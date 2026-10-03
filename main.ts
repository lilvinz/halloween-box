function Spiel_1() {
    HalloweenKeypad.clearEventQueue()
    Timeout = 10000
    PixelListe = []
    for (let Index = 0; Index < 25; Index++) {
        PixelListe.push(1)
    }
    Timer = control.millis()
    Fortschritt = 0
    while (Fortschritt < 25 && control.millis() - Timer < Timeout) {
        Ergebnis = HalloweenKeypad.waitForAnyKey(50)
        if (Ergebnis >= 0) {
            if (PixelListe[Ergebnis] == 1) {
                player_pro.play_sound(2)
                PixelListe[Ergebnis] = 0
                Tastenmatrix.setPixelColor(Ergebnis, neopixel.colors(NeoPixelColors.Black))
                Tastenmatrix.show()
                Fortschritt += 1
            } else {
                player_pro.play_sound(5)
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
function Spiel_Hintergrund_4() {

}
function Spiel_2() {
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
                    player_pro.play_sound(2)
                    Fortschritt += 1
                    Timeout = Timeout * 0.75
                } else {
                    player_pro.play_sound(5)
                    Fortschritt += -1
                    Timeout = Timeout * 0.75
                    if (Fortschritt < 0) {
                        player_pro.wait_until_elapsed(1500)
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
function Spiel_Hintergrund_1() {
    for (let Index2 = 0; Index2 < 25; Index2++) {
        if (PixelListe[Index2]) {
            Tastenmatrix.setPixelColor(Index2, neopixel.rgb(halloween.stevensLawBrightness(Math.map(control.millis() - Timer, 0, Timeout, 255, 0), 0.5), 0, 0))
        }
    }
    Tastenmatrix.show()
}
function Attraktion_Hintergrund() {
    if (control.millis() > playtime_polling_time + 2000) {
        playtime_polling_time = control.millis()
        if (player_pro.get_playtime_advanced() == false) {
            player_pro.play_music(randint(1, 10))
        }
    }
    if (control.millis() - Ende_Bonbonausgabe < 15000) {
        Kreis.rotate(1)
        Kreis.show()
    } else {
        Kreis.clear()
        Kreis.show()
    }
}
function Bonbonausgabe_Hintergrund() {
    if (player_pro.millis_since_last_play() > 3000) {
        player_pro.play_sound(1)
    }
    Kreis.rotate(1)
    Kreis.show()
    if (Math.idiv(control.millis(), 1000) % 2 == 1) {
        halloween.Bild_anzeigen(halloween.Zuckerstange(), Tastenmatrix, 255, 255, true)
    } else {
        halloween.Bild_anzeigen(halloween.Zuckerstange2(), Tastenmatrix, 255, 255, true)
    }
}
function Bonbons_ausgeben() {
    player_pro.play_sound(1)
    Spiel = 99
    Kreis.showRainbow(1, 360)
    Mindestmenge = 4
    Anzahl_Bonbon = 0
    for (let index = 0; index < Mindestmenge; index++) {
        Ausgabe_Startzeit = control.millis()
        Ausgabe_Dauer_bis_Bonbon = 0
        Ein_Bonbon_erkannt = 0
        servos.P0.run(-40)
        basic.pause(150)
        servos.P0.run(17)
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
    Ende_Bonbonausgabe = control.millis()
    Spiel = 0
    player_pro.wait_until_elapsed(3000)
    radio.sendValue("dispens", Anzahl_Bonbon)
    if (Anzahl_Bonbon < Mindestmenge) {
        halloween.Bild_anzeigen(halloween.Falsch(), Tastenmatrix, 255, 255, true)
        player_pro.play_sound(5)
        player_pro.wait_until_elapsed(1500)
        player_pro.play_sound(5)
        player_pro.wait_until_elapsed(1500)
        player_pro.play_sound(5)
        player_pro.wait_until_elapsed(1500)
    }
}
input.onButtonPressed(Button.A, function () {
    Lautstärke += -5
    if (Lautstärke < 0) {
        Lautstärke = 0
    }
    Verstärker(Lautstärke)
})
function Spiel_Hintergrund_3() {
}
control.onEvent(EventBusSource.MICROBIT_ID_IO_P8, EventBusValue.MICROBIT_PIN_EVT_FALL, function () {
    Ein_Bonbon_erkannt = 1
    Anzahl_Bonbon += 1
})
function Spiel_Hintergrund_2() {
    Tastenmatrix.setPixelColor(Pixel, neopixel.rgb(0, 0, halloween.stevensLawBrightness(Math.map(control.millis() - Timer, 0, Timeout, 255, 0), 0.5)))
    Tastenmatrix.show()
}
interface Spiel4Tasteneingabe {
    runde: number;
    richtig: boolean;
}
function Spiel_4() {
    HalloweenKeypad.clearEventQueue()
    let treffer = 0
    let fehler = 0
    let schrittDauer = 400
    let startzeit = control.millis()
    let spalte = randint(0, 1) == 1
    let linie = randint(0, 4)
    let position = 0
    let richtung = 1
    let naechsterSchritt = startzeit
    let aktuelleRunde = 0
    let angezeigteRunde = -1
    let angezeigtesZiel = -1
    let naechsterFrame = startzeit
    let nachleuchtendeTaste = -1
    let nachleuchtStart = 0
    let nachleuchtFarbe = 0
    let zielfarbe = neopixel.rgb(255, 90, 0)
    let eingaben: Spiel4Tasteneingabe[] = []
    let spielLaeuft = true

    // Die Callback-Auswertung hält den beim sichtbaren Pixel gültigen Zustand
    // fest; späteres Polling darf einen alten Tastendruck nicht umdeuten.
    Spiel4_Eingabe = function (taste: number) {
        if (spielLaeuft && angezeigtesZiel >= 0 && angezeigteRunde == aktuelleRunde) {
            eingaben.push({ runde: angezeigteRunde, richtig: taste == angezeigtesZiel })
        }
    }
    Tastenmatrix.clear()
    while (treffer < 3 && fehler < 3 && control.millis() - startzeit < 20000) {
        if (control.millis() - startzeit >= 20000) {
            break
        }

        // Die Keypad-API liefert bei timeout=0 nicht unterscheidbar -1 für
        // Release und leere Queue. Presses werden daher über den EINEN
        // registrierten Callback in diese Spiel-Queue übernommen.
        HalloweenKeypad.clearEventQueue()
        while (eingaben.length > 0 && treffer < 3 && fehler < 3) {
            if (control.millis() - startzeit >= 20000) {
                break
            }
            let eingabe = eingaben.shift()
            if (eingabe.runde == aktuelleRunde) {
                if (eingabe.richtig) {
                    treffer += 1
                    // Vor dem Sound erhöhen: Eingaben während der UART-Ausgabe
                    // des alten Bildes dürfen nicht zur nächsten Runde zählen.
                    aktuelleRunde += 1
                    player_pro.play_sound(2)
                    if (treffer < 3) {
                        schrittDauer = 400 - treffer * 100
                        spalte = randint(0, 1) == 1
                        linie = randint(0, 4)
                        position = 0
                        richtung = 1
                        naechsterSchritt = control.millis()
                    }
                } else {
                    fehler += 1
                    player_pro.play_sound(5)
                }
            }
        }

        if (treffer >= 3 || fehler >= 3 || control.millis() - startzeit >= 20000) {
            break
        }

        let jetzt = control.millis()
        let zielWechselt = jetzt >= naechsterSchritt
        if (zielWechselt || jetzt >= naechsterFrame) {
            if (aktuelleRunde == 1) {
                zielfarbe = neopixel.rgb(150, 0, 255)
            } else if (aktuelleRunde >= 2) {
                zielfarbe = neopixel.rgb(0, 220, 210)
            } else {
                zielfarbe = neopixel.rgb(255, 90, 0)
            }
            if (zielWechselt && angezeigtesZiel >= 0 && angezeigteRunde == aktuelleRunde) {
                nachleuchtendeTaste = angezeigtesZiel
                nachleuchtStart = jetzt
                nachleuchtFarbe = zielfarbe
            }
            if (angezeigteRunde != aktuelleRunde) {
                nachleuchtendeTaste = -1
            }
            Tastenmatrix.clear()
            if (nachleuchtendeTaste >= 0 && jetzt - nachleuchtStart < 140) {
                let trailHelligkeit = Math.idiv(255 * (140 - (jetzt - nachleuchtStart)), 1400)
                Tastenmatrix.setPixelColor(nachleuchtendeTaste, neopixel.rgb(
                    Math.idiv(Math.idiv(nachleuchtFarbe & 0xFF0000, 65536) * trailHelligkeit, 255),
                    Math.idiv(Math.idiv(nachleuchtFarbe & 0x00FF00, 256) * trailHelligkeit, 255),
                    Math.idiv((nachleuchtFarbe & 0x0000FF) * trailHelligkeit, 255)
                ))
            }
            let neuesZiel = angezeigtesZiel
            if (zielWechselt) {
                neuesZiel = 0
                if (spalte) {
                    neuesZiel = position * 5 + linie
                } else {
                    neuesZiel = linie * 5 + position
                }
            }
            let puls = (Math.sin(jetzt * 2 * Math.PI / 900) + 1) / 2
            let helligkeit = 0.55 + puls * 0.45
            Tastenmatrix.setPixelColor(neuesZiel, neopixel.rgb(
                Math.idiv(zielfarbe & 0xFF0000, 65536) * helligkeit,
                Math.idiv(zielfarbe & 0x00FF00, 256) * helligkeit,
                (zielfarbe & 0x0000FF) * helligkeit
            ))
            Tastenmatrix.show()
            if (zielWechselt) {
                // Nur ein tatsächlicher Zielwechsel ändert die Eingabe-Zuordnung.
                angezeigtesZiel = neuesZiel
                angezeigteRunde = aktuelleRunde
                naechsterSchritt = jetzt + schrittDauer
                position += richtung
                if (position == 4 || position == 0) {
                    richtung = -richtung
                }
            }
            naechsterFrame = jetzt + 25
        }
        basic.pause(5)
    }
    Spiel4_Eingabe = null
    spielLaeuft = false
    eingaben = []
    HalloweenKeypad.clearEventQueue()
    Tastenmatrix.clear()
    Tastenmatrix.show()
    if (treffer >= 3) {
        return 1
    }
    return 0
}
function Spielstart() {
    player_pro.play_sound(3)
    Spielstart_Bild = randint(0, 2)
    if (Spielstart_Bild == 0) {
        halloween.Bild_anzeigen(halloween.Geist(), Tastenmatrix, 255, 255, true)
    } else if (Spielstart_Bild == 1) {
        halloween.Bild_anzeigen(halloween.Totenkopf(), Tastenmatrix, 255, 255, true)
    } else {
        halloween.Bild_anzeigen(halloween.Kürbis(), Tastenmatrix, 255, 255, true)
    }
    player_pro.wait_until_elapsed(6000)
    Tastenmatrix.clear()
    Tastenmatrix.show()
}
function Attraktion() {
    Spiel = 98
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
            Attraktion_Helfer = randint(0, 4)
            player_pro.play_sound(randint(11, 21))
            if (Attraktion_Helfer == 0) {
                while (HalloweenKeypad.waitForAnyKey(0) == -1 && control.millis() - Timer < Timeout) {
                    Attraktion_Helfer = halloween.Pulsing_Brightness(2000, 10, 255)
                    halloween.Bild_anzeigen(halloween.Totenkopf(), Tastenmatrix, Attraktion_Helfer, Attraktion_Helfer, true)
                    basic.pause(10)
                }
            } else if (Attraktion_Helfer == 1) {
                while (HalloweenKeypad.waitForAnyKey(0) == -1 && control.millis() - Timer < Timeout) {
                    Attraktion_Helfer = halloween.Pulsing_Brightness(2000, 10, 255)
                    halloween.Bild_anzeigen(halloween.Herz(), Tastenmatrix, Attraktion_Helfer, Attraktion_Helfer, true)
                    basic.pause(10)
                }
            } else if (Attraktion_Helfer == 2) {
                while (HalloweenKeypad.waitForAnyKey(0) == -1 && control.millis() - Timer < Timeout) {
                    Attraktion_Helfer = halloween.Pulsing_Brightness(2000, 10, 255)
                    halloween.Bild_anzeigen(halloween.Kürbis(), Tastenmatrix, Attraktion_Helfer, Attraktion_Helfer, true)
                    basic.pause(10)
                }
            } else if (Attraktion_Helfer == 3) {
                while (HalloweenKeypad.waitForAnyKey(0) == -1 && control.millis() - Timer < Timeout) {
                    Attraktion_Helfer = halloween.Pulsing_Brightness(2000, 10, 255)
                    halloween.Bild_anzeigen(halloween.Geist(), Tastenmatrix, 255, Attraktion_Helfer, true)
                    basic.pause(10)
                }
            } else if (Attraktion_Helfer == 4) {
                while (HalloweenKeypad.waitForAnyKey(0) == -1 && control.millis() - Timer < Timeout) {
                    Attraktion_Helfer = halloween.Pulsing_Brightness(2000, 10, 255)
                    halloween.Bild_anzeigen(halloween.Feuer(), Tastenmatrix, Attraktion_Helfer, Attraktion_Helfer, true)
                    basic.pause(10)
                }
            } else {

            }
        } else {

        }
    }
    Spiel = 0
    // Warte auf Hintergrundtask
    basic.pause(100)
}
function Spiel_3() {
    HalloweenKeypad.clearEventQueue()
    Timeout = 30000  // 30 seconds total timeout
    Memory_Positions = []
    Memory_Colors = []
    Memory_Miss_Count = 0
    Memory_Current_Step = 0
    Memory_Show_Phase = true

    // Define easily recognizable colors (RGB values)
    let available_colors = [
        neopixel.rgb(255, 0, 0),    // Red
        neopixel.rgb(0, 255, 0),    // Green
        neopixel.rgb(0, 0, 255),    // Blue
        neopixel.rgb(255, 255, 0),  // Yellow
        neopixel.rgb(255, 0, 255),  // Magenta
        neopixel.rgb(0, 255, 255)   // Cyan
    ]

    // Generate random sequence with unique positions and colors
    let used_positions: number[] = []
    let used_colors: number[] = []
    for (let i = 0; i < Memory_Sequence_Length; i++) {
        let new_position: number
        do {
            new_position = randint(0, 24)
        } while (used_positions.indexOf(new_position) >= 0)

        let new_color: number
        do {
            new_color = available_colors[randint(0, available_colors.length - 1)]
        } while (used_colors.indexOf(new_color) >= 0)

        used_positions.push(new_position)
        used_colors.push(new_color)
        Memory_Positions.push(new_position)
        Memory_Colors.push(new_color)
    }

    Timer = control.millis()

    // Show sequence phase - show exactly twice
    for (let sequence_iterations = 0; sequence_iterations < 2; sequence_iterations++) {
        // Show the sequence
        Tastenmatrix.clear()
        for (let i = 0; i < Memory_Sequence_Length; i++) {
            Tastenmatrix.setPixelColor(Memory_Positions[i], Memory_Colors[i])
            Tastenmatrix.show()
            basic.pause(300)
            basic.pause(300)
        }

        // Pause before next iteration or input phase
        Tastenmatrix.clear()
        Tastenmatrix.show()
        basic.pause(1000)
    }

    // Clear any button presses that happened during learning phase
    HalloweenKeypad.clearEventQueue()

    // Input phase - wait for user to reproduce sequence
    Tastenmatrix.clear()
    Tastenmatrix.show()

    while (Memory_Current_Step < Memory_Sequence_Length && Memory_Miss_Count < 2 && control.millis() - Timer < Timeout) {
        Ergebnis = HalloweenKeypad.waitForAnyKey(50)
        if (Ergebnis >= 0) {
            if (Ergebnis == Memory_Positions[Memory_Current_Step]) {
                // Correct button pressed
                player_pro.play_sound(2)
                Tastenmatrix.setPixelColor(Ergebnis, Memory_Colors[Memory_Current_Step])
                Tastenmatrix.show()
                Memory_Current_Step += 1
            } else {
                // Wrong button pressed - only count misses after first correct button
                player_pro.play_sound(5)
                if (Memory_Current_Step > 0) {
                    Memory_Miss_Count += 1
                }
                // Flash the wrong button briefly in red
                Tastenmatrix.setPixelColor(Ergebnis, neopixel.rgb(255, 0, 0))
                Tastenmatrix.show()
                basic.pause(200)

                // Restore previous state - check if this button was already correctly pressed
                let restore_color = neopixel.colors(NeoPixelColors.Black)
                for (let j = 0; j < Memory_Current_Step; j++) {
                    if (Memory_Positions[j] == Ergebnis) {
                        restore_color = Memory_Colors[j]
                        break
                    }
                }
                Tastenmatrix.setPixelColor(Ergebnis, restore_color)
                Tastenmatrix.show()
            }
        }
    }

    // Check win condition
    if (Memory_Current_Step >= Memory_Sequence_Length && Memory_Miss_Count < 2) {
        return 1  // Win
    } else {
        // Wait for error sound to complete before returning loss
        if (Memory_Miss_Count >= 2) {
            player_pro.wait_until_elapsed(1000)
        }
        return 0  // Loss
    }
}
input.onButtonPressed(Button.AB, function () {
    servos.P0.run(60)
    basic.pause(1000)
    servos.P0.stop()
})
input.onButtonPressed(Button.B, function () {
    Lautstärke += 5
    if (Lautstärke > 255) {
        Lautstärke = 255
    }
    Verstärker(Lautstärke)
})
input.onGesture(Gesture.Shake, function () {
    Spiel = 0
    Verstärker(100)
    player_pro.play_sound(99)
    radio.sendValue("tilt", 0)
    basic.pause(4000)
    control.reset()
})
function Verstärker(Lautstärke: number) {
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
let MonsterFarbe = 0
let Memory_Sequence_Length = 4
let Memory_Positions: number[] = []
let Memory_Colors: number[] = []
let Memory_Miss_Count = 0
let Memory_Current_Step = 0
let Memory_Show_Phase = true
let Geprüfte_Lautstärke = 0
let playtime_polling_time = 0
let Attraktion_Helfer = 0
let Attraktionsmodus = 0
let Spielstart_Bild = 0
let Ein_Bonbon_erkannt = 0
let Ausgabe_Dauer_bis_Bonbon = 0
let Ausgabe_Startzeit = 0
let Anzahl_Bonbon = 0
let Mindestmenge = 0
let Ende_Bonbonausgabe = 0
let Spiel = 0
let Pixel = 0
let Ergebnis = 0
let Fortschritt = 0
let Timer = 0
let PixelListe: number[] = []
let Timeout = 0
let Tastenmatrix: neopixel.Strip = null
let Kreis: neopixel.Strip = null
let Lautstärke = 0
let Sound_Zeit_seit_Start_ms = 0
let Sound_Startzeit = 0
let Attraktion_Helfer2 = 0
let LastPingTime = 0
let event_source = 0
let event_value = 0
let Spiel4_Eingabe: ((taste: number) => void) = null
// Sensor in der Ausgabe. Ist ein open drain low active. Deshalb pull-up aktiv.
pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
pins.setEvents(DigitalPin.P8, PinEventType.Edge)
Lautstärke = 80
Verstärker(Lautstärke)
HalloweenKeypad.initialize()
HalloweenKeypad.onAnyKeyPressed(function (taste: number) {
    if (Spiel4_Eingabe) {
        Spiel4_Eingabe(taste)
    }
})
Kreis = neopixel.create(DigitalPin.P12, 35, NeoPixelMode.RGB)
Kreis.clear()
Kreis.show()
Tastenmatrix = neopixel.create(DigitalPin.P1, 25, NeoPixelMode.RGBW)
Tastenmatrix.setMatrixWidth(5)
Tastenmatrix.clear()
Tastenmatrix.show()
radio.setGroup(152)
radio.setTransmitPower(7)
radio.setFrequencyBand(46)
player_pro.connect(SerialPin.P16, SerialPin.P15)
basic.forever(function () {
    Tastenmatrix.clear()
    Attraktion()
    Spielstart()
    Spiel = randint(1, 4)
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
    if (Ergebnis) {
        radio.sendValue("won", Spiel)
    } else {
        radio.sendValue("lost", Spiel)
    }
    Spiel = 0
    // Warte bis der Hintergrund fertig verarbeitet ist.
    basic.pause(100)
    if (Ergebnis) {
        Bonbons_ausgeben()
    } else {
        halloween.Bild_anzeigen(halloween.Falsch(), Tastenmatrix, 255, 255, true)
        player_pro.play_sound(4)
        player_pro.wait_until_elapsed(5000)
    }
})
control.inBackground(function () {
    while (true) {
        if (control.millis() - LastPingTime > 1000) {
            radio.sendValue("ping", 0)
        }
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
