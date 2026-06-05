import { useState } from 'preact/hooks'
import { Settings } from 'lucide-react'
import { Dashboard } from './components/Dashboard'

export function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  if (isAdmin) {
    return (
      <div className="p-4 space-y-8">
        <button onClick={() => setIsAdmin(false)} className="mb-4 text-sm text-slate-500">← Înapoi la Clasament</button>
        <h2 className="text-xl font-bold text-center">Admin Panel</h2>

        {/* 1. Import Matches */}
        <div className="bg-white rounded-xl border p-4 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-700">Import Matches</h3>
          <button 
            onClick={async () => {
              const { importMatches } = await import('./lib/importMatches');
              await importMatches();
            }}
            className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700"
          >
            Import Matches from Excel
          </button>
        </div>

        {/* 2. Add Participant */}
        <div className="bg-white rounded-xl border p-4 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-700">Add Participant</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const name = (e.target as any).pName.value;
            if (!name) return;
            await fetch('https://cm2026flex2-backend.onrender.com/api/participants', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name })
            });
            alert('Participant added!');
            (e.target as any).reset();
          }} className="flex gap-2">
            <input name="pName" placeholder="Participant Name" className="flex-1 bg-slate-50 border rounded-lg py-2 px-3" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Add</button>
          </form>
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
