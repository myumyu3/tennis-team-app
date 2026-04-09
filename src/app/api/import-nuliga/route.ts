// nuLigaからの試合情報インポート API Route

import { NextRequest, NextResponse } from 'next/server';

interface Match {
  date: string;        // DD.MM.YYYY
  time: string;        // HH:MM または空文字
  homeTeam: string;
  awayTeam: string;
  isHomeGame: boolean; // 自チームがホームか
}

export async function POST(request: NextRequest) {
  try {
    const { url: inputUrl } = await request.json();

    if (!inputUrl) {
      return NextResponse.json(
        { error: 'Bitte gib eine URL ein' },
        { status: 400 }
      );
    }

    // URLを正規化（プロトコルが欠けている場合は自動補完）
    let url = inputUrl.trim();
    
    // プロトコルがない場合は追加
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // liga.nuドメインの場合はhttpsを追加
      if (url.includes('liga.nu')) {
        url = 'https://' + url;
      } else {
        return NextResponse.json(
          { error: 'Ungültige URL. Bitte kopiere die vollständige URL von nuLiga (z.B. https://wtv.liga.nu/...)' },
          { status: 400 }
        );
      }
    }

    // nuLigaのURLかチェック
    if (!url.includes('liga.nu')) {
      return NextResponse.json(
        { error: 'Bitte gib eine gültige nuLiga URL ein (wtv.liga.nu, tnb.liga.nu, htv.liga.nu, etc.)' },
        { status: 400 }
      );
    }

    // nuLigaページを取得（ブラウザのように振る舞う）
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Fehler beim Abrufen der nuLiga-Seite (Status: ${response.status})` },
        { status: 500 }
      );
    }

    const html = await response.text();

    // チーム名を抽出（複数の方法を試す）
    let teamName = '';
    let fullTeamName = '';
    
    // 方法1: h1タグから
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    if (h1Match) {
      fullTeamName = h1Match[1].trim();
      teamName = fullTeamName.split('(')[0].trim();
    }
    
    // 方法2: ページ内の見出し構造から（# で始まる行）
    if (!teamName) {
      const headingMatch = html.match(/^#\s+(.+)$/m);
      if (headingMatch) {
        fullTeamName = headingMatch[1].trim();
        teamName = fullTeamName.split('(')[0].trim();
      }
    }
    
    // 方法3: Vereinセクションのリンクから
    if (!teamName) {
      const vereinMatch = html.match(/<strong>Verein<\/strong>[\s\S]*?>\s*([^<(]+)/);
      if (vereinMatch) {
        teamName = vereinMatch[1].trim();
      }
    }
    
    // 方法4: Mannschaftセクションから
    if (!teamName) {
      const mannschaftMatch = html.match(/<strong>Mannschaft<\/strong>[\s\S]*?>\s*([^<]+)</);
      if (mannschaftMatch) {
        teamName = mannschaftMatch[1].trim();
      }
    }
    
    if (!teamName) {
      // デバッグ: タイトルタグも試す
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      const debugInfo = titleMatch ? `Titel: ${titleMatch[1]}` : 'Kein Titel';
      
      // h1タグの有無を確認
      const h1Count = (html.match(/<h1/g) || []).length;
      
      // Vereinセクションの有無を確認
      const vereinExists = html.includes('<strong>Verein</strong>');
      
      // Mannschaftセクションの有無を確認
      const mannschaftExists = html.includes('<strong>Mannschaft</strong>');
      
      // HTMLの長さ
      const htmlLength = html.length;
      
      const debugDetails = `
        ${debugInfo} | 
        HTML-Länge: ${htmlLength} Zeichen | 
        H1-Tags gefunden: ${h1Count} | 
        Verein-Sektion: ${vereinExists ? 'Ja' : 'Nein'} | 
        Mannschaft-Sektion: ${mannschaftExists ? 'Ja' : 'Nein'}
      `.trim();
      
      return NextResponse.json(
        { error: `Teamname konnte nicht gefunden werden. Debug: ${debugDetails}` },
        { status: 400 }
      );
    }
    
    // fullTeamNameが設定されていない場合はteamNameを使用
    if (!fullTeamName) {
      fullTeamName = teamName;
    }
    
    // チーム名の部分一致を柔軟に判定する関数
    const isMyTeam = (teamInTable: string): boolean => {
      const normalizedTable = teamInTable.toLowerCase().trim();
      const normalizedMyTeam = teamName.toLowerCase().trim();
      
      // 完全一致
      if (normalizedTable === normalizedMyTeam) return true;
      
      // 自チーム名が試合テーブルのチーム名に含まれる（例: "TC Bad Vilbel" が "TC Bad Vilbel 1" に含まれる）
      if (normalizedTable.includes(normalizedMyTeam)) return true;
      
      // 試合テーブルのチーム名が自チーム名で始まる（例: "TC Bad Vilbel 1" が "TC Bad Vilbel" で始まる）
      if (normalizedTable.startsWith(normalizedMyTeam)) return true;
      
      // 最初の2単語が一致（例: "TC Bad Vilbel" と "TC Bad Vilbel 1"）
      const myTeamWords = normalizedMyTeam.split(' ').slice(0, 2).join(' ');
      const tableWords = normalizedTable.split(' ').slice(0, 2).join(' ');
      if (myTeamWords && tableWords && myTeamWords === tableWords) return true;
      
      return false;
    };

    // クラブ住所を抽出（ホームゲーム用）
    let clubAddress = '';
    const addressMatch = html.match(/<strong>Verein<\/strong>[\s\S]*?<\/a>\s+([^<]+)</);
    if (addressMatch) {
      clubAddress = addressMatch[1].trim();
    }

    // 試合テーブルを抽出
    const matches: Match[] = [];
    
    // テーブルセクションを探す
    const tableMatch = html.match(/Spieltermine[\s\S]*?<table[\s\S]*?>([\s\S]*?)<\/table>/);
    if (!tableMatch) {
      return NextResponse.json(
        { error: 'Keine Spieltabelle gefunden' },
        { status: 400 }
      );
    }

    const tableContent = tableMatch[1];
    const rows = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g) || [];

    for (const row of rows) {
      // 日付と時間を抽出
      const dateTimeMatch = row.match(/(\d{2}\.\d{2}\.\d{4})(?:\s+(\d{2}:\d{2}))?/);
      if (!dateTimeMatch) continue;

      const date = dateTimeMatch[1];
      const time = dateTimeMatch[2] || '';

      // チーム名を含むセルを抽出（リンクタグから）
      const teamLinks = row.match(/<a[^>]*teamPortrait[^>]*>([^<]+)<\/a>/g);
      
      if (!teamLinks || teamLinks.length < 2) {
        // リンクがない場合は通常のテキストを探す
        const cells = row.match(/<td[^>]*>([^<]+(?:<[^>]+>[^<]+<\/[^>]+>)?[^<]*)<\/td>/g);
        if (!cells) continue;
        
        // チーム名と思われるセルを抽出
        const teamCells = cells.filter(cell => {
          const text = cell.replace(/<[^>]+>/g, '').trim();
          return text.length > 3 && 
                 !text.match(/^\d/) && 
                 !text.match(/^[A-Z]{1,3}$/) &&
                 !text.includes('&') &&
                 text !== 'offen' &&
                 text !== 'anzeigen';
        });
        
        if (teamCells.length < 2) continue;
        
        const homeTeam = teamCells[0].replace(/<[^>]+>/g, '').trim();
        const awayTeam = teamCells[1].replace(/<[^>]+>/g, '').trim();
        
        const isHomeGame = isMyTeam(homeTeam);
        
        matches.push({ date, time, homeTeam, awayTeam, isHomeGame });
        continue;
      }

      // リンクからチーム名を抽出
      const extractTeamFromLink = (link: string): string => {
        const match = link.match(/>([^<]+)</);
        return match ? match[1].trim() : '';
      };

      const homeTeam = extractTeamFromLink(teamLinks[0]);
      const awayTeam = extractTeamFromLink(teamLinks[1]);

      if (!homeTeam || !awayTeam) continue;

      // 自チームがホームかどうか判定
      const isHomeGame = isMyTeam(homeTeam);

      matches.push({ date, time, homeTeam, awayTeam, isHomeGame });
    }

    // 重複削除（同じ日付・同じチームの試合）
    const uniqueMatches = matches.filter((match, index, self) =>
      index === self.findIndex(m => 
        m.date === match.date && 
        m.homeTeam === match.homeTeam && 
        m.awayTeam === match.awayTeam
      )
    );

    return NextResponse.json({
      teamName,
      clubAddress,
      matches: uniqueMatches
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Importieren der Daten' },
      { status: 500 }
    );
  }
}
