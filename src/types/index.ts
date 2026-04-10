// データモデルの型定義（マルチチーム対応版 - 改善版）

export interface Team {
  id: string;
  name: string;              // チーム名
  einladungscode: string;    // 6桁の招待コード
  createdAt: number;         // timestamp
}

export interface Member {
  id: string;
  teamId: string;            // 所属チームID
  uid?: string;              // Firebase Auth UID（移行期間はオプショナル）
  nachname: string;          // 苗字
  vorname: string;           // 名前
  geburtsdatum: string;      // TT.MM.JJJJ 形式
  istAdmin: boolean;         // 管理者フラグ
  aktiv: boolean;            // アクティブフラグ
}

export interface Match {
  id: string;
  teamId: string;
  datum: string;             // TT.MM.JJJJ
  uhrzeit?: string;          // HH:MM（オプショナル）
  gegner: string;            // 相手チーム名
  istHeimspiel: boolean;     // true=Heimspiel, false=Auswärtsspiel
  ort: string;               // 会場
}

export type TeilnahmeStatus = 
  | "verfuegbar"           // 出場可能
  | "nur_doppel"           // ダブルスのみ
  | "vielleicht"           // 未定
  | "nicht_verfuegbar";    // 不可能

export type SelectionStatus =
  | "none"                 // 未選抜
  | "nominiert"            // 選抜済み
  | "reserve";             // 控え

export interface Teilnahme {
  id: string;
  teamId: string;
  spielId: string;           // matchId
  mitgliedId: string;        // memberId
  status: TeilnahmeStatus;
  selectionStatus?: SelectionStatus;  // 選抜ステータス（管理者が設定）
  kommentar?: string;
  aktualisiertAm: number;    // timestamp
}

export interface HeimSpielAufgabe {
  id: string;
  teamId: string;
  spielId: string;
  gegenstand: string;        // 持ち物名
  zugewiesenAn: string | null;  // memberId
}

export interface GastSpielAuto {
  id: string;
  teamId: string;
  spielId: string;
  fahrerId: string;          // memberId
  freiePlaetze: number;      // 空席数
  notiz?: string;
}

// UI用の拡張型
export interface MatchWithTeilnahme extends Match {
  meineTeilnahme?: Teilnahme;
  totalVerfuegbar?: number;
  totalNurDoppel?: number;
  totalVielleicht?: number;
  totalNichtVerfuegbar?: number;
}

export interface TeilnahmeWithMember extends Teilnahme {
  member?: Member;
}

// ローカルストレージ用のセッションデータ
export interface SessionData {
  member: Member;
  team: Team;
}
