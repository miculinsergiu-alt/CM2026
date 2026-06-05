import { useState } from 'preact/hooks'
import { Settings } from 'lucide-react'
import { Dashboard } from './components/Dashboard'

export function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  if (isAdmin) {
    return (
      <div className="p-4">
        <button onClick={() => setIsAdmin(false)} className="mb-4 text-sm text-slate-500">← Înapoi la Clasament</button>
        <h2 className="text-xl font-bold">Admin Panel</h2>
        {/* Aici vei adăuga interfața de Admin creată anterior */}
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
