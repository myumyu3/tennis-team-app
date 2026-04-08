'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { login as authLogin, convertIsoToGerman } from '@/lib/auth';
import { Team } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [nachname, setNachname] = useState('');
  const [geburtsdatum, setGeburtsdatum] = useState('');
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'credentials' | 'team-select'>('credentials');
  const [rememberMe, setRememberMe] = useState(false);

  // ページロード時：保存されたログイン情報があれば自動ログイン
  useEffect(() => {
    const savedNachname = localStorage.getItem('tennisRememberNachname');
    const savedGeburtsdatum = localStorage.getItem('tennisRememberGeburtsdatum');
    
    if (savedNachname && savedGeburtsdatum) {
      // 保存された情報がある場合、自動的にログイン処理を実行
      setNachname(savedNachname);
      setGeburtsdatum(savedGeburtsdatum);
      setRememberMe(true);
      
      // 自動ログインを実行
      autoLogin(savedNachname, savedGeburtsdatum);
    }
  }, []);

  // 自動ログイン処理
  const autoLogin = async (savedNachname: string, savedGeburtsdatum: string) => {
    try {
      const germanDate = convertIsoToGerman(savedGeburtsdatum);
      const result = await authLogin(savedNachname, germanDate);

      if (result?.member && result?.team) {
        login(result.member, result.team);
        router.push('/matches');
      } else if (result?.teams && result.teams.length > 0) {
        setAvailableTeams(result.teams);
        setStep('team-select');
      }
    } catch (err) {
      console.error('Auto login error:', err);
      // 自動ログイン失敗時は何もしない（手動ログインできる状態にする）
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // 余分な空白を削除
      const cleanNachname = nachname.trim();
      const cleanGeburtsdatum = geburtsdatum.trim();

      // 日付の検証と変換
      if (!cleanGeburtsdatum || !cleanGeburtsdatum.includes('-')) {
        setError('Bitte gib ein gültiges Geburtsdatum ein.');
        setIsSubmitting(false);
        return;
      }

      const germanDate = convertIsoToGerman(cleanGeburtsdatum);
      
      // 変換後の形式を検証
      if (!germanDate || germanDate.split('.').length !== 3) {
        setError('Ungültiges Datumsformat. Bitte verwende den Kalender.');
        setIsSubmitting(false);
        return;
      }

      const result = await authLogin(cleanNachname, germanDate);

      if (!result) {
        setError('Nachname oder Geburtsdatum falsch, oder du bist in keinem Team.');
        setIsSubmitting(false);
        return;
      }

      // ログイン情報を保存または削除
      if (rememberMe) {
        localStorage.setItem('tennisRememberNachname', cleanNachname);
        localStorage.setItem('tennisRememberGeburtsdatum', cleanGeburtsdatum);
      } else {
        localStorage.removeItem('tennisRememberNachname');
        localStorage.removeItem('tennisRememberGeburtsdatum');
      }

      if (result.member && result.team) {
        login(result.member, result.team);
        router.push('/matches');
      } else if (result.teams && result.teams.length > 0) {
        setAvailableTeams(result.teams);
        setStep('team-select');
      } else {
        setError('Keine Teams gefunden.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ein Fehler ist aufgetreten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeamSelection = async () => {
    if (!selectedTeamId) {
      setError('Bitte wähle ein Team aus.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanNachname = nachname.trim();
      const cleanGeburtsdatum = geburtsdatum.trim();
      const germanDate = convertIsoToGerman(cleanGeburtsdatum);
      const result = await authLogin(cleanNachname, germanDate, selectedTeamId);

      if (result?.member && result?.team) {
        login(result.member, result.team);
        router.push('/matches');
      } else {
        setError('Fehler beim Team-Login.');
      }
    } catch (err) {
      console.error('Team selection error:', err);
      setError('Ein Fehler ist aufgetreten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md">
        <button onClick={() => router.push('/')} className="text-primary-600 hover:text-primary-700 font-medium mb-4">
          ← Zurück
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🎾</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Anmelden</h2>
          <p className="text-gray-600">
            {step === 'credentials' ? 'Gib deine Anmeldedaten ein' : 'Wähle dein Team aus'}
          </p>
        </div>

        <div className="card">
          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nachname</label>
                <input type="text" value={nachname} onChange={(e) => setNachname(e.target.value)} className="input-field" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Geburtsdatum</label>
                <input
                  type="date"
                  value={geburtsdatum}
                  onChange={(e) => setGeburtsdatum(e.target.value)}
                  className="input-field"
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                  Nächstes Mal automatisch anmelden
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Anmelden...' : 'Weiter'}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Wähle dein Team:</label>
                <div className="space-y-2">
                  {availableTeams.map((team) => (
                    <label
                      key={team.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedTeamId === team.id ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="team"
                        value={team.id}
                        checked={selectedTeamId === team.id}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="w-5 h-5 mr-3"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{team.name}</div>
                        <div className="text-xs text-gray-600">Code: {team.einladungscode}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setStep('credentials'); setSelectedTeamId(''); setError(''); }} className="btn-secondary flex-1">
                  Zurück
                </button>
                <button onClick={handleTeamSelection} disabled={isSubmitting || !selectedTeamId} className="btn-primary flex-1">
                  {isSubmitting ? 'Anmelden...' : 'Anmelden'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Noch kein Mitglied?</p>
          <button onClick={() => router.push('/')} className="mt-1 text-primary-600 hover:text-primary-700 font-medium">
            Team erstellen oder beitreten →
          </button>
        </div>
      </div>
    </div>
  );
}
