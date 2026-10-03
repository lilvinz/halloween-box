#!/usr/bin/env node
// Same-VM gameplay and visual checks over the exact source argument (including
// actual PXT-generated TypeScript). No gameplay globals are reset by the harness.
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");
const { execFileSync } = require("child_process");
const ts = require("../node_modules/pxt-core/pxtcompiler/ext-typescript/lib/typescript.js");

const args = process.argv.slice(2);
const mutationMode = args.includes("--mutation-checks");
const baselineArg = args.findIndex(x => x === "--baseline");
const baselinePath = baselineArg >= 0 ? path.resolve(args[baselineArg + 1]) : undefined;
const sourcePath = path.resolve(args.find(x => !x.startsWith("--") && (baselineArg < 0 || x !== args[baselineArg + 1])) || "main.ts");
const source = fs.readFileSync(sourcePath, "utf8");

function setup(input, label) {
    const ast = ts.createSourceFile(`${label}.ts`, input, ts.ScriptTarget.Latest, true);
    const text = n => input.slice(n.getFullStart(), n.getEnd());
    const fn = name => {
        const node = ast.statements.find(n => ts.isFunctionDeclaration(n) && n.name && n.name.text === name);
        assert(node, `${label}: missing ${name}`);
        return ts.transpile(text(node), { target: ts.ScriptTarget.ES2017 });
    };
    const stateDeclarations = ast.statements.filter(ts.isVariableStatement).flatMap(statement =>
        statement.declarationList.declarations.filter(d => {
            if (!ts.isIdentifier(d.name)) return false;
            const name = d.name.text;
            return name.startsWith("Spiel4_") || name.startsWith("Memory_") || name === "Spiel2_EingabeGewertet";
        }).map(d => `let ${d.getText(ast)};`));
    const declarations = ts.transpile(stateDeclarations.join("\n"), { target: ts.ScriptTarget.ES2017 });
    const startupAssignments = ast.statements.filter(n => {
        if (!ts.isExpressionStatement(n) || !ts.isBinaryExpression(n.expression) || n.expression.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return false;
        if (!ts.isIdentifier(n.expression.left)) return false;
        const name = n.expression.left.text;
        return name.startsWith("Memory_") || name.startsWith("Spiel4_") || name === "Spiel2_EingabeGewertet";
    }).map(text).join("\n");
    const registration = ast.statements.find(n => ts.isExpressionStatement(n) && text(n).includes("HalloweenKeypad.onAnyKeyPressed"));
    assert(registration, `${label}: registered onAnyKeyPressed statement missing`);
    return {
        input, ast, declarations, startupAssignments,
        registration: ts.transpile(text(registration), { target: ts.ScriptTarget.ES2017 }),
        game4: fn("Spiel_4"), game3: fn("Spiel_3"), game2: fn("Spiel_2"),
        game1: fn("Spiel_1"), game1Background: fn("Spiel_Hintergrund_1"),
        label
    };
}
const src = setup(source, sourcePath);
const base = baselinePath ? setup(fs.readFileSync(baselinePath, "utf8"), baselinePath) : undefined;
function ok(value, message) { if (!value) throw new Error(message); }
function pass(message) { console.log(`PASS ${message}`); }
function rgb(r, g, b) { return (((r & 255) << 16) | ((g & 255) << 8) | (b & 255)) >>> 0; }
function read(ctx, expression) {
    try { return vm.runInContext(expression, ctx); } catch (_) { return undefined; }
}
function extractInputGlobals(code, ctx, register = true) {
    vm.runInContext(code.declarations, ctx);
    if (code.startupAssignments) vm.runInContext(code.startupAssignments, ctx);
    if (register) vm.runInContext(code.registration, ctx);
}

function game4Env(code, options = {}) {
    let now = 0, callback, registrations = 0, order = 0, clearCount = 0, maxDriverQueue = 0, lastAutoHue = null, autoHitCount = 0;
    let randoms = Array(256).fill(0);
    const scheduled = [], driverQueue = [], physical = [], frames = [], sounds = [];
    const buffer = Array(25).fill(0), visible = Array(25).fill(0);
    const math = Object.create(Math); math.idiv = (a, b) => Math.trunc(a / b);
    function pixelPower(c) { c = Number(c) >>> 0; return Math.max((c >>> 16) & 255, (c >>> 8) & 255, c & 255); }
    function activeVisible() {
        let index = -1, power = 0;
        for (let i = 0; i < visible.length; i++) { const p = pixelPower(visible[i]); if (p > power) { power = p; index = i; } }
        return index;
    }
    function pump(until) {
        while (scheduled.length && scheduled[0].at <= until) {
            const e = scheduled.shift();
            const key = e.key === "visible" ? activeVisible() : typeof e.key === "function" ? e.key({ now, visible: visible.slice(), buffer: buffer.slice(), context: ctx }) : e.key;
            const delivered = { ...e, key, visibleAtPress: visible.slice(), order: order++ };
            physical.push(delivered);
            driverQueue.push({ ...delivered });
            maxDriverQueue = Math.max(maxDriverQueue, driverQueue.length);
            if (e.pressed !== false && callback) callback(key);
        }
        now = until;
    }
    const ctx = {
        Math: math,
        control: { millis: () => now },
        basic: { pause(ms) { pump(now + ms); } },
        randint(min, max) {
            if (!randoms.length) throw new Error(`Spiel 4 RNG exhausted at ${now}ms (${min}..${max})`);
            const n = randoms.shift(); if (n < min || n > max) throw new Error(`randint ${n} outside ${min}..${max}`); return n;
        },
        Tastenmatrix: {
            clear() { buffer.fill(0); },
            setPixelColor(i, color) { if (i >= 0 && i < 25) buffer[i] = Number(color) >>> 0; },
            show() {
                if (options.showMs) pump(now + options.showMs);
                visible.splice(0, visible.length, ...buffer);
                frames.push({ at: now, pixels: visible.slice() });
                if (options.autoHitPhases && autoHitCount < options.autoHitPhases) {
                    const index = activeVisible(), color = index < 0 ? 0 : visible[index];
                    const r = (color >>> 16) & 255, g = (color >>> 8) & 255, b = color & 255;
                    const hue = b > r && b > g ? "violet" : r > g * 1.5 && r > b ? "orange" : g > r && b > r ? "turquoise" : null;
                    if (hue && hue !== lastAutoHue) {
                        lastAutoHue = hue; autoHitCount++;
                        const at = now + (options.autoHitDelayMs || 900), keyEventOrder = order + 10000 + autoHitCount * 2;
                        schedule([{ at, key: "visible", pressed: true, order: keyEventOrder }, { at: at + 1, key: "visible", pressed: false, order: keyEventOrder + 1 }]);
                    }
                }
            }
        },
        neopixel: { rgb, colors: n => Number(n) >>> 0 }, NeoPixelColors: { Black: 0 },
        HalloweenKeypad: {
            onAnyKeyPressed(fn) { registrations++; callback = fn; },
            clearEventQueue() { driverQueue.length = 0; clearCount++; },
            waitForAnyKey() { throw new Error("Spiel 4 must use the registered key-down callback"); }
        },
        player_pro: { play_sound(n) { sounds.push({ at: now, n }); if (options.soundMs) pump(now + options.soundMs); } }
    };
    vm.createContext(ctx);
    extractInputGlobals(code, ctx);
    vm.runInContext(code.game4, ctx);

    function schedule(events) {
        scheduled.push(...events.map(e => ({ pressed: true, ...e })));
        scheduled.sort((a, b) => a.at - b.at || (a.order || 0) - (b.order || 0));
    }
    function play(events = [], randomSequence) {
        if (randomSequence) randoms = randomSequence.slice();
        const before = { now, sounds: sounds.length, physical: physical.length, frames: frames.length, clears: clearCount };
        schedule(events);
        const result = vm.runInContext("Spiel_4()", ctx, { timeout: 10000 });
        const delivered = physical.slice(before.physical);
        const hits = sounds.slice(before.sounds);
        const ownRounds = read(ctx, "Spiel4_EingabeRunden"), ownCorrect = read(ctx, "Spiel4_EingabeRichtig");
        const arraysPresent = Array.isArray(ownRounds) && Array.isArray(ownCorrect);
        const gameQueueAligned = !arraysPresent || ownRounds.length === ownCorrect.length;
        const gameQueueEmpty = !arraysPresent || (ownRounds.length === 0 && ownCorrect.length === 0);
        return {
            result, start: before.now, end: now, hits, physical: delivered, frames: frames.slice(before.frames),
            registrations, driverQueue: driverQueue.slice(), clearCount, maxDriverQueue,
            arraysPresent, gameQueueAligned, gameQueueEmpty,
            active: read(ctx, "Spiel4_Aktiv"), context: ctx
        };
    }
    return {
        play, context: ctx, frames, sounds, physical, driverQueue,
        setRandoms(values) { randoms = values.slice(); },
        dispatch(key) { if (callback) callback(key); },
        stats() { return { now, registrations, sounds: sounds.slice(), physical: physical.slice(), driverQueue: driverQueue.slice(), clearCount }; }
    };
}
function taps(at, key = "visible", gap = 1) {
    return [{ at, key, pressed: true, order: 0 }, { at: at + gap, key, pressed: false, order: 1 }];
}
function winningEvents(start) { return [...taps(start + 1), ...taps(start + 10), ...taps(start + 20)]; }
function assertGame4Exit(r, message) {
    ok(r.active === undefined || r.active === false, `${message}: game remained active`);
    ok(r.gameQueueAligned && r.gameQueueEmpty, `${message}: game FIFOs unaligned or nonempty`);
    ok(r.driverQueue.length === 0, `${message}: software driver queue was not cleared`);
}
function assertWin(r, message) {
    ok(r.result === 1, `${message}: result ${r.result}`);
    ok(r.hits.filter(s => s.n === 2).length === 3 && r.hits.length === 3, `${message}: expected exactly 3 new success sounds, got ${r.hits.map(x => x.n)}`);
    const presses = r.physical.filter(x => x.pressed !== false);
    ok(presses.length === 3, `${message}: expected 3 delivered physical press events, got ${presses.length}`);
    ok(r.end >= presses[2].at, `${message}: returned before third press timestamp`);
    assertGame4Exit(r, message);
}
function testSpiel4() {
    // The one initialized environment is reused across each scenario. Neither
    // globals nor callbacks are reset by test code between invocations.
    const winWin = game4Env(src);
    const beforeOutside = winWin.stats();
    winWin.dispatch(0);
    ok(winWin.stats().sounds.length === beforeOutside.sounds.length, "inactive/outside-game callback had side effects");
    const first = winWin.play(winningEvents(0)); assertWin(first, "win #1");
    const second = winWin.play(winningEvents(first.end)); assertWin(second, "win #2 same VM");
    ok(second.registrations === 1, "permanent handler must be registered exactly once across repeated calls");
    const soundsAfter = winWin.stats().sounds.length;
    winWin.dispatch(24);
    ok(winWin.stats().sounds.length === soundsAfter, "post-exit callback had side effects");
    pass("Spiel 4 win->win same VM, exact new sounds/presses, inactive callback and one handler");

    const lossWin = game4Env(src);
    const lost = lossWin.play([
        { at: 1, key: 24, pressed: true }, { at: 2, key: 24, pressed: false },
        { at: 3, key: 24, pressed: true }, { at: 4, key: 24, pressed: false },
        { at: 5, key: 24, pressed: true }, { at: 6, key: 24, pressed: false }
    ]);
    ok(lost.result === 0 && lost.hits.map(x => x.n).join(",") === "5,5,5", "three queued wrong presses must lose exactly once each");
    assertGame4Exit(lost, "loss exit");
    const recovered = lossWin.play(winningEvents(lost.end)); assertWin(recovered, "loss->win same VM");
    pass("Spiel 4 loss->win same VM and paired-FIFO/driver cleanup");

    const timeoutWin = game4Env(src);
    const timed = timeoutWin.play([]);
    ok(timed.result === 0 && timed.end - timed.start >= 20000, `no-input invocation did not hit strict 20s deadline (${timed.end - timed.start})`);
    assertGame4Exit(timed, "timeout exit");
    const afterTimeout = timeoutWin.play(winningEvents(timed.end)); assertWin(afterTimeout, "timeout->win same VM");
    pass("Spiel 4 timeout->win same VM with exit-state reset");

    const duplicate = game4Env(src);
    const dup = duplicate.play([...taps(1), ...taps(2)]);
    ok(dup.hits.filter(x => x.n === 2).length === 1, `same-generation duplicate advanced twice: ${dup.hits.map(x => x.n)}`);
    assertGame4Exit(dup, "duplicate exit");
    pass("Spiel 4 duplicate old-generation FIFO heads are both discarded");

    const duringSound = game4Env(src, { soundMs: 5 });
    const soundCase = duringSound.play([{ at: 1, key: "visible", pressed: true }, { at: 2, key: "visible", pressed: false }, { at: 6, key: "visible", pressed: true }]);
    ok(soundCase.hits.filter(x => x.n === 2).length === 1, `input delivered during sound gained next-generation credit: ${soundCase.hits.map(x => x.n)}`);
    ok(soundCase.physical.filter(x => x.pressed !== false).length === 2, "sound-yield test did not deliver its in-sound press");
    ok(soundCase.gameQueueAligned, "sound-yield callback split the paired queues");
    assertGame4Exit(soundCase, "sound-yield exit");
    pass("Spiel 4 input during sound is rejected by generation gate");

    const duringShow = game4Env(src, { showMs: 1 });
    const showCase = duringShow.play([...taps(402, "visible")]);
    ok(showCase.physical.some(e => e.pressed !== false && e.at === 402 && e.visibleAtPress.some(v => v !== 0)), "show-yield press did not occur while an old target was visible");
    ok(showCase.hits.some(x => x.n === 2), `press classified using post-show metadata instead of old visible target: ${showCase.hits.map(x => x.n)}`);
    assertGame4Exit(showCase, "show-yield exit");
    pass("Spiel 4 show-yield input uses displayed pre-update metadata");

    const boundary = game4Env(src);
    const edgeCase = boundary.play([...taps(1, 0), ...taps(16, 0), ...taps(30, 24), ...taps(50, 24), ...taps(219, 1)]);
    ok(edgeCase.result === 0 && edgeCase.hits.map(x => x.n).join(",") === "2,2,5,5,5", `known wrong-boundary press became a hit: ${edgeCase.hits.map(x => x.n)}`);
    ok(edgeCase.gameQueueAligned, "boundary event left paired queues misaligned");
    assertGame4Exit(edgeCase, "boundary exit");
    pass("Spiel 4 former wrong-boundary press remains wrong");

    const deadline = game4Env(src).play(taps(20000));
    ok(deadline.result === 0 && deadline.hits.length === 0 && deadline.end >= 20000, "press at strict 20s deadline was accepted");
    ok(deadline.physical.filter(e => e.pressed !== false).length === 1, "deadline key-down/release pump did not deliver exactly one press");
    assertGame4Exit(deadline, "strict deadline exit");
    pass("Spiel 4 press at strict deadline rejected; release ignored and queues cleared");
}

function game3Env(code) {
    let now = 0, randoms = [], keys = [], randomDraws = 0, consumed = 0, queue = [];
    const calls = [], writes = [], sounds = [];
    const math = Object.create(Math); math.idiv = (a, b) => Math.trunc(a / b);
    const ctx = {
        Math: math, control: { millis: () => now }, basic: { pause(ms) { now += ms; } },
        randint(min, max) {
            if (randomDraws >= 1000) throw new Error("Spiel 3 RNG safety cap exceeded");
            if (!randoms.length) throw new Error(`Spiel 3 RNG exhausted after ${randomDraws} draws at ${now}ms`);
            const value = randoms.shift(); randomDraws++;
            if (value < min || value > max) throw new Error(`randint ${value} outside ${min}..${max}`);
            calls.push({ min, max, value, at: now }); return value;
        },
        HalloweenKeypad: {
            clearEventQueue() { queue = []; },
            waitForAnyKey(ms) {
                if (keys.length && keys[0].at <= now + ms) {
                    const event = keys.shift(); now = event.at; consumed++; queue.push({ ...event }); return event.key;
                }
                now += ms; return -1;
            }
        },
        Tastenmatrix: { clear() {}, setPixelColor(i, color) { writes.push([i, color]); }, show() {} },
        neopixel: { rgb, colors: n => Number(n) >>> 0 }, NeoPixelColors: { Black: 0 },
        player_pro: { play_sound(n) { sounds.push({ at: now, n }); }, wait_until_elapsed(ms) { now += ms; } }
    };
    vm.createContext(ctx);
    extractInputGlobals(code, ctx, false);
    vm.runInContext(code.game3, ctx);
    function play(randomSequence, keySequence) {
        randoms = randomSequence.slice(); keys = keySequence.map(k => ({ at: now + k.after, key: k.key }));
        randomDraws = 0; consumed = 0; calls.length = 0;
        const start = now;
        const result = vm.runInContext("Spiel_3()", ctx, { timeout: 10000 });
        const state = {
            positions: read(ctx, "Memory_Positions"), colors: read(ctx, "Memory_Colors"),
            usedPositions: read(ctx, "Memory_BenutztePositionen"), usedColors: read(ctx, "Memory_BenutzteFarben"),
            step: read(ctx, "Memory_Current_Step"), misses: read(ctx, "Memory_Miss_Count")
        };
        return { result, start, end: now, randomDraws, draws: calls.slice(), consumed, state, writes: writes.slice(), sounds: sounds.slice() };
    }
    return { play, context: ctx };
}
const repeatedSequence = [0, 0, 1, 1, 2, 2, 3, 3];
const fourKeys = [0, 1, 2, 3].map((key, i) => ({ after: 7000 + i * 50, key }));
function assertMemoryWin(r, label) {
    ok(r.result === 1 && r.state.step === 4 && r.state.misses === 0, `${label}: win/reset state mismatch result=${r.result},step=${r.state.step},misses=${r.state.misses}`);
    ok(r.randomDraws === 8, `${label}: expected exactly 8 RNG draws, got ${r.randomDraws}`);
    ok(r.consumed === 4, `${label}: expected 4 consumed keys, got ${r.consumed}`);
    ok(r.state.positions.join(",") === "0,1,2,3", `${label}: generated positions ${r.state.positions}`);
    if (Array.isArray(r.state.usedPositions)) {
        ok(r.state.usedPositions.join(",") === "0,1,2,3" && r.state.usedColors.length === 4, `${label}: uniqueness arrays not reset/populated`);
    }
    ok(new Set(r.state.colors).size === 4, `${label}: colors not unique`);
}
function testSpiel3() {
    const winWin = game3Env(src);
    const first = winWin.play(repeatedSequence, fourKeys); assertMemoryWin(first, "memory win #1");
    const second = winWin.play(repeatedSequence, fourKeys); assertMemoryWin(second, "memory win #2 same VM");
    pass("Spiel 3 identical-sequence win->win same VM, exact RNG and input counts");

    const lossWin = game3Env(src);
    const loss = lossWin.play(repeatedSequence, [{ after: 7000, key: 0 }, { after: 7050, key: 24 }, { after: 7100, key: 24 }]);
    ok(loss.result === 0 && loss.state.step === 1 && loss.state.misses === 2 && loss.randomDraws === 8 && loss.consumed === 3, "Spiel 3 two-error loss contract changed");
    const recover = lossWin.play(repeatedSequence, fourKeys); assertMemoryWin(recover, "memory loss->win same VM");
    pass("Spiel 3 loss->win same VM resets step/misses and uniqueness arrays");

    const timeoutWin = game3Env(src);
    const timeout = timeoutWin.play(repeatedSequence, []);
    ok(timeout.result === 0 && timeout.end - timeout.start >= 30000 && timeout.randomDraws === 8 && timeout.consumed === 0, "Spiel 3 intro-inclusive 30s timeout changed");
    const recoveredTimeout = timeoutWin.play(repeatedSequence, fourKeys); assertMemoryWin(recoveredTimeout, "memory timeout->win same VM");
    pass("Spiel 3 timeout->win same VM; waitForAnyKey(ms) advances virtual clock");
}

function visualTrace(code) {
    const env = game4Env(code, { autoHitPhases: 3, autoHitDelayMs: 900 });
    const r = env.play([]);
    assertWin(r, `visual trace ${code.label}`);
    return r.frames;
}
function compareBaseline() {
    assert(base, "baseline source missing");
    const before = visualTrace(base), after = visualTrace(src);
    const same = JSON.stringify(before) === JSON.stringify(after);
    if (!same) {
        let index = 0;
        while (index < Math.min(before.length, after.length) && JSON.stringify(before[index]) === JSON.stringify(after[index])) index++;
        throw new Error(`RGB frame trace differs: baseline=${before.length}, source=${after.length}, firstDifference=${index}; baseline=${JSON.stringify(before[index])}; source=${JSON.stringify(after[index])}`);
    }
    ok(before.length === 109, `expected 109 timestamped frames, got ${before.length}`);
    pass(`baseline/source RGB timestamped frame parity (${before.length} byte-identical frames)`);
}

function mutateInsideFunction(input, functionName, assignment, label) {
    const file = ts.createSourceFile("mutation.ts", input, ts.ScriptTarget.Latest, true);
    const fn = file.statements.find(n => ts.isFunctionDeclaration(n) && n.name && n.name.text === functionName);
    assert(fn, `mutation fixture missing ${functionName}`);
    const start = fn.getStart(file), end = fn.getEnd();
    const chunk = input.slice(start, end);
    assert(chunk.includes(assignment), `${label}: assignment not found inside ${functionName}`);
    return input.slice(0, start) + chunk.replace(assignment, `/* mutation removed per-call reset: ${assignment} */`) + input.slice(end);
}
function mutationChecks() {
    const cases = [
        { label: "Spiel4_Treffer reset", functionName: "Spiel_4", assignment: "Spiel4_Treffer = 0", expected: "win #2 same VM" },
        { label: "Memory_BenutztePositionen reset", functionName: "Spiel_3", assignment: "Memory_BenutztePositionen = []", expected: "RNG exhausted" },
        { label: "Memory_BenutzteFarben reset", functionName: "Spiel_3", assignment: "Memory_BenutzteFarben = []", expected: "RNG exhausted" }
    ];
    for (const item of cases) {
        const mutated = mutateInsideFunction(source, item.functionName, item.assignment, item.label);
        const file = `/tmp/opencode/check-games-mutation-${item.label.replace(/[^a-z0-9]+/gi, "-")}.ts`;
        fs.writeFileSync(file, mutated);
        let output = "", failed = false;
        try { output = execFileSync(process.execPath, [__filename, file], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 30000 }); }
        catch (e) { failed = true; output = `${e.stdout || ""}\n${e.stderr || ""}`; }
        assert(failed, `${item.label}: mutation unexpectedly survived`);
        assert(output.includes(item.expected), `${item.label}: failed for unexpected reason (wanted ${item.expected})\n${output}`);
        console.log(`PASS mutation rejected: ${item.label}; failure point=${item.expected}`);
    }
}

testSpiel4();
testSpiel3();
if (base) compareBaseline();
if (mutationMode) mutationChecks();
