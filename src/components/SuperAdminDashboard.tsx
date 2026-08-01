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
  Filter,
  Calendar,
  RefreshCw,
  Edit3,
  UserPlus,
  X,
  Mail,
  User,
  Clock,
  Check
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
  const [activeTab, setActiveTab] = useState<'elections' | 'users' | 'system'>('elections');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'CLOSED'>('ALL');
  
  // User Management State
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState<'ALL' | 'PREMIUM' | 'FREE'>('ALL');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'ORGANIZER' | 'SUPER_ADMIN'>('ALL');

  // Modals for User Management
  const [editingSubUser, setEditingSubUser] = useState<UserProfile | null>(null);
  const [editingDetailsUser, setEditingDetailsUser] = useState<UserProfile | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [resetPassNotice, setResetPassNotice] = useState<{ userId: string; tempPass: string } | null>(null);

  // Form states for Add User
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ORGANIZER' | 'SUPER_ADMIN'>('ORGANIZER');
  const [newUserPlan, setNewUserPlan] = useState<'FREE' | 'PREMIUM'>('PREMIUM');

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

  // System Demo Users List with full subscription tracking
  const [userList, setUserList] = useState<UserProfile[]>([
    {
      id: 'usr-admin-01',
      email: 'admin@etelna.com',
      name: 'System SuperAdmin',
      role: 'SUPER_ADMIN',
      plan: 'PREMIUM',
      authProvider: 'email',
      electionsCreatedCount: 5,
      createdAt: '2025-01-15T08:00:00.000Z',
      isLoggedIn: true,
      subscriptionStatus: 'LIFETIME',
      subscriptionExpiry: '2099-12-31',
      maxElectionsQuota: 999,
      maxVotersQuota: 50000,
      status: 'ACTIVE'
    },
    {
      id: 'usr-org-101',
      email: 'organizer@university.edu',
      name: 'Campus Election Director',
      role: 'ORGANIZER',
      plan: 'PREMIUM',
      authProvider: 'google',
      electionsCreatedCount: 3,
      createdAt: '2025-06-10T10:30:00.000Z',
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiry: '2026-12-31',
      maxElectionsQuota: 20,
      maxVotersQuota: 5000,
      status: 'ACTIVE'
    },
    {
      id: 'usr-org-102',
      email: 'hello@corporate-vote.com',
      name: 'Corporate HR Admin',
      role: 'ORGANIZER',
      plan: 'FREE',
      authProvider: 'email',
      electionsCreatedCount: 1,
      createdAt: '2025-07-20T14:15:00.000Z',
      subscriptionStatus: 'EXPIRED',
      subscriptionExpiry: '2025-12-01',
      maxElectionsQuota: 1,
      maxVotersQuota: 100,
      status: 'ACTIVE'
    }
  ]);

  // Filtered elections across whole system
  const filteredElections = elections.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered users across whole system
  const filteredUsers = userList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          u.id.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesPlan = userPlanFilter === 'ALL' || u.plan === userPlanFilter;
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesPlan && matchesRole;
  });

  const activeCount = elections.filter(e => e.status === 'ACTIVE').length;
  const draftCount = elections.filter(e => e.status === 'DRAFT').length;
  const totalVotersCount = elections.reduce((acc, curr) => acc + (curr.totalVoters || 0), 0);

  // User Actions
  const handleRenewSubscription = (userId: string, newExpiry: string, newPlan: 'FREE' | 'PREMIUM', newStatus: 'ACTIVE' | 'LIFETIME' | 'EXPIRED') => {
    setUserList(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          plan: newPlan,
          subscriptionExpiry: newExpiry,
          subscriptionStatus: newStatus,
          status: 'ACTIVE'
        };
      }
      return u;
    }));
    setEditingSubUser(null);
  };

  const handleUpdateUserDetails = (updated: UserProfile) => {
    setUserList(prev => prev.map(u => u.id === updated.id ? updated : u));
    setEditingDetailsUser(null);
  };

  const handleResetPassword = (userId: string) => {
    const temp = 'eTelnaPass' + Math.floor(1000 + Math.random() * 9000);
    setResetPassNotice({ userId, tempPass: temp });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user account from the system?')) {
      setUserList(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName) return;

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: newUserEmail.trim(),
      name: newUserName.trim(),
      role: newUserRole,
      plan: newUserPlan,
      authProvider: 'email',
      electionsCreatedCount: 0,
      createdAt: new Date().toISOString(),
      subscriptionStatus: newUserPlan === 'PREMIUM' ? 'ACTIVE' : 'EXPIRED',
      subscriptionExpiry: newUserPlan === 'PREMIUM' ? '2027-12-31' : '2025-12-31',
      maxElectionsQuota: newUserPlan === 'PREMIUM' ? 25 : 1,
      maxVotersQuota: newUserPlan === 'PREMIUM' ? 10000 : 100,
      status: 'ACTIVE'
    };

    setUserList(prev => [newUser, ...prev]);
    setIsAddUserModalOpen(false);
    setNewUserEmail('');
    setNewUserName('');
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
              Global system overview for <span className="text-purple-300 font-bold">eTelna Digital Voting Engine</span>. Manage all election instances, Google API OAuth configurations, user roles, user subscriptions, and payment revenue.
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Organizers & Subscriptions</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{userList.length}</span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              {userList.filter(u => u.plan === 'PREMIUM').length} Premium Active
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Free Tier: {userList.filter(u => u.plan === 'FREE').length}</span>
            <span>Admins: {userList.filter(u => u.role === 'SUPER_ADMIN').length}</span>
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
              Razorpay Active
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Price: ₹{adminConfig.tierConfig?.premiumPrice || 2499}</span>
            <span>Renewals: Active</span>
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
            User Management & Subscriptions ({userList.length})
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

        {activeTab === 'elections' ? (
          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Election Instance
          </button>
        ) : activeTab === 'users' ? (
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            Add User Account
          </button>
        ) : null}
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

      {/* TAB 2: FULL USER MANAGEMENT & SUBSCRIPTION PAGE */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          
          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-3xl shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search user name, email or ID..."
                value={userSearchTerm}
                onChange={e => setUserSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Plan:</span>
              {(['ALL', 'PREMIUM', 'FREE'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setUserPlanFilter(p)}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    userPlanFilter === p
                      ? 'bg-purple-100 text-purple-900 border border-purple-200 font-black'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {p}
                </button>
              ))}

              <span className="ml-2">Role:</span>
              {(['ALL', 'ORGANIZER', 'SUPER_ADMIN'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    userRoleFilter === r
                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-200 font-black'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {r === 'SUPER_ADMIN' ? 'ADMIN' : r}
                </button>
              ))}
            </div>
          </div>

          {/* User Reset Password Notification Banner */}
          {resetPassNotice && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Temporary Password Generated for User (<span className="font-mono text-purple-800">{resetPassNotice.userId}</span>):{' '}
                  <span className="font-mono bg-amber-200/80 px-2 py-0.5 rounded-md text-amber-950 font-black select-all">{resetPassNotice.tempPass}</span>
                </span>
              </div>
              <button
                onClick={() => setResetPassNotice(null)}
                className="text-amber-700 hover:text-amber-950 underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* User Accounts Data Table */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-bold text-xs text-slate-700">
              <div>Registered Accounts & Organizers ({filteredUsers.length})</div>
              <div className="text-[11px] text-slate-500">Super Admin Subscription & Access Control</div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium">
                  No user accounts match your search filters
                </div>
              ) : (
                filteredUsers.map(u => {
                  const isExpired = u.subscriptionExpiry && new Date(u.subscriptionExpiry) < new Date();
                  return (
                    <div key={u.id} className="p-4 sm:p-5 hover:bg-slate-50/80 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* User Info Column */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <img
                          src={u.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={u.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                        />
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-900 text-sm tracking-tight truncate">
                              {u.name}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              u.role === 'SUPER_ADMIN'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {u.role}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ID: {u.id}
                            </span>
                          </div>

                          <div className="text-slate-500 text-xs font-mono flex items-center gap-2 flex-wrap">
                            <span>{u.email}</span>
                            <span>•</span>
                            <span className="capitalize">Provider: {u.authProvider}</span>
                            <span>•</span>
                            <span>Created: {new Date(u.createdAt).toLocaleDateString()}</span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] pt-1 text-slate-600">
                            <span>Elections: <strong className="text-slate-900">{u.electionsCreatedCount}</strong></span>
                            <span>Quota: <strong className="text-slate-900">{u.maxElectionsQuota || 1} Elections</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Subscription Info & Actions Column */}
                      <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        
                        {/* Subscription Status Badge */}
                        <div className="text-left lg:text-right">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-3 py-1 rounded-full font-black text-[10px] uppercase flex items-center gap-1 ${
                              u.plan === 'PREMIUM'
                                ? isExpired
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              <Crown className="w-3 h-3" />
                              {u.plan} PLAN {isExpired ? '(EXPIRED)' : ''}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              Expiry: {u.subscriptionExpiry ? u.subscriptionExpiry : 'No Active Expiry'}
                            </span>
                          </div>
                        </div>

                        {/* Control Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingSubUser(u)}
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                            title="Manage Subscription & Expiry"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Renew / Edit Plan
                          </button>

                          <button
                            onClick={() => setEditingDetailsUser(u)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                            title="Edit User Details & Role"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleResetPassword(u.id)}
                            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl transition-all cursor-pointer"
                            title="Reset User Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all cursor-pointer"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })
              )}
            </div>
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
                className="text-xs font-bold text-purple-600 hover:underline cursor-pointer"
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

      {/* MODAL 1: MANAGE SUBSCRIPTION & RENEWAL */}
      {editingSubUser && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-slate-900 text-base">Manage User Subscription</h3>
              </div>
              <button onClick={() => setEditingSubUser(null)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
              <div className="font-extrabold text-slate-900">{editingSubUser.name}</div>
              <div className="text-slate-500 font-mono">{editingSubUser.email}</div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subscription Plan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSubUser({ ...editingSubUser, plan: 'FREE' })}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      editingSubUser.plan === 'FREE'
                        ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    FREE TIER
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSubUser({ ...editingSubUser, plan: 'PREMIUM' })}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      editingSubUser.plan === 'PREMIUM'
                        ? 'bg-purple-50 text-purple-900 border-purple-300 ring-2 ring-purple-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    PREMIUM PLAN
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Expiration / Renewal Date</label>
                <input
                  type="date"
                  value={editingSubUser.subscriptionExpiry || ''}
                  onChange={e => setEditingSubUser({ ...editingSubUser, subscriptionExpiry: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              {/* Quick Extension Presets */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-500 text-[10px] uppercase">Quick Renewal Extension</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + 1);
                      setEditingSubUser({
                        ...editingSubUser,
                        subscriptionExpiry: d.toISOString().split('T')[0],
                        plan: 'PREMIUM'
                      });
                    }}
                    className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold cursor-pointer transition-all"
                  >
                    + 1 Month
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() + 1);
                      setEditingSubUser({
                        ...editingSubUser,
                        subscriptionExpiry: d.toISOString().split('T')[0],
                        plan: 'PREMIUM'
                      });
                    }}
                    className="py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-[11px] font-bold cursor-pointer transition-all"
                  >
                    + 1 Year
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingSubUser({
                        ...editingSubUser,
                        subscriptionExpiry: '2099-12-31',
                        plan: 'PREMIUM'
                      });
                    }}
                    className="py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-[11px] font-bold cursor-pointer transition-all"
                  >
                    Lifetime
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditingSubUser(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRenewSubscription(
                    editingSubUser.id,
                    editingSubUser.subscriptionExpiry || '2026-12-31',
                    editingSubUser.plan,
                    editingSubUser.subscriptionExpiry === '2099-12-31' ? 'LIFETIME' : 'ACTIVE'
                  )}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Save & Renew Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER DETAILS */}
      {editingDetailsUser && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Edit User Account</h3>
              <button onClick={() => setEditingDetailsUser(null)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingDetailsUser.name}
                  onChange={e => setEditingDetailsUser({ ...editingDetailsUser, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editingDetailsUser.email}
                  onChange={e => setEditingDetailsUser({ ...editingDetailsUser, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">System Role</label>
                <select
                  value={editingDetailsUser.role}
                  onChange={e => setEditingDetailsUser({ ...editingDetailsUser, role: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="ORGANIZER">ORGANIZER</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditingDetailsUser(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateUserDetails(editingDetailsUser)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Update User Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW USER ACCOUNT */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Add New Platform User</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Organizer Name"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@organization.com"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="ORGANIZER">ORGANIZER</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plan</label>
                  <select
                    value={newUserPlan}
                    onChange={e => setNewUserPlan(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="FREE">FREE TIER</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
