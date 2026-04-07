'use client';

// トップページ（チーム作成 or チーム参加の選択）

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { member, team, loading } = useAuth();

  // すでにログイン済みの場合は試合一覧にリダイレクト
  useEffect(() => {
    if (!loading && member && team) {
      router.push('/matches');
    }
  }, [member, team, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2">🎾</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Tennis Team Manager</h2>
          <p className="text-gray-600">Willkommen! Wie möchtest du starten?</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/team/create')}
            className="btn-primary w-full text-lg py-4"
          >
            ➕ Neues Team erstellen
          </button>

          <button
            onClick={() => router.push('/team/join')}
            className="btn-secondary w-full text-lg py-4"
          >
            👥 Vorhandenem Team beitreten
          </button>

          <button
            onClick={() => router.push('/login')}
            className="w-full text-primary-600 hover:text-primary-700 font-medium py-3 text-sm"
          >
            Bereits Mitglied? Hier anmelden →
          </button>
        </div>

        <div className="mt-12 card bg-blue-50 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">💡 Hinweis</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Erstelle ein Team und teile den Einladungscode</li>
            <li>• Oder trete einem bestehenden Team mit dem Code bei</li>
            <li>• Keine E-Mail erforderlich!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
