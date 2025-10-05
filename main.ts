function Spiel_1 () {
    HalloweenKeypad.clearEventQueue()
    PixelListe = []
    for (let Index = 0; Index <= 25; Index++) {
        PixelListe.push(1)
    }
    Timer = control.millis()
    Fortschritt = 0
    Tastenmatrix.showRainbow(1, 360)
    Tastenmatrix.show()
    while (Fortschritt < 25 && control.millis() - Timer < 10000) {
        Ergebnis = HalloweenKeypad.waitForAnyKey(50)
        if (Ergebnis >= 0) {
            if (PixelListe[Ergebnis] == 1) {
                Starte_Sound(7)
                PixelListe[Ergebnis] = 0
                Tastenmatrix.setPixelColor(Ergebnis, neopixel.colors(NeoPixelColors.Black))
                Tastenmatrix.setPixelWhiteLED(Ergebnis, 0)
                Tastenmatrix.show()
                Fortschritt += 1
            } else {
                Starte_Sound(2)
            }
        }
    }
    if (Fortschritt == 25) {
        return 1
    } else {
        return 0
    }
}
control.onEvent(EventBusSource.MICROBIT_ID_IO_P8, EventBusValue.MICROBIT_PIN_EVT_RISE, function () {
    Tastenmatrix.setPixelColor(20, neopixel.colors(NeoPixelColors.Black))
    Tastenmatrix.show()
})
function Empfundene_Helligkeit (num: number) {
    return 0
}
function Spiel_2 () {
    HalloweenKeypad.clearEventQueue()
    Timeout = 20000
    Fortschritt = 0
    while (Fortschritt < 10) {
        Pixel = randint(0, 24)
        Timer = control.millis()
        while (control.millis() - Timer < Timeout) {
            Ergebnis = HalloweenKeypad.waitForAnyKey(50)
            if (Ergebnis >= 0) {
                if (Ergebnis == Pixel) {
                    Starte_Sound(7)
                    Fortschritt += 1
                    Timeout = Timeout * 0.75
                } else {
                    Starte_Sound(2)
                    Fortschritt += -1
                    Timeout = Timeout * 0.75
                    if (Fortschritt < 0) {
                        Warte_auf_Soundende()
                        return 0
                    }
                }
                break;
            }
        }
        if (control.millis() - Timer >= Timeout) {
            Fortschritt += -1
            Timeout = Timeout * 0.75
            if (Fortschritt < 0) {
                return 0
            }
        }
        Tastenmatrix.setPixelColor(Pixel, neopixel.colors(NeoPixelColors.Black))
    }
    if (Fortschritt >= 10) {
        return 1
    } else {
        return 0
    }
}
function Warte_auf_Soundende () {
    // Hier müssen wir warten, falls der Player gerade erst los geschickt wurde.
    basic.pause(50)
    while (Sound_spielt()) {
        basic.pause(10)
    }
}
function Bild_anzeigen (RGBW: number[][]) {
    for (let Index = 0; Index <= 24; Index++) {
        Tastenmatrix.setPixelColor(Index, RGBW[Index][0])
        Tastenmatrix.setPixelWhiteLED(Index, RGBW[Index][1])
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
            if (!(Sound_spielt())) {
                Starte_Sound(8)
            }
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
        Starte_Sound(2)
        Warte_auf_Soundende()
        Starte_Sound(2)
        Warte_auf_Soundende()
        Starte_Sound(2)
        Warte_auf_Soundende()
    }
}
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
    Bild_anzeigen(halloween.Geist())
    basic.pause(500)
    Bild_anzeigen(halloween.Zuckerstange())
    basic.pause(500)
    Bild_anzeigen(halloween.Totenkopf())
    basic.pause(500)
    Bild_anzeigen(halloween.OK())
    basic.pause(500)
    Bild_anzeigen(halloween.Kürbis())
    basic.pause(500)
    Bild_anzeigen(halloween.Herz())
    basic.pause(500)
    Tastenmatrix.clear()
    Tastenmatrix.show()
}
function Attraktion () {
    HalloweenKeypad.clearEventQueue()
    while (HalloweenKeypad.waitForAnyKey(10) == -1) {
        if (!(Sound_spielt())) {
            Starte_Sound(randint(9, 15))
        }
        Tastenmatrix.showBarGraph(input.soundLevel(), 255)
        Tastenmatrix.show()
    }
}
function Spiel_3 () {
    return 0
}
input.onButtonPressed(Button.B, function () {
	
})
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
    basic.pause(50)
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
let Pixel = 0
let Timeout = 0
let Ergebnis = 0
let Fortschritt = 0
let Timer = 0
let PixelListe: number[] = []
let Tastenmatrix: neopixel.Strip = null
let Kreis: neopixel.Strip = null
// Sensor in der Ausgabe. Ist ein open drain low active. Deshalb pull-up aktiv.
pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
pins.setEvents(DigitalPin.P8, PinEventType.Edge)
Verstärker(18)
HalloweenKeypad.initialize()
Kreis = neopixel.create(DigitalPin.P12, 35, NeoPixelMode.RGB)
Tastenmatrix = neopixel.create(DigitalPin.P1, 25, NeoPixelMode.RGBW)
Tastenmatrix.setMatrixWidth(5)
loops.everyInterval(50, function () {
    Kreis.rotate(1)
    Kreis.show()
})
basic.forever(function () {
    Tastenmatrix.clear()
    Attraktion()
    Spielstart()
    Spiel = randint(2, 2)
    if (Spiel == 1) {
        Ergebnis = Spiel_1()
    } else if (Spiel == 2) {
        Ergebnis = Spiel_2()
    } else if (Spiel == 3) {
        Ergebnis = Spiel_3()
    } else if (Spiel == 4) {
        Ergebnis = Spiel_4()
    } else {
        Ergebnis = 0
    }
    Spiel = 0
    if (Ergebnis) {
        Bonbons_ausgeben()
    } else {
        Starte_Sound(5)
        Warte_auf_Soundende()
    }
})
control.inBackground(function () {
    while (true) {
        if (Spiel == 2) {
            Tastenmatrix.setPixelColor(Pixel, neopixel.rgb(halloween.stevensLawBrightness(Math.map(control.millis() - Timer, 0, Timeout, 255, 0), 1), 0, 0))
            Tastenmatrix.show()
        } else {
        	
        }
        basic.pause(100)
    }
})
