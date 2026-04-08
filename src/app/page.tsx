'use client';

// トップページ（チーム作成 or チーム参加の選択）

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

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
    <div className="min-h-screen flex flex-col">
      {/* ヒーローセクション - 背景画像 */}
      <div className="relative h-[400px] md:h-[500px] w-full">
        <Image
          src="/images/tennisclub.jpg"
          alt="Tennis Court"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">🎾</h1>
            <h2 className="text-4xl md:text-5xl font-bold mb-3">Tennis Team Manager</h2>
            <p className="text-xl md:text-2xl">Willkommen! Wie möchtest du starten?</p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="w-full max-w-md">
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

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-3">
            <button
              onClick={() => router.push('/anleitung')}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              📖 Anleitung
            </button>
          </div>
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
