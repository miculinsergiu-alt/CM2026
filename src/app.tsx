import { useState } from 'preact/hooks'
import { Trophy, Calendar, User, Settings, LogOut } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useAuth } from './hooks/useAuth'
import { useMatches, useLeaderboard, useProfile, useUserPredictions, useAdminData } from './hooks/useData'
import { Auth } from './components/Auth'
import { supabase } from './lib/supabase'
import { useEffect } from 'preact/hooks'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function App() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'matches' | 'leaderboard' | 'profile' | 'admin'>('matches')
  
  const { matches, loading: matchesLoading } = useMatches()
  const { profiles, loading: leaderboardLoading } = useLeaderboard()
  const { profile } = useProfile(user?.id)
  const { predictions: existingPredictions } = useUserPredictions(user?.id)
  const { participants: adminParticipants, matches: adminMatches } = useAdminData()

  const [predictions, setPredictions] = useState<Record<string, { home: number; away: number }>>({})

  useEffect(() => {
    if (existingPredictions) {
      setPredictions(existingPredictions)
    }
  }, [existingPredictions])

  const handleSavePrediction = async (matchId: string) => {
    const pred = predictions[matchId]
    if (!pred || pred.home === undefined || pred.away === undefined) {
      return alert('Please enter both scores')
    }

    const { error } = await supabase.from('predictions').upsert({
      user_id: user?.id,
      match_id: matchId,
      predicted_home: pred.home,
      predicted_away: pred.away,
    }, { onConflict: 'user_id,match_id' })

    if (error) alert(error.message)
    else alert('Prediction saved!')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  const handleLogout = () => supabase.auth.signOut()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="text-yellow-500 w-6 h-6" />
          Mondial 2026
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium bg-slate-100 px-2 py-1 rounded">
            {profile?.total_points ?? 0} pts
          </span>
          <div className="w-8 h-8 rounded-full bg-slate-200 border flex items-center justify-center overflow-hidden">
            {user.email?.[0].toUpperCase() ?? <User className="w-5 h-5 text-slate-500" />}
          </div>
          <button onClick={handleLogout} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {activeTab === 'matches' && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold px-1 text-left">Upcoming Matches</h2>
            {matchesLoading ? (
              <p className="text-center text-slate-500 py-10">Loading matches...</p>
            ) : matches.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No matches found.</p>
            ) : (
              matches.map((match: any) => (
                <div key={match.id} className="bg-white rounded-xl border p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="uppercase tracking-wider">{match.status}</span>
                    <span>{new Date(match.start_time).toLocaleDateString()} • {new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-lg font-bold">
                        {match.team_home.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold truncate w-full text-center">{match.team_home}</span>
                    </div>
                    <div className="text-xl font-bold text-slate-400">
                      {match.status === 'finished' || match.status === 'live' ? `${match.score_home} - ${match.score_away}` : 'vs'}
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-lg font-bold">
                        {match.team_away.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold truncate w-full text-center">{match.team_away}</span>
                    </div>
                  </div>
                  {match.status === 'scheduled' && (
                    <>
                      <div className="pt-2 border-t flex items-center gap-2">
                        <input 
                          type="number" 
                          placeholder="0" 
                          value={predictions[match.id]?.home ?? ''}
                          onChange={(e) => setPredictions(prev => ({
                            ...prev,
                            [match.id]: { ...prev[match.id], home: parseInt((e.target as HTMLInputElement).value) }
                          }))}
                          className="w-full bg-slate-50 border rounded-lg py-2 text-center font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                        />
                        <span className="text-slate-300">-</span>
                        <input 
                          type="number" 
                          placeholder="0" 
                          value={predictions[match.id]?.away ?? ''}
                          onChange={(e) => setPredictions(prev => ({
                            ...prev,
                            [match.id]: { ...prev[match.id], away: parseInt((e.target as HTMLInputElement).value) }
                          }))}
                          className="w-full bg-slate-50 border rounded-lg py-2 text-center font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                        />
                      </div>
                      <button 
                        onClick={() => handleSavePrediction(match.id)}
                        className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                      >
                        Save Prediction
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
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
                    {leaderboardLoading ? (
                      <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-500">Loading rankings...</td></tr>
                    ) : profiles.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-500">No users yet.</td></tr>
                    ) : (
                      profiles.map((p: any, idx: number) => (
                        <tr key={p.id} className={cn(p.id === user.id && "bg-blue-50")}>
                          <td className="px-4 py-4 font-bold text-slate-50">{idx + 1}</td>
                          <td className="px-4 py-4 font-semibold">{p.full_name || p.id.substring(0, 8)}</td>
                          <td className="px-4 py-4 text-right font-bold text-blue-600">{p.total_points}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
             </div>
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="space-y-4 text-left">
            <h2 className="text-lg font-semibold px-1">Your Profile</h2>
            <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-md text-2xl font-black text-blue-600">
                {user.email?.[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold">{profile?.full_name || 'Prediction Fan'}</h3>
                <p className="text-slate-500 text-sm">{user.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full pt-4">
                 <div className="bg-slate-50 p-3 rounded-lg border">
                   <span className="block text-xs text-slate-500 uppercase font-bold text-center">Your Points</span>
                   <span className="text-xl font-black text-blue-600 block text-center">{profile?.total_points ?? 0}</span>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-lg border">
                   <span className="block text-xs text-slate-500 uppercase font-bold text-center">Role</span>
                   <span className="text-xl font-black text-slate-800 block text-center uppercase tracking-tighter">{profile?.role ?? 'User'}</span>
                 </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'admin' && (
          <section className="space-y-6 text-left">
            <h2 className="text-lg font-semibold px-1 text-center">Admin Panel</h2>
            
            {/* Create Participant */}
            <div className="bg-white rounded-xl border p-4 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-700">Add Participant</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const name = (e.target as any).pName.value;
                if (!name) return;
                await fetch('http://localhost:3000/api/participants', {
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

            {/* Prediction Entry */}
            <div className="bg-white rounded-xl border p-4 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-700">Enter Predictions</h3>
              <select onChange={(e) => {
                (window as any).selectedPid = (e.target as HTMLSelectElement).value;
              }} className="w-full bg-slate-50 border rounded-lg py-2 px-3">
                <option value="">Select Participant</option>
                {adminParticipants.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <div className="space-y-2">
                {adminMatches.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm">
                    <span className="flex-1 truncate">{m.team_home} vs {m.team_away}</span>
                    <input name={`h-${m.id}`} type="number" placeholder="H" className="w-12 bg-slate-50 border rounded text-center" />
                    <input name={`a-${m.id}`} type="number" placeholder="A" className="w-12 bg-slate-50 border rounded text-center" />
                  </div>
                ))}
              </div>
              <button 
                onClick={async () => {
                   const pid = (window as any).selectedPid;
                   if (!pid) return alert('Select participant');

                   const predictionsToSave = adminMatches.map((m: any) => {
                      const hInput = document.querySelector(`input[name="h-${m.id}"]`) as HTMLInputElement;
                      const aInput = document.querySelector(`input[name="a-${m.id}"]`) as HTMLInputElement;
                      return { participant_id: pid, match_id: m.id, predicted_home: parseInt(hInput.value), predicted_away: parseInt(aInput.value) };
                   }).filter((p: any) => !isNaN(p.predicted_home) && !isNaN(p.predicted_away));

                   await fetch('http://localhost:3000/api/predictions', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify(predictionsToSave[0]) // Simplificat pentru un singur apel
                   });
                   alert("Predicție salvată!");
                }}
                className="w-full bg-green-600 text-white font-bold py-2 rounded-lg"
              >
                Salvează Predicții
              </button>
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
