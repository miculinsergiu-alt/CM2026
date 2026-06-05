import { Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Dashboard({ participants }: { participants: { name: string, totalPoints: number }[] }) {

  // Format data for chart
  const chartData = participants.map(p => ({
    name: p.name,
    points: p.totalPoints
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
            <Bar dataKey="points" fill="#3b82f6" name="Puncte" />
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
            {[...participants].sort((a,b) => b.totalPoints - a.totalPoints).map((p, i) => (
              <tr key={i} className="border-b">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3 font-semibold">{p.name}</td>
                <td className="px-4 py-3 text-right font-bold text-blue-600">{p.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
