'use client';

// 試合詳細ページ（改善版 - Gastspiel車管理UI改善）

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  doc, getDoc, collection, query, where, getDocs, 
  addDoc, updateDoc, deleteDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Match, Teilnahme, TeilnahmeStatus, Member, 
  HeimSpielAufgabe, GastSpielAuto, TeilnahmeWithMember 
} from '@/types';

export default function MatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.id as string;
  const { member, team, loading } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [meineTeilnahme, setMeineTeilnahme] = useState<Teilnahme | null>(null);
  const [allTeilnahmen, setAllTeilnahmen] = useState<TeilnahmeWithMember[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [heimAufgaben, setHeimAufgaben] = useState<HeimSpielAufgabe[]>([]);
  const [gastAutos, setGastAutos] = useState<GastSpielAuto[]>([]);
  
  // 車管理用の新しいステート
  const [selectedDrivers, setSelectedDrivers] = useState<{[key: string]: number}>({});  // memberId -> freiePlaetze
  
  const [selectedStatus, setSelectedStatus] = useState<TeilnahmeStatus>('verfuegbar');
  const [kommentar, setKommentar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 認証チェック
  useEffect(() => {
    if (!loading && (!member || !team)) {
      router.push('/');
    }
  }, [member, team, loading, router]);

  // データ取得
  useEffect(() => {
    if (!member || !team || !matchId) return;

    const fetchData = async () => {
      try {
        // 試合情報取得
        const matchDoc = await getDoc(doc(db, 'matches', matchId));
        if (!matchDoc.exists() || matchDoc.data().teamId !== team.id) {
          alert('Spiel nicht gefunden');
          router.push('/matches');
          return;
        }
        const matchData = { id: matchDoc.id, ...matchDoc.data() } as Match;
        setMatch(matchData);

        // 自分の回答取得
        const meineTeilnahmeQuery = query(
          collection(db, 'teilnahmen'),
          where('teamId', '==', team.id),
          where('spielId', '==', matchId),
          where('mitgliedId', '==', member.id)
        );
        const meineTeilnahmeSnapshot = await getDocs(meineTeilnahmeQuery);
        if (!meineTeilnahmeSnapshot.empty) {
          const teilnahme = {
            id: meineTeilnahmeSnapshot.docs[0].id,
            ...meineTeilnahmeSnapshot.docs[0].data()
          } as Teilnahme;
          setMeineTeilnahme(teilnahme);
          setSelectedStatus(teilnahme.status);
          setKommentar(teilnahme.kommentar || '');
        }

        // 全メンバー取得（運転手名表示のため、全ユーザーに必要）
        const membersSnapshot = await getDocs(query(
          collection(db, 'members'),
          where('teamId', '==', team.id),
          where('aktiv', '==', true)
        ));
        const membersData = membersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Member));
        setMembers(membersData);

        // Gastspielの場合は運転手情報を取得（全ユーザーが見られる）
        if (!matchData.istHeimspiel) {
          const gastQuery = query(
            collection(db, 'gast_spiel_autos'),
            where('teamId', '==', team.id),
            where('spielId', '==', matchId)
          );
          const gastSnapshot = await getDocs(gastQuery);
          const gastData = gastSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as GastSpielAuto));
          setGastAutos(gastData);
          
          // 既存のドライバー情報をselectedDriversにセット（管理者用）
          if (member.istAdmin) {
            const drivers: {[key: string]: number} = {};
            gastData.forEach(auto => {
              drivers[auto.fahrerId] = auto.freiePlaetze;
            });
            setSelectedDrivers(drivers);
          }
        }

        // 全員の回答取得（全メンバーが閲覧可能）
        const allTeilnahmenQuery = query(
          collection(db, 'teilnahmen'),
          where('teamId', '==', team.id),
          where('spielId', '==', matchId)
        );
        const allTeilnahmenSnapshot = await getDocs(allTeilnahmenQuery);
        const teilnahmenData = allTeilnahmenSnapshot.docs.map(doc => {
          const teilnahme = { id: doc.id, ...doc.data() } as Teilnahme;
          const teilnahmeMember = membersData.find(m => m.id === teilnahme.mitgliedId);
          return { ...teilnahme, member: teilnahmeMember };
        });
        setAllTeilnahmen(teilnahmenData);

        // 管理者の場合は追加データ取得
        if (member.istAdmin) {
          // Heimspiel の場合は持ち物割り当て取得
          if (matchData.istHeimspiel) {
            const heimQuery = query(
              collection(db, 'heim_spiel_aufgaben'),
              where('teamId', '==', team.id),
              where('spielId', '==', matchId)
            );
            const heimSnapshot = await getDocs(heimQuery);
            const heimData = heimSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as HeimSpielAufgabe));
            setHeimAufgaben(heimData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Fehler beim Laden der Daten');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [member, team, matchId, router]);

  // 出場回答の保存
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !team || !match) return;

    setIsSubmitting(true);
    try {
      const teilnahmeData = {
        teamId: team.id,
        spielId: match.id,
        mitgliedId: member.id,
        status: selectedStatus,
        kommentar: kommentar.trim() || null,
        aktualisiertAm: Date.now()
      };

      if (meineTeilnahme) {
        await updateDoc(doc(db, 'teilnahmen', meineTeilnahme.id), teilnahmeData);
      } else {
        await addDoc(collection(db, 'teilnahmen'), teilnahmeData);
      }

      alert('Deine Antwort wurde gespeichert!');
      router.push('/matches');
    } catch (error) {
      console.error('Error saving teilnahme:', error);
      alert('Fehler beim Speichern');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Heimspiel 持ち物の追加
  const handleAddHeimItem = async () => {
    if (!member?.istAdmin || !match || !team) return;
    const item = prompt('Welches Item möchtest du hinzufügen?');
    if (!item) return;

    try {
      await addDoc(collection(db, 'heim_spiel_aufgaben'), {
        teamId: team.id,
        spielId: match.id,
        gegenstand: item.trim(),
        zugewiesenAn: null
      });
      window.location.reload();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Fehler beim Hinzufügen');
    }
  };

  // Heimspiel 持ち物の割り当て更新
  const handleUpdateHeimAssignment = async (aufgabeId: string, memberId: string | null) => {
    try {
      await updateDoc(doc(db, 'heim_spiel_aufgaben', aufgabeId), {
        zugewiesenAn: memberId
      });
      setHeimAufgaben(prev => prev.map(a => 
        a.id === aufgabeId ? { ...a, zugewiesenAn: memberId } : a
      ));
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Fehler beim Aktualisieren');
    }
  };

  // Heimspiel 持ち物の削除
  const handleDeleteHeimItem = async (aufgabeId: string) => {
    if (!confirm('Möchtest du dieses Item wirklich löschen?')) return;
    
    try {
      await deleteDoc(doc(db, 'heim_spiel_aufgaben', aufgabeId));
      setHeimAufgaben(prev => prev.filter(a => a.id !== aufgabeId));
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Fehler beim Löschen');
    }
  };

  // Gastspiel 車管理 - ドライバーのチェック切り替え
  const toggleDriver = (memberId: string) => {
    setSelectedDrivers(prev => {
      const newDrivers = { ...prev };
      if (newDrivers[memberId] !== undefined) {
        delete newDrivers[memberId];
      } else {
        newDrivers[memberId] = 4; // デフォルト4席
      }
      return newDrivers;
    });
  };

  // Gastspiel 車管理 - 座席数の変更
  const updateSeats = (memberId: string, seats: number) => {
    setSelectedDrivers(prev => ({
      ...prev,
      [memberId]: Math.max(0, Math.min(7, seats)) // 0〜7の範囲
    }));
  };

  // Gastspiel 車管理 - 保存
  const handleSaveCarAssignments = async () => {
    if (!member?.istAdmin || !match || !team) return;
    
    setIsSubmitting(true);
    try {
      // 既存の車割り当てを全削除
      for (const auto of gastAutos) {
        await deleteDoc(doc(db, 'gast_spiel_autos', auto.id));
      }
      
      // 新しい割り当てを追加
      for (const [fahrerId, freiePlaetze] of Object.entries(selectedDrivers)) {
        await addDoc(collection(db, 'gast_spiel_autos'), {
          teamId: team.id,
          spielId: match.id,
          fahrerId,
          freiePlaetze,
          notiz: ''
        });
      }
      
      alert('Fahrerzuteilung gespeichert!');
      window.location.reload();
    } catch (error) {
      console.error('Error saving car assignments:', error);
      alert('Fehler beim Speichern');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gastspiel 車管理 - 運転手自身が削除
  const handleRemoveMyself = async (autoId: string) => {
    if (!member || !confirm('Möchtest du dich als Fahrer austragen?')) return;
    
    try {
      await deleteDoc(doc(db, 'gast_spiel_autos', autoId));
      alert('Du wurdest als Fahrer ausgetragen.');
      window.location.reload();
    } catch (error) {
      console.error('Error removing driver:', error);
      alert('Fehler beim Austragen');
    }
  };

  if (loading || isLoading || !member || !team || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Laden...</div>
      </div>
    );
  }

  const getStatusCount = (status: TeilnahmeStatus) => {
    return allTeilnahmen.filter(a => a.status === status).length;
  };

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
          <h1 className="text-2xl font-bold text-gray-900">
            Spiel vs {match.gegner}
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 試合情報 */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Spielinformationen</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded font-bold ${
                match.istHeimspiel ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {match.istHeimspiel ? 'Heimspiel' : 'Auswärtsspiel'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">📅</span>
              <span className="font-medium">
                {match.datum}
                {match.uhrzeit ? ` um ${match.uhrzeit} Uhr` : ' (Zeit noch offen)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">📍</span>
              <span>{match.ort}</span>
            </div>
          </div>
        </div>

        {/* 出場回答フォーム */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Deine Zusage</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {(['verfuegbar', 'nur_doppel', 'vielleicht', 'nicht_verfuegbar'] as TeilnahmeStatus[]).map(status => (
                <label key={status} className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={selectedStatus === status}
                    onChange={(e) => setSelectedStatus(e.target.value as TeilnahmeStatus)}
                    className="w-5 h-5"
                  />
                  <span className="flex-1">
                    <span className={`font-semibold ${
                      status === 'verfuegbar' ? 'text-green-700' :
                      status === 'nur_doppel' ? 'text-blue-700' :
                      status === 'vielleicht' ? 'text-yellow-700' :
                      'text-red-700'
                    }`}>
                      {status === 'verfuegbar' && '✓ Ich bin dabei'}
                      {status === 'nur_doppel' && 'D Nur Doppel'}
                      {status === 'vielleicht' && '? Vielleicht'}
                      {status === 'nicht_verfuegbar' && '✗ Nicht verfügbar'}
                    </span>
                    <span className="block text-xs text-gray-600 mt-1">
                      {status === 'verfuegbar' && 'Singles und Doppel möglich'}
                      {status === 'nur_doppel' && 'Nur für Doppel verfügbar'}
                      {status === 'vielleicht' && 'Noch nicht sicher, aber wenn möglich dabei'}
                      {status === 'nicht_verfuegbar' && 'Kann leider nicht teilnehmen'}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <div>
              <label htmlFor="kommentar" className="block text-sm font-semibold text-gray-700 mb-2">
                Kommentar (optional)
              </label>
              <textarea
                id="kommentar"
                value={kommentar}
                onChange={(e) => setKommentar(e.target.value)}
                className="input-field resize-none"
                rows={3}
                placeholder="z.B. Ankunftszeit, besondere Hinweise..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? 'Wird gespeichert...' : 'Antwort speichern'}
            </button>
          </form>
        </div>

        {/* 全メンバーの回答一覧（全員が閲覧可能） */}
        {allTeilnahmen.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Zusagen aller Mitglieder</h2>
            <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-green-50 p-2 rounded">
                <span className="font-semibold text-green-700">✓ Dabei: {getStatusCount('verfuegbar')}</span>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <span className="font-semibold text-blue-700">D Doppel: {getStatusCount('nur_doppel')}</span>
              </div>
              <div className="bg-yellow-50 p-2 rounded">
                <span className="font-semibold text-yellow-700">? Vielleicht: {getStatusCount('vielleicht')}</span>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <span className="font-semibold text-red-700">✗ Abwesend: {getStatusCount('nicht_verfuegbar')}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {/* 選抜順にソート: nominiert → reserve → その他 */}
              {[...members]
                .sort((a, b) => {
                  const aTeilnahme = allTeilnahmen.find(t => t.mitgliedId === a.id);
                  const bTeilnahme = allTeilnahmen.find(t => t.mitgliedId === b.id);
                  const order = { nominiert: 0, reserve: 1, none: 2 };
                  const aOrder = order[aTeilnahme?.selectionStatus || 'none'];
                  const bOrder = order[bTeilnahme?.selectionStatus || 'none'];
                  return aOrder - bOrder;
                })
                .map(m => {
                  const teilnahme = allTeilnahmen.find(a => a.mitgliedId === m.id);
                  return (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{m.vorname} {m.nachname}</span>
                          
                          {/* 選抜バッジ（全員が見られる） */}
                          {teilnahme?.selectionStatus === 'nominiert' && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                              ⭐ Nominiert
                            </span>
                          )}
                          {teilnahme?.selectionStatus === 'reserve' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                              🔄 Reserve
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <span className={`status-badge ${
                        teilnahme?.status === 'verfuegbar' ? 'bg-green-100 text-green-800' :
                        teilnahme?.status === 'nur_doppel' ? 'bg-blue-100 text-blue-800' :
                        teilnahme?.status === 'vielleicht' ? 'bg-yellow-100 text-yellow-800' :
                        teilnahme?.status === 'nicht_verfuegbar' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {teilnahme?.status === 'verfuegbar' && '✓ Dabei'}
                        {teilnahme?.status === 'nur_doppel' && 'D Doppel'}
                        {teilnahme?.status === 'vielleicht' && '? Vielleicht'}
                        {teilnahme?.status === 'nicht_verfuegbar' && '✗ Abwesend'}
                        {!teilnahme && '− Keine Antwort'}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Heimspiel: 持ち物管理 */}
        {match.istHeimspiel && member.istAdmin && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Heimspiel - Mitbringsel</h2>
              <button onClick={handleAddHeimItem} className="btn-secondary text-sm py-2 px-4">
                + Item
              </button>
            </div>
            <div className="space-y-3">
              {heimAufgaben.map(aufgabe => (
                <div key={aufgabe.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <span className="flex-1 font-medium">{aufgabe.gegenstand}</span>
                  <select
                    value={aufgabe.zugewiesenAn || ''}
                    onChange={(e) => handleUpdateHeimAssignment(aufgabe.id, e.target.value || null)}
                    className="input-field text-sm py-2 flex-1"
                  >
                    <option value="">Nicht zugewiesen</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.vorname} {m.nachname}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDeleteHeimItem(aufgabe.id)}
                    className="text-red-600 hover:text-red-700 px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {heimAufgaben.length === 0 && (
                <p className="text-gray-600 text-sm">Noch keine Items hinzugefügt.</p>
              )}
            </div>
          </div>
        )}

        {/* Gastspiel: 車管理（改善版 - チェックボックス方式） */}
        {!match.istHeimspiel && member.istAdmin && (
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Auswärtsspiel - Fahrgemeinschaften</h2>
            <p className="text-sm text-gray-600 mb-4">
              Wähle die Fahrer aus und gib an, wie viele Plätze sie anbieten können.
            </p>
            
            <div className="space-y-3 mb-6">
              {members.map(m => {
                const isDriver = selectedDrivers[m.id] !== undefined;
                const seats = selectedDrivers[m.id] || 4;
                
                return (
                  <div key={m.id} className="border-2 rounded-lg p-4 bg-white">
                    <div className="flex items-center gap-3">
                      {/* チェックボックス（大きめ） */}
                      <input
                        type="checkbox"
                        checked={isDriver}
                        onChange={() => toggleDriver(m.id)}
                        className="w-6 h-6 rounded cursor-pointer"
                        id={`driver-${m.id}`}
                      />
                      
                      {/* メンバー名 */}
                      <label htmlFor={`driver-${m.id}`} className="flex-1 font-medium cursor-pointer">
                        {m.vorname} {m.nachname}
                      </label>
                      
                      {/* 座席数入力（ドライバーの場合のみ表示） */}
                      {isDriver && (
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600 whitespace-nowrap">
                            Freie Plätze:
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateSeats(m.id, seats - 1)}
                              className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded font-bold"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              value={seats}
                              onChange={(e) => updateSeats(m.id, parseInt(e.target.value) || 0)}
                              className="w-16 text-center input-field py-2"
                              min="0"
                              max="7"
                            />
                            <button
                              type="button"
                              onClick={() => updateSeats(m.id, seats + 1)}
                              className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleSaveCarAssignments}
              disabled={isSubmitting || Object.keys(selectedDrivers).length === 0}
              className="btn-primary w-full"
            >
              {isSubmitting ? 'Wird gespeichert...' : 'Fahrerzuteilung speichern'}
            </button>

            {Object.keys(selectedDrivers).length === 0 && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Wähle mindestens einen Fahrer aus
              </p>
            )}
          </div>
        )}

        {/* Gastspiel: 運転手一覧（全ユーザー向け） */}
        {!match.istHeimspiel && !member.istAdmin && gastAutos.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🚗 Verfügbare Fahrer</h2>
            
            <div className="space-y-3">
              {gastAutos.map(auto => {
                const driver = members.find(m => m.id === auto.fahrerId);
                const isMyself = member.id === auto.fahrerId;
                
                return (
                  <div 
                    key={auto.id} 
                    className={`border-2 rounded-lg p-4 ${isMyself ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {driver ? `${driver.vorname} ${driver.nachname}` : 'Unbekannt'}
                          {isMyself && <span className="ml-2 text-sm text-blue-600">(Du)</span>}
                        </p>
                        <p className="text-sm text-gray-600">
                          {auto.freiePlaetze} {auto.freiePlaetze === 1 ? 'freier Platz' : 'freie Plätze'}
                        </p>
                      </div>
                      
                      {isMyself && (
                        <button
                          onClick={() => handleRemoveMyself(auto.id)}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium"
                        >
                          ❌ Austragen
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
