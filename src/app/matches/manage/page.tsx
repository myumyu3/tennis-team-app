'use client';

// 試合管理ページ（管理者専用 - 改善版）

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Match } from '@/types';
import { parseGermanDate, convertIsoToGerman, convertGermanToIso } from '@/lib/auth';

export default function ManageMatchesPage() {
  const router = useRouter();
  const { member, team, loading } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  
  // フォームの状態（日付はYYYY-MM-DD形式で保存）
  const [formData, setFormData] = useState({
    datumIso: '', // YYYY-MM-DD
    uhrzeit: '',
    gegner: '',
    istHeimspiel: true,
    ort: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 認証チェック
  useEffect(() => {
    if (!loading && (!member || !team || !member.istAdmin)) {
      alert('Zugriff verweigert. Nur Teamleiter können Spiele verwalten.');
      router.push('/matches');
    }
  }, [member, team, loading, router]);

  // 試合データ取得
  useEffect(() => {
    if (!member?.istAdmin || !team) return;

    const fetchMatches = async () => {
      try {
        const matchesSnapshot = await getDocs(query(
          collection(db, 'matches'),
          where('teamId', '==', team.id)
        ));
        let matchesData = matchesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Match));

        // 日付でソート
        matchesData.sort((a, b) => {
          const dateA = parseGermanDate(a.datum);
          const dateB = parseGermanDate(b.datum);
          if (!dateA || !dateB) return 0;
          return dateB.getTime() - dateA.getTime(); // 新しい順
        });

        setMatches(matchesData);
      } catch (error) {
        console.error('Error fetching matches:', error);
        alert('Fehler beim Laden der Spiele');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [member, team]);

  // 試合追加
  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    
    setIsSubmitting(true);

    try {
      const germanDate = convertIsoToGerman(formData.datumIso);
      
      await addDoc(collection(db, 'matches'), {
        teamId: team.id,
        datum: germanDate,
        uhrzeit: formData.uhrzeit || undefined, // 空の場合はundefined
        gegner: formData.gegner,
        istHeimspiel: formData.istHeimspiel,
        ort: formData.ort
      });
      
      alert('Spiel erfolgreich hinzugefügt!');
      setFormData({
        datumIso: '',
        uhrzeit: '',
        gegner: '',
        istHeimspiel: true,
        ort: ''
      });
      setShowAddForm(false);
      
      window.location.reload();
    } catch (error) {
      console.error('Error adding match:', error);
      alert('Fehler beim Hinzufügen des Spiels');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 試合編集
  const handleEditMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;
    
    setIsSubmitting(true);

    try {
      const germanDate = convertIsoToGerman(formData.datumIso);
      
      await updateDoc(doc(db, 'matches', editingMatch.id), {
        datum: germanDate,
        uhrzeit: formData.uhrzeit || undefined,
        gegner: formData.gegner,
        istHeimspiel: formData.istHeimspiel,
        ort: formData.ort
      });
      
      alert('Spiel erfolgreich aktualisiert!');
      setEditingMatch(null);
      setFormData({
        datumIso: '',
        uhrzeit: '',
        gegner: '',
        istHeimspiel: true,
        ort: ''
      });
      
      window.location.reload();
    } catch (error) {
      console.error('Error updating match:', error);
      alert('Fehler beim Aktualisieren des Spiels');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 試合削除
  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('Möchtest du dieses Spiel wirklich löschen? Alle Zusagen werden ebenfalls gelöscht.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'matches', matchId));
      
      // 関連データも削除
      const teilnahmenQuery = query(collection(db, 'teilnahmen'), where('spielId', '==', matchId));
      const teilnahmenSnapshot = await getDocs(teilnahmenQuery);
      await Promise.all(teilnahmenSnapshot.docs.map(doc => deleteDoc(doc.ref)));

      const aufgabenQuery = query(collection(db, 'heim_spiel_aufgaben'), where('spielId', '==', matchId));
      const aufgabenSnapshot = await getDocs(aufgabenQuery);
      await Promise.all(aufgabenSnapshot.docs.map(doc => deleteDoc(doc.ref)));

      const autosQuery = query(collection(db, 'gast_spiel_autos'), where('spielId', '==', matchId));
      const autosSnapshot = await getDocs(autosQuery);
      await Promise.all(autosSnapshot.docs.map(doc => deleteDoc(doc.ref)));

      alert('Spiel gelöscht!');
      setMatches(prev => prev.filter(m => m.id !== matchId));
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Fehler beim Löschen');
    }
  };

  // 編集モード開始
  const startEdit = (match: Match) => {
    setEditingMatch(match);
    setFormData({
      datumIso: convertGermanToIso(match.datum),
      uhrzeit: match.uhrzeit || '',
      gegner: match.gegner,
      istHeimspiel: match.istHeimspiel,
      ort: match.ort
    });
    setShowAddForm(false);
  };

  // 編集モードキャンセル
  const cancelEdit = () => {
    setEditingMatch(null);
    setFormData({
      datumIso: '',
      uhrzeit: '',
      gegner: '',
      istHeimspiel: true,
      ort: ''
    });
  };

  if (loading || isLoading || !member || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/matches')}
            className="text-primary-600 hover:text-primary-700 font-medium mb-2"
          >
            ← Zurück zur Übersicht
          </button>
          <h1 className="text-2xl font-bold text-gray-900">⚙️ Spiele verwalten</h1>
          <p className="text-sm text-gray-600 mt-1">{team.name}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingMatch(null);
            }}
            className="btn-primary w-full"
          >
            {showAddForm ? '− Abbrechen' : '+ Neues Spiel hinzufügen'}
          </button>
        </div>

        {(showAddForm || editingMatch) && (
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingMatch ? 'Spiel bearbeiten' : 'Neues Spiel'}
            </h2>
            <form onSubmit={editingMatch ? handleEditMatch : handleAddMatch} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Datum *
                </label>
                <input
                  type="date"
                  value={formData.datumIso}
                  onChange={(e) => setFormData({ ...formData, datumIso: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Uhrzeit (optional)
                </label>
                <input
                  type="time"
                  value={formData.uhrzeit}
                  onChange={(e) => setFormData({ ...formData, uhrzeit: e.target.value })}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leer lassen, wenn die Zeit noch nicht feststeht
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gegner *
                </label>
                <input
                  type="text"
                  value={formData.gegner}
                  onChange={(e) => setFormData({ ...formData, gegner: e.target.value })}
                  className="input-field"
                  placeholder="TC Blau-Weiss München"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Spielort *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="istHeimspiel"
                      checked={formData.istHeimspiel === true}
                      onChange={() => setFormData({ ...formData, istHeimspiel: true })}
                      className="w-5 h-5"
                    />
                    <span className="font-medium">Heimspiel</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="istHeimspiel"
                      checked={formData.istHeimspiel === false}
                      onChange={() => setFormData({ ...formData, istHeimspiel: false })}
                      className="w-5 h-5"
                    />
                    <span className="font-medium">Auswärtsspiel</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse/Ort *
                </label>
                <textarea
                  value={formData.ort}
                  onChange={(e) => setFormData({ ...formData, ort: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Tennisplatz Adresse"
                  required
                />
              </div>

              <div className="flex gap-3">
                {editingMatch && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="btn-secondary flex-1"
                  >
                    Abbrechen
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1"
                >
                  {isSubmitting ? 'Wird gespeichert...' : editingMatch ? 'Aktualisieren' : 'Spiel hinzufügen'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Alle Spiele ({matches.length})
          </h2>
          {matches.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Noch keine Spiele erstellt.</p>
          ) : (
            <div className="space-y-3">
              {matches.map(match => (
                <div
                  key={match.id}
                  className="p-4 rounded-lg border-2 border-gray-200 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          match.istHeimspiel ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {match.istHeimspiel ? 'H' : 'G'}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          vs {match.gegner}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          📅 {match.datum}
                          {match.uhrzeit ? ` um ${match.uhrzeit} Uhr` : ' (Zeit noch offen)'}
                        </div>
                        <div>📍 {match.ort}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => startEdit(match)}
                        className="text-sm px-3 py-1 rounded font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        className="text-sm px-3 py-1 rounded font-medium bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card bg-yellow-50 border-yellow-200">
          <h3 className="font-bold text-yellow-900 mb-2">⚠️ Wichtig</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Beim Löschen eines Spiels werden alle Zusagen ebenfalls gelöscht</li>
            <li>• Die Uhrzeit ist optional - hilfreich bei noch offenen Terminen</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
