function Spiel_1 () {
    HalloweenKeypad.clearEventQueue()
    Timeout = 10000
    PixelListe = []
    for (let index = 0; index < 25; index++) {
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
function Spiel_Hintergrund_4 () {
	
}
function Spiel_2 () {
    HalloweenKeypad.clearEventQueue()
    Timeout = 20000
    Fortschritt = 0
    while (Fortschritt < 10) {
        Pixel = randint(0, 24)
        Timer = control.millis()
        Spiel2_EingabeGewertet = false
        while (control.millis() - Timer < Timeout) {
            Ergebnis = HalloweenKeypad.waitForAnyKey(50)
            if (control.millis() - Timer >= Timeout) {
                break;
            }
            if (Ergebnis >= 0) {
                Spiel2_EingabeGewertet = true
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
        if (!(Spiel2_EingabeGewertet)) {
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
function Spiel_Hintergrund_1 () {
    for (let Index2 = 0; Index2 <= 24; Index2++) {
        if (PixelListe[Index2]) {
            Tastenmatrix.setPixelColor(Index2, neopixel.rgb(halloween.stevensLawBrightness(Math.map(control.millis() - Timer, 0, Timeout, 255, 0), 0.5), 0, 0))
        }
    }
    Tastenmatrix.show()
}
function Bonbonausgabe_Hintergrund () {
    if (player_pro.millis_since_last_play() > 3000) {
        player_pro.play_sound(1)
    }
    Kreis.rotate(1)
    Kreis.show()
    if (Math.idiv(control.millis(), 1000) % 2 == 1) {
        halloween.Bild_anzeigen(halloween.Zuckerstange(), Tastenmatrix, 255, 255, true, false, 0)
    } else {
        halloween.Bild_anzeigen(halloween.Zuckerstange2(), Tastenmatrix, 255, 255, true, false, 0)
    }
}
function Bonbons_ausgeben () {
    player_pro.play_sound(1)
    Spiel = 99
    Kreis.showRainbow(1, 360)
    Mindestmenge = 4
    Anzahl_Bonbon = 0
    for (let index = 0; index < 2; index++) {
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
        halloween.Bild_anzeigen(halloween.Falsch(), Tastenmatrix, 255, 255, true, false, 0)
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
function Spiel_Hintergrund_3 () {
	
}
control.onEvent(EventBusSource.MICROBIT_ID_IO_P8, EventBusValue.MICROBIT_PIN_EVT_FALL, function () {
    Ein_Bonbon_erkannt = 1
    Anzahl_Bonbon += 1
})
function Spiel_Hintergrund_2 () {
    Tastenmatrix.setPixelColor(Pixel, neopixel.rgb(0, 0, halloween.stevensLawBrightness(Math.map(control.millis() - Timer, 0, Timeout, 255, 0), 0.5)))
    Tastenmatrix.show()
}
function Spiel_4 () {
    Spiel4_Aktiv = false
    HalloweenKeypad.clearEventQueue()
    Spiel4_Treffer = 0
    Spiel4_Fehler = 0
    Spiel4_SchrittDauer = 400
    Spiel4_Startzeit = control.millis()
    Spiel4_Spalte = randint(0, 1) == 1
    Spiel4_Linie = randint(0, 4)
    Spiel4_Position = 0
    Spiel4_Richtung = 1
    Spiel4_NaechsterSchritt = Spiel4_Startzeit
    Spiel4_AktuelleRunde = 0
    Spiel4_AngezeigteRunde = -1
    Spiel4_AngezeigtesZiel = -1
    Spiel4_NaechsterFrame = Spiel4_Startzeit
    Spiel4_NachleuchtendeTaste = -1
    Spiel4_NachleuchtStart = 0
    Spiel4_NachleuchtRot = 0
    Spiel4_NachleuchtGruen = 0
    Spiel4_NachleuchtBlau = 0
    Spiel4_ZielRot = 255
    Spiel4_ZielGruen = 90
    Spiel4_ZielBlau = 0
    Spiel4_EingabeRunden = []
    Spiel4_EingabeRichtig = []
    Tastenmatrix.clear()
    Spiel4_Aktiv = true
    while (Spiel4_Treffer < 3 && Spiel4_Fehler < 3 && control.millis() - Spiel4_Startzeit < 20000) {
        if (control.millis() - Spiel4_Startzeit >= 20000) {
            break;
        }
        // Die Keypad-API liefert bei timeout=0 nicht unterscheidbar -1 für
        // Release und leere Queue. Presses werden daher über den EINEN
        // registrierten Callback in diese Spiel-Queue übernommen.
        HalloweenKeypad.clearEventQueue()
        while (Spiel4_EingabeRunden.length > 0 && Spiel4_Treffer < 3 && Spiel4_Fehler < 3) {
            if (control.millis() - Spiel4_Startzeit >= 20000) {
                break;
            }
            Spiel4_EingabeRunde = Spiel4_EingabeRunden.shift()
            Spiel4_EingabeIstRichtig = Spiel4_EingabeRichtig.shift()
            if (Spiel4_EingabeRunde == Spiel4_AktuelleRunde) {
                if (Spiel4_EingabeIstRichtig) {
                    Spiel4_Treffer += 1
                    // Vor dem Sound erhöhen: Eingaben während der UART-Ausgabe
                    // des alten Bildes dürfen nicht zur nächsten Runde zählen.
                    Spiel4_AktuelleRunde += 1
                    player_pro.play_sound(2)
                    if (Spiel4_Treffer < 3) {
                        Spiel4_SchrittDauer = 400 - Spiel4_Treffer * 100
                        Spiel4_Spalte = randint(0, 1) == 1
                        Spiel4_Linie = randint(0, 4)
                        Spiel4_Position = 0
                        Spiel4_Richtung = 1
                        Spiel4_NaechsterSchritt = control.millis()
                    }
                } else {
                    Spiel4_Fehler += 1
                    player_pro.play_sound(5)
                }
            }
        }
        if (Spiel4_Treffer >= 3 || Spiel4_Fehler >= 3 || control.millis() - Spiel4_Startzeit >= 20000) {
            break;
        }
        Spiel4_Jetzt = control.millis()
        Spiel4_ZielWechselt = Spiel4_Jetzt >= Spiel4_NaechsterSchritt
        if (Spiel4_ZielWechselt || Spiel4_Jetzt >= Spiel4_NaechsterFrame) {
            if (Spiel4_AktuelleRunde == 1) {
                Spiel4_ZielRot = 150
                Spiel4_ZielGruen = 0
                Spiel4_ZielBlau = 255
            } else if (Spiel4_AktuelleRunde >= 2) {
                Spiel4_ZielRot = 0
                Spiel4_ZielGruen = 220
                Spiel4_ZielBlau = 210
            } else {
                Spiel4_ZielRot = 255
                Spiel4_ZielGruen = 90
                Spiel4_ZielBlau = 0
            }
            if (Spiel4_ZielWechselt && Spiel4_AngezeigtesZiel >= 0 && Spiel4_AngezeigteRunde == Spiel4_AktuelleRunde) {
                Spiel4_NachleuchtendeTaste = Spiel4_AngezeigtesZiel
                Spiel4_NachleuchtStart = Spiel4_Jetzt
                Spiel4_NachleuchtRot = Spiel4_ZielRot
                Spiel4_NachleuchtGruen = Spiel4_ZielGruen
                Spiel4_NachleuchtBlau = Spiel4_ZielBlau
            }
            if (Spiel4_AngezeigteRunde != Spiel4_AktuelleRunde) {
                Spiel4_NachleuchtendeTaste = -1
            }
            Tastenmatrix.clear()
            if (Spiel4_NachleuchtendeTaste >= 0 && Spiel4_Jetzt - Spiel4_NachleuchtStart < 140) {
                Spiel4_TrailHelligkeit = Math.idiv(255 * (140 - (Spiel4_Jetzt - Spiel4_NachleuchtStart)), 1400)
                Tastenmatrix.setPixelColor(Spiel4_NachleuchtendeTaste, neopixel.rgb(Math.idiv(Spiel4_NachleuchtRot * Spiel4_TrailHelligkeit, 255), Math.idiv(Spiel4_NachleuchtGruen * Spiel4_TrailHelligkeit, 255), Math.idiv(Spiel4_NachleuchtBlau * Spiel4_TrailHelligkeit, 255)))
            }
            Spiel4_NeuesZiel = Spiel4_AngezeigtesZiel
            if (Spiel4_ZielWechselt) {
                Spiel4_NeuesZiel = 0
                if (Spiel4_Spalte) {
                    Spiel4_NeuesZiel = Spiel4_Position * 5 + Spiel4_Linie
                } else {
                    Spiel4_NeuesZiel = Spiel4_Linie * 5 + Spiel4_Position
                }
            }
            Spiel4_Puls = (Math.sin(Spiel4_Jetzt * 2 * Math.PI / 900) + 1) / 2
            Spiel4_Helligkeit = 0.55 + Spiel4_Puls * 0.45
            Tastenmatrix.setPixelColor(Spiel4_NeuesZiel, neopixel.rgb(Spiel4_ZielRot * Spiel4_Helligkeit, Spiel4_ZielGruen * Spiel4_Helligkeit, Spiel4_ZielBlau * Spiel4_Helligkeit))
            Tastenmatrix.show()
            if (Spiel4_ZielWechselt) {
                // Nur ein tatsächlicher Zielwechsel ändert die Eingabe-Zuordnung.
                Spiel4_AngezeigtesZiel = Spiel4_NeuesZiel
                Spiel4_AngezeigteRunde = Spiel4_AktuelleRunde
                Spiel4_NaechsterSchritt = Spiel4_Jetzt + Spiel4_SchrittDauer
                Spiel4_Position += Spiel4_Richtung
                if (Spiel4_Position == 4 || Spiel4_Position == 0) {
                    Spiel4_Richtung = 0 - Spiel4_Richtung
                }
            }
            Spiel4_NaechsterFrame = Spiel4_Jetzt + 25
        }
        basic.pause(5)
    }
    Spiel4_Aktiv = false
    Spiel4_EingabeRunden = []
    Spiel4_EingabeRichtig = []
    HalloweenKeypad.clearEventQueue()
    Tastenmatrix.clear()
    Tastenmatrix.show()
    if (Spiel4_Treffer >= 3) {
        return 1
    }
    return 0
}
function Spielstart () {
    player_pro.play_sound(3)
    Spielstart_Bild = randint(0, 2)
    if (Spielstart_Bild == 0) {
        halloween.Bild_anzeigen(halloween.Geist(), Tastenmatrix, 255, 255, true, false, 0)
    } else if (Spielstart_Bild == 1) {
        halloween.Bild_anzeigen(halloween.Totenkopf(), Tastenmatrix, 255, 255, true, false, 0)
    } else {
        halloween.Bild_anzeigen(halloween.Kürbis(), Tastenmatrix, 255, 255, true, false, 0)
    }
    player_pro.wait_until_elapsed(6000)
    Tastenmatrix.clear()
    Tastenmatrix.show()
}
function Attraktion () {
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
                    halloween.Bild_anzeigen(halloween.Totenkopf(), Tastenmatrix, Attraktion_Helfer, Attraktion_Helfer, true, false, 0)
                    basic.pause(10)
                }
            } else if (Attraktion_Helfer == 1) {
                while (HalloweenKeypad.waitForAnyKey(0) == -1 && control.millis() - Timer < Timeout) {
                    Attraktion_Helfer = halloween.Pulsing_Brightness(2000, 10, 255)
                    halloween.Bild_anzeigen(halloween.Herz(), Tastenmatrix, Attraktion_Helfer, Attraktion_Helfer, true, false, 0)
                    basic.pause(10)
                }
            } else if (Attraktion_Helfer == 2) {
                while (HalloweenKeypad.waitForAnyKey(0) == -1 && control.millis() - Timer < Timeout) {
                    Attraktion_Helfer = halloween.Pulsing_Brightness(2000, 10, 255)
                    halloween.Bild_anzeigen(halloween.Kürbis(), Tastenmatrix, Attraktion_Helfer, Attraktion_Helfer, true, false, 0)
                    basic.pause(10)
                }
            } else if (Attraktion_Helfer == 3) {
                while (HalloweenKeypad.waitForAnyKey(0) == -1 && control.millis() - Timer < Timeout) {
                    Attraktion_Helfer = halloween.Pulsing_Brightness(2000, 10, 255)
                    halloween.Bild_anzeigen(halloween.Geist(), Tastenmatrix, 255, Attraktion_Helfer, true, false, 0)
                    basic.pause(10)
                }
            } else if (Attraktion_Helfer == 4) {
                while (HalloweenKeypad.waitForAnyKey(0) == -1 && control.millis() - Timer < Timeout) {
                    Attraktion_Helfer = halloween.Pulsing_Brightness(2000, 10, 255)
                    halloween.Bild_anzeigen(halloween.Feuer(), Tastenmatrix, Attraktion_Helfer, Attraktion_Helfer, true, false, 0)
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
input.onGesture(Gesture.Shake, function () {
    Spiel = 0
    Verstärker(100)
    player_pro.play_sound(99)
    radio.sendValue("tilt", 0)
    basic.pause(4000)
    control.reset()
})
function Spiel_3 () {
    HalloweenKeypad.clearEventQueue()
    // 30 seconds total timeout
    Timeout = 30000
    Memory_Positions = []
    Memory_Colors = []
    Memory_Miss_Count = 0
    Memory_Current_Step = 0
    Memory_Show_Phase = true
    // Define easily recognizable colors (RGB values)
    Memory_VerfuegbareFarben = [
    neopixel.rgb(255, 0, 0),
    neopixel.rgb(0, 255, 0),
    neopixel.rgb(0, 0, 255),
    neopixel.rgb(255, 255, 0),
    neopixel.rgb(255, 0, 255),
    neopixel.rgb(0, 255, 255)
    ]
    // Generate random sequence with unique positions and colors
    Memory_BenutztePositionen = []
    Memory_BenutzteFarben = []
    Memory_NeuePosition = 0
    Memory_NeueFarbe = 0
    for (let index = 0; index < Memory_Sequence_Length; index++) {
        Memory_NeuePosition = randint(0, 24)
        while (Memory_BenutztePositionen.indexOf(Memory_NeuePosition) >= 0) {
            Memory_NeuePosition = randint(0, 24)
        }
        Memory_NeueFarbe = Memory_VerfuegbareFarben[randint(0, Memory_VerfuegbareFarben.length - 1)]
        while (Memory_BenutzteFarben.indexOf(Memory_NeueFarbe) >= 0) {
            Memory_NeueFarbe = Memory_VerfuegbareFarben[randint(0, Memory_VerfuegbareFarben.length - 1)]
        }
        Memory_BenutztePositionen.push(Memory_NeuePosition)
        Memory_BenutzteFarben.push(Memory_NeueFarbe)
        Memory_Positions.push(Memory_NeuePosition)
        Memory_Colors.push(Memory_NeueFarbe)
    }
    Timer = control.millis()
    // Show sequence phase - show exactly twice
    for (let index = 0; index < 2; index++) {
        // Show the sequence
        Tastenmatrix.clear()
        for (let j = 0; j <= Memory_Sequence_Length - 1; j++) {
            Tastenmatrix.setPixelColor(Memory_Positions[j], Memory_Colors[j])
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
                Memory_Wiederherstellungsfarbe = neopixel.colors(NeoPixelColors.Black)
                for (let k = 0; k <= Memory_Current_Step - 1; k++) {
                    if (Memory_Positions[k] == Ergebnis) {
                        Memory_Wiederherstellungsfarbe = Memory_Colors[k]
                        break;
                    }
                }
                Tastenmatrix.setPixelColor(Ergebnis, Memory_Wiederherstellungsfarbe)
                Tastenmatrix.show()
            }
        }
    }
    // Check win condition
    if (Memory_Current_Step >= Memory_Sequence_Length && Memory_Miss_Count < 2) {
        // Win
        return 1
    } else {
        // Wait for error sound to complete before returning loss
        if (Memory_Miss_Count >= 2) {
            player_pro.wait_until_elapsed(1000)
        }
        // Loss
        return 0
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
HalloweenKeypad.onAnyKeyPressed(function (taste) {
    if (Spiel4_Aktiv && Spiel4_AngezeigtesZiel >= 0 && Spiel4_AngezeigteRunde == Spiel4_AktuelleRunde) {
        Spiel4_EingabeRunden.push(Spiel4_AngezeigteRunde)
        Spiel4_EingabeRichtig.push(taste == Spiel4_AngezeigtesZiel)
    }
})
function Attraktion_Hintergrund () {
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
let LastPingTime = 0
let Geprüfte_Lautstärke = 0
let playtime_polling_time = 0
let Memory_Wiederherstellungsfarbe = 0
let Memory_NeueFarbe = 0
let Memory_NeuePosition = 0
let Memory_BenutzteFarben: number[] = []
let Memory_BenutztePositionen: number[] = []
let Memory_VerfuegbareFarben: number[] = []
let Memory_Current_Step = 0
let Memory_Miss_Count = 0
let Memory_Colors: number[] = []
let Memory_Positions: number[] = []
let Attraktion_Helfer = 0
let Attraktionsmodus = 0
let Spielstart_Bild = 0
let Spiel4_Helligkeit = 0
let Spiel4_Puls = 0
let Spiel4_NeuesZiel = 0
let Spiel4_TrailHelligkeit = 0
let Spiel4_ZielWechselt = false
let Spiel4_Jetzt = 0
let Spiel4_EingabeIstRichtig = false
let Spiel4_EingabeRunde = 0
let Spiel4_EingabeRichtig: boolean[] = []
let Spiel4_EingabeRunden: number[] = []
let Spiel4_ZielBlau = 0
let Spiel4_ZielGruen = 0
let Spiel4_ZielRot = 0
let Spiel4_NachleuchtBlau = 0
let Spiel4_NachleuchtGruen = 0
let Spiel4_NachleuchtRot = 0
let Spiel4_NachleuchtStart = 0
let Spiel4_NachleuchtendeTaste = 0
let Spiel4_NaechsterFrame = 0
let Spiel4_AngezeigtesZiel = 0
let Spiel4_AngezeigteRunde = 0
let Spiel4_AktuelleRunde = 0
let Spiel4_NaechsterSchritt = 0
let Spiel4_Richtung = 0
let Spiel4_Position = 0
let Spiel4_Linie = 0
let Spiel4_Spalte = false
let Spiel4_Startzeit = 0
let Spiel4_SchrittDauer = 0
let Spiel4_Fehler = 0
let Spiel4_Treffer = 0
let Spiel4_Aktiv = false
let Ende_Bonbonausgabe = 0
let Ein_Bonbon_erkannt = 0
let Ausgabe_Dauer_bis_Bonbon = 0
let Ausgabe_Startzeit = 0
let Anzahl_Bonbon = 0
let Mindestmenge = 0
let Spiel = 0
let Spiel2_EingabeGewertet = false
let Pixel = 0
let Ergebnis = 0
let Fortschritt = 0
let Timer = 0
let PixelListe: number[] = []
let Timeout = 0
let Tastenmatrix: neopixel.Strip = null
let Kreis: neopixel.Strip = null
let Lautstärke = 0
let Memory_Show_Phase = false
let Memory_Sequence_Length = 0
let event_value = 0
let event_source = 0
let Attraktion_Helfer2 = 0
let Sound_Startzeit = 0
let Sound_Zeit_seit_Start_ms = 0
let MonsterFarbe = 0
Memory_Sequence_Length = 4
Memory_Show_Phase = true
// Sensor in der Ausgabe. Ist ein open drain low active. Deshalb pull-up aktiv.
pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
pins.setEvents(DigitalPin.P8, PinEventType.Edge)
Lautstärke = 80
Verstärker(Lautstärke)
HalloweenKeypad.initialize()
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
        halloween.Bild_anzeigen(halloween.Falsch(), Tastenmatrix, 255, 255, true, false, 0)
        player_pro.play_sound(4)
        player_pro.wait_until_elapsed(5000)
    }
})
control.inBackground(function () {
    while (true) {
        if (control.millis() - LastPingTime > 1000) {
            LastPingTime = control.millis()
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
