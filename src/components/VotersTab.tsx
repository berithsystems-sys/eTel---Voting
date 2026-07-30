import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Upload,
  Key,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Mail,
  RefreshCw,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Voter } from '../types';

interface VotersTabProps {
  voters: Voter[];
  onAddVoters: (voters: Partial<Voter>[]) => Promise<void>;
  onDeleteVoter: (id: string) => Promise<void>;
}

export const VotersTab: React.FC<VotersTabProps> = ({
  voters,
  onAddVoters,
  onDeleteVoter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VOTED' | 'PENDING'>('ALL');
  const [showKeys, setShowKeys] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Single Add form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [voterId, setVoterId] = useState('');
  const [weight, setWeight] = useState(1);

  // Bulk paste
  const [bulkText, setBulkText] = useState('');

  const filteredVoters = voters.filter(v => {
    const matchesFilter =
      statusFilter === 'ALL' ||
      (statusFilter === 'VOTED' && v.hasVoted) ||
      (statusFilter === 'PENDING' && !v.hasVoted);
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.voterId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSingleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddVoters([
      {
        name: name.trim() || 'New Voter',
        email: email.trim(),
        voterId: voterId.trim() || `VOTER-${Math.floor(1000 + Math.random() * 9000)}`,
        weight: Number(weight) || 1,
      }
    ]);
    setName('');
    setEmail('');
    setVoterId('');
    setWeight(1);
    setIsAddModalOpen(false);
  };

  const handleBulkAdd = async () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n');
    const newItems: Partial<Voter>[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(',');
      if (parts.length >= 1 && parts[0].trim()) {
        newItems.push({
          name: parts[0]?.trim() || `Voter ${idx + 1}`,
          email: parts[1]?.trim() || `voter${idx + 1}@example.com`,
          voterId: parts[2]?.trim() || `VOTER-${1000 + voters.length + idx + 1}`,
          weight: 1
        });
      }
    });

    if (newItems.length > 0) {
      await onAddVoters(newItems);
      setBulkText('');
      setIsBulkModalOpen(false);
    }
  };

  const handleGenerateSampleVoters = async () => {
    const samples: Partial<Voter>[] = Array.from({ length: 5 }).map((_, i) => ({
      name: `Sample Voter ${voters.length + i + 1}`,
      email: `sample.voter${voters.length + i + 1}@example.com`,
      voterId: `VOTER-${2000 + voters.length + i}`,
      weight: 1
    }));
    await onAddVoters(samples);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Voters Roster & Authentication Keys
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Total voters registered: <strong className="text-slate-800">{voters.length}</strong> | 
            Voted: <strong className="text-emerald-600">{voters.filter(v => v.hasVoted).length}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="voters-btn-show-keys"
            onClick={() => setShowKeys(!showKeys)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
          >
            {showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showKeys ? 'Hide Secret Keys' : 'Show Secret Keys'}
          </button>

          <button
            id="voters-btn-bulk-import"
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            Bulk Import CSV
          </button>

          <button
            id="voters-btn-add-single"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Single Voter
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {(['ALL', 'VOTED', 'PENDING'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Voter Name, ID, or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Voter ID</th>
                <th className="p-3">Secret Key</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3 text-center">Weight</th>
                <th className="p-3">Status</th>
                <th className="p-3">Voted At</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredVoters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    No voters found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredVoters.map(voter => (
                  <tr key={voter.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold font-mono text-slate-900">{voter.voterId}</td>
                    <td className="p-3 font-mono text-slate-600">
                      {showKeys ? (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-indigo-600 font-bold">
                          {voter.voterKey}
                        </span>
                      ) : (
                        <span className="text-slate-400">••••••••</span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-slate-900">{voter.name}</td>
                    <td className="p-3 text-slate-500">{voter.email}</td>
                    <td className="p-3 text-center font-bold text-slate-700">{voter.weight}</td>
                    <td className="p-3">
                      {voter.hasVoted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Voted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-500" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 text-[11px] font-mono">
                      {voter.votedAt ? new Date(voter.votedAt).toLocaleString() : '—'}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteVoter(voter.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Voter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Add Voter Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Single Voter</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSingleAdd} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Hauzel"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Voter ID (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated if blank (e.g. VOTER-1007)"
                  value={voterId}
                  onChange={e => setVoterId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Vote Weight</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={weight}
                  onChange={e => setWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Save Voter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                Bulk Import Voters (CSV / List)
              </h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Paste voter entries below in CSV format: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">Name, Email, VoterID</code> (one voter per line).
              </p>

              <textarea
                rows={6}
                placeholder={`Thangzamuan Hauzel, thangzamuan@example.com, VOTER-1008\nMary Kom Simte, mary.simte@example.com, VOTER-1009`}
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleGenerateSampleVoters}
                  className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  + Add 5 Demo Voters
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkAdd}
                    className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs"
                  >
                    Import Voters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
