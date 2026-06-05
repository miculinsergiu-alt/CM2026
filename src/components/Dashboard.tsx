import { Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { useState } from 'preact/hooks';
import { Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Dashboard({ participants }: { participants: { id: string, name: string, totalPoints: number, predictions: any[] }[] }) {
  const [selectedP, setSelectedP] = useState<any | null>(null);

  const chartData = participants.map(p => ({
    name: p.name,
    points: p.totalPoints
  }));

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Trophy className="text-yellow-500" /> Clasament Mondial 2026
      </h1>

      <div className="bg-white p-4 rounded-xl border h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="points" fill="#3b82f6" name="Puncte" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Loc</th>
              <th className="px-4 py-3 text-left">Participant</th>
              <th className="px-4 py-3 text-right">Puncte</th>
            </tr>
          </thead>
          <tbody>
            {[...participants].sort((a,b) => b.totalPoints - a.totalPoints).map((p, i) => (
              <tr key={p.id} className="border-b cursor-pointer hover:bg-blue-50" onClick={() => setSelectedP(p)}>
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3 font-semibold">{p.name}</td>
                <td className="px-4 py-3 text-right font-bold text-blue-600">{p.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedP && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedP(null)}>
          <div className="bg-white p-6 rounded-xl w-full max-w-sm max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-4">Predicții: {selectedP.name}</h2>
            <div className="space-y-2 text-sm">
              {Object.entries(selectedP.predictions).map(([mId, pred]: [string, any]) => (
                <div key={mId} className="flex justify-between border-b pb-1">
                  <span>Meci {mId}</span>
                  <span className="font-bold">{pred.h} - {pred.a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
