'use client';

// Anleitung (使い方) ページ

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
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">Für Teamleiter (Admin):</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Spiele erstellen</strong> - Neue Spiele mit Datum, Zeit und Gegner anlegen</li>
              <li><strong>Alle Zusagen sehen</strong> - Übersicht über alle Teilnehmerzusagen</li>
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
            <ol className="list-decimal list-inside text-gray-700 space-y-1">
              <li>Gehe zur App-Startseite</li>
              <li>Klicke auf <strong>"Anmelden"</strong></li>
              <li>Gib Nachname und Geburtsdatum ein</li>
              <li>Wähle dein Team (falls mehrere)</li>
              <li>Klicke auf <strong>"Weiter"</strong></li>
            </ol>
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
              <p className="text-gray-700 mb-2">Das Löschen entfernt dauerhaft:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Alle Mitglieder</li>
                <li>Alle Spiele und Zusagen</li>
                <li>Alle Heimspiel-Aufgaben</li>
                <li>Alle Fahrgemeinschaften</li>
                <li>Das gesamte Team</li>
              </ul>
            </div>

            <p className="text-gray-700 mb-2"><strong>So löschst du ein Team:</strong></p>
            <ol className="list-decimal list-inside text-gray-700 space-y-1 mb-4">
              <li>Gehe zu <strong>"⚙️ Einstellungen"</strong></li>
              <li>Scrolle zu <strong>"⚠️ Gefahrenzone"</strong></li>
              <li>Klicke auf <strong>"Team löschen"</strong></li>
              <li>Gib den exakten Teamnamen ein</li>
              <li>Klicke auf <strong>"Endgültig löschen"</strong></li>
              <li>Der Löschvorgang zeigt den Fortschritt (1/6 bis 6/6)</li>
              <li>Nach erfolgreicher Löschung wirst du zur Startseite weitergeleitet</li>
            </ol>

            <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
              <p className="font-semibold text-yellow-900 mb-1">💡 Alternative zum Löschen:</p>
              <p className="text-sm text-gray-700">
                Wenn du nur die Saison beenden möchtest, musst du das Team NICHT löschen. 
                Du kannst einfach alte Spiele löschen und neue anlegen. 
                Das Team und alle Mitglieder bleiben erhalten.
              </p>
            </div>
          </section>

          {/* Tipps und Tricks */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">💡 Tipps und Tricks</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Zeitangabe ist optional</strong> - Leer lassen, wenn noch nicht festgelegt</li>
              <li><strong>Mehrere Teams</strong> - Du kannst mehreren Teams angehören</li>
              <li><strong>Passwort = Geburtsdatum</strong> - Teile es nicht mit Unbefugten</li>
              <li><strong>Browser-Daten nicht löschen</strong> - Sonst musst du dich neu anmelden</li>
            </ul>
          </section>

          {/* Häufige Fragen */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">❓ Häufige Fragen</h2>
            
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-900">F: Ich habe meinen Einladungscode vergessen. Was nun?</p>
                <p className="text-gray-700">A: Der Teamleiter findet den Code unter "⚙️ Einstellungen".</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900">F: Kann ich ein gelöschtes Team wiederherstellen?</p>
                <p className="text-gray-700">A: Nein! Die Team-Löschung ist endgültig. Es gibt KEINE Wiederherstellungsmöglichkeit.</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900">F: Kann ich die App auf dem Handy nutzen?</p>
                <p className="text-gray-700">A: Ja! Die App ist für Mobilgeräte optimiert.</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900">F: Werden andere Teams meine Daten sehen können?</p>
                <p className="text-gray-700">A: Nein. Jedes Team ist komplett isoliert.</p>
              </div>
            </div>
          </section>

          {/* Datenschutz */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">🔒 Datenschutz und Sicherheit</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Alle Daten sind in der Cloud gespeichert (Google Firebase)</li>
              <li>Nur Teammitglieder haben Zugriff auf Teamdaten</li>
              <li>Jedes Team ist komplett getrennt</li>
              <li>Sichere Verbindung über HTTPS</li>
              <li>Teile deinen Einladungscode nur mit vertrauenswürdigen Personen</li>
            </ul>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">📞 Support</h2>
            <p className="text-gray-700">Bei Problemen oder Fragen:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2 mb-4">
              <li>Kontaktiere deinen Teamleiter</li>
              <li>Prüfe deine Internetverbindung</li>
              <li>Aktualisiere die Seite (F5 oder Strg+R)</li>
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
              <strong>Version 2.0</strong> - Mit Team-Verwaltung und verbesserter Benutzerfreundlichkeit
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
