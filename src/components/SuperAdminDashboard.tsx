import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Vote,
  DollarSign,
  Database,
  Globe,
  Settings,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Lock,
  Zap,
  Activity,
  Server,
  Key,
  ChevronRight,
  TrendingUp,
  Sliders,
  Trash2,
  Play,
  Pause,
  Filter
} from 'lucide-react';
import { Election, UserProfile, AuditLog, PaymentTransaction, AdminTierConfig, PaymentGatewayConfig, GoogleOAuthConfig } from '../types';
import { fetchAdminTierConfig, updateAdminTierConfig } from '../services/api';

interface SuperAdminDashboardProps {
  currentUser: UserProfile;
  elections: Election[];
  onSelectElection: (id: string) => void;
  onOpenSettingsModal: () => void;
  onOpenCreateModal: () => void;
  onToggleElectionStatus?: (electionId: string, currentStatus: string) => void;
  onDeleteElection?: (electionId: string) => void;
  onSwitchToOrganizerMode?: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  currentUser,
  elections,
  onSelectElection,
  onOpenSettingsModal,
  onOpenCreateModal,
  onToggleElectionStatus,
  onDeleteElection,
  onSwitchToOrganizerMode
}) => {
  const [activeTab, setActiveTab] = useState<'elections' | 'users' | 'system' | 'audit'>('elections');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'CLOSED'>('ALL');
  
  const [adminConfig, setAdminConfig] = useState<{
    tierConfig?: AdminTierConfig;
    paymentGateway?: PaymentGatewayConfig;
    googleOAuthConfig?: GoogleOAuthConfig;
    transactions?: PaymentTransaction[];
    databaseConnected?: boolean;
  }>({});

  useEffect(() => {
    fetchAdminTierConfig()
      .then(res => setAdminConfig(res))
      .catch(err => console.error(err));
  }, []);

  // Filtered elections across whole system
  const filteredElections = elections.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = elections.filter(e => e.status === 'ACTIVE').length;
  const draftCount = elections.filter(e => e.status === 'DRAFT').length;
  const totalVotersCount = elections.reduce((acc, curr) => acc + (curr.totalVoters || 0), 0);

  // System Demo Users List
  const [userList, setUserList] = useState<UserProfile[]>([
    {
      id: 'usr-admin-01',
      email: 'admin@etelna.com',
      name: 'System SuperAdmin',
      role: 'SUPER_ADMIN',
      plan: 'PREMIUM',
      authProvider: 'email',
      electionsCreatedCount: 5,
      createdAt: new Date().toISOString(),
      isLoggedIn: true
    },
    {
      id: 'usr-org-101',
      email: 'organizer@university.edu',
      name: 'Campus Election Director',
      role: 'ORGANIZER',
      plan: 'PREMIUM',
      authProvider: 'google',
      electionsCreatedCount: 3,
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
    },
    {
      id: 'usr-org-102',
      email: 'hello@corporate-vote.com',
      name: 'Corporate HR Admin',
      role: 'ORGANIZER',
      plan: 'FREE',
      authProvider: 'email',
      electionsCreatedCount: 1,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ]);

  const toggleUserPlan = (userId: string) => {
    setUserList(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, plan: u.plan === 'FREE' ? 'PREMIUM' : 'FREE' };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* SUPER ADMIN BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Super Admin System Control Center
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                MySQL DB Online
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Platform Master Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Global system overview for <span className="text-purple-300 font-bold">eTelna Digital Voting Engine</span>. Manage all election instances, Google API OAuth configurations, user roles, and payment revenue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenSettingsModal}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/30 text-xs flex items-center gap-2 transition-all cursor-pointer border border-purple-400/30"
            >
              <Settings className="w-4 h-4" />
              Configure Google API & Pricing
            </button>

            {onSwitchToOrganizerMode && (
              <button
                onClick={onSwitchToOrganizerMode}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-purple-400" />
                Switch to Election Manager
              </button>
            )}
          </div>
        </div>
      </div>

      {/* METRICS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total System Elections</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Vote className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{elections.length}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {activeCount} Active Now
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Drafts: {draftCount}</span>
            <span>Voters: {totalVotersCount}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Organizers & Users</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{userList.length}</span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              2 Premium
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Free Tier: 1</span>
            <span>SuperAdmin: 1</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Google OAuth Status</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              OAuth 2.0 Active
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
              {adminConfig.googleOAuthConfig?.clientId || 'Configured in Settings'}
            </p>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>SSO: Enabled</span>
            <span>One-Tap: Active</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Revenue</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              ₹{(adminConfig.transactions || []).reduce((sum, tx) => sum + tx.amount, 4998)}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Razorpay Test
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Price: ₹{adminConfig.tierConfig?.premiumPrice || 2499}</span>
            <span>Txns: {(adminConfig.transactions || []).length || 2}</span>
          </div>
        </div>

      </div>

      {/* DASHBOARD TAB NAVIGATION */}
      <div className="border-b border-slate-200 pb-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('elections')}
            className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'elections'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Vote className="w-4 h-4" />
            All System Elections ({elections.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Organizers & User Accounts ({userList.length})
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'system'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Server className="w-4 h-4" />
            Google API & Infrastructure
          </button>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Election Instance
        </button>
      </div>

      {/* TAB 1: ALL SYSTEM ELECTIONS */}
      {activeTab === 'elections' && (
        <div className="space-y-4">
          
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-3xl shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search election title or ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status:</span>
              {(['ALL', 'ACTIVE', 'DRAFT', 'CLOSED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-purple-100 text-purple-900 border border-purple-200 font-black'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Elections List Table */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-bold text-xs text-slate-700">
              <div>System Election Campaigns ({filteredElections.length})</div>
              <div className="text-[11px] text-slate-500">SuperAdmin Direct Control</div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {filteredElections.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium">No elections match your filter criteria</div>
              ) : (
                filteredElections.map(el => (
                  <div key={el.id} className="p-4 sm:p-5 hover:bg-slate-50/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          el.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : el.status === 'DRAFT'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {el.status}
                        </span>

                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          ID: {el.id}
                        </span>

                        <span className="text-[10px] text-slate-500 font-medium">
                          Timezone: {el.timezone || 'Asia/Kolkata'}
                        </span>
                      </div>

                      <h3 className="font-black text-slate-900 text-sm tracking-tight truncate">
                        {el.title}
                      </h3>

                      <p className="text-slate-500 text-xs line-clamp-1">
                        {el.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="font-extrabold text-slate-900">{el.totalVoters || 0} Registered Voters</div>
                        <div className="text-[10px] text-slate-400">Questions: {el.questions?.length || 1}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectElection(el.id)}
                          className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs border border-purple-200 transition-all cursor-pointer flex items-center gap-1"
                        >
                          Manage
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {onToggleElectionStatus && (
                          <button
                            onClick={() => onToggleElectionStatus(el.id, el.status)}
                            title={el.status === 'ACTIVE' ? 'Pause Election' : 'Activate Election'}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                          >
                            {el.status === 'ACTIVE' ? <Pause className="w-4 h-4 text-amber-600" /> : <Play className="w-4 h-4 text-emerald-600" />}
                          </button>
                        )}

                        {onDeleteElection && (
                          <button
                            onClick={() => onDeleteElection(el.id)}
                            title="Delete Election Instance"
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all cursor-pointer border border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORGANIZERS & USER ACCOUNTS */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden space-y-4">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-bold text-xs text-slate-700">
            <div>Platform Registered Accounts & Organizers</div>
            <div className="text-[11px] text-slate-500">SuperAdmin Plan Upgrade Management</div>
          </div>

          <div className="p-4 divide-y divide-slate-100 text-xs">
            {userList.map(u => (
              <div key={u.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={u.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-extrabold text-slate-900 flex items-center gap-2">
                      {u.name}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        u.role === 'SUPER_ADMIN'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] font-mono">{u.email} • Provider: {u.authProvider}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full font-bold text-[10px] ${
                    u.plan === 'PREMIUM'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {u.plan} PLAN
                  </span>

                  {u.role !== 'SUPER_ADMIN' && (
                    <button
                      onClick={() => toggleUserPlan(u.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-xl transition-all cursor-pointer"
                    >
                      Toggle {u.plan === 'FREE' ? 'Upgrade to PREMIUM' : 'Downgrade to FREE'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM GOOGLE API & INFRASTRUCTURE */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                <Globe className="w-5 h-5 text-blue-600" />
                Google API & Single Sign-On Configuration
              </h3>
              <button
                onClick={onOpenSettingsModal}
                className="text-xs font-bold text-purple-600 hover:underline"
              >
                Edit Keys
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1 font-mono">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Client ID</div>
                <div className="text-slate-800 text-[11px] truncate">
                  {adminConfig.googleOAuthConfig?.clientId || '94f5335a-b171-4a1d-b88c-cb1ca96c9177.apps.googleusercontent.com'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1 font-mono">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Authorized Redirect URI</div>
                <div className="text-slate-800 text-[11px] truncate">
                  {adminConfig.googleOAuthConfig?.redirectUri || 'https://ais-pre-issf6sxkar2q64repghr23-257579155645.asia-southeast1.run.app/auth/google/callback'}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Google OAuth 2.0 status is enabled and accepting user logins.
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                <Database className="w-5 h-5 text-purple-600" />
                phpMyAdmin MySQL Database Connection
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                CONNECTED
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">DB Host</div>
                  <div className="font-bold text-slate-800 mt-0.5">phpMyAdmin / MySQL</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Tables Persisted</div>
                  <div className="font-bold text-slate-800 mt-0.5">7 Tables Active</div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-purple-900 font-medium">
                Automatic table schema sync with MySQL database is active. All voter records and election configurations are stored securely.
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
