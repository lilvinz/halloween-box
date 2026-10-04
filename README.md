# Halloween Box

A Halloween game box for children: press a button, play one of four games, and win candy. This repository contains the complete firmware project for a **micro:bit V2**.

## Hardware

- 5×5 arcade-button panel with one RGBW NeoPixel behind each button
- Additional ring of 35 RGB NeoPixels
- TCA8418 I²C keypad controller and a button matrix with diodes
- DFPlayer Pro sound module and speaker
- Servo-operated candy dispenser with a candy-counting sensor

## How it works

Lights and sound attract players until a button is pressed. After a six-second start animation, the box randomly selects one of the four games. A win starts the candy dispenser; a loss shows and plays feedback. The box then returns to attract mode.

The dispenser aims to deliver **at least four pieces of candy**, counted by the sensor. It allows up to two dispensing cycles, each with a ten-second limit while waiting for detection. Failure to reach the minimum triggers error feedback. Mechanical overrun can release additional candy; the setting is a minimum target, not an exact physical quantity.

## Games

| Game | Goal |
| --- | --- |
| 1. Button challenge | Press all 25 buttons. The time limit starts at ten seconds; pressing an already completed button reduces it by 25%. |
| 2. Target button | Reach ten points by pressing the blue target. Wrong presses and timeouts subtract a point; a negative score loses. The round limit starts at 20 seconds and decreases by 25% each round. |
| 3. Memory sequence | Watch four distinct positions and colours appear twice, then repeat the positions in order. |
| 4. Bouncing light | Catch the bright light as it moves along a row or column. Three hits win; three wrong presses or the 20-second limit lose. |

Game 4 changes from orange to violet to turquoise and speeds up after each hit. Its target pulses and leaves a faint fading trail. **Only the bright target is hittable**, not the trail.

## Audio

The box uses a spooky background soundscape and game-specific sound effects.
The two Visaton speakers and MAX9744 amplifier are clearly audible outdoors
in our setup.

The audio files are **not included**: their original sources and usage rights
still need to be checked. For a rebuild, provide your own recordings or
appropriately licensed replacements. Audio files may be added later if their
redistribution rights are confirmed; the project's CC BY license does not
apply to unverified third-party recordings.

## Open in MakeCode

1. Open [MakeCode for micro:bit](https://makecode.microbit.org/).
2. Choose **Import** → **Import URL**.
3. Enter `https://github.com/lilvinz/halloween-box`.

The project can be edited with Blockly or TypeScript. Alternatively, import a locally built HEX file using **Import File**; the build embeds the project sources. Generated HEX files under `built/` are not tracked in this repository.

## Keep TypeScript and Blockly in sync

`main.ts` and `main.blocks` are two representations of the same program. Do not edit them independently.

- **In MakeCode:** edit either view, let the editor regenerate the other, and save or export both files together.
- **Outside MakeCode:** after editing `main.ts`, run `make blocks` before committing. This regenerates and validates `main.blocks`. TypeScript changes must remain within MakeCode's Blockly-supported subset.

With the local toolchain installed, use:

```sh
make blocks                           # Regenerate blocks from TypeScript
make check-blockly                    # Validate the checked-in block file
node tools/check-games.cjs             # Check game behaviour in TypeScript
```

`make check-blockly` loads the actual `main.blocks`, compiles it to TypeScript, checks types and hardware fields, and runs game-behaviour simulations. It rejects unsupported JavaScript blocks. It **does not prove equality with an independently edited `main.ts`**. Commit both source files after synchronizing them.

The simulations do not replace testing on the physical box.

## Local toolchain

Use a maintained Node.js LTS release, npm, Git, and Make. PXT Core 13.0.9 requires Node.js 18 or newer and npm 8 or newer. The commands below use a Linux/macOS shell; on Windows, use a compatible environment such as WSL. Internet access is needed for package downloads and cloud compilation.

From the project directory, install the CLI, the target version currently recorded in `pxt.json`, and the DOM dependency used by the Blockly checks:

```sh
npm install --no-save --package-lock=false pxt@0.5.1 pxt-microbit@9.0.12 jsdom@26.1.0
./node_modules/.bin/pxt install
```

These flags avoid adding a package manifest or lockfile. Dependencies are stored in the ignored `node_modules/` and `pxt_modules/` directories. When MakeCode changes the target version, check that the local toolchain matches it.

**Version note:** the existing local build and Blockly checks were verified with micro:bit target 8.1.3 / PXT Core 12.1.12. MakeCode subsequently regenerated the project for target 9.0.12. The matching installation above follows the published package metadata, but a clean 9.0.12 installation has not yet been validated here.

See the [MakeCode CLI documentation](https://makecode.com/cli) and [micro:bit target documentation](https://github.com/microsoft/pxt-microbit#readme) for toolchain details.

## Build and flash micro:bit V2

Build with the V2 compile switch rather than the default build, which previously exceeded the older target's size limit:

```sh
PXT_COMPILE_SWITCHES=csv-mbcodal ./node_modules/.bin/pxt build --ignoreTests
```

The output is `built/binary.hex`. Connect a **micro:bit V2** over USB and copy the file to the **MICROBIT** drive. This build is intended for V2, not V1. No local C++/CODAL toolchain is needed when using the normal cloud build.

## Project page

[lilvinz.github.io/halloween-box](https://lilvinz.github.io/halloween-box/)

## License

Original source code, including firmware, tools, and the website's HTML/CSS
presentation code, is licensed under the [MIT License](LICENSE).

Original project documentation and photos, including prose on the project
page, are licensed under [CC BY 4.0](LICENSE-docs.md). Attribution: **lilvinz**
([GitHub](https://github.com/lilvinz)). When sharing or adapting them, provide
credit, link to the license, and indicate changes.

Third-party code and other third-party materials retain their own licenses.
These notices do not license unpublished design files supplied by others.

#### Metadata (used for search, rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
