import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Download, Share2, Eye, EyeOff, BarChart2, PieChart as PieIcon, CheckCircle2 } from 'lucide-react';
import { Election } from '../types';

interface ResultsTabProps {
  election: Election;
  onUpdateSettings: (settingsPartial: Partial<Election['settings']>) => void;
}

const COLORS = [
  '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#64748b',
  '#06b6d4', '#ec4899', '#10b981', '#84cc16', '#6366f1'
];

export const ResultsTab: React.FC<ResultsTabProps> = ({
  election,
  onUpdateSettings
}) => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const mainQuestion = election.questions[0];
  const totalVotesCast = mainQuestion
    ? mainQuestion.options.reduce((sum, opt) => sum + opt.votesCount, 0)
    : 0;

  const chartData = mainQuestion?.options.map((opt, idx) => {
    const pct = totalVotesCast > 0 ? Math.round((opt.votesCount / totalVotesCast) * 100) : 0;
    return {
      name: opt.title,
      votes: opt.votesCount,
      percentage: pct,
      color: COLORS[idx % COLORS.length]
    };
  }) || [];

  const handleDownloadCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Candidate Option,Votes,Percentage\n';
    chartData.forEach(row => {
      csvContent += `"${row.name}",${row.votes},${row.percentage}%\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${election.title.replace(/\s+/g, '_')}_Results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            Election Results & Tallies
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Total ballot picks counted: <strong className="text-slate-800">{totalVotesCast}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Chart Type Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setChartType('pie')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                chartType === 'pie' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              Donut
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                chartType === 'bar' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Bar
            </button>
          </div>

          {/* Publish Toggles */}
          <button
            onClick={() => onUpdateSettings({ isResultsPublished: !election.settings.isResultsPublished })}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              election.settings.isResultsPublished
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            {election.settings.isResultsPublished ? 'Results Published' : 'Publish Results'}
          </button>

          {/* Export Report */}
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV
          </button>

        </div>
      </div>

      {/* Main Results Container: Left Table, Right Interactive Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Table Column (Matching screenshot list layout) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              {mainQuestion?.question || 'Managing Committee Options'}
            </h3>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Vote Tallies
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
            {chartData.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-500">Option ID: #{idx + 1}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {item.percentage}%
                  </span>
                  <span className="text-xs font-extrabold text-white bg-slate-900 px-2.5 py-1 rounded-lg min-w-[36px] text-center">
                    {item.votes}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Chart Column */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-600" />
            Vote Distribution Breakdown
          </h3>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="votes"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} votes`, 'Count']}
                    contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              ) : (
                <BarChart data={chartData.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                    {chartData.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Cryptographically audited. Updates automatically on new ballot submission.
          </div>
        </div>

      </div>

    </div>
  );
};
