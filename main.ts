function Spiel_1 () {
    HalloweenKeypad.clearEventQueue()
    Timeout = 10000
    PixelListe = []
    for (let Index = 0; Index <= 25; Index++) {
        PixelListe.push(1)
    }
    Timer = control.millis()
    Fortschritt = 0
    while (Fortschritt < 25 && control.millis() - Timer < Timeout) {
        Ergebnis = HalloweenKeypad.waitForAnyKey(50)
        if (Ergebnis >= 0) {
            if (PixelListe[Ergebnis] == 1) {
                Starte_Sound(7)
                PixelListe[Ergebnis] = 0
                Tastenmatrix.setPixelColor(Ergebnis, neopixel.colors(NeoPixelColors.Black))
                Tastenmatrix.show()
                Fortschritt += 1
            } else {
                Starte_Sound(2)
                Timeout = Timeout * 0.75
            }
        }
    }
    if (Fortschritt == 25) {
        return 1
    } else {
        return 0
    }
}
function Spiel_Hintergrund_4 () {
	
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
function Spiel_Hintergrund_1 () {
    for (let Index2 = 0; Index2 <= 25; Index2++) {
        if (PixelListe[Index2]) {
            Tastenmatrix.setPixelColor(Index2, neopixel.rgb(halloween.stevensLawBrightness(Math.map(control.millis() - Timer, 0, Timeout, 255, 0), 0.5), 0, 0))
        }
    }
    Tastenmatrix.show()
}
function Bonbonausgabe_Hintergrund () {
    if (!(Sound_spielt())) {
        Starte_Sound(8)
    }
    Kreis.rotate(1)
    Kreis.show()
    if (Math.idiv(control.millis(), 1000) % 2 == 1) {
        halloween.Bild_anzeigen(halloween.Zuckerstange(), Tastenmatrix, 255, 255, true)
    } else {
        halloween.Bild_anzeigen(halloween.Zuckerstange2(), Tastenmatrix, 255, 255, true)
    }
}
function Bonbons_ausgeben () {
    Starte_Sound(8)
    Spiel = 99
    Kreis.showRainbow(1, 360)
    Mindestmenge = 2
    Anzahl_Bonbon = 0
    for (let index = 0; index < 2; index++) {
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
    Spiel = 0
    Kreis.clear()
    Kreis.show()
    Warte_auf_Soundende()
    if (Anzahl_Bonbon < Mindestmenge) {
        halloween.Bild_anzeigen(halloween.Falsch(), Tastenmatrix, 255, 255, true)
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
    control.reset()
})
function Spiel_Hintergrund_3 () {
	
}
control.onEvent(EventBusSource.MICROBIT_ID_IO_P8, EventBusValue.MICROBIT_PIN_EVT_FALL, function () {
    Ein_Bonbon_erkannt = 1
    Anzahl_Bonbon += 1
})
function Sound_spielt () {
    return pins.digitalReadPin(DigitalPin.P9) == 1
}
function Spiel_Hintergrund_2 () {
    Tastenmatrix.setPixelColor(Pixel, neopixel.rgb(0, 0, halloween.stevensLawBrightness(Math.map(control.millis() - Timer, 0, Timeout, 255, 0), 0.5)))
    Tastenmatrix.show()
}
function Spiel_4 () {
    return 0
}
function Spielstart () {
    Starte_Sound(6)
    Spielstart_Bild = randint(0, 2)
    if (Spielstart_Bild == 0) {
        halloween.Bild_anzeigen(halloween.Geist(), Tastenmatrix, 255, 255, true)
    } else if (Spielstart_Bild == 1) {
        halloween.Bild_anzeigen(halloween.Totenkopf(), Tastenmatrix, 255, 255, true)
    } else {
        halloween.Bild_anzeigen(halloween.Kürbis(), Tastenmatrix, 255, 255, true)
    }
    Warte_auf_Soundende()
    Tastenmatrix.clear()
    Tastenmatrix.show()
}
function Attraktion () {
    Spiel = 98
    // Warte bis der Hintergrund läuft
    basic.pause(100)
    HalloweenKeypad.initialize()
    while (HalloweenKeypad.getLastKeyPressed() == -1) {
        Attraktionsmodus = randint(1, 3)
        Timeout = 60000
        Timer = control.millis()
        if (Attraktionsmodus == 1) {
            Tastenmatrix.clear()
            while (HalloweenKeypad.waitForAnyKey(0) == -1 && control.millis() - Timer < Timeout) {
                Tastenmatrix.showBarGraph(input.soundLevel(), 255)
                Tastenmatrix.show()
                basic.pause(10)
            }
        } else if (Attraktionsmodus == 2) {
            while (HalloweenKeypad.waitForAnyKey(0) == -1 && control.millis() - Timer < Timeout) {
                Attraktion_Helfer = randint(0, 24)
                Tastenmatrix.clear()
                Tastenmatrix.setPixelWhiteLED(Attraktion_Helfer, 255)
                Tastenmatrix.setPixelColor(Attraktion_Helfer, neopixel.colors(NeoPixelColors.White))
                Tastenmatrix.show()
                basic.pause(randint(50, 100))
                Tastenmatrix.clear()
                Tastenmatrix.show()
                basic.pause(randint(500, 1000))
            }
        } else if (Attraktionsmodus == 3) {
            Attraktion_Helfer = randint(0, 3)
            if (Attraktion_Helfer == 0) {
                Starte_Sound(3)
                while (HalloweenKeypad.waitForAnyKey(0) == -1 && control.millis() - Timer < Timeout) {
                    Attraktion_Helfer = halloween.stevensLawBrightness(halloween.Pulsing_Brightness(2000, 10, 255), 0.5)
                    halloween.Bild_anzeigen(halloween.Totenkopf(), Tastenmatrix, Attraktion_Helfer, Attraktion_Helfer, true)
                    basic.pause(10)
                }
            } else if (Attraktion_Helfer == 1) {
                Starte_Sound(7)
                while (HalloweenKeypad.waitForAnyKey(0) == -1 && control.millis() - Timer < Timeout) {
                    Attraktion_Helfer = halloween.stevensLawBrightness(halloween.Pulsing_Brightness(2000, 10, 255), 0.5)
                    halloween.Bild_anzeigen(halloween.Herz(), Tastenmatrix, Attraktion_Helfer, Attraktion_Helfer, true)
                    basic.pause(10)
                }
            } else if (Attraktion_Helfer == 2) {
                Starte_Sound(4)
                while (HalloweenKeypad.waitForAnyKey(0) == -1 && control.millis() - Timer < Timeout) {
                    Attraktion_Helfer = halloween.stevensLawBrightness(halloween.Pulsing_Brightness(2000, 10, 255), 0.5)
                    halloween.Bild_anzeigen(halloween.Kürbis(), Tastenmatrix, Attraktion_Helfer, Attraktion_Helfer, true)
                    basic.pause(10)
                }
            } else if (Attraktion_Helfer == 3) {
                Starte_Sound(16)
                while (HalloweenKeypad.waitForAnyKey(0) == -1 && control.millis() - Timer < Timeout) {
                    Attraktion_Helfer = halloween.stevensLawBrightness(halloween.Pulsing_Brightness(2000, 10, 255), 0.5)
                    halloween.Bild_anzeigen(halloween.Geist(), Tastenmatrix, 255, Attraktion_Helfer, true)
                    basic.pause(10)
                }
            } else {
            	
            }
        } else {
        	
        }
    }
    Spiel = 0
    // Warte bis der Hintergrund fertig verarbeitet ist.
    basic.pause(100)
}
function Spiel_3 () {
    return 0
}
input.onButtonPressed(Button.B, function () {
	
})
input.onGesture(Gesture.Shake, function () {
    Starte_Sound(15)
})
radio.onReceivedValue(function (name, value) {
	
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
function Attraktion_Hintergrund () {
    if (!(Sound_spielt())) {
        Starte_Sound(randint(9, 15))
    }
}
function Verstärker (Lautstärke: number) {
    Geprüfte_Lautstärke = Lautstärke
    if (Geprüfte_Lautstärke < 0) {
        Geprüfte_Lautstärke = 0
    }
    if (Geprüfte_Lautstärke > 255) {
        Geprüfte_Lautstärke = 255
    }
    Geprüfte_Lautstärke = halloween.stevensLawBrightness(Geprüfte_Lautstärke, 0.67)
    pins.i2cWriteNumber(
    75,
    Math.map(Geprüfte_Lautstärke, 0, 255, 0, 63),
    NumberFormat.UInt8LE,
    false
    )
}
let Geprüfte_Lautstärke = 0
let Attraktion_Helfer = 0
let Attraktionsmodus = 0
let Spielstart_Bild = 0
let Ein_Bonbon_erkannt = 0
let Ausgabe_Dauer_bis_Bonbon = 0
let Ausgabe_Startzeit = 0
let Anzahl_Bonbon = 0
let Mindestmenge = 0
let Spiel = 0
let Pixel = 0
let Ergebnis = 0
let Fortschritt = 0
let Timer = 0
let PixelListe: number[] = []
let Timeout = 0
let Tastenmatrix: neopixel.Strip = null
let Kreis: neopixel.Strip = null
// Sensor in der Ausgabe. Ist ein open drain low active. Deshalb pull-up aktiv.
pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
pins.setEvents(DigitalPin.P8, PinEventType.Edge)
Verstärker(40)
HalloweenKeypad.initialize()
Kreis = neopixel.create(DigitalPin.P12, 35, NeoPixelMode.RGB)
Kreis.clear()
Kreis.show()
Tastenmatrix = neopixel.create(DigitalPin.P1, 25, NeoPixelMode.RGBW)
Tastenmatrix.setMatrixWidth(5)
Tastenmatrix.clear()
Tastenmatrix.show()
radio.setGroup(1)
radio.setTransmitPower(7)
radio.setFrequencyBand(0)
basic.forever(function () {
    Tastenmatrix.clear()
    Attraktion()
    Spielstart()
    Spiel = randint(1, 2)
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
    // Warte bis der Hintergrund fertig verarbeitet ist.
    basic.pause(100)
    if (Ergebnis) {
        Bonbons_ausgeben()
    } else {
        halloween.Bild_anzeigen(halloween.Falsch(), Tastenmatrix, 255, 255, true)
        Starte_Sound(5)
        Warte_auf_Soundende()
    }
})
control.inBackground(function () {
    while (true) {
        if (Spiel == 1) {
            Spiel_Hintergrund_1()
        } else if (Spiel == 2) {
            Spiel_Hintergrund_2()
        } else if (Spiel == 3) {
            Spiel_Hintergrund_3()
        } else if (Spiel == 4) {
            Spiel_Hintergrund_4()
        } else if (Spiel == 99) {
            Bonbonausgabe_Hintergrund()
        } else if (Spiel == 98) {
            Attraktion_Hintergrund()
        } else {
        	
        }
        basic.pause(20)
    }
})
