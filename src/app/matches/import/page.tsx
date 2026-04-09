'use client';

// nuLigaからの試合インポート画面

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ImportedMatch {
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  isHomeGame: boolean;
  selected: boolean;
  address: string;
}

export default function ImportNuLigaPage() {
  const router = useRouter();
  const { member, team } = useAuth();
  
  const [nuligaUrl, setNuligaUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [teamName, setTeamName] = useState('');
  const [clubAddress, setClubAddress] = useState('');
  const [matches, setMatches] = useState<ImportedMatch[]>([]);

  // 管理者チェック
  if (!member?.istAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">🔒 Nur für Teamleiter</h1>
          <p className="text-gray-700 mb-6">Diese Funktion ist nur für Teamleiter verfügbar.</p>
          <button onClick={() => router.push('/matches')} className="btn-primary">
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  const handleFetchMatches = async () => {
    setError('');
    setIsLoading(true);
    setMatches([]);

    try {
      const response = await fetch('/api/import-nuliga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: nuligaUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Fehler beim Abrufen der Daten');
        return;
      }

      setTeamName(data.teamName);
      setClubAddress(data.clubAddress);
      
      // 試合リストを初期化（全選択、ホームゲームには住所を自動入力）
      const importedMatches: ImportedMatch[] = data.matches.map((match: any) => ({
        ...match,
        selected: true,
        address: match.isHomeGame ? data.clubAddress : ''
      }));

      setMatches(importedMatches);

    } catch (err) {
      console.error('Fetch error:', err);
      setError('Netzwerkfehler. Bitte erneut versuchen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMatch = (index: number) => {
    const updated = [...matches];
    updated[index].selected = !updated[index].selected;
    setMatches(updated);
  };

  const handleAddressChange = (index: number, address: string) => {
    const updated = [...matches];
    updated[index].address = address;
    setMatches(updated);
  };

  const handleImport = async () => {
    if (!team) return;

    const selectedMatches = matches.filter(m => m.selected);
    
    if (selectedMatches.length === 0) {
      setError('Bitte wähle mindestens ein Spiel aus.');
      return;
    }

    // 住所の確認
    const missingAddress = selectedMatches.find(m => !m.address.trim());
    if (missingAddress) {
      setError('Bitte gib für alle ausgewählten Spiele eine Adresse ein.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Firestoreに保存
      for (const match of selectedMatches) {
        // 日付をISO形式に変換 (DD.MM.YYYY → YYYY-MM-DD)
        const [day, month, year] = match.date.split('.');
        const isoDate = `${year}-${month}-${day}`;

        // 対戦相手名を抽出（自チームではない方）
        const gegner = match.isHomeGame ? match.awayTeam : match.homeTeam;

        await addDoc(collection(db, 'matches'), {
          teamId: team.id,
          datum: match.date,  // DD.MM.YYYY形式で保存
          uhrzeit: match.time || '',
          gegner: gegner,
          ort: match.address,
          istHeimspiel: match.isHomeGame,
          createdAt: Date.now()
        });
      }

      alert(`${selectedMatches.length} Spiel(e) erfolgreich importiert!`);
      router.push('/matches');

    } catch (err) {
      console.error('Save error:', err);
      setError('Fehler beim Speichern der Spiele');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/matches')}
            className="text-primary-600 hover:text-primary-700 font-medium mb-2"
          >
            ← Zurück
          </button>
          <h1 className="text-3xl font-bold text-gray-900">📥 nuLiga Import</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* URL入力 */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">1. nuLiga URL eingeben</h2>
          <p className="text-sm text-gray-600 mb-4">
            Gehe zu deinem Team auf nuLiga und kopiere die URL aus der Adressleiste.
          </p>
          
          <input
            type="text"
            value={nuligaUrl}
            onChange={(e) => setNuligaUrl(e.target.value)}
            placeholder="https://wtv.liga.nu/cgi-bin/WebObjects/..."
            className="input-field mb-4"
          />

          <button
            onClick={handleFetchMatches}
            disabled={!nuligaUrl || isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Wird geladen...' : '🔍 Spiele abrufen'}
          </button>

          {error && (
            <div className="mt-4 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* 試合リスト */}
        {matches.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              2. Spiele auswählen ({matches.filter(m => m.selected).length}/{matches.length})
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Team: <strong>{teamName}</strong>
            </p>

            <div className="space-y-4">
              {matches.map((match, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-4 ${
                    match.selected ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={match.selected}
                      onChange={() => handleToggleMatch(index)}
                      className="mt-1 w-5 h-5"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          match.isHomeGame ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {match.isHomeGame ? 'H' : 'G'}
                        </span>
                        <span className="font-bold text-gray-900">
                          vs {match.isHomeGame ? match.awayTeam : match.homeTeam}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        📅 {match.date} {match.time && `• 🕐 ${match.time} Uhr`}
                      </div>

                      {match.selected && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            📍 Spielort / Adresse *
                          </label>
                          <input
                            type="text"
                            value={match.address}
                            onChange={(e) => handleAddressChange(index, e.target.value)}
                            placeholder={match.isHomeGame ? "Heimadresse (bereits eingefügt)" : "Adresse des Gastgebers eingeben"}
                            className="input-field"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleImport}
                disabled={isSaving || matches.filter(m => m.selected).length === 0}
                className="btn-primary w-full"
              >
                {isSaving 
                  ? 'Wird gespeichert...' 
                  : `✓ ${matches.filter(m => m.selected).length} Spiel(e) importieren`
                }
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
