import { useState } from 'preact/hooks'
import { Settings } from 'lucide-react'
import { Dashboard } from './components/Dashboard'
import { matches } from './lib/matches'

export function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [participants, setParticipants] = useState<{name: string, predictions: any, totalPoints: number}[]>([]);
  const [newParticipant, setNewParticipant] = useState('');

  const addParticipant = (e: any) => {
    e.preventDefault();
    if(!newParticipant) return;
    setParticipants([...participants, { name: newParticipant, predictions: {}, totalPoints: 0 }]);
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
      
      let points = 0;
      if (parseInt(pred.h) === h && parseInt(pred.a) === a) points = 3; // Scor exact
      else if (Math.sign(parseInt(pred.h) - parseInt(pred.a)) === Math.sign(h - a)) points = 1; // Rezultat
      else points = -1; // Gresit

      return { ...p, totalPoints: p.totalPoints + points };
    });
    setParticipants(updated);
    alert('Scor validat și puncte actualizate!');
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
              <button 
                onClick={async () => {
                  const predList = Object.entries(p.predictions).map(([match_id, scores]: [string, any]) => ({
                    participant_id: p.id,
                    match_id,
                    predicted_home: parseInt(scores.h || 0),
                    predicted_away: parseInt(scores.a || 0)
                  }));
                  await fetch('https://cm2026flex2-backend.onrender.com/api/predictions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ participant_id: p.id, predictions: predList })
                  });
                  alert('Predicții salvate!');
                }}
                className="mt-4 w-full bg-green-600 text-white font-bold py-2 rounded-lg"
              >
                Salvează Predicții
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border p-4 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-700">Validează Scor Final (Admin)</h3>
          {matches.map(m => (
            <div key={m.id} className="flex items-center gap-2 text-sm mb-2">
              <span className="flex-1 truncate">{m.team_home} vs {m.team_away}</span>
              <input id={`real-h-${m.id}`} type="number" placeholder="H" className="w-12 bg-slate-50 border rounded text-center" />
              <input id={`real-a-${m.id}`} type="number" placeholder="A" className="w-12 bg-slate-50 border rounded text-center" />
              <button onClick={() => validateScores(m.id, (document.getElementById(`real-h-${m.id}`) as HTMLInputElement).value, (document.getElementById(`real-a-${m.id}`) as HTMLInputElement).value)} className="bg-green-600 text-white px-2 py-1 rounded">Finish</button>
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
      <Dashboard participants={participants} />
    </div>
  )
}
