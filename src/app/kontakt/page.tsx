'use client';

// Kontakt/Feedback ページ

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

function KontaktForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submitted = searchParams.get('success') === 'true';

  return (
    <>
      {!submitted ? (
        <>
          {/* 説明 */}
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Hast du einen Bug gefunden, eine Idee für eine neue Funktion oder eine Frage zur App?
            </p>
            <p className="text-gray-700">
              Wir freuen uns über dein Feedback! Fülle einfach das Formular aus und wir melden uns bei dir.
            </p>
          </div>

          {/* Formspree フォーム */}
          <form
            action="https://formspree.io/f/xnjorgnp"
            method="POST"
            className="space-y-4"
          >
            {/* リダイレクト先を指定 */}
            <input type="hidden" name="_next" value="/kontakt?success=true" />
            
            {/* スパム対策 */}
            <input type="text" name="_gotcha" style={{ display: 'none' }} />

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="input-field"
                placeholder="Dein Name"
              />
            </div>

            {/* E-Mail */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                E-Mail *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="input-field"
                placeholder="deine@email.de"
              />
            </div>

            {/* Kategorie */}
            <div>
              <label htmlFor="kategorie" className="block text-sm font-semibold text-gray-700 mb-1">
                Kategorie *
              </label>
              <select
                id="kategorie"
                name="kategorie"
                required
                className="input-field"
              >
                <option value="">Bitte wählen...</option>
                <option value="bug">🐛 Bug melden</option>
                <option value="feature">💡 Feature vorschlagen</option>
                <option value="frage">❓ Frage stellen</option>
                <option value="sonstiges">📝 Sonstiges</option>
              </select>
            </div>

            {/* Betreff */}
            <div>
              <label htmlFor="betreff" className="block text-sm font-semibold text-gray-700 mb-1">
                Betreff *
              </label>
              <input
                type="text"
                id="betreff"
                name="betreff"
                required
                className="input-field"
                placeholder="Kurze Zusammenfassung"
              />
            </div>

            {/* Nachricht */}
            <div>
              <label htmlFor="nachricht" className="block text-sm font-semibold text-gray-700 mb-1">
                Nachricht *
              </label>
              <textarea
                id="nachricht"
                name="nachricht"
                required
                rows={6}
                className="input-field resize-none"
                placeholder="Beschreibe dein Anliegen so detailliert wie möglich..."
              />
            </div>

            {/* Teamname (optional) */}
            <div>
              <label htmlFor="teamname" className="block text-sm font-semibold text-gray-700 mb-1">
                Teamname (optional)
              </label>
              <input
                type="text"
                id="teamname"
                name="teamname"
                className="input-field"
                placeholder="Dein Teamname (hilft uns bei der Fehlersuche)"
              />
            </div>

            {/* Absenden Button */}
            <button
              type="submit"
              className="btn-primary w-full text-lg"
            >
              📧 Nachricht absenden
            </button>

            <p className="text-xs text-gray-500 text-center">
              * Pflichtfelder
            </p>
          </form>
        </>
      ) : (
        /* Erfolgsbestätigung */
        <div className="text-center py-8">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Vielen Dank!</h2>
          <p className="text-gray-700 mb-6">
            Deine Nachricht wurde erfolgreich gesendet. Wir melden uns in Kürze bei dir.
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Zurück zur Startseite
          </button>
        </div>
      )}

      {/* Hinweise */}
      {!submitted && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tipps für Bug-Meldungen:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Beschreibe, was du getan hast</li>
            <li>Beschreibe, was passiert ist</li>
            <li>Beschreibe, was eigentlich passieren sollte</li>
            <li>Gib deinen Teamnamen an (falls relevant)</li>
            <li>Gib an, welches Gerät/Browser du nutzt</li>
          </ul>
        </div>
      )}
    </>
  );
}

export default function KontaktPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">📧 Kontakt & Feedback</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <Suspense fallback={<div className="text-center py-8">Laden...</div>}>
            <KontaktForm />
          </Suspense>
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
