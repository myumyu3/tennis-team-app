'use client';

// チーム作成ページ（改善版 - date型入力）

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createTeam, convertIsoToGerman } from '@/lib/auth';

export default function CreateTeamPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [teamName, setTeamName] = useState('');
  const [nachname, setNachname] = useState('');
  const [vorname, setVorname] = useState('');
  const [geburtsdatum, setGeburtsdatum] = useState(''); // YYYY-MM-DD形式
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // YYYY-MM-DD を TT.MM.JJJJ に変換
      const germanDate = convertIsoToGerman(geburtsdatum);
      
      const result = await createTeam(teamName, nachname, vorname, germanDate);

      if (result) {
        login(result.member, result.team);
        
        alert(
          `Team erfolgreich erstellt!\n\n` +
          `Dein Einladungscode: ${result.team.einladungscode}\n\n` +
          `Teile diesen Code mit deinen Teammitgliedern, damit sie beitreten können.`
        );
        
        router.push('/matches');
      } else {
        setError('Fehler beim Erstellen des Teams. Bitte versuche es erneut.');
      }
    } catch (err) {
      console.error('Create team error:', err);
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push('/')}
          className="text-primary-600 hover:text-primary-700 font-medium mb-4"
        >
          ← Zurück
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Neues Team erstellen</h1>
          <p className="text-gray-600">Erstelle dein Tennis-Team und lade andere ein</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="teamName" className="block text-sm font-semibold text-gray-700 mb-2">
                Teamname *
              </label>
              <input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="input-field"
                placeholder="z.B. TC Rot-Weiss Berlin"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Der Name deines Tennis-Teams
              </p>
            </div>

            <div className="border-t pt-5">
              <h3 className="font-semibold text-gray-900 mb-4">Deine Informationen (Teamleiter)</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="vorname" className="block text-sm font-semibold text-gray-700 mb-2">
                    Vorname *
                  </label>
                  <input
                    id="vorname"
                    type="text"
                    value={vorname}
                    onChange={(e) => setVorname(e.target.value)}
                    onBlur={(e) => setVorname(e.target.value.trim())}
                    className="input-field"
                    placeholder="Dein Vorname"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="nachname" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nachname *
                  </label>
                  <input
                    id="nachname"
                    type="text"
                    value={nachname}
                    onChange={(e) => setNachname(e.target.value)}
                    onBlur={(e) => setNachname(e.target.value.trim())}
                    className="input-field"
                    placeholder="Dein Nachname"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="geburtsdatum" className="block text-sm font-semibold text-gray-700 mb-2">
                    Geburtsdatum *
                  </label>
                  <input
                    id="geburtsdatum"
                    type="date"
                    value={geburtsdatum}
                    onChange={(e) => setGeburtsdatum(e.target.value)}
                    className="input-field"
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Wird als dein Login-Passwort verwendet. Es muss nicht dein echtes Geburtsdatum sein: Du kannst
                    einen beliebigen einprägsamen Tag wählen und musst denselben später bei der Anmeldung eingeben.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? 'Team wird erstellt...' : 'Team erstellen'}
            </button>
          </form>
        </div>

        <div className="mt-6 card bg-green-50 border-green-200">
          <h3 className="font-bold text-green-900 mb-2">✅ Nach der Erstellung</h3>
          <p className="text-sm text-green-800">
            Du erhältst einen 6-stelligen Einladungscode, den du mit deinen Teammitgliedern teilen kannst.
          </p>
        </div>
      </div>
    </div>
  );
}
