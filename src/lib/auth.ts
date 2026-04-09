// 認証関連のユーティリティ関数（マルチチーム対応版 - 改善版）

import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Member, Team, SessionData } from '@/types';

/**
 * 6桁の招待コードを生成
 */
export function generateEinladungscode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * チームを作成
 */
export async function createTeam(
  teamName: string,
  adminNachname: string,
  adminVorname: string,
  adminGeburtsdatum: string
): Promise<{ team: Team; member: Member } | null> {
  try {
    // 招待コード生成（重複チェック付き）
    let einladungscode = generateEinladungscode();
    let isDuplicate = true;
    
    while (isDuplicate) {
      const teamsRef = collection(db, 'teams');
      const q = query(teamsRef, where('einladungscode', '==', einladungscode));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        isDuplicate = false;
      } else {
        einladungscode = generateEinladungscode();
      }
    }
    
    // チーム作成
    const teamRef = await addDoc(collection(db, 'teams'), {
      name: teamName,
      einladungscode,
      createdAt: Date.now()
    });
    
    const team: Team = {
      id: teamRef.id,
      name: teamName,
      einladungscode,
      createdAt: Date.now()
    };
    
    // 管理者メンバーを作成
    const memberRef = await addDoc(collection(db, 'members'), {
      teamId: teamRef.id,
      nachname: adminNachname,
      vorname: adminVorname,
      geburtsdatum: adminGeburtsdatum,
      istAdmin: true,
      aktiv: true
    });
    
    const member: Member = {
      id: memberRef.id,
      teamId: teamRef.id,
      nachname: adminNachname,
      vorname: adminVorname,
      geburtsdatum: adminGeburtsdatum,
      istAdmin: true,
      aktiv: true
    };
    
    return { team, member };
  } catch (error) {
    console.error('Team creation error:', error);
    return null;
  }
}

/**
 * チームに参加
 */
export async function joinTeam(
  einladungscode: string,
  nachname: string,
  vorname: string,
  geburtsdatum: string
): Promise<{ team: Team; member: Member } | null> {
  try {
    // 招待コードでチーム検索
    const teamsRef = collection(db, 'teams');
    const teamQuery = query(teamsRef, where('einladungscode', '==', einladungscode.toUpperCase()));
    const teamSnapshot = await getDocs(teamQuery);
    
    if (teamSnapshot.empty) {
      return null;
    }
    
    const teamDoc = teamSnapshot.docs[0];
    const team: Team = {
      id: teamDoc.id,
      ...teamDoc.data()
    } as Team;
    
    // 既に同じ人が同じチームに存在するかチェック
    const membersRef = collection(db, 'members');
    const memberQuery = query(
      membersRef,
      where('teamId', '==', team.id),
      where('nachname', '==', nachname),
      where('geburtsdatum', '==', geburtsdatum)
    );
    const existingMember = await getDocs(memberQuery);
    
    if (!existingMember.empty) {
      // 既存メンバーとしてログイン
      const memberDoc = existingMember.docs[0];
      const member: Member = {
        id: memberDoc.id,
        ...memberDoc.data()
      } as Member;
      return { team, member };
    }
    
    // 新規メンバーとして追加
    const memberRef = await addDoc(collection(db, 'members'), {
      teamId: team.id,
      nachname,
      vorname,
      geburtsdatum,
      istAdmin: false,
      aktiv: true
    });
    
    const member: Member = {
      id: memberRef.id,
      teamId: team.id,
      nachname,
      vorname,
      geburtsdatum,
      istAdmin: false,
      aktiv: true
    };
    
    return { team, member };
  } catch (error) {
    console.error('Join team error:', error);
    return null;
  }
}

/**
 * ログイン（チーム選択あり）
 */
export async function login(
  nachname: string,
  geburtsdatum: string,
  teamId?: string
): Promise<{ teams: Team[]; member?: Member; team?: Team } | null> {
  try {
    // 該当するメンバーを検索
    const membersRef = collection(db, 'members');
    const q = query(
      membersRef,
      where('nachname', '==', nachname),
      where('geburtsdatum', '==', geburtsdatum),
      where('aktiv', '==', true)
    );
    
    const memberSnapshot = await getDocs(q);
    
    if (memberSnapshot.empty) {
      return null;
    }
    
    const members = memberSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Member));
    
    // 各メンバーのチーム情報を取得
    const teams: Team[] = [];
    for (const member of members) {
      const teamDoc = await getDoc(doc(db, 'teams', member.teamId));
      if (teamDoc.exists()) {
        teams.push({
          id: teamDoc.id,
          ...teamDoc.data()
        } as Team);
      }
    }
    
    // teamId が指定されている場合は、そのチームのメンバーを返す
    if (teamId) {
      const selectedMember = members.find(m => m.teamId === teamId);
      const selectedTeam = teams.find(t => t.id === teamId);
      
      if (selectedMember && selectedTeam) {
        return {
          teams,
          member: selectedMember,
          team: selectedTeam
        };
      }
    }
    
    // teamId が指定されていない、または複数チーム所属の場合
    if (teams.length === 1) {
      // 1チームのみ所属の場合は自動選択
      return {
        teams,
        member: members[0],
        team: teams[0]
      };
    }
    
    // 複数チーム所属の場合はチーム選択画面へ
    return { teams };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

/**
 * ローカルストレージにセッション情報を保存
 */
export function saveSession(member: Member, team: Team): void {
  if (typeof window !== 'undefined') {
    const sessionData: SessionData = { member, team };
    localStorage.setItem('tennisSession', JSON.stringify(sessionData));
  }
}

/**
 * ローカルストレージからセッション情報を取得
 */
export function getSession(): SessionData | null {
  if (typeof window !== 'undefined') {
    const sessionStr = localStorage.getItem('tennisSession');
    if (sessionStr) {
      try {
        return JSON.parse(sessionStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * ログアウト処理（セッション削除）
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tennisSession');
    // 自動ログイン情報も削除
    localStorage.removeItem('tennisRememberNachname');
    localStorage.removeItem('tennisRememberGeburtsdatum');
  }
}

/**
 * Date を TT.MM.JJJJ 形式に変換
 */
export function formatDateGerman(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * TT.MM.JJJJ 形式の日付を Date オブジェクトに変換
 */
export function parseGermanDate(dateStr: string): Date | null {
  const parts = dateStr.split('.');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 月は0始まり
  const year = parseInt(parts[2], 10);
  
  return new Date(year, month, day);
}

/**
 * YYYY-MM-DD 形式を TT.MM.JJJJ 形式に変換
 * より堅牢なバージョン
 */
export function convertIsoToGerman(isoDate: string): string {
  if (!isoDate || typeof isoDate !== 'string') {
    console.error('Invalid date input:', isoDate);
    return '';
  }

  // トリムして余分な空白を削除
  isoDate = isoDate.trim();

  // 既にドイツ形式（DD.MM.YYYY）の場合はそのまま返す
  if (isoDate.includes('.')) {
    const parts = isoDate.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      // 月と日が2桁になるようにパディング
      const paddedMonth = month.padStart(2, '0');
      const paddedDay = day.padStart(2, '0');
      return `${paddedDay}.${paddedMonth}.${year}`;
    }
  }

  // YYYY-MM-DD 形式かチェック
  const parts = isoDate.split('-');
  if (parts.length !== 3) {
    console.error('Invalid date format:', isoDate);
    return '';
  }

  const [year, month, day] = parts;
  
  // 各部分が有効かチェック
  if (!year || !month || !day) {
    console.error('Missing date parts:', { year, month, day });
    return '';
  }

  // 月と日が2桁になるようにパディング
  const paddedMonth = month.padStart(2, '0');
  const paddedDay = day.padStart(2, '0');

  return `${paddedDay}.${paddedMonth}.${year}`;
}

/**
 * TT.MM.JJJJ 形式を YYYY-MM-DD 形式に変換
 */
export function convertGermanToIso(germanDate: string): string {
  const parts = germanDate.split('.');
  if (parts.length !== 3) return '';
  
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
