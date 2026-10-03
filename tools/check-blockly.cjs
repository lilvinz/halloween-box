#!/usr/bin/env node
// Official in-memory PXT decompile -> Blockly import/compile -> TS typecheck.
// The only generated artifacts are written under /tmp/opencode.
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
function parseArgs(argv) {
    const parsed = { positional: [], blocks: undefined, writeBlocks: false };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === "--blocks") {
            assert(!parsed.blocks && argv[i + 1], "usage: check-blockly.cjs [source.ts] | --blocks file.xml | --write-blocks");
            parsed.blocks = path.resolve(argv[++i]);
        } else if (argv[i] === "--write-blocks") parsed.writeBlocks = true;
        else if (argv[i].startsWith("--")) throw new Error(`unknown option ${argv[i]}`);
        else parsed.positional.push(argv[i]);
    }
    assert(parsed.positional.length <= 1, "at most one source TypeScript path is allowed");
    assert(!(parsed.blocks && parsed.writeBlocks), "--blocks and --write-blocks are mutually exclusive");
    assert(!(parsed.blocks && parsed.positional.length), "--blocks validates the actual XML; do not combine with a source path");
    assert(!(parsed.writeBlocks && parsed.positional.length), "--write-blocks is allowed only for the project's main.ts");
    return parsed;
}
const args = parseArgs(process.argv.slice(2));
const sourcePath = args.blocks || path.resolve(args.positional[0] || path.join(ROOT, "main.ts"));
const tempRoot = fs.mkdtempSync(path.join("/tmp/opencode", "halloween-blockly-"));
const logPath = path.join(tempRoot, "roundtrip.log");
const log = [];
let dom, workspace;
function note(value) { const s = String(value); log.push(s); process.stdout.write(`${s}\n`); }
function diagText(ts, diagnostics) {
    return diagnostics.length ? ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCurrentDirectory: () => ROOT,
        getCanonicalFileName: f => f,
        getNewLine: () => "\n"
    }) : "";
}
function hash(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
function collectPxtFiles(dir, cfg, out) {
    for (const name of [...(cfg.files || []), ...(cfg.testFiles || [])]) {
        const abs = path.join(dir, name);
        if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
            out[path.relative(ROOT, abs).replace(/\\/g, "/")] = fs.readFileSync(abs, "utf8");
        }
    }
}
function childDirectories(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).filter(x => x.isDirectory()).map(x => path.join(dir, x.name));
}
function parseDiagnostics(label, diagnostics, ts) {
    assert(Array.isArray(diagnostics), `${label}: diagnostics array missing`);
    note(`${label} diagnostics=${diagnostics.length}`);
    if (diagnostics.length) note(diagText(ts, diagnostics));
    assert.strictEqual(diagnostics.length, 0, `${label}: expected no PXT diagnostics`);
}

async function main() {
    const projectSourcePath = args.blocks ? path.join(ROOT, "main.ts") : sourcePath;
    const source = fs.readFileSync(projectSourcePath, "utf8");
    note(`mode=${args.blocks ? "validate-blocks" : args.writeBlocks ? "write-blocks" : "export-source"} source=${projectSourcePath} sha256=${hash(source)}`);

    // One installed SDK entry initializes a consistent PXT / compiler API set.
    require(path.join(ROOT, "node_modules/pxt-core/built/pxt.js"));
    const p = global.pxt, c = global.pxtc, ts = global.ts;
    assert(p && c && ts, "installed PXT SDK APIs unavailable");
    p.setAppTarget(JSON.parse(fs.readFileSync(path.join(ROOT, "node_modules/pxt-microbit/built/target.json"), "utf8")));

    const files = {};
    const rootConfigText = fs.readFileSync(path.join(ROOT, "pxt.json"), "utf8");
    const rootConfig = JSON.parse(rootConfigText);
    files["pxt.json"] = rootConfigText;
    collectPxtFiles(ROOT, rootConfig, files);
    for (const depDir of childDirectories(path.join(ROOT, "pxt_modules"))) {
        const configPath = path.join(depDir, "pxt.json");
        if (!fs.existsSync(configPath)) continue;
        const relative = path.relative(ROOT, depDir).replace(/\\/g, "/");
        const text = fs.readFileSync(configPath, "utf8");
        files[`${relative}/pxt.json`] = text;
        collectPxtFiles(depDir, JSON.parse(text), files);
    }
    files["main.ts"] = source;
    const sourceReference = files["main.ts"];

    const opts = await p.simpleGetCompileOptionsAsync(files, { native: false });
    assert.strictEqual(files["main.ts"], sourceReference, "compile-option preparation mutated the source input map");
    assert.strictEqual(files["main.ts"], source, "PXT patch preparation changed input main.ts identity");
    assert.strictEqual(opts.fileSystem && opts.fileSystem["main.ts"], source, "PXT target-version patching changed main.ts before AST/decompile");
    note("PXT input main.ts identity preserved through compile-option preparation");
    opts.ast = true;
    const program = c.getTSProgram(opts);
    parseDiagnostics("source typecheck", ts.getPreEmitDiagnostics(program), ts);

    let xml;
    if (args.blocks) {
        xml = fs.readFileSync(args.blocks, "utf8");
        assert(xml.length > 0, `Blockly XML is empty: ${args.blocks}`);
        note(`validating supplied XML=${args.blocks} bytes=${Buffer.byteLength(xml)}`);
    } else {
        opts.errorOnGreyBlocks = true;
        const decompiled = c.decompile(program, opts, p.MAIN_TS, true);
        note(`decompiler success=${decompiled && decompiled.success}`);
        parseDiagnostics("decompiler", decompiled && decompiled.diagnostics, ts);
        assert.strictEqual(decompiled.success, true, "official PXT decompiler did not report success");
        xml = decompiled.outfiles && decompiled.outfiles[p.MAIN_BLOCKS];
        assert(typeof xml === "string" && xml.length > 0, "official decompiler did not produce main.blocks XML");
    }
    const candidatePath = path.join(tempRoot, "candidate.blocks");
    fs.writeFileSync(candidatePath, xml);
    note(`candidate XML bytes=${Buffer.byteLength(xml)} path=${candidatePath}`);

    const { JSDOM } = require(path.join(ROOT, "node_modules/jsdom"));
    dom = new JSDOM("<!doctype html><html><body></body></html>");
    for (const key of ["window", "document", "navigator", "DOMParser", "XMLSerializer", "Node", "Element", "HTMLElement", "SVGElement", "MutationObserver"]) {
        const value = key === "window" ? dom.window : key === "document" ? dom.window.document : dom.window[key];
        Object.defineProperty(global, key, { configurable: true, writable: true, value });
    }
    global.lf = p.Util.lf;

    const workerOps = [];
    global.Worker = class {
        constructor() {
            this.onmessage = null;
            queueMicrotask(() => this.onmessage && this.onmessage({ data: { id: "ready" } }));
        }
        postMessage(message) {
            workerOps.push(message && message.op);
            assert(message && message.op === "format", `unexpected Blockly worker operation: ${message && message.op}`);
            const result = c.service.performOperation(message.op, message.arg);
            queueMicrotask(() => this.onmessage && this.onmessage({ data: { id: message.id, result } }));
        }
        terminate() {}
    };
    p.webConfig = { workerjs: "in-memory-pxt-service" };

    // Report every SDK warning; fail specifically on warnings that indicate
    // a custom field is absent or ignored. Other SDK warnings remain visible.
    const captured = [];
    const originals = {};
    const captureMethods = ["log", "warn", "error"];
    for (const method of captureMethods) {
        originals[method] = console[method];
        console[method] = (...args) => {
            const message = args.map(String).join(" ");
            captured.push({ method, message });
            originals[method](...args);
        };
    }
    try {
        require(path.join(ROOT, "node_modules/pxt-core/built/tests/blockssetup.js"));
        const pb = p.blocks.requirePxtBlockly();
        const Blockly = p.blocks.requireBlockly();
        require(path.join(ROOT, "node_modules/pxt-microbit/built/fieldeditors.js"));
        const extensions = await p.editor.initFieldExtensionsAsync({});
        assert(extensions && Array.isArray(extensions.fieldEditors), "micro:bit field extension fieldEditors array missing");
        const selectors = [];
        for (const field of extensions.fieldEditors) {
            assert(field && field.selector && field.editor, `invalid field editor descriptor: ${JSON.stringify(field)}`);
            selectors.push(field.selector);
            pb.registerFieldEditor(field.selector, field.editor, field.validator);
        }
        note(`registered field editors=${selectors.join(",")}`);
        assert(selectors.includes("gestures"), "Gesture field editor was not registered");
        assert(selectors.includes("pinpicker"), "pinpicker field editor was not registered");

        const info = c.getBlocksInfo(c.getApiInfo(program, opts.jres), opts.bannedCategories);
        pb.initializeAndInject(info);
        const parsed = new dom.window.DOMParser().parseFromString(xml, "text/xml");
        assert(!parsed.querySelector("parsererror"), "candidate XML parse failed");
        const unsupported = [...parsed.querySelectorAll("block, shadow")].filter(n => n.getAttribute("type") === c.TS_STATEMENT_TYPE || n.getAttribute("type") === c.TS_OUTPUT_TYPE);
        note(`XML grey statement/output elements=${unsupported.length}`);
        assert.strictEqual(unsupported.length, 0, "candidate XML contains unsupported grey TypeScript blocks");

        workspace = new Blockly.Workspace();
        Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
        note(`workspace blocks=${workspace.getAllBlocks(false).length}`);
        const greyStatements = workspace.getAllBlocks(false).filter(b => b.type === c.TS_STATEMENT_TYPE).length;
        const greyOutputs = workspace.getAllBlocks(false).filter(b => b.type === c.TS_OUTPUT_TYPE).length;
        note(`workspace grey statement=${greyStatements}; output=${greyOutputs}`);
        assert.strictEqual(greyStatements + greyOutputs, 0, "Blockly workspace contains unsupported grey blocks");

        const output = await pb.compileAsync(workspace, info);
        assert(output && typeof output.source === "string", "official Blockly compiler produced no TypeScript");
        parseDiagnostics("Blockly compiler", output.diagnostics, ts);
        fs.writeFileSync(path.join(tempRoot, "roundtrip.ts"), output.source);
        const roundFiles = { ...files, "main.ts": output.source };
        const roundInput = roundFiles["main.ts"];
        const roundOpts = await p.simpleGetCompileOptionsAsync(roundFiles, { native: false });
        assert.strictEqual(roundFiles["main.ts"], roundInput, "roundtrip compile-option preparation mutated main.ts input");
        roundOpts.ast = true;
        const roundProgram = c.getTSProgram(roundOpts);
        parseDiagnostics("generated TypeScript", ts.getPreEmitDiagnostics(roundProgram), ts);
        assert(workerOps.length > 0 && workerOps.every(op => op === "format"), "Blockly compile did not use the expected PXT formatter operation");

        assertNativeInputFields(ts, output.source);
        const fieldWarnings = captured.filter(x => /field editor|not registered|non-existent field|ignoring.*field/i.test(x.message));
        note(`captured SDK warnings=${captured.length}; missing/ignored field warnings=${fieldWarnings.length}`);
        const knownOptionalWarning = /Block definition "(?:text|text_join)" overwrites previous definition|Blockly\.Workspace\.getAllVariables was deprecated|Blockly\.Workspace\.getVariable(?:ById)? was deprecated/;
        for (const warning of captured) note(`SDK ${warning.method}${knownOptionalWarning.test(warning.message) ? " (known optional)" : ""}: ${warning.message}`);
        assert.strictEqual(fieldWarnings.length, 0, "PXT emitted missing or ignored field-editor/field warnings");
        const roundtripPath = path.join(tempRoot, "roundtrip.ts");
        note(`generated TypeScript=${roundtripPath}`);
        const gameCheck = execFileSync(process.execPath, [path.join(ROOT, "tools/check-games.cjs"), roundtripPath], {
            cwd: ROOT, encoding: "utf8", timeout: 60000
        });
        note("official generated-TypeScript behavior suite:");
        for (const line of gameCheck.trimEnd().split("\n")) note(`  ${line}`);
        note(`PASS official Blockly XML compile/typecheck/game-behavior validation`);
        if (args.writeBlocks) {
            assert.strictEqual(sourcePath, path.join(ROOT, "main.ts"), "--write-blocks cannot write from an alternate source");
            fs.writeFileSync(path.join(ROOT, "main.blocks"), xml);
            note(`wrote validated official XML to ${path.join(ROOT, "main.blocks")}`);
        } else {
            note("tracked files unchanged by default; candidate stays under /tmp/opencode");
        }
    } finally {
        for (const method of captureMethods) console[method] = originals[method];
        if (workspace) workspace.dispose();
        if (dom) dom.window.close();
    }
}

function assertNativeInputFields(ts, source) {
    const ast = ts.createSourceFile("roundtrip.ts", source, ts.ScriptTarget.Latest, true);
    const calls = [];
    function walk(n) {
        if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression)) {
            const receiver = n.expression.expression.getText(ast), method = n.expression.name.text;
            if ((receiver === "input" && method === "onGesture") || (receiver === "pins" && (method === "setPull" || method === "setEvents"))) calls.push({ receiver, method, args: n.arguments });
        }
        ts.forEachChild(n, walk);
    }
    walk(ast);
    const arg = (call, i) => call.args[i] && call.args[i].getText(ast);
    const gesture = calls.filter(x => x.receiver === "input" && x.method === "onGesture");
    const pulls = calls.filter(x => x.receiver === "pins" && x.method === "setPull");
    const events = calls.filter(x => x.receiver === "pins" && x.method === "setEvents");
    assert.strictEqual(gesture.length, 1, `expected one generated input.onGesture call, got ${gesture.length}`);
    assert.strictEqual(pulls.length, 1, `expected one generated pins.setPull call, got ${pulls.length}`);
    assert.strictEqual(events.length, 1, `expected one generated pins.setEvents call, got ${events.length}`);
    assert.strictEqual(arg(gesture[0], 0), "Gesture.Shake", "generated AST lost input.onGesture(Gesture.Shake)");
    assert.strictEqual(arg(pulls[0], 0), "DigitalPin.P8", "generated AST lost pins.setPull(DigitalPin.P8)");
    assert.strictEqual(arg(events[0], 0), "DigitalPin.P8", "generated AST lost pins.setEvents(DigitalPin.P8)");
    note("AST native fields confirmed: input.onGesture(Gesture.Shake), pins.setPull(P8), pins.setEvents(P8)");
}

main().catch(err => {
    log.push(`FAIL ${err && err.stack || err}`);
        process.stderr.write(`${err && err.stack || err}\n`);
    process.exitCode = 1;
}).finally(() => {
    fs.writeFileSync(logPath, log.join("\n") + "\n");
    console.log(`log=${logPath}`);
});
