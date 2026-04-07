'use client';

// 試合一覧ページ（ログイン後ホーム）

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Match, Teilnahme, MatchWithTeilnahme } from '@/types';
import { parseGermanDate } from '@/lib/auth';

export default function MatchesPage() {
  const router = useRouter();
  const { member, team, logout, loading } = useAuth();
  const [matches, setMatches] = useState<MatchWithTeilnahme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 認証チェック
  useEffect(() => {
    if (!loading && (!member || !team)) {
      router.push('/');
    }
  }, [member, team, loading, router]);

  // 試合データの取得
  useEffect(() => {
    if (!member || !team) return;

    const fetchMatches = async () => {
      try {
        // 今日以降の試合を取得（日付順）
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const matchesRef = collection(db, 'matches');
        const q = query(
          matchesRef,
          where('teamId', '==', team.id)
        );
        
        const matchesSnapshot = await getDocs(q);
        let matchesData: Match[] = matchesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Match));

        // 日付でフィルタリングとソート（クライアント側）
        matchesData = matchesData
          .filter(match => {
            const matchDate = parseGermanDate(match.datum);
            return matchDate && matchDate >= today;
          })
          .sort((a, b) => {
            const dateA = parseGermanDate(a.datum);
            const dateB = parseGermanDate(b.datum);
            if (!dateA || !dateB) return 0;
            return dateA.getTime() - dateB.getTime();
          });

        // 各試合に対する自分の回答を取得
        const matchesWithTeilnahme: MatchWithTeilnahme[] = await Promise.all(
          matchesData.map(async (match) => {
            const teilnahmenRef = collection(db, 'teilnahmen');
            const teilnahmeQuery = query(
              teilnahmenRef,
              where('teamId', '==', team.id),
              where('spielId', '==', match.id),
              where('mitgliedId', '==', member.id)
            );
            const teilnahmeSnapshot = await getDocs(teilnahmeQuery);
            
            const meineTeilnahme = teilnahmeSnapshot.empty 
              ? undefined 
              : { id: teilnahmeSnapshot.docs[0].id, ...teilnahmeSnapshot.docs[0].data() } as Teilnahme;

            return {
              ...match,
              meineTeilnahme
            };
          })
        );

        setMatches(matchesWithTeilnahme);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [member, team]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'verfuegbar':
        return '✓';
      case 'nur_doppel':
        return 'D';
      case 'vielleicht':
        return '?';
      case 'nicht_verfuegbar':
        return '✗';
      default:
        return '−';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'verfuegbar':
        return 'bg-green-100 text-green-800';
      case 'nur_doppel':
        return 'bg-blue-100 text-blue-800';
      case 'vielleicht':
        return 'bg-yellow-100 text-yellow-800';
      case 'nicht_verfuegbar':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'verfuegbar':
        return 'Dabei';
      case 'nur_doppel':
        return 'Nur Doppel';
      case 'vielleicht':
        return 'Vielleicht';
      case 'nicht_verfuegbar':
        return 'Abwesend';
      default:
        return 'Keine Antwort';
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
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🎾 Meine Spiele</h1>
              <p className="text-sm text-gray-600 mt-1">
                {team.name}
              </p>
              <p className="text-xs text-gray-500">
                {member.vorname} {member.nachname}
                {member.istAdmin && <span className="ml-2 text-primary-600 font-semibold">(Teamleiter)</span>}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      {/* メイン */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Spiele werden geladen...</div>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Keine anstehenden Spiele</div>
            {member.istAdmin && (
              <p className="mt-2 text-sm text-gray-500">
                Klicke auf "Spiele verwalten", um ein neues Spiel zu erstellen.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                onClick={() => router.push(`/matches/${match.id}`)}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
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
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{match.datum}</span>
                        <span className="font-medium">{match.uhrzeit} Uhr</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{match.ort}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className={`status-badge ${getStatusColor(match.meineTeilnahme?.status)}`}>
                      <span className="text-lg font-bold mr-1">
                        {getStatusIcon(match.meineTeilnahme?.status)}
                      </span>
                      <span className="text-xs">
                        {getStatusText(match.meineTeilnahme?.status)}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Zum Bearbeiten tippen
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 管理者用のナビゲーションボタン */}
        {member.istAdmin && (
          <div className="mt-8 space-y-3">
            <button
              onClick={() => router.push('/members')}
              className="btn-secondary w-full"
            >
              👥 Mitglieder verwalten
            </button>
            <button
              onClick={() => router.push('/matches/manage')}
              className="btn-primary w-full"
            >
              ⚙️ Spiele verwalten
            </button>
            <div className="card bg-blue-50 border-blue-200">
              <div className="text-sm text-blue-900">
                <strong>Einladungscode:</strong> <span className="font-mono text-lg ml-2">{team.einladungscode}</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Teile diesen Code mit neuen Mitgliedern
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
