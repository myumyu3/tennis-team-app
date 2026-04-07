'use client';

// 認証状態を管理する React Context（マルチチーム対応版）

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Member, Team } from '@/types';
import { getSession, saveSession, logout as authLogout } from '@/lib/auth';

interface AuthContextType {
  member: Member | null;
  team: Team | null;
  loading: boolean;
  login: (member: Member, team: Team) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setMember(session.member);
      setTeam(session.team);
    }
    setLoading(false);
  }, []);

  const login = (newMember: Member, newTeam: Team) => {
    setMember(newMember);
    setTeam(newTeam);
    saveSession(newMember, newTeam);
  };

  const logout = () => {
    setMember(null);
    setTeam(null);
    authLogout();
  };

  return (
    <AuthContext.Provider value={{ member, team, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
