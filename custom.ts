



/**
 * DFPlayer Pro control extension
 */
//% weight=100 color=#0fbc11 icon="\uf0c3" block="DFPlayer Pro"
namespace player_pro {

    let isConnected = false
    let lastPlayTimestamp = 0
    let playertime = -1
    let last_playertime = -1
    let serial_last_line = ""

    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function() {
        serial_last_line = serial.readLine()
    })

    /**
     * Connect to the DFPlayer Pro module using UART.
     * 
     * This must be called before using any other functions.
     * It automatically sets up the serial connection and disables
     * the onboard amplifier to prepare the module for external use.
     *
     * @param pinTX the TX pin on micro:bit (connected to RX on DFPlayer Pro), e.g. SerialPin.P0
     * @param pinRX the RX pin on micro:bit (connected to TX on DFPlayer Pro), e.g. SerialPin.P1
     */
    //% blockId="dfplayerpro_connect"
    //% block="connect DFPlayer Pro TX %pinTX|RX %pinRX"
    //% weight=100 blockGap=20
    //% pinTX.defl=SerialPin.P0
    //% pinRX.defl=SerialPin.P1
    export function connect(pinTX: SerialPin = SerialPin.P0, pinRX: SerialPin = SerialPin.P1): void {
        serial.redirect(pinTX, pinRX, BaudRate.BaudRate115200)
        isConnected = true
        basic.pause(500)
        // Set to music mode
        serial.writeString("AT+FUNCTION=1\r\n")
        basic.pause(50)
        // Disable internal amplifier
        serial.writeString("AT+AMP=OFF\r\n")
        basic.pause(50)
        // Disable prompt
        serial.writeString("AT+PROMPT=OFF\r\n")
        basic.pause(50)
        // Set volume
        serial.writeString("AT+VOL=30\r\n")
        basic.pause(50)
        // Set play mode to single
        serial.writeString("AT+PLAYMODE=3\r\n")
        basic.pause(50)
    }

    /**
     * Play a sound file by its numeric filename.
     * 
     * The DFPlayer Pro will play the file in the root directory
     * matching the given number (starting from 1). Files must follow
     * the naming convention: `1.mp3`, `2.mp3`, etc.
     *
     * @param num the track number to play, e.g. 1
     */
    //% blockId="dfplayerpro_play_sound"
    //% block="play sound number %num"
    //% weight=90 blockGap=12
    //% num.min=1 num.max=255
    export function play_sound(num: number) {
        if (!isConnected) return
        serial.writeString("AT+PLAYFILE=/" + convertToText(num) + ".mp3\r\n")
        lastPlayTimestamp = control.millis()
        playertime = -1
    }

    /**
     * Play a music track from the /music folder by its number.
     * 
     * The DFPlayer Pro will play the file located in the `/music/` directory
     * with the given number (starting from 1). Files must be named following
     * DFPlayer Pro conventions, e.g. `1.mp3`, `2.mp3`, etc.
     *
     * @param num the music track number to play, e.g. 1
     */
    //% blockId="dfplayerpro_play_music"
    //% block="play music track number %num"
    //% weight=89 blockGap=12
    //% num.min=1 num.max=255
    export function play_music(num: number) {
        if (!isConnected) return
        serial.writeString("AT+PLAYFILE=/music/" + convertToText(num) + ".mp3\r\n")
        lastPlayTimestamp = control.millis()
        playertime = -1
    }

    /**
     * Get the elapsed time in milliseconds since the last play command.
     * 
     * Returns 0 if no playback command has been issued yet.
     *
     * @returns milliseconds since the last play command
     */
    //% blockId="dfplayerpro_elapsed_since_play"
    //% block="milliseconds since last play"
    //% weight=80 blockGap=12
    export function millis_since_last_play(): number {
        return control.millis() - lastPlayTimestamp
    }

    /**
     * Wait until a specified number of milliseconds have passed
     * since the last play command.
     * 
     * This is useful for sequencing sounds or synchronizing
     * other actions to playback timing.
     *
     * @param ms the time in milliseconds to wait since the last play command, e.g. 500
     */
    //% blockId="dfplayerpro_wait_since_play"
    //% block="wait until %ms|ms since last play"
    //% weight=79
    //% ms.min=0 ms.max=60000
    export function wait_until_elapsed(ms: number) {
        if (lastPlayTimestamp == 0) return
        while (control.millis() - lastPlayTimestamp < ms) {
            basic.pause(5)
        }
    }

    /**
     * Get the current playback time from the DFPlayer Pro.
     * 
     * This queries the DFPlayer Pro using `AT+QUERY=3`, which returns
     * the current playtime in milliseconds of the track being played.
     * 
     * Returns 0 if no track is playing or if the response is invalid.
     *
     * @returns current playback time in milliseconds
     */
    //% blockId="dfplayerpro_get_playtime"
    //% block="current playback time (ms)"
    //% weight=80 blockGap=12
    export function get_playtime(): number {
        if (!isConnected) return 0

        serial_last_line = ""
        serial.writeString("AT+QUERY=3\r\n")
        const timeout = control.millis()
        while (serial_last_line == "" && control.millis() - timeout < 50) {
            basic.pause(5)
        }

        if (serial_last_line == null || serial_last_line.length == 0) return 0
        let playtime = parseInt(serial_last_line)
        if (isNaN(playtime)) return 0
        return playtime
    }

    /**
     * Check if the DFPlayer Pro playback time has advanced
     * since the last check.
     * 
     * This can be used to detect whether playback is progressing.
     * Returns `true` if the playtime has changed since the last call,
     * otherwise `false`.
     *
     * Useful for checking if playback is active or stalled.
     *
     * @returns true if playback time increased since last check
     */
    //% blockId="dfplayerpro_playtime_advanced"
    //% block="playback time advanced?"
    //% weight=78
    export function get_playtime_advanced(): boolean {
        if (!isConnected) return false

        // Enforce grace period after starting a track
        if (millis_since_last_play() < 2000) return true

        last_playertime = playertime
        playertime = get_playtime()

        // Direct comparison to allow for failed reads
        return playertime != last_playertime
    }
}


/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon="\uf0c3"
namespace halloween {
    // Auto-generated sprite functions from XCF files
    // Generated by convert_all_sprites.py

    //% blockId="stevens_law_brightness"
    //% block="perceived brightness of %inputValue|with exponent %exponent"
    //% help="Applies Stevens' Power Law to correct brightness perception. Use smaller exponents (<1) for brighter midtones, larger (>1) for darker response."
    //% group="Effects"
    //% inlineInputMode=inline
    //% weight=85
    //% inputValue.min=0 inputValue.max=255 inputValue.defl=128
    //% exponent.defl=1.0
    export function stevensLawBrightness(inputValue: number, exponent: number = 1.0): number {
        // Clamp input to 0..255
        const clamped = Math.max(0, Math.min(255, inputValue))

        // Normalize to 0..1
        const normalized = clamped / 255

        // Apply Stevens' Power Law
        const perceived = Math.pow(normalized, exponent)

        // Scale back to 0..255 (integer)
        return Math.round(perceived * 255)
    }

    // Helper: clamp to 0..255
    function clamp8(n: number) {
        return Math.max(0, Math.min(255, n | 0))
    }

    // Helper: scale a 24-bit RGB color by a factor (0..255)
    function scaleColor24(c: number, factor: number) {
        const r = (c >> 16) & 0xFF
        const g = (c >> 8) & 0xFF
        const b = c & 0xFF
        const rr = Math.idiv(r * factor, 255)
        const gg = Math.idiv(g * factor, 255)
        const bb = Math.idiv(b * factor, 255)
        return (rr << 16) | (gg << 8) | bb
    }

    /**
     * Display a 5×5 RGBW image on a NeoPixel strip with independent RGB/White brightness,
     * optional clear before drawing, and optional auto-show.
     * @param strip The NeoPixel strip or matrix to draw on
     * @param RGBW The 25-element image array: [ [neopixel.rgb(r,g,b), w], ... ]
     * @param brightnessRGB Brightness for RGB (0–255). Default 255
     * @param brightnessW Brightness for White (0–255). Default 255
     * @param showAfter Call show() after drawing (default true)
     */
    //% blockId="bild_anzeigen_advanced"
    //% block="display %RGBW on %strip|RGB %brightnessRGB|White %brightnessW|show %showAfter"
    //% group="Display"
    //% inlineInputMode=inline
    //% weight=100
    //% brightnessRGB.min=0 brightnessRGB.max=255 brightnessRGB.defl=255
    //% brightnessW.min=0 brightnessW.max=255 brightnessW.defl=255
    export function Bild_anzeigen(
        RGBW: number[][],
        strip: neopixel.Strip,
        brightnessRGB: number = 255,
        brightnessW: number = 255,
        showAfter: boolean = true
    ) {
        const br = clamp8(brightnessRGB)
        const bw = clamp8(brightnessW)

        for (let i = 0; i < 25 && i < RGBW.length; i++) {
            const c = RGBW[i][0] | 0
            const w = clamp8(RGBW[i][1] || 0)
            const cScaled = (br === 255) ? c : scaleColor24(c, br)
            const wScaled = (bw === 255) ? w : Math.idiv(w * bw, 255)
            strip.setPixelColor(i, cScaled)
            strip.setPixelWhiteLED(i, wScaled)
        }

        if (showAfter) strip.show()
    }

    /**
     * Calculates a pulsing brightness value (0–255) based on the system time.
     * @param cycleMs Full pulse cycle time in milliseconds (e.g. 2000 = 2 s up/down)
     * @param minB Minimum brightness (0–255)
     * @param maxB Maximum brightness (0–255)
     * @returns Brightness value (0–255)
     */
    //% blockId="pulsing_brightness"
    //% block="pulsing brightness with cycle %cycleMs|ms min %minB|max %maxB"
    //% help="Generates a sinusoidal brightness between min and max based on the system millisecond tick."
    //% group="Effects"
    //% inlineInputMode=inline
    //% weight=90
    //% cycleMs.defl=2000 minB.defl=50 maxB.defl=255
    export function Pulsing_Brightness(cycleMs: number, minB: number, maxB: number): number {
        const now = control.millis() % cycleMs
        const phase = (now / cycleMs) * 2 * Math.PI
        const wave = (Math.sin(phase) + 1) / 2  // 0..1
        const value = minB + wave * (maxB - minB)
        return Math.round(value)
    }

    // Auto-generated sprite functions from XCF files
    // Generated by convert_all_sprites.py

    //% block
    /**
    * Returns the 5×5 RGBW sprite for Enno1.
    * Each element is [ [neopixel.rgb(r,g,b), whiteBrightness] ].
    */
    //% blockId="sprite_Enno1"
    //% block="Enno1 image"
    //% help="Provides the 5×5 Enno1 image as an RGBW array for display on your NeoPixel matrix."
    //% group="Images"
    //% weight=100
    export function Enno1(): number[][] {
        return [
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 82, 5), 133], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 82, 5), 133], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 82, 5), 133], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255],
            [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 82, 5), 133], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 82, 5), 133], [neopixel.rgb(0, 0, 0), 255],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 0]
        ]
    }

    //% block
    /**
    * Returns the 5×5 RGBW sprite for Enno2.
    * Each element is [ [neopixel.rgb(r,g,b), whiteBrightness] ].
    */
    //% blockId="sprite_Enno2"
    //% block="Enno2 image"
    //% help="Provides the 5×5 Enno2 image as an RGBW array for display on your NeoPixel matrix."
    //% group="Images"
    //% weight=100
    export function Enno2(): number[][] {
        return [
            [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(255, 90, 0), 0], [neopixel.rgb(255, 90, 0), 0], [neopixel.rgb(255, 90, 0), 0], [neopixel.rgb(0, 0, 0), 255],
            [neopixel.rgb(255, 90, 0), 0], [neopixel.rgb(0, 215, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 215, 0), 0], [neopixel.rgb(255, 90, 0), 0],
            [neopixel.rgb(255, 90, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 215, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(255, 90, 0), 0],
            [neopixel.rgb(255, 90, 0), 0], [neopixel.rgb(0, 215, 0), 0], [neopixel.rgb(0, 215, 0), 0], [neopixel.rgb(0, 215, 0), 0], [neopixel.rgb(255, 90, 0), 0],
            [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(255, 90, 0), 0], [neopixel.rgb(255, 90, 0), 0], [neopixel.rgb(255, 90, 0), 0], [neopixel.rgb(0, 0, 0), 255]
        ]
    }

    //% block
    /**
    * Returns the 5×5 RGBW sprite for Enno3.
    * Each element is [ [neopixel.rgb(r,g,b), whiteBrightness] ].
    */
    //% blockId="sprite_Enno3"
    //% block="Enno3 image"
    //% help="Provides the 5×5 Enno3 image as an RGBW array for display on your NeoPixel matrix."
    //% group="Images"
    //% weight=100
    export function Enno3(): number[][] {
        return [
            [neopixel.rgb(0, 0, 0), 117], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(0, 0, 0), 117], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(0, 0, 0), 117],
            [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(0, 0, 0), 117], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(0, 0, 0), 117], [neopixel.rgb(192, 179, 0), 33],
            [neopixel.rgb(0, 0, 0), 117], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(0, 0, 0), 117], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(0, 0, 0), 117],
            [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(0, 0, 0), 117], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(0, 0, 0), 117], [neopixel.rgb(192, 179, 0), 33],
            [neopixel.rgb(0, 0, 0), 117], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(0, 0, 0), 117], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(0, 0, 0), 117]
        ]
    }

    //% block
    /**
    * Returns the 5×5 RGBW sprite for Enno4.
    * Each element is [ [neopixel.rgb(r,g,b), whiteBrightness] ].
    */
    //% blockId="sprite_Enno4"
    //% block="Enno4 image"
    //% help="Provides the 5×5 Enno4 image as an RGBW array for display on your NeoPixel matrix."
    //% group="Images"
    //% weight=100
    export function Enno4(): number[][] {
        return [
            [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(192, 179, 0), 33],
            [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(26, 0, 192), 32],
            [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32],
            [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32],
            [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(26, 0, 192), 32]
        ]
    }

    //% block
    /**
    * Returns the 5×5 RGBW sprite for Enno5.
    * Each element is [ [neopixel.rgb(r,g,b), whiteBrightness] ].
    */
    //% blockId="sprite_Enno5"
    //% block="Enno5 image"
    //% help="Provides the 5×5 Enno5 image as an RGBW array for display on your NeoPixel matrix."
    //% group="Images"
    //% weight=100
    export function Enno5(): number[][] {
        return [
            [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(255, 90, 0), 0], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(255, 90, 0), 0], [neopixel.rgb(26, 0, 192), 32],
            [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(255, 90, 0), 0], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32],
            [neopixel.rgb(255, 90, 0), 0], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(255, 90, 0), 0],
            [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(255, 90, 0), 0], [neopixel.rgb(255, 90, 0), 0], [neopixel.rgb(255, 90, 0), 0], [neopixel.rgb(26, 0, 192), 32],
            [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32]
        ]
    }

    //% block
    /**
    * Returns the 5×5 RGBW sprite for Enno6.
    * Each element is [ [neopixel.rgb(r,g,b), whiteBrightness] ].
    */
    //% blockId="sprite_Enno6"
    //% block="Enno6 image"
    //% help="Provides the 5×5 Enno6 image as an RGBW array for display on your NeoPixel matrix."
    //% group="Images"
    //% weight=100
    export function Enno6(): number[][] {
        return [
            [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(113, 0, 0), 26],
            [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(113, 0, 0), 26], [neopixel.rgb(26, 0, 192), 32],
            [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(0, 0, 0), 3], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(26, 0, 192), 32],
            [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(192, 179, 0), 33], [neopixel.rgb(192, 179, 0), 33],
            [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32], [neopixel.rgb(26, 0, 192), 32]
        ]
    }

    //% block
    /**
    * Returns the 5×5 RGBW sprite for Falsch.
    * Each element is [ [neopixel.rgb(r,g,b), whiteBrightness] ].
    */
    //% blockId="sprite_Falsch"
    //% block="Falsch image"
    //% help="Provides the 5×5 Falsch image as an RGBW array for display on your NeoPixel matrix."
    //% group="Images"
    //% weight=100
    export function Falsch(): number[][] {
        return [
            [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(248, 0, 8), 7],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(248, 0, 8), 7]
        ]
    }

    //% block
    /**
    * Returns the 5×5 RGBW sprite for Feuer.
    * Each element is [ [neopixel.rgb(r,g,b), whiteBrightness] ].
    */
    //% blockId="sprite_Feuer"
    //% block="Feuer image"
    //% help="Provides the 5×5 Feuer image as an RGBW array for display on your NeoPixel matrix."
    //% group="Images"
    //% weight=100
    export function Feuer(): number[][] {
        return [
            [neopixel.rgb(108, 0, 33), 0], [neopixel.rgb(173, 0, 0), 0], [neopixel.rgb(197, 105, 0), 51], [neopixel.rgb(202, 50, 0), 0], [neopixel.rgb(108, 0, 33), 0],
            [neopixel.rgb(108, 0, 33), 0], [neopixel.rgb(202, 50, 0), 0], [neopixel.rgb(163, 137, 0), 92], [neopixel.rgb(197, 105, 0), 51], [neopixel.rgb(173, 0, 0), 0],
            [neopixel.rgb(173, 0, 0), 0], [neopixel.rgb(197, 105, 0), 51], [neopixel.rgb(59, 54, 0), 196], [neopixel.rgb(163, 137, 0), 92], [neopixel.rgb(173, 0, 0), 0],
            [neopixel.rgb(202, 50, 0), 0], [neopixel.rgb(163, 137, 0), 92], [neopixel.rgb(59, 54, 0), 196], [neopixel.rgb(163, 137, 0), 92], [neopixel.rgb(202, 50, 0), 0],
            [neopixel.rgb(197, 105, 0), 51], [neopixel.rgb(59, 54, 0), 196], [neopixel.rgb(59, 54, 0), 196], [neopixel.rgb(163, 137, 0), 92], [neopixel.rgb(197, 105, 0), 51]
        ]
    }

    //% block
    /**
    * Returns the 5×5 RGBW sprite for Geist.
    * Each element is [ [neopixel.rgb(r,g,b), whiteBrightness] ].
    */
    //% blockId="sprite_Geist"
    //% block="Geist image"
    //% help="Provides the 5×5 Geist image as an RGBW array for display on your NeoPixel matrix."
    //% group="Images"
    //% weight=100
    export function Geist(): number[][] {
        return [
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(255, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(255, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255],
            [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255],
            [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 0]
        ]
    }

    //% block
    /**
    * Returns the 5×5 RGBW sprite for Herz.
    * Each element is [ [neopixel.rgb(r,g,b), whiteBrightness] ].
    */
    //% blockId="sprite_Herz"
    //% block="Herz image"
    //% help="Provides the 5×5 Herz image as an RGBW array for display on your NeoPixel matrix."
    //% group="Images"
    //% weight=100
    export function Herz(): number[][] {
        return [
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(248, 0, 8), 7],
            [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(248, 0, 8), 7],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(248, 0, 8), 7], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0]
        ]
    }

    //% block
    /**
    * Returns the 5×5 RGBW sprite for Kürbis.
    * Each element is [ [neopixel.rgb(r,g,b), whiteBrightness] ].
    */
    //% blockId="sprite_Kürbis"
    //% block="Kürbis image"
    //% help="Provides the 5×5 Kürbis image as an RGBW array for display on your NeoPixel matrix."
    //% group="Images"
    //% weight=100
    export function Kürbis(): number[][] {
        return [
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(51, 104, 0), 13], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(245, 116, 0), 5], [neopixel.rgb(245, 116, 0), 5], [neopixel.rgb(245, 116, 0), 5], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(245, 116, 0), 5], [neopixel.rgb(67, 31, 0), 183], [neopixel.rgb(245, 116, 0), 5], [neopixel.rgb(67, 31, 0), 183], [neopixel.rgb(245, 116, 0), 5],
            [neopixel.rgb(245, 116, 0), 5], [neopixel.rgb(245, 116, 0), 5], [neopixel.rgb(67, 31, 0), 183], [neopixel.rgb(245, 116, 0), 5], [neopixel.rgb(245, 116, 0), 5],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(245, 116, 0), 5], [neopixel.rgb(245, 116, 0), 5], [neopixel.rgb(245, 116, 0), 5], [neopixel.rgb(0, 0, 0), 0]
        ]
    }

    //% block
    /**
    * Returns the 5×5 RGBW sprite for OK.
    * Each element is [ [neopixel.rgb(r,g,b), whiteBrightness] ].
    */
    //% blockId="sprite_OK"
    //% block="OK image"
    //% help="Provides the 5×5 OK image as an RGBW array for display on your NeoPixel matrix."
    //% group="Images"
    //% weight=100
    export function OK(): number[][] {
        return [
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 255, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 255, 0), 0], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 255, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 255, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 255, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0]
        ]
    }

    //% block
    /**
    * Returns the 5×5 RGBW sprite for Totenkopf.
    * Each element is [ [neopixel.rgb(r,g,b), whiteBrightness] ].
    */
    //% blockId="sprite_Totenkopf"
    //% block="Totenkopf image"
    //% help="Provides the 5×5 Totenkopf image as an RGBW array for display on your NeoPixel matrix."
    //% group="Images"
    //% weight=100
    export function Totenkopf(): number[][] {
        return [
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255],
            [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 0]
        ]
    }

    //% block
    /**
    * Returns the 5×5 RGBW sprite for Zuckerstange.
    * Each element is [ [neopixel.rgb(r,g,b), whiteBrightness] ].
    */
    //% blockId="sprite_Zuckerstange"
    //% block="Zuckerstange image"
    //% help="Provides the 5×5 Zuckerstange image as an RGBW array for display on your NeoPixel matrix."
    //% group="Images"
    //% weight=100
    export function Zuckerstange(): number[][] {
        return [
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(255, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(255, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(255, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(255, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0]
        ]
    }

    //% block
    /**
    * Returns the 5×5 RGBW sprite for Zuckerstange2.
    * Each element is [ [neopixel.rgb(r,g,b), whiteBrightness] ].
    */
    //% blockId="sprite_Zuckerstange2"
    //% block="Zuckerstange2 image"
    //% help="Provides the 5×5 Zuckerstange2 image as an RGBW array for display on your NeoPixel matrix."
    //% group="Images"
    //% weight=100
    export function Zuckerstange2(): number[][] {
        return [
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(255, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(255, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(255, 0, 0), 0], [neopixel.rgb(0, 0, 0), 0],
            [neopixel.rgb(0, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(255, 0, 0), 0], [neopixel.rgb(0, 0, 0), 255], [neopixel.rgb(0, 0, 0), 0]
        ]
    }
}
