import { useState } from 'preact/hooks'
import { Settings } from 'lucide-react'
import { Dashboard } from './components/Dashboard'
import { matches } from './lib/matches'

export function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [participants, setParticipants] = useState<{id: string, name: string, predictions: any, totalPoints: number}[]>([]);
  const [newParticipant, setNewParticipant] = useState('');

  const addParticipant = (e: any) => {
    e.preventDefault();
    if(!newParticipant) return;
    setParticipants([...participants, { id: Date.now().toString(), name: newParticipant, predictions: {}, totalPoints: 0 }]);
    setNewParticipant('');
  };

  const updatePrediction = (pIndex: number, matchId: string, score: string, type: 'h' | 'a') => {
    const updated = [...participants];
    if (!updated[pIndex].predictions[matchId]) updated[pIndex].predictions[matchId] = { h: '', a: '' };
    updated[pIndex].predictions[matchId][type] = score;
    setParticipants(updated);
  };

  const validateScores = (matchId: string, realH: string, realA: string) => {
    const h = parseInt(realH);
    const a = parseInt(realA);
    if (isNaN(h) || isNaN(a)) return;

    const updated = participants.map(p => {
      const pred = p.predictions[matchId];
      if (!pred) return p;
      const points = (parseInt(pred.h) === h && parseInt(pred.a) === a) ? 1 : 0;
      return { ...p, totalPoints: p.totalPoints + points };
    });
    setParticipants(updated);
    alert('Scor validat și puncte actualizate!');
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 p-2 sm:p-4">
        <button onClick={() => setIsAdmin(false)} className="mb-4 text-sm text-slate-500">← Înapoi la Clasament</button>
        <h2 className="text-xl font-bold text-center mb-6">Admin Panel</h2>

        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-3">Adaugă Participant</h3>
            <form onSubmit={addParticipant} className="flex gap-2">
              <input value={newParticipant} onChange={e => setNewParticipant((e.target as HTMLInputElement).value)} placeholder="Nume" className="flex-1 bg-slate-50 border rounded-lg py-2 px-3" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Add</button>
            </form>
          </div>

          {participants.map((p, pIndex) => (
            <div key={p.id} className="bg-white rounded-xl border p-4 shadow-sm">
              <h3 className="font-bold text-lg mb-4">{p.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matches.map(m => (
                  <div key={m.id} className="flex items-center gap-2 text-xs border-b pb-2">
                    <span className="flex-1 truncate">{m.teams}</span>
                    <input type="number" placeholder="H" onChange={e => updatePrediction(pIndex, m.id, (e.target as HTMLInputElement).value, 'h')} className="w-10 bg-slate-50 border rounded text-center py-1" />
                    <input type="number" placeholder="A" onChange={e => updatePrediction(pIndex, m.id, (e.target as HTMLInputElement).value, 'a')} className="w-10 bg-slate-50 border rounded text-center py-1" />
                  </div>
                ))}
              </div>
              <button onClick={() => alert('Predicții salvate local!')} className="mt-4 w-full bg-green-600 text-white font-bold py-2 rounded-lg">Salvează</button>
            </div>
          ))}

          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4">Validează Scor</h3>
            {matches.map(m => (
              <div key={m.id} className="flex items-center gap-2 text-xs mb-2 border-b pb-2">
                <span className="flex-1 truncate">{m.teams}</span>
                <input id={`real-h-${m.id}`} type="number" placeholder="H" className="w-10 bg-slate-50 border rounded text-center py-1" />
                <input id={`real-a-${m.id}`} type="number" placeholder="A" className="w-10 bg-slate-50 border rounded text-center py-1" />
                <button onClick={() => validateScores(m.id, (document.getElementById(`real-h-${m.id}`) as HTMLInputElement).value, (document.getElementById(`real-a-${m.id}`) as HTMLInputElement).value)} className="bg-green-600 text-white px-2 py-1 rounded">Finish</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <span className="font-bold">Mondial 2026</span>
        <button onClick={() => { const pass = prompt('Parolă Admin:'); if (pass === 'admin123') setIsAdmin(true); }} className="flex items-center gap-2 text-sm bg-slate-800 text-white px-3 py-1 rounded">
          <Settings className="w-4 h-4" /> Admin
        </button>
      </header>
      <Dashboard participants={participants} matches={matches} />
    </div>
  )
}
