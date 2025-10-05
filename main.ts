function Spiel_1 () {
    return 0
}
control.onEvent(EventBusSource.MICROBIT_ID_IO_P8, EventBusValue.MICROBIT_PIN_EVT_RISE, function () {
    Tastenmatrix.setPixelColor(20, neopixel.colors(NeoPixelColors.Black))
    Tastenmatrix.show()
})
function Spiel_2 () {
    return 0
}
function Warte_auf_Soundende () {
    while (Sound_spielt()) {
        basic.pause(100)
    }
}
function Bild_anzeigen (RGB: number[], W: number[]) {
    for (let Index = 0; Index <= 24; Index++) {
        Tastenmatrix.setPixelWhiteLED(Index, W[Index])
        Tastenmatrix.setPixelColor(Index, RGB[Index])
    }
    Tastenmatrix.show()
}
function Bonbons_ausgeben () {
    Mindestmenge = 2
    Anzahl_Bonbon = 0
    Tastenmatrix.showBarGraph(Anzahl_Bonbon, 24)
    Tastenmatrix.show()
    Kreis.showRainbow(1, 360)
    for (let index = 0; index < 2; index++) {
        Starte_Sound(8)
        Ausgabe_Startzeit = control.millis()
        Ausgabe_Dauer_bis_Bonbon = 0
        Ein_Bonbon_erkannt = 0
        servos.P0.run(-40)
        basic.pause(150)
        servos.P0.run(15)
        // Das ist das Zeitlimit
        while (Anzahl_Bonbon < Mindestmenge && (Ein_Bonbon_erkannt == 0 && Ausgabe_Dauer_bis_Bonbon < 10000)) {
            Ausgabe_Dauer_bis_Bonbon = control.millis() - Ausgabe_Startzeit
            basic.pause(5)
        }
        servos.P0.run(-60)
        basic.pause(200)
        servos.P0.stop()
        // Hier müssen wir warten, falls noch welche fallen.
        basic.pause(1000)
        if (Anzahl_Bonbon >= Mindestmenge) {
            break;
        }
    }
    Kreis.clear()
    Warte_auf_Soundende()
    if (Anzahl_Bonbon < Mindestmenge) {
        Starte_Sound(1)
    }
}
HalloweenKeypad.onKeyPressed(20, function () {
    control.raiseEvent(
    EventBusSource.MICROBIT_ID_BUTTON_A,
    EventBusValue.MICROBIT_BUTTON_EVT_CLICK
    )
})
HalloweenKeypad.onAnyKeyPressed(function (key2) {
    Tastenmatrix.setPixelColor(key2, neopixel.colors(NeoPixelColors.Red))
    Tastenmatrix.setMatrixColor(HalloweenKeypad.getKeyColumn(key2), HalloweenKeypad.getKeyRow(key2), neopixel.colors(NeoPixelColors.Red))
    Tastenmatrix.show()
})
input.onButtonPressed(Button.A, function () {
    Bonbons_ausgeben()
})
control.onEvent(EventBusSource.MICROBIT_ID_IO_P8, EventBusValue.MICROBIT_PIN_EVT_FALL, function () {
    Ein_Bonbon_erkannt = 1
    Anzahl_Bonbon += 1
    Tastenmatrix.showBarGraph(Anzahl_Bonbon, 24)
    Tastenmatrix.setPixelColor(20, neopixel.colors(NeoPixelColors.White))
    Tastenmatrix.show()
})
function Sound_spielt () {
    return pins.digitalReadPin(DigitalPin.P9) == 1
}
function Spiel_4 () {
    return 0
}
function Spielstart () {
    Starte_Sound(6)
    Warte_auf_Soundende()
}
function Attraktion () {
    HalloweenKeypad.initialize()
    while (HalloweenKeypad.getLastKeyPressed() == -1) {
        if (!(Sound_spielt())) {
            Starte_Sound(randint(10, 15))
        }
        Tastenmatrix.showBarGraph(input.soundLevel(), 255)
        Tastenmatrix.show()
        basic.pause(10)
    }
}
HalloweenKeypad.onAnyKeyReleased(function (key) {
    Tastenmatrix.setPixelColor(key, neopixel.colors(NeoPixelColors.Black))
    Tastenmatrix.setMatrixColor(HalloweenKeypad.getKeyColumn(key), HalloweenKeypad.getKeyRow(key), neopixel.colors(NeoPixelColors.Black))
    Tastenmatrix.show()
})
function Spiel_3 () {
    return 0
}
input.onGesture(Gesture.Shake, function () {
    Starte_Sound(15)
})
function Starte_Sound (num: number) {
    if (Math.floor(num / 1) % 2 == 1) {
        pins.setPull(DigitalPin.P13, PinPullMode.PullUp)
    } else {
        pins.setPull(DigitalPin.P13, PinPullMode.PullDown)
    }
    if (Math.floor(num / 2) % 2 == 1) {
        pins.setPull(DigitalPin.P14, PinPullMode.PullUp)
    } else {
        pins.setPull(DigitalPin.P14, PinPullMode.PullDown)
    }
    if (Math.floor(num / 4) % 2 == 1) {
        pins.setPull(DigitalPin.P15, PinPullMode.PullUp)
    } else {
        pins.setPull(DigitalPin.P15, PinPullMode.PullDown)
    }
    if (Math.floor(num / 8) % 2 == 1) {
        pins.setPull(DigitalPin.P16, PinPullMode.PullUp)
    } else {
        pins.setPull(DigitalPin.P16, PinPullMode.PullDown)
    }
    basic.pause(100)
    pins.setPull(DigitalPin.P13, PinPullMode.PullNone)
    pins.setPull(DigitalPin.P14, PinPullMode.PullNone)
    pins.setPull(DigitalPin.P15, PinPullMode.PullNone)
    pins.setPull(DigitalPin.P16, PinPullMode.PullNone)
}
function Verstärker (Lautstärke: number) {
    Geprüfte_Lautstärke = Lautstärke
    if (Geprüfte_Lautstärke < 0) {
        Geprüfte_Lautstärke = 0
    }
    if (Geprüfte_Lautstärke > 63) {
        Geprüfte_Lautstärke = 63
    }
    pins.i2cWriteNumber(
    75,
    Geprüfte_Lautstärke,
    NumberFormat.UInt8LE,
    false
    )
}
let Spiel = 0
let Geprüfte_Lautstärke = 0
let Ein_Bonbon_erkannt = 0
let Ausgabe_Dauer_bis_Bonbon = 0
let Ausgabe_Startzeit = 0
let Anzahl_Bonbon = 0
let Mindestmenge = 0
let Tastenmatrix: neopixel.Strip = null
let Kreis: neopixel.Strip = null
// Sensor in der Ausgabe. Ist ein open drain low active. Deshalb pull-up aktiv.
pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
pins.setEvents(DigitalPin.P8, PinEventType.Edge)
Verstärker(20)
HalloweenKeypad.initialize()
Kreis = neopixel.create(DigitalPin.P12, 35, NeoPixelMode.RGB)
Tastenmatrix = neopixel.create(DigitalPin.P1, 25, NeoPixelMode.RGBW)
Tastenmatrix.showRainbow(1, 360)
Tastenmatrix.show()
Tastenmatrix.setMatrixWidth(5)
basic.forever(function () {
    Attraktion()
    Spielstart()
    Spiel = randint(1, 10)
    if (Spiel == 1) {
        Spiel = Spiel_1()
    } else if (Spiel == 2) {
        Spiel = Spiel_2()
    } else if (Spiel == 3) {
        Spiel = Spiel_3()
    } else if (Spiel == 4) {
        Spiel = Spiel_4()
    } else {
        Spiel = 0
    }
    if (Spiel) {
        Bonbons_ausgeben()
    } else {
        Starte_Sound(5)
    }
})
