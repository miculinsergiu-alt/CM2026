import { useState, useEffect } from 'preact/hooks';
import { Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = 'https://cm2026flex2-backend.onrender.com/api';

export function Dashboard() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/leaderboard`)
      .then(res => res.json())
      .then(setData);
  }, []);

  // Format data for chart: [{ name: 'User', correct: 5, wrong: 2 }, ...]
  const chartData = data.map(p => ({
    name: p.name,
    correct: p.correct_predictions || 0,
    wrong: p.wrong_predictions || 0
  }));

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Trophy className="text-yellow-500" /> Clasament Mondial 2026
      </h1>

      {/* Chart */}
      <div className="bg-white p-4 rounded-xl border h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="correct" stackId="a" fill="#22c55e" name="Corecte" />
            <Bar dataKey="wrong" stackId="a" fill="#ef4444" name="Greșite" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
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
            {data.map((p, i) => (
              <tr key={p.id} className="border-b">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3 font-semibold">{p.name}</td>
                <td className="px-4 py-3 text-right font-bold text-blue-600">{p.total_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
