'use client';

// チーム設定・削除ページ（管理者専用）- デバッグ版

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SettingsPage() {
  const router = useRouter();
  const { member, team, loading, logout } = useAuth();
  const [memberCount, setMemberCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmTeamName, setConfirmTeamName] = useState('');

  // 認証チェック
  useEffect(() => {
    console.log('🔍 Settings Page - Auth状態:', { member, team, loading });
    if (!loading && (!member || !team || !member.istAdmin)) {
      console.log('❌ アクセス拒否 - リダイレクト');
      alert('Zugriff verweigert. Nur Teamleiter können auf diese Seite zugreifen.');
      router.push('/matches');
    }
  }, [member, team, loading, router]);

  // メンバー数を取得
  useEffect(() => {
    if (!team) return;

    const fetchMemberCount = async () => {
      try {
        const membersSnapshot = await getDocs(query(
          collection(db, 'members'),
          where('teamId', '==', team.id)
        ));
        setMemberCount(membersSnapshot.size);
        console.log('📊 メンバー数:', membersSnapshot.size);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };

    fetchMemberCount();
  }, [team]);

  // チーム削除処理（確認スキップ版：順次削除 + デバッグログ）
  const handleDeleteTeam = async () => {
    console.log('🔍🔍🔍 削除ボタンがクリックされました！');
    console.log('🔍 team:', team);
    console.log('🔍 member:', member);
    console.log('🔍 confirmTeamName:', `"${confirmTeamName}"`);
    console.log('🔍 team.name:', team ? `"${team.name}"` : 'null');
    
    if (!team || !member) {
      console.log('❌ team または member が null です');
      return;
    }

    // チーム名確認
    console.log('🔍 チーム名チェック開始...');
    console.log('   入力値:', `"${confirmTeamName}"`);
    console.log('   期待値:', `"${team.name}"`);
    console.log('   入力値の長さ:', confirmTeamName.length);
    console.log('   期待値の長さ:', team.name.length);
    console.log('   一致？:', confirmTeamName === team.name);
    
    if (confirmTeamName !== team.name) {
      console.log('❌ チーム名が一致しません！');
      alert('Teamname stimmt nicht überein. Bitte gib den genauen Teamnamen ein.');
      return;
    }
    
    console.log('✅ チーム名が一致しました！');
    console.log('✅ 確認スキップ - 削除開始');
    
    setIsDeleting(true);

    try {
      console.log('🗑️ Starte Team-Löschung...');

      // 1. Gastspiel Autos löschen
      setDeleteProgress('Lösche Fahrgemeinschaften... (1/5)');
      console.log('🗑️ [1/5] Lösche Fahrgemeinschaften...');
      const autosQuery = query(collection(db, 'gast_spiel_autos'), where('teamId', '==', team.id));
      const autosSnapshot = await getDocs(autosQuery);
      console.log(`   Gefunden: ${autosSnapshot.size} Dokumente`);
      for (const docSnapshot of autosSnapshot.docs) {
        await deleteDoc(docSnapshot.ref);
      }
      console.log('   ✅ Fahrgemeinschaften gelöscht');

      // 2. Heimspiel Aufgaben löschen
      setDeleteProgress('Lösche Heimspiel-Aufgaben... (2/5)');
      console.log('🗑️ [2/5] Lösche Heimspiel-Aufgaben...');
      const aufgabenQuery = query(collection(db, 'heim_spiel_aufgaben'), where('teamId', '==', team.id));
      const aufgabenSnapshot = await getDocs(aufgabenQuery);
      console.log(`   Gefunden: ${aufgabenSnapshot.size} Dokumente`);
      for (const docSnapshot of aufgabenSnapshot.docs) {
        await deleteDoc(docSnapshot.ref);
      }
      console.log('   ✅ Heimspiel-Aufgaben gelöscht');

      // 3. Teilnahmen löschen
      setDeleteProgress('Lösche Zusagen... (3/5)');
      console.log('🗑️ [3/5] Lösche Zusagen...');
      const teilnahmenQuery = query(collection(db, 'teilnahmen'), where('teamId', '==', team.id));
      const teilnahmenSnapshot = await getDocs(teilnahmenQuery);
      console.log(`   Gefunden: ${teilnahmenSnapshot.size} Dokumente`);
      for (const docSnapshot of teilnahmenSnapshot.docs) {
        await deleteDoc(docSnapshot.ref);
      }
      console.log('   ✅ Zusagen gelöscht');

      // 4. Matches löschen
      setDeleteProgress('Lösche Spiele... (4/5)');
      console.log('🗑️ [4/5] Lösche Spiele...');
      const matchesQuery = query(collection(db, 'matches'), where('teamId', '==', team.id));
      const matchesSnapshot = await getDocs(matchesQuery);
      console.log(`   Gefunden: ${matchesSnapshot.size} Dokumente`);
      for (const docSnapshot of matchesSnapshot.docs) {
        await deleteDoc(docSnapshot.ref);
      }
      console.log('   ✅ Spiele gelöscht');

      // 5. Team löschen
      setDeleteProgress('Lösche Team... (5/5)');
      console.log('🗑️ [5/5] Lösche Team...');
      await deleteDoc(doc(db, 'teams', team.id));
      console.log('   ✅ Team gelöscht');

      console.log('✅✅✅ ALLE DATEN ERFOLGREICH GELÖSCHT! ✅✅✅');

      // 7. 成功したら、ローカルストレージをクリアしてログアウト
      setDeleteProgress('Erfolgreich! Leite weiter...');
      console.log('🔓 ログアウト実行...');
      logout();

      alert(
        `✅ Erfolgreich gelöscht!\n\n` +
        `Team "${team.name}" und die zugehörigen Teamdaten wurden entfernt.\n` +
        `Mitgliederkonten wurden nicht gelöscht.`
      );

      // 8. トップページへリダイレクト
      console.log('🏠 トップページへリダイレクト...');
      router.push('/');
    } catch (error) {
      console.error('❌❌❌ FEHLER BEIM LÖSCHEN ❌❌❌');
      console.error('Fehlerdetails:', error);
      
      setDeleteProgress('');
      
      alert(
        `❌ Fehler beim Löschen des Teams!\n\n` +
        `Einige Daten wurden möglicherweise nicht gelöscht.\n` +
        `Bitte überprüfe die Browser-Konsole für Details.\n\n` +
        `Du bleibst angemeldet und kannst es erneut versuchen.`
      );
      
      setIsDeleting(false);
    }
  };

  if (loading || !member || !team) {
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
            onClick={() => router.push('/members')}
            className="text-primary-600 hover:text-primary-700 font-medium mb-2"
          >
            ← Zurück zu Mitglieder
          </button>
          <h1 className="text-2xl font-bold text-gray-900">⚙️ Team-Einstellungen</h1>
          <p className="text-sm text-gray-600 mt-1">Nur für Teamleiter</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Team-Informationen */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Team-Informationen</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">Teamname:</span>
              <span className="font-semibold text-gray-900">{team.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">Einladungscode:</span>
              <span className="font-mono font-bold text-primary-600 text-lg">{team.einladungscode}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">Mitglieder:</span>
              <span className="font-semibold text-gray-900">{memberCount}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Erstellt am:</span>
              <span className="font-semibold text-gray-900">
                {new Date(team.createdAt).toLocaleDateString('de-DE')}
              </span>
            </div>
          </div>
        </div>

        {/* Gefahrenzone: Team löschen */}
        <div className="card border-2 border-red-200 bg-red-50">
          <h2 className="text-lg font-bold text-red-900 mb-2">⚠️ Gefahrenzone</h2>
          <p className="text-sm text-red-800 mb-4">
            Dieser Bereich enthält irreversible Aktionen. Sei vorsichtig!
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => {
                console.log('🔍 "Team löschen" ボタンがクリックされました');
                setShowDeleteConfirm(true);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Team löschen
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-red-300">
                <h3 className="font-bold text-red-900 mb-3">Team wirklich löschen?</h3>
                <p className="text-sm text-red-800 mb-3">
                  Diese Aktion löscht <strong>unwiderruflich</strong>:
                </p>
                <ul className="text-sm text-red-800 space-y-1 mb-4 list-disc list-inside">
                  <li>Alle Spiele und Zusagen</li>
                  <li>Alle Heimspiel-Aufgaben</li>
                  <li>Alle Fahrgemeinschaften</li>
                  <li>Das gesamte Team "{team.name}"</li>
                </ul>
                <p className="text-sm font-bold text-red-900 mb-3">
                  Gib den Teamnamen zur Bestätigung ein:
                </p>
                <input
                  type="text"
                  value={confirmTeamName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setConfirmTeamName(value);
                    console.log('🔍 入力値変更:', `"${value}"`);
                    console.log('🔍 チーム名:', `"${team.name}"`);
                    console.log('🔍 一致？:', value === team.name);
                    console.log('🔍 入力値の長さ:', value.length);
                    console.log('🔍 チーム名の長さ:', team.name.length);
                  }}
                  placeholder={team.name}
                  className="input-field mb-3"
                  disabled={isDeleting}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    console.log('🔍 "Abbrechen" がクリックされました');
                    setShowDeleteConfirm(false);
                    setConfirmTeamName('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  disabled={isDeleting}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDeleteTeam}
                  disabled={confirmTeamName !== team.name || isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeleting ? (deleteProgress || 'Wird gelöscht...') : 'Endgültig löschen'}
                </button>
              </div>

              {/* デバッグ情報表示 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs">
                <p className="font-bold mb-1">🔍 Debug Info:</p>
                <p>入力値: "{confirmTeamName}" (長さ: {confirmTeamName.length})</p>
                <p>チーム名: "{team.name}" (長さ: {team.name.length})</p>
                <p>一致: {confirmTeamName === team.name ? '✅ はい' : '❌ いいえ'}</p>
                <p>ボタン有効: {confirmTeamName === team.name && !isDeleting ? '✅ はい' : '❌ いいえ'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Hinweise */}
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">💡 Hinweise</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Der Einladungscode kann mit anderen geteilt werden</li>
            <li>• Nur Teamleiter können Einstellungen ändern</li>
            <li>• Team-Löschung ist unwiderruflich - Teamdaten gehen verloren</li>
            <li>• Mitgliederkonten bleiben erhalten</li>
            <li>• Bei versehentlicher Löschung gibt es keine Wiederherstellung</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
