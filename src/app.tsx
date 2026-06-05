import { useState } from 'preact/hooks'
import { Settings } from 'lucide-react'
import { Dashboard } from './components/Dashboard'
import { matches } from './lib/matches'

export function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [participants, setParticipants] = useState<{name: string, predictions: any}[]>([]);
  const [newParticipant, setNewParticipant] = useState('');

  const addParticipant = (e: any) => {
    e.preventDefault();
    if(!newParticipant) return;
    setParticipants([...participants, { name: newParticipant, predictions: {} }]);
    setNewParticipant('');
  };

  const updatePrediction = (pIndex: number, matchId: string, score: string, type: 'h' | 'a') => {
    const updated = [...participants];
    if (!updated[pIndex].predictions[matchId]) updated[pIndex].predictions[matchId] = { h: '', a: '' };
    updated[pIndex].predictions[matchId][type] = score;
    setParticipants(updated);
  };

  if (isAdmin) {
    return (
      <div className="p-4 space-y-8">
        <button onClick={() => setIsAdmin(false)} className="mb-4 text-sm text-slate-500">← Înapoi la Clasament</button>
        <h2 className="text-xl font-bold text-center">Admin Panel</h2>

        <div className="bg-white rounded-xl border p-4 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-700">Adaugă Participant</h3>
          <form onSubmit={addParticipant} className="flex gap-2">
            <input value={newParticipant} onChange={e => setNewParticipant((e.target as HTMLInputElement).value)} placeholder="Nume Participant" className="flex-1 bg-slate-50 border rounded-lg py-2 px-3" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Add</button>
          </form>
        </div>

        <div className="space-y-4">
          {participants.map((p, pIndex) => (
            <div key={pIndex} className="bg-white rounded-xl border p-4 shadow-sm">
              <h3 className="font-bold text-lg mb-4">{p.name}</h3>
              {matches.map(m => (
                <div key={m.id} className="flex items-center gap-2 text-sm mb-2">
                  <span className="flex-1 truncate">{m.team_home} vs {m.team_away}</span>
                  <input type="number" placeholder="H" onChange={e => updatePrediction(pIndex, m.id, (e.target as HTMLInputElement).value, 'h')} className="w-12 bg-slate-50 border rounded text-center" />
                  <input type="number" placeholder="A" onChange={e => updatePrediction(pIndex, m.id, (e.target as HTMLInputElement).value, 'a')} className="w-12 bg-slate-50 border rounded text-center" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <span className="font-bold">Mondial 2026</span>
        <button 
          onClick={() => {
            const pass = prompt('Introdu parola de Admin:');
            if (pass === 'admin123') setIsAdmin(true); 
            else alert('Parolă greșită');
          }}
          className="flex items-center gap-2 text-sm bg-slate-800 text-white px-3 py-1 rounded"
        >
          <Settings className="w-4 h-4" /> Admin
        </button>
      </header>
      <Dashboard />
    </div>
  )
}
