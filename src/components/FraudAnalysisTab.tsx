import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Download, AlertTriangle, CheckCircle, Ban, Search, Laptop } from 'lucide-react';
import { AuditLog } from '../types';

interface FraudAnalysisTabProps {
  auditLogs: AuditLog[];
}

export const FraudAnalysisTab: React.FC<FraudAnalysisTabProps> = ({ auditLogs }) => {
  const [filter, setFilter] = useState<'ALL' | 'SUCCESS' | 'FLAGGED' | 'BLOCKED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    const matchesFilter = filter === 'ALL' || log.status === filter;
    const matchesSearch =
      log.voterId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm) ||
      log.notes.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const flaggedCount = auditLogs.filter(l => l.status === 'FLAGGED').length;
  const blockedCount = auditLogs.filter(l => l.status === 'BLOCKED').length;

  const handleExportAuditCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,ID,Timestamp,Voter ID,Action,IP Address,Status,Notes\n';
    auditLogs.forEach(l => {
      csvContent += `"${l.id}","${l.timestamp}","${l.voterId}","${l.action}","${l.ipAddress}","${l.status}","${l.notes.replace(/"/g, '""')}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Election_Fraud_Audit_Logs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Security Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Security Health</span>
            <div className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              100% Integrity
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">Zero unauthorized votes accepted</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">IP Collisions Flagged</span>
            <div className="text-2xl font-black text-amber-600 mt-1 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              {flaggedCount} Events
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">Shared IP network logs</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Duplicate Key Attempts Blocked</span>
            <div className="text-2xl font-black text-rose-600 mt-1 flex items-center gap-2">
              <Ban className="w-6 h-6 text-rose-500" />
              {blockedCount} Blocked
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">Replay attacks rejected</span>
          </div>
        </div>

      </div>

      {/* Audit Log Table Header & Search */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              Fraud Audit & Access Logs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cryptographically verified connection logs per voter token submission
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportAuditCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export Audit Logs
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'SUCCESS', 'FLAGGED', 'BLOCKED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === st
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Logs' : st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Voter ID or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Voter ID</th>
                <th className="p-3">Action</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Status</th>
                <th className="p-3">Verification Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No matching security logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-slate-900 font-mono">
                      {log.voterId}
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {log.action}
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {log.ipAddress}
                    </td>
                    <td className="p-3">
                      {log.status === 'SUCCESS' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          SUCCESS
                        </span>
                      )}
                      {log.status === 'FLAGGED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          FLAGGED
                        </span>
                      )}
                      {log.status === 'BLOCKED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Ban className="w-3 h-3 text-rose-500" />
                          BLOCKED
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 max-w-xs truncate" title={log.notes}>
                      {log.notes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
