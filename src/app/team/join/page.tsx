'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { joinTeam, convertIsoToGerman } from '@/lib/auth';

export default function JoinTeamPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [einladungscode, setEinladungscode] = useState('');
  const [nachname, setNachname] = useState('');
  const [vorname, setVorname] = useState('');
  const [geburtsdatum, setGeburtsdatum] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const germanDate = convertIsoToGerman(geburtsdatum);
      const result = await joinTeam(einladungscode, nachname, vorname, germanDate);

      if (result) {
        login(result.member, result.team);
        alert(`Willkommen im Team "${result.team.name}"!`);
        router.push('/matches');
      } else {
        setError('Einladungscode ungültig oder Team nicht gefunden.');
      }
    } catch (err) {
      console.error('Join team error:', err);
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeInput = (value: string) => {
    setEinladungscode(value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md">
        <button onClick={() => router.push('/')} className="text-primary-600 hover:text-primary-700 font-medium mb-4">
          ← Zurück
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team beitreten</h1>
          <p className="text-gray-600">Gib den Einladungscode deines Teams ein</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="einladungscode" className="block text-sm font-semibold text-gray-700 mb-2">
                Einladungscode *
              </label>
              <input
                id="einladungscode"
                type="text"
                value={einladungscode}
                onChange={(e) => handleCodeInput(e.target.value)}
                className="input-field text-center text-2xl font-mono tracking-widest"
                placeholder="ABC123"
                required
                maxLength={6}
                autoComplete="off"
              />
            </div>

            <div className="border-t pt-5">
              <h3 className="font-semibold text-gray-900 mb-4">Deine Informationen</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vorname *</label>
                  <input 
                    type="text" 
                    value={vorname} 
                    onChange={(e) => setVorname(e.target.value)} 
                    onBlur={(e) => setVorname(e.target.value.trim())}
                    className="input-field" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nachname *</label>
                  <input 
                    type="text" 
                    value={nachname} 
                    onChange={(e) => setNachname(e.target.value)} 
                    onBlur={(e) => setNachname(e.target.value.trim())}
                    className="input-field" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Geburtsdatum *</label>
                  <input
                    type="date"
                    value={geburtsdatum}
                    onChange={(e) => setGeburtsdatum(e.target.value)}
                    className="input-field"
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-gray-500 mt-1">Wird als dein Login-Passwort verwendet</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting || einladungscode.length !== 6} className="btn-primary w-full">
              {isSubmitting ? 'Trete bei...' : 'Team beitreten'}
            </button>
          </form>
        </div>

        <div className="mt-6 card bg-blue-50 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">💡 Tipp</h3>
          <p className="text-sm text-blue-800">
            Wenn du bereits Mitglied bist, nutze die "Anmelden"-Option auf der Startseite.
          </p>
        </div>
      </div>
    </div>
  );
}
