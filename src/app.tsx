import { useState } from 'preact/hooks'
import { Trophy, Calendar, User, Settings } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function App() {
  const [activeTab, setActiveTab] = useState<'matches' | 'leaderboard' | 'profile' | 'admin'>('matches')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="text-yellow-500 w-6 h-6" />
          Mondial 2026
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium bg-slate-100 px-2 py-1 rounded">1,250 pts</span>
          <div className="w-8 h-8 rounded-full bg-slate-200 border flex items-center justify-center">
            <User className="w-5 h-5 text-slate-500" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {activeTab === 'matches' && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold px-1 text-left">Upcoming Matches</h2>
            {/* Mock matches */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Match #{i}</span>
                  <span>June 15, 2026 • 21:00</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-lg font-bold">RO</div>
                    <span className="text-sm font-semibold">Romania</span>
                  </div>
                  <div className="text-xl font-bold text-slate-400">vs</div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-lg font-bold">GE</div>
                    <span className="text-sm font-semibold">Germany</span>
                  </div>
                </div>
                <div className="pt-2 border-t flex items-center gap-2">
                   <input type="number" placeholder="0" className="w-full bg-slate-50 border rounded-lg py-2 text-center font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                   <span className="text-slate-300">-</span>
                   <input type="number" placeholder="0" className="w-full bg-slate-50 border rounded-lg py-2 text-center font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <button className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                  Save Prediction
                </button>
              </div>
            ))}
          </section>
        )}

        {activeTab === 'leaderboard' && (
          <section className="space-y-4 text-left">
             <h2 className="text-lg font-semibold px-1">Leaderboard</h2>
             <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600">Pos</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">User</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { name: 'Sergiu', points: 2450, rank: 1 },
                      { name: 'Andrei', points: 2120, rank: 2 },
                      { name: 'Elena', points: 1980, rank: 3 },
                    ].map((user) => (
                      <tr key={user.name}>
                        <td className="px-4 py-4 font-bold text-slate-500">{user.rank}</td>
                        <td className="px-4 py-4 font-semibold">{user.name}</td>
                        <td className="px-4 py-4 text-right font-bold text-blue-600">{user.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="space-y-4 text-left">
            <h2 className="text-lg font-semibold px-1">Your Profile</h2>
            <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-md">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Sergiu Miculin</h3>
                <p className="text-slate-500 text-sm">sergiu@example.com</p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full pt-4">
                 <div className="bg-slate-50 p-3 rounded-lg border">
                   <span className="block text-xs text-slate-500 uppercase font-bold">Rank</span>
                   <span className="text-xl font-black text-slate-800">#1</span>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-lg border">
                   <span className="block text-xs text-slate-500 uppercase font-bold">Points</span>
                   <span className="text-xl font-black text-blue-600">2,450</span>
                 </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'admin' && (
          <section className="space-y-4 text-left">
            <h2 className="text-lg font-semibold px-1">Admin Panel</h2>
            <div className="bg-white rounded-xl border p-4 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-700">Add New Match</h3>
              <div className="space-y-3">
                <input type="text" placeholder="Team Home" className="w-full bg-slate-50 border rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Team Away" className="w-full bg-slate-50 border rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="datetime-local" className="w-full bg-slate-50 border rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500" />
                <button className="w-full bg-slate-800 text-white font-bold py-2 rounded-lg hover:bg-slate-900 transition-colors">
                  Create Match
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around px-2 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('matches')}
          className={cn("flex flex-col items-center gap-1 flex-1 transition-all", activeTab === 'matches' ? "text-blue-600 scale-110" : "text-slate-400")}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Matches</span>
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={cn("flex flex-col items-center gap-1 flex-1 transition-all", activeTab === 'leaderboard' ? "text-blue-600 scale-110" : "text-slate-400")}
        >
          <Trophy className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Board</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={cn("flex flex-col items-center gap-1 flex-1 transition-all", activeTab === 'profile' ? "text-blue-600 scale-110" : "text-slate-400")}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
        </button>
        <button 
          onClick={() => setActiveTab('admin')}
          className={cn("flex flex-col items-center gap-1 flex-1 transition-all", activeTab === 'admin' ? "text-blue-600 scale-110" : "text-slate-400")}
        >
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
        </button>
      </nav>
    </div>
  )
}
