'use client';

// Anleitung (使い方) ページ - 更新版

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AnleitungPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="text-primary-600 hover:text-primary-700 font-medium mb-2"
          >
            ← Zurück zur Startseite
          </button>
          <h1 className="text-3xl font-bold text-gray-900">📖 Tennis-Team Manager - Anleitung</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          
          {/* Was ist diese App? */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">📱 Was ist diese App?</h2>
            <p className="text-gray-700">
              Eine einfache Web-App zur Organisation von Tennismannschaften für die nuLiga. 
              Perfekt für die Planung von Spielen, Zusagen und Fahrgemeinschaften.
            </p>
          </section>

          {/* Hauptfunktionen */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">✨ Hauptfunktionen</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Für alle Mitglieder:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li><strong>Spielübersicht</strong> - Alle kommenden und vergangenen Spiele sehen</li>
              <li><strong>Zusage abgeben</strong> - Verfügbarkeit für jedes Spiel melden</li>
              <li><strong>Kommentare</strong> - Besondere Hinweise zu deiner Zusage hinzufügen</li>
              <li><strong>Spieldetails</strong> - Datum, Uhrzeit, Gegner und Ort einsehen</li>
              <li><strong>Automatische Anmeldung</strong> - Nächstes Mal automatisch anmelden 🆕</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">Für Teamleiter (Admin):</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Spiele erstellen</strong> - Neue Spiele mit Datum, Zeit und Gegner anlegen</li>
              <li><strong>Alle Zusagen sehen</strong> - Übersicht über alle Teilnehmerzusagen</li>
              <li><strong>Aufstellung festlegen</strong> - 4 Nominierte + 1 Reserve auswählen 🆕⭐</li>
              <li><strong>Heimspiel-Organisation</strong> - Mitbringsel zuweisen</li>
              <li><strong>Auswärtsspiel-Organisation</strong> - Fahrgemeinschaften planen</li>
              <li><strong>Mitgliederverwaltung</strong> - Neue Mitglieder hinzufügen oder deaktivieren</li>
              <li><strong>Team-Einstellungen</strong> - Team-Informationen einsehen und Team löschen</li>
            </ul>
          </section>

          {/* Erste Schritte */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">🚀 Erste Schritte</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Neues Team erstellen</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-1 mb-4">
              <li>Gehe zur App-Startseite</li>
              <li>Klicke auf <strong>"Neues Team erstellen"</strong></li>
              <li>Gib Teamname, Vorname, Nachname und Geburtsdatum ein</li>
              <li>Klicke auf <strong>"Team erstellen"</strong></li>
              <li><strong>Wichtig:</strong> Du erhältst einen <strong>6-stelligen Einladungscode</strong></li>
            </ol>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">Einem Team beitreten</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-1 mb-4">
              <li>Gehe zur App-Startseite</li>
              <li>Klicke auf <strong>"Team beitreten"</strong></li>
              <li>Gib den Einladungscode und deine Daten ein</li>
              <li>Klicke auf <strong>"Team beitreten"</strong></li>
            </ol>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">Anmelden (wenn du bereits Mitglied bist)</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-1 mb-4">
              <li>Gehe zur App-Startseite</li>
              <li>Klicke auf <strong>"🔑 Bereits Mitglied? Hier anmelden"</strong></li>
              <li>Gib Nachname und Geburtsdatum ein</li>
              <li><strong>🆕 Optional:</strong> Setze Häkchen bei <strong>"Nächstes Mal automatisch anmelden"</strong></li>
              <li>Wähle dein Team (falls mehrere)</li>
              <li>Klicke auf <strong>"Weiter"</strong></li>
            </ol>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
              <p className="text-sm text-gray-700">
                <strong>🆕 Automatische Anmeldung:</strong> Wenn du das Häkchen setzt, wirst du beim nächsten Besuch automatisch angemeldet. 
                Deine Anmeldedaten werden sicher auf deinem Gerät gespeichert.
              </p>
            </div>
          </section>

          {/* NEU: Aufstellung festlegen */}
          <section className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-green-900 mb-3">⭐ Aufstellung festlegen (nur Teamleiter) 🆕</h2>
            
            <p className="text-gray-700 mb-4">
              Als Teamleiter kannst du für jedes Spiel die Aufstellung festlegen: <strong>4 Nominierte</strong> und <strong>1 Reserve</strong>.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">So funktioniert's:</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-4">
              <li>Öffne ein <strong>Spiel</strong></li>
              <li>Scrolle zu <strong>"⭐ Aufstellung festlegen"</strong></li>
              <li>Du siehst alle Spieler mit Status <strong>"✓ Dabei"</strong></li>
              <li>Wähle für jeden Spieler aus dem Dropdown-Menü:
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li><strong>⭐ Nominiert</strong> - Spieler ist für das Spiel eingeteilt</li>
                  <li><strong>🔄 Reserve</strong> - Spieler ist Ersatzspieler</li>
                  <li><strong>—</strong> - Keine Auswahl</li>
                </ul>
              </li>
              <li>Die Auswahl wird <strong>sofort automatisch gespeichert</strong></li>
            </ol>

            <div className="bg-white border border-green-300 rounded p-4 mb-4">
              <p className="font-semibold text-gray-900 mb-2">Anzeige der Auswahl:</p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Nominiert:</strong> 3 / 4
              </p>
              <p className="text-sm text-gray-700">
                <strong>Reserve:</strong> 1 / 1
              </p>
              <p className="text-sm text-gray-600 mt-2">
                ⚠️ Wenn mehr als 4 Nominierte oder mehr als 1 Reserve ausgewählt sind, erscheint eine Warnung.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">Was sehen andere Spieler?</h3>
            <p className="text-gray-700 mb-2">
              Im Abschnitt <strong>"Zusagen aller Mitglieder"</strong> sehen alle Teammitglieder die Auswahl:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li><strong>[⭐ Nominiert]</strong> - Grünes Badge neben dem Namen</li>
              <li><strong>[🔄 Reserve]</strong> - Blaues Badge neben dem Namen</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">Wichtige Hinweise:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Die nominierten Spieler werden <strong>oben in der Liste</strong> angezeigt</li>
              <li>Wenn ein Spieler seine Zusage auf <strong>"✗ Nicht dabei"</strong> ändert, wird die Auswahl automatisch entfernt</li>
              <li>Nur Spieler mit Status <strong>"✓ Dabei"</strong> können ausgewählt werden</li>
            </ul>
          </section>

          {/* Fahrgemeinschaften */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">🚗 Auswärtsspiel - Fahrgemeinschaften</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Für Teamleiter: Fahrer festlegen</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-1 mb-4">
              <li>Öffne ein <strong>Auswärtsspiel</strong></li>
              <li>Scrolle zu <strong>"Auswärtsspiel - Fahrgemeinschaften"</strong></li>
              <li>Wähle Fahrer aus (Häkchen setzen ☑)</li>
              <li>Gib die Anzahl freier Plätze an (0-7)</li>
              <li>Klicke auf <strong>"Fahrerzuteilung speichern"</strong></li>
            </ol>

            <div className="bg-gray-50 border border-gray-300 rounded p-3 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Beispiel:</strong> Hans Müller mit 4 freien Plätzen, Peter Klein mit 2 freien Plätzen
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">Für alle Mitglieder: Verfügbare Fahrer sehen</h3>
            <p className="text-gray-700 mb-2">
              Wenn du ein Auswärtsspiel öffnest, siehst du im Abschnitt <strong>"🚗 Verfügbare Fahrer"</strong> alle Fahrer und ihre freien Plätze.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Als Fahrer austragen</h3>
            <p className="text-gray-700 mb-2">
              Wenn du als Fahrer eingetragen bist, aber doch nicht fahren kannst:
            </p>
            <ol className="list-decimal list-inside text-gray-700 space-y-1 mb-4">
              <li>Öffne das Auswärtsspiel</li>
              <li>Im Abschnitt <strong>"🚗 Verfügbare Fahrer"</strong> siehst du deine Eintragung mit <strong>(Du)</strong></li>
              <li>Klicke auf <strong>"❌ Austragen"</strong></li>
              <li>Bestätige die Frage</li>
              <li>Du wirst als Fahrer entfernt</li>
            </ol>

            <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
              <p className="text-sm text-gray-700">
                <strong>💡 Hinweis:</strong> Nur du selbst kannst dich austragen. 
                Der Teamleiter kann dich auch entfernen, indem er die Fahrerzuteilung neu speichert.
              </p>
            </div>
          </section>

          {/* Team-Einstellungen und Löschen */}
          <section className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-900 mb-3">⚙️ Team-Einstellungen und Löschen (nur Teamleiter)</h2>
            
            <h3 className="text-xl font-semibold text-red-800 mb-2">Team-Einstellungen aufrufen</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-1 mb-4">
              <li>Gehe zu <strong>"👥 Mitglieder"</strong></li>
              <li>Klicke oben rechts auf <strong>"⚙️ Einstellungen"</strong></li>
              <li>Du siehst Teamname, Einladungscode, Mitglieder und Erstellungsdatum</li>
            </ol>

            <h3 className="text-xl font-semibold text-red-800 mb-2">⚠️ Team löschen</h3>
            <div className="bg-white border-2 border-red-300 rounded p-4 mb-3">
              <p className="font-bold text-red-900 mb-2">WICHTIG: Diese Aktion ist UNWIDERRUFLICH!</p>
              <p className="text-gray-700 text-sm">
                Wenn du ein Team löschst, werden <strong>ALLE Daten</strong> gelöscht:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                <li>Alle Mitglieder</li>
                <li>Alle Spiele</li>
                <li>Alle Zusagen</li>
                <li>Alle Aufstellungen 🆕</li>
                <li>Alle Fahrgemeinschaften</li>
                <li>Alle Heimspiel-Mitbringsel</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-red-800 mb-2">So löschst du ein Team:</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-1 mb-3">
              <li>Gehe zu <strong>"⚙️ Team-Einstellungen"</strong></li>
              <li>Scrolle nach unten zu <strong>"⚠️ Gefahrenzone"</strong></li>
              <li>Klicke auf <strong>"🗑️ Team löschen"</strong></li>
              <li>Gib zur Bestätigung den <strong>Teamnamen</strong> ein</li>
              <li>Klicke auf <strong>"Ja, Team unwiderruflich löschen"</strong></li>
            </ol>

            <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
              <p className="text-sm text-gray-700">
                <strong>💡 Alternative:</strong> Wenn du ein Team nur vorübergehend nicht nutzen möchtest, 
                musst du es nicht löschen. Du kannst einfach keine neuen Spiele erstellen.
              </p>
            </div>
          </section>

          {/* Tipps und Tricks */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">💡 Tipps und Tricks</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Für Teamleiter:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li><strong>Spiele frühzeitig anlegen:</strong> So haben die Spieler mehr Zeit zum Zusagen</li>
              <li><strong>Aufstellung festlegen:</strong> Lege die Aufstellung fest, sobald genug Zusagen vorhanden sind 🆕</li>
              <li><strong>Fahrer festlegen:</strong> Lege Fahrer fest, sobald klar ist, wer dabei ist</li>
              <li><strong>Heimspiel-Mitbringsel:</strong> Weise Aufgaben frühzeitig zu</li>
              <li><strong>Einladungscode teilen:</strong> Teile den Code per WhatsApp oder E-Mail</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">Für alle Mitglieder:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Früh zusagen:</strong> So kann der Teamleiter besser planen</li>
              <li><strong>Automatische Anmeldung nutzen:</strong> Spart Zeit beim nächsten Login 🆕</li>
              <li><strong>Kommentar hinzufügen:</strong> Z.B. "Komme später" oder "Nur Doppel"</li>
              <li><strong>Regelmäßig prüfen:</strong> Schau regelmäßig, ob neue Spiele angelegt wurden</li>
            </ul>
          </section>

          {/* Häufige Fragen */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">❓ Häufige Fragen</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Ich habe meinen Einladungscode vergessen. Was nun?</h3>
                <p className="text-gray-700">
                  Der Teamleiter kann den Code in den <strong>Team-Einstellungen</strong> einsehen und dir mitteilen.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Kann ich in mehreren Teams Mitglied sein?</h3>
                <p className="text-gray-700">
                  Ja! Du kannst mehreren Teams beitreten. Beim Anmelden wählst du dann aus, welches Team du sehen möchtest.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">🆕 Was passiert, wenn ich "Nicht dabei" wähle und vorher nominiert war?</h3>
                <p className="text-gray-700">
                  Deine Nominierung wird automatisch entfernt. Der Teamleiter muss dann einen anderen Spieler nominieren.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Wie kann ich meine Zusage ändern?</h3>
                <p className="text-gray-700">
                  Öffne das Spiel erneut, wähle einen neuen Status und klicke auf <strong>"Speichern"</strong>.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Kann ich ein Spiel nachträglich bearbeiten?</h3>
                <p className="text-gray-700">
                  Ja, als Teamleiter kannst du auf <strong>"⚙️ Spiel verwalten"</strong> klicken und dann <strong>"✏️ Bearbeiten"</strong> wählen.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">🆕 Wo finde ich die automatische Anmeldung?</h3>
                <p className="text-gray-700">
                  Beim Anmelden auf der Login-Seite gibt es das Häkchen <strong>"Nächstes Mal automatisch anmelden"</strong>. 
                  Setze es vor dem Klick auf "Weiter".
                </p>
              </div>
            </div>
          </section>

          {/* Probleme und Support */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">🆘 Probleme und Support</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Die App lädt nicht / zeigt Fehler</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li>Prüfe deine Internetverbindung</li>
              <li>Lade die Seite neu (F5 oder Aktualisieren-Button)</li>
              <li>Lösche Browser-Cache und Cookies</li>
              <li>Versuche einen anderen Browser</li>
            </ul>
            
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-gray-700 mb-3">
                <strong>🐛 Bug gefunden oder Feedback?</strong><br />
                Wir freuen uns über deine Rückmeldung!
              </p>
              <button
                onClick={() => router.push('/kontakt')}
                className="btn-primary"
              >
                📧 Kontakt aufnehmen
              </button>
            </div>
          </section>

          {/* Viel Erfolg */}
          <section className="text-center bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🎾 Viel Erfolg mit eurem Tennis-Team!</h2>
            <p className="text-gray-700">
              Erstellt von einem Tennis-Enthusiasten für Tennis-Enthusiasten.<br />
              Entwickelt mit ❤️ für die nuLiga-Community.
            </p>
            <p className="text-sm text-gray-600 mt-3">
              <strong>Version 2.1</strong> - Mit Aufstellung, Auto-Login und vielen Verbesserungen 🆕
            </p>
          </section>

        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
            <Image
              src="/images/heritage_logo_small.jpg"
              alt="Heritage Office"
              width={60}
              height={20}
              className="inline-block"
            />
            © 2026 Heritage Office Deutschland. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
