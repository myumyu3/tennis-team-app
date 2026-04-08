'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Member } from '@/types';
import { convertIsoToGerman } from '@/lib/auth';

export default function MembersPage() {
  const router = useRouter();
  const { member, team, loading } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    nachname: '',
    vorname: '',
    geburtsdatumIso: '',
    istAdmin: false,
    aktiv: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!member || !team || !member.istAdmin)) {
      alert('Zugriff verweigert. Nur Teamleiter können Mitglieder verwalten.');
      router.push('/matches');
    }
  }, [member, team, loading, router]);

  useEffect(() => {
    if (!member?.istAdmin || !team) return;

    const fetchMembers = async () => {
      try {
        const membersSnapshot = await getDocs(query(
          collection(db, 'members'),
          where('teamId', '==', team.id)
        ));
        const membersData = membersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Member));
        setMembers(membersData.sort((a, b) => a.nachname.localeCompare(b.nachname)));
      } catch (error) {
        console.error('Error fetching members:', error);
        alert('Fehler beim Laden der Mitglieder');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [member, team]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    
    setIsSubmitting(true);

    try {
      const germanDate = convertIsoToGerman(formData.geburtsdatumIso);
      
      const q = query(
        collection(db, 'members'),
        where('teamId', '==', team.id),
        where('nachname', '==', formData.nachname),
        where('geburtsdatum', '==', germanDate)
      );
      const existingMembers = await getDocs(q);
      
      if (!existingMembers.empty) {
        alert('Ein Mitglied mit diesem Namen und Geburtsdatum existiert bereits in diesem Team!');
        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'members'), {
        teamId: team.id,
        nachname: formData.nachname,
        vorname: formData.vorname,
        geburtsdatum: germanDate,
        istAdmin: formData.istAdmin,
        aktiv: formData.aktiv
      });
      
      alert('Mitglied erfolgreich hinzugefügt!');
      setFormData({
        nachname: '',
        vorname: '',
        geburtsdatumIso: '',
        istAdmin: false,
        aktiv: true
      });
      setShowAddForm(false);
      window.location.reload();
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Fehler beim Hinzufügen des Mitglieds');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMemberActive = async (memberId: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, 'members', memberId), { aktiv: !currentActive });
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, aktiv: !currentActive } : m));
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Fehler beim Aktualisieren');
    }
  };

  const toggleAdmin = async (memberId: string, currentAdmin: boolean) => {
    if (currentAdmin) {
      alert('Du kannst die Teamleiter-Rechte nicht entziehen.');
      return;
    }

    if (!confirm('Möchtest du dieses Mitglied wirklich zum Teamleiter machen? Deine eigenen Rechte werden dabei entzogen.')) {
      return;
    }

    try {
      await updateDoc(doc(db, 'members', member!.id), { istAdmin: false });
      await updateDoc(doc(db, 'members', memberId), { istAdmin: true });
      
      alert('Teamleiter-Rechte wurden übertragen. Du wirst abgemeldet.');
      router.push('/');
    } catch (error) {
      console.error('Error updating admin:', error);
      alert('Fehler beim Übertragen der Rechte');
    }
  };

  if (loading || isLoading || !member || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header 
        className="shadow-sm sticky top-0 z-10 relative"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(/images/tennisclub3.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button onClick={() => router.push('/matches')} className="text-white/90 hover:text-white font-medium mb-3 bg-black/20 hover:bg-black/30 px-3 py-1 rounded backdrop-blur-sm transition-all inline-block">
            ← Zurück zur Übersicht
          </button>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">👥 Mitgliederverwaltung</h1>
          <p className="text-sm text-white mt-2 font-medium drop-shadow-md">{team.name}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary w-full">
            {showAddForm ? '− Abbrechen' : '+ Neues Mitglied hinzufügen'}
          </button>
        </div>

        {showAddForm && (
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Neues Mitglied</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vorname *</label>
                <input type="text" value={formData.vorname} onChange={(e) => setFormData({ ...formData, vorname: e.target.value })} className="input-field" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nachname *</label>
                <input type="text" value={formData.nachname} onChange={(e) => setFormData({ ...formData, nachname: e.target.value })} className="input-field" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Geburtsdatum *</label>
                <input
                  type="date"
                  value={formData.geburtsdatumIso}
                  onChange={(e) => setFormData({ ...formData, geburtsdatumIso: e.target.value })}
                  className="input-field"
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">Wird als Login-Passwort verwendet</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="aktiv"
                  checked={formData.aktiv}
                  onChange={(e) => setFormData({ ...formData, aktiv: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="aktiv" className="font-medium">Aktives Mitglied</label>
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Wird hinzugefügt...' : 'Mitglied hinzufügen'}
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Alle Mitglieder ({members.length})</h2>
          <div className="space-y-3">
            {members.map(m => (
              <div key={m.id} className={`p-4 rounded-lg border-2 ${m.aktiv ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-300 opacity-60'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{m.vorname} {m.nachname}</h3>
                      {m.istAdmin && <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded">Teamleiter</span>}
                      {!m.aktiv && <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded">Inaktiv</span>}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Geb.: {m.geburtsdatum}</div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {m.id !== member.id && (
                      <>
                        <button
                          onClick={() => toggleMemberActive(m.id, m.aktiv)}
                          className={`text-sm px-3 py-1 rounded font-medium ${m.aktiv ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        >
                          {m.aktiv ? 'Deaktivieren' : 'Aktivieren'}
                        </button>
                        
                        {!m.istAdmin && (
                          <button
                            onClick={() => toggleAdmin(m.id, m.istAdmin)}
                            className="text-sm px-3 py-1 rounded font-medium bg-primary-100 text-primary-700 hover:bg-primary-200"
                          >
                            Zu Teamleiter machen
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
