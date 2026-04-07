// データモデルの型定義（Firebase Anonymous Auth対応版）

export interface Team {
  id: string;
  name: string;
  einladungscode: string;
  createdAt: number;
}

export interface Member {
  id: string;
  uid?: string;              // Firebase Auth UID（既存データとの互換性のためオプショナル）
  teamId: string;
  nachname: string;
  vorname: string;
  geburtsdatum: string;      // TT.MM.JJJJ 形式
  istAdmin: boolean;
  aktiv: boolean;
}

export interface Match {
  id: string;
  teamId: string;
  datum: string;             // TT.MM.JJJJ
  uhrzeit?: string;          // HH:MM（オプショナル）
  gegner: string;
  istHeimspiel: boolean;
  ort: string;
}

export type TeilnahmeStatus = 
  | "verfuegbar"
  | "nur_doppel"
  | "vielleicht"
  | "nicht_verfuegbar";

export interface Teilnahme {
  id: string;
  teamId: string;
  spielId: string;
  mitgliedId: string;
  status: TeilnahmeStatus;
  kommentar?: string;
  aktualisiertAm: number;
}

export interface HeimSpielAufgabe {
  id: string;
  teamId: string;
  spielId: string;
  gegenstand: string;
  zugewiesenAn: string | null;
}

export interface GastSpielAuto {
  id: string;
  teamId: string;
  spielId: string;
  fahrerId: string;
  freiePlaetze: number;
  notiz?: string;
}

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

export interface SessionData {
  member: Member;
  team: Team;
}
