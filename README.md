
> Open this page at [https://lilvinz.github.io/halloween-box/](https://lilvinz.github.io/halloween-box/)

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open [https://makecode.microbit.org/](https://makecode.microbit.org/)
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for **https://github.com/lilvinz/halloween-box** and import

## Edit this project

To edit this repository in MakeCode.

* open [https://makecode.microbit.org/](https://makecode.microbit.org/)
* click on **Import** then click on **Import URL**
* paste **https://github.com/lilvinz/halloween-box** and click import

### Keep TypeScript and Blockly in sync

`main.ts` and `main.blocks` are both project sources; gameplay logic is represented with ordinary editable Blockly blocks. After changing TypeScript, run `make blocks` to generate and validate `main.blocks` with the installed PXT/Blockly compiler. After editing blocks in MakeCode, export the updated project sources together so that both files are included in the same change.

Run `make check-blockly` to validate the actual checked-in `main.blocks` XML, including native input/pin fields, Blockly diagnostics, generated-TypeScript typechecking, and game behavior checks. This validates the XML on its own; it does not claim semantic equality with `main.ts` when the two files were edited separately.

#### Metadata (used for search, rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
