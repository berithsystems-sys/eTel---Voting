import React from 'react';
import {
  Users,
  Vote,
  TrendingUp,
  ShieldAlert,
  Play,
  CheckCircle2,
  Share2,
  Copy,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Election, Voter, AuditLog } from '../types';

interface OverviewTabProps {
  election: Election;
  voters: Voter[];
  auditLogs: AuditLog[];
  onUpdateStatus: (status: 'Draft' | 'Active' | 'Completed') => void;
  onNavigateTab: (tab: 'results' | 'voters' | 'ballot' | 'fraud' | 'settings') => void;
  onSwitchToVoterView: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  election,
  voters,
  auditLogs,
  onUpdateStatus,
  onNavigateTab,
  onSwitchToVoterView
}) => {
  const [copied, setCopied] = React.useState(false);

  const totalVoters = voters.length;
  const votedCount = voters.filter(v => v.hasVoted).length;
  const turnoutPercent = totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0;
  const flaggedLogs = auditLogs.filter(l => l.status === 'FLAGGED' || l.status === 'BLOCKED').length;

  const publicVoteUrl = `${window.location.origin}/?electionId=${election.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicVoteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Top Welcome / Status Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              eTelna Official Election Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {election.title}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Real-time monitor and controls for election commissioners. Managing voter key authentication, ballot Integrity, and real-time tally updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {election.status === 'Draft' && (
              <button
                id="overview-btn-launch"
                onClick={() => onUpdateStatus('Active')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Launch Election
              </button>
            )}

            {election.status === 'Active' && (
              <button
                id="overview-btn-complete"
                onClick={() => onUpdateStatus('Completed')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-sky-500 hover:bg-sky-600 text-slate-950 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Close & Finish Election
              </button>
            )}

            {election.status === 'Completed' && (
              <button
                id="overview-btn-reopen"
                onClick={() => onUpdateStatus('Active')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                Re-open Election
              </button>
            )}

            <button
              id="overview-btn-vote-preview"
              onClick={onSwitchToVoterView}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs border border-white/20 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Open Voter View
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Registered Voters</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight">{totalVoters}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              Eligible key holders registered
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Votes Cast</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Vote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight">{votedCount}</div>
            <div className="text-xs text-slate-500 mt-1">
              Verified ballots received
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Voter Turnout</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight">{turnoutPercent}%</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${turnoutPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Fraud Audit Alerts</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight">{flaggedLogs}</div>
            <div className="text-xs text-amber-600 font-medium mt-1">
              {flaggedLogs > 0 ? 'Duplicate/IP collision detected' : 'Zero security flags'}
            </div>
          </div>
        </div>

      </div>

      {/* Shareable Voter Link & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Share Link Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-600" />
              Public Voter Ballot Share Link
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
              Encryption Active
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Send this URL to voters along with their unique Voter ID and Voter Key. Voters will cast their encrypted choices directly on this portal.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={publicVoteUrl}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-mono focus:outline-none"
            />
            <button
              id="overview-btn-copy-link"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Quick Admin Navigation shortcuts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900">Quick Shortcuts</h3>
          <div className="space-y-2">
            <button
              onClick={() => onNavigateTab('results')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-all"
            >
              <span>View Real-time Results & Charts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('voters')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-all"
            >
              <span>Manage & Import Voters</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('ballot')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-all"
            >
              <span>Edit Candidates & Questions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('fraud')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 text-slate-700 hover:text-amber-600 text-xs font-semibold transition-all"
            >
              <span>Check Fraud & IP Audit Logs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
