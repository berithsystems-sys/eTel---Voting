import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, AdminTab, SettingsSubTab } from './components/Sidebar';
import { OverviewTab } from './components/OverviewTab';
import { ResultsTab } from './components/ResultsTab';
import { FraudAnalysisTab } from './components/FraudAnalysisTab';
import { VotersTab } from './components/VotersTab';
import { BallotTab } from './components/BallotTab';
import { AddonsTab } from './components/AddonsTab';
import { SettingsTab } from './components/SettingsTab';
import { VoterPortal } from './components/VoterPortal';
import { LandingPage } from './components/LandingPage';
import { CpanelGuideModal } from './components/CpanelGuideModal';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { AdminTierSettingsModal } from './components/AdminTierSettingsModal';
import { AdminLoginGuard } from './components/AdminLoginGuard';
import { ElectionManagerHeader } from './components/ElectionManagerHeader';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';

import { ExternalLink, Vote } from 'lucide-react';
import { Election, Voter, AuditLog, UserProfile, AdminTierConfig, PaymentGatewayConfig } from './types';
import {
  fetchElection,
  fetchElections,
  createNewElection,
  deleteElectionApi,
  updateElection,
  duplicateElection,
  fetchVoters,
  addVoters,
  deleteVoter,
  fetchAuditLogs,
  fetchAuthMe,
  logoutUser
} from './services/api';

export default function App() {
  const [activeView, setActiveView] = useState<'landing' | 'admin' | 'voter'>('landing');

  const changeView = (newView: 'landing' | 'admin' | 'voter') => {
    setActiveView(newView);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', newView);
      window.history.pushState({}, '', url.toString());
    } catch (e) {}
  };
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('overview');
  const [activeSettingsSubTab, setActiveSettingsSubTab] = useState<SettingsSubTab>('general');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCpanelGuideOpen, setIsCpanelGuideOpen] = useState(false);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAdminSettingsModalOpen, setIsAdminSettingsModalOpen] = useState(false);
  const [isSuperAdminMasterMode, setIsSuperAdminMasterMode] = useState(true);

  // Auth & Tier State
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'guest',
    email: '',
    name: 'Guest Visitor',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'ORGANIZER',
    plan: 'FREE',
    authProvider: 'email',
    electionsCreatedCount: 0,
    createdAt: new Date().toISOString(),
    isLoggedIn: false
  });

  const [tierConfig, setTierConfig] = useState<AdminTierConfig>({
    freeMaxCandidates: 10,
    freeMaxElections: 1,
    premiumPrice: 2499,
    currency: 'INR',
    pricingPeriod: 'LIFETIME'
  });

  const [paymentGateway, setPaymentGateway] = useState<Partial<PaymentGatewayConfig>>({
    provider: 'razorpay',
    publishableKey: 'rzp_test_eTelnaLive9918237',
    mode: 'test',
    isEnabled: true,
    currency: 'INR'
  });

  // App Data State
  const [elections, setElections] = useState<Election[]>([]);
  const [election, setElection] = useState<Election | null>(null);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load backend data on mount
  const loadData = async (targetId?: string) => {
    try {
      const [allEls, vtrData, logsData, authData] = await Promise.all([
        fetchElections(),
        fetchVoters(),
        fetchAuditLogs(),
        fetchAuthMe()
      ]);
      setElections(allEls);

      const queryParams = new URLSearchParams(window.location.search);
      const urlElectionId = targetId || queryParams.get('electionId');
      
      let activeEl = allEls.find(e => e.id === urlElectionId) || allEls[0];
      if (!activeEl && urlElectionId) {
        try {
          activeEl = await fetchElection(urlElectionId);
        } catch (e) {}
      }
      setElection(activeEl || allEls[0] || null);

      setVoters(vtrData);
      setAuditLogs(logsData);
      if (authData.user) setCurrentUser(authData.user);
      if (authData.tierConfig) setTierConfig(authData.tierConfig);
      if (authData.paymentGateway) setPaymentGateway(authData.paymentGateway);
    } catch (err) {
      console.error('Error loading backend data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('electionId') || undefined;
    loadData(targetId);

    // Check if view URL parameter is present
    const viewParam = params.get('view');
    if (viewParam === 'voter' || viewParam === 'admin' || viewParam === 'landing') {
      setActiveView(viewParam);
    } else if (params.get('vote') === 'true' || params.get('electionId')) {
      setActiveView('voter');
    } else {
      setActiveView('landing');
    }
  }, []);

  const handleSelectElection = async (id: string) => {
    setIsLoading(true);
    try {
      const el = await fetchElection(id);
      setElection(el);
    } catch (e) {
      const found = elections.find(x => x.id === id);
      if (found) setElection(found);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateElection = async (data: { title: string; description?: string; startDate?: string; endDate?: string; timezone?: string }) => {
    try {
      const res = await createNewElection(data);
      setElections(res.elections);
      setElection(res.election);
      alert(`Election "${res.election.title}" created successfully!`);
    } catch (err: any) {
      if (err.message && err.message.includes('Free Plan Limit Reached')) {
        setIsPaymentModalOpen(true);
      } else {
        alert(err.message || 'Failed to create election');
      }
    }
  };

  const handleDeleteElection = async (id: string) => {
    try {
      const res = await deleteElectionApi(id);
      setElections(res.elections);
      if (res.elections.length > 0) {
        setElection(res.elections[0]);
      }
      alert('Election deleted successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to delete election');
    }
  };

  const handleUpdateElection = async (updatedFields: Partial<Election>) => {
    try {
      const res = await updateElection(updatedFields);
      setElection(res.election);
      setElections(prev => prev.map(e => e.id === res.election.id ? res.election : e));
    } catch (err: any) {
      if (err.message && err.message.includes('Free Plan Limit Reached')) {
        setIsPaymentModalOpen(true);
      } else {
        alert(err.message || 'Failed to update election');
      }
    }
  };

  const handleUpdateSettings = async (settingsPartial: Partial<Election['settings']>) => {
    if (!election) return;
    const newSettings = { ...election.settings, ...settingsPartial };
    await handleUpdateElection({ settings: newSettings });
  };

  const handleDuplicateElection = async () => {
    try {
      const res = await duplicateElection();
      setElection(res.election);
      await loadData();
      alert('Election duplicated successfully as a new template!');
      setActiveAdminTab('overview');
    } catch (err: any) {
      if (err.message && err.message.includes('Free Plan One-Time Election Limit Reached')) {
        setIsPaymentModalOpen(true);
      } else {
        alert(err.message || 'Failed to duplicate election');
      }
    }
  };

  const handleAddVoters = async (newVotersList: Partial<Voter>[]) => {
    try {
      const res = await addVoters(newVotersList);
      setVoters(res.voters);
      const logs = await fetchAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      alert('Failed to add voters');
    }
  };

  const handleDeleteVoter = async (voterId: string) => {
    try {
      const res = await deleteVoter(voterId);
      setVoters(res.voters);
    } catch (err) {
      alert('Failed to delete voter');
    }
  };

  const handleStatusChange = async (newStatus: 'Draft' | 'Active' | 'Completed') => {
    await handleUpdateElection({ status: newStatus });
  };

  const handleLogout = async () => {
    try {
      const res = await logoutUser();
      setCurrentUser(res.user);
    } catch (err) {
      setCurrentUser({
        ...currentUser,
        isLoggedIn: false
      });
    }
  };

  if (isLoading || !election) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm font-semibold tracking-wider text-slate-300">
          Loading eTelna Platform...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Top Main Navbar */}
      <Navbar
        election={election}
        activeView={activeView}
        setActiveView={changeView}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenPaymentModal={() => {
          if (!currentUser.isLoggedIn) {
            setIsAuthModalOpen(true);
          } else {
            setIsPaymentModalOpen(true);
          }
        }}
        onOpenAdminSettingsModal={() => {
          if (!currentUser.isLoggedIn) {
            setIsAuthModalOpen(true);
          } else {
            setIsAdminSettingsModalOpen(true);
          }
        }}
        onLogout={handleLogout}
      />

      {/* VIEW SWITCH: LANDING PAGE HUB */}
      {activeView === 'landing' ? (
        <LandingPage
          election={election}
          currentUser={currentUser}
          tierConfig={tierConfig}
          onSelectVoterPortal={() => changeView('voter')}
          onSelectOrganizerPortal={() => {
            if (!currentUser.isLoggedIn) {
              setIsAuthModalOpen(true);
            } else {
              changeView('admin');
            }
          }}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
        />
      ) : activeView === 'voter' ? (
        /* VIEW SWITCH: PUBLIC VOTER PORTAL */
        <VoterPortal
          election={election}
          sampleVoters={voters}
          onBackToAdmin={() => changeView('admin')}
        />
      ) : !currentUser.isLoggedIn ? (
        /* VIEW SWITCH: ADMIN LOGIN GUARD */
        <AdminLoginGuard
          onLoginSuccess={(updatedUser) => {
            setCurrentUser(updatedUser);
            setActiveAdminTab('overview');
          }}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onBackToLanding={() => changeView('landing')}
        />
      ) : (

        /* VIEW SWITCH: ADMIN DASHBOARD (AUTHENTICATED ONLY) */
        <div className="flex-1 flex w-full max-w-7xl mx-auto min-h-0">
          
          {/* If Super Admin Master Mode is enabled, render dedicated SuperAdminDashboard */}
          {currentUser.role === 'SUPER_ADMIN' && isSuperAdminMasterMode ? (
            <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              <SuperAdminDashboard
                currentUser={currentUser}
                elections={elections}
                onSelectElection={(id) => {
                  handleSelectElection(id);
                  setIsSuperAdminMasterMode(false);
                }}
                onOpenSettingsModal={() => setIsAdminSettingsModalOpen(true)}
                onOpenCreateModal={handleCreateElection}
                onDeleteElection={handleDeleteElection}
                onSwitchToOrganizerMode={() => setIsSuperAdminMasterMode(false)}
              />
            </div>
          ) : (
            <>
              {/* Admin Sidebar Navigation */}
              <Sidebar
                activeTab={activeAdminTab}
                setActiveTab={setActiveAdminTab}
                activeSettingsSubTab={activeSettingsSubTab}
                setActiveSettingsSubTab={setActiveSettingsSubTab}
                election={election}
                isMobileOpen={isMobileSidebarOpen}
                setIsMobileOpen={setIsMobileSidebarOpen}
                currentUser={currentUser}
                onOpenSuperAdminPanel={() => setIsAdminSettingsModalOpen(true)}
              />

              {/* Right Column Content Area: Main Content + Bottom Footer */}
              <div className="flex-1 min-w-0 flex flex-col min-h-0 w-full">
                <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto block">
                  
                  {/* Multi-Election Manager Control Bar */}
                  <div className="space-y-3 mb-6">
                    {currentUser.role === 'SUPER_ADMIN' && (
                      <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-2xl">
                        <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                          You are currently in Election Organizer View.
                        </div>
                        <button
                          onClick={() => setIsSuperAdminMasterMode(true)}
                          className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          Return to Super Admin Dashboard
                        </button>
                      </div>
                    )}

                    <ElectionManagerHeader
                      elections={elections}
                      activeElection={election}
                      onSelectElection={handleSelectElection}
                      onCreateElection={handleCreateElection}
                      onUpdateElection={handleUpdateElection}
                      onDeleteElection={handleDeleteElection}
                      onOpenVoterPortal={() => changeView('voter')}
                    />
                  </div>

              {/* Mobile Sidebar Toggle Button */}
              <div className="lg:hidden mb-4 flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 capitalize">
                  Tab: {activeAdminTab} {activeAdminTab === 'settings' ? `(${activeSettingsSubTab})` : ''}
                </span>
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold"
                >
                  Menu Navigation
                </button>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeAdminTab === 'overview' && (
                <OverviewTab
                  election={election}
                  voters={voters}
                  auditLogs={auditLogs}
                  onUpdateStatus={handleStatusChange}
                  onNavigateTab={(tab) => {
                    if (tab === 'settings') {
                      setActiveAdminTab('settings');
                    } else {
                      setActiveAdminTab(tab);
                    }
                  }}
                  onSwitchToVoterView={() => setActiveView('voter')}
                />
              )}

              {/* TAB 2: RESULTS */}
              {activeAdminTab === 'results' && (
                <ResultsTab
                  election={election}
                  onUpdateSettings={handleUpdateSettings}
                />
              )}

              {/* TAB 3: FRAUD ANALYSIS */}
              {activeAdminTab === 'fraud' && (
                <FraudAnalysisTab
                  auditLogs={auditLogs}
                />
              )}

              {/* TAB 4: VOTERS */}
              {activeAdminTab === 'voters' && (
                <VotersTab
                  voters={voters}
                  onAddVoters={handleAddVoters}
                  onDeleteVoter={handleDeleteVoter}
                />
              )}

              {/* TAB 5: BALLOT */}
              {activeAdminTab === 'ballot' && (
                <BallotTab
                  election={election}
                  onUpdateElection={handleUpdateElection}
                  currentUser={currentUser}
                  tierConfig={tierConfig}
                  onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
                />
              )}

              {/* TAB 6: ADD-ONS */}
              {activeAdminTab === 'addons' && (
                <AddonsTab
                  currentUser={currentUser}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  onOpenCpanelModal={() => setIsCpanelGuideOpen(true)}
                />
              )}

              {/* TAB 7: SETTINGS */}
              {activeAdminTab === 'settings' && (
                <SettingsTab
                  election={election}
                  activeSubTab={activeSettingsSubTab}
                  setActiveSubTab={setActiveSettingsSubTab}
                  onUpdateElection={handleUpdateElection}
                  onDuplicateElection={handleDuplicateElection}
                  currentUser={currentUser}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                />
              )}

            </main>

            {/* Admin Dashboard Footer */}
            <footer className="py-5 px-6 border-t border-slate-200 bg-white text-slate-600 text-xs mt-auto shrink-0 w-full">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Vote className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-900">eTelna Organizer Console</span>
                  <span className="text-slate-400">•</span>
                  <span>Audit-Ready Election Engine</span>
                </div>

                <div className="flex items-center gap-1 text-slate-700 font-medium">
                  <span>Powered by:</span>
                  <a
                    href="https://BerithSystems.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-black text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <span>BerithSystems.com</span>
                    <ExternalLink className="w-3 h-3 text-indigo-500" />
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </>
      )}
    </div>
  )}

      {/* cPanel Deployment Guide Modal */}
      <CpanelGuideModal
        isOpen={isCpanelGuideOpen}
        onClose={() => setIsCpanelGuideOpen(false)}
      />

      {/* Auth Modal (Email / Password & Google Login) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(updatedUser) => setCurrentUser(updatedUser)}
        onLogout={handleLogout}
      />

      {/* Payment Gateway Upgrade Checkout Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        currentUser={currentUser}
        tierConfig={tierConfig}
        paymentGateway={paymentGateway}
        onPaymentSuccess={(upgradedUser) => setCurrentUser(upgradedUser)}
      />

      {/* Super Admin Control Panel Modal */}
      <AdminTierSettingsModal
        isOpen={isAdminSettingsModalOpen}
        onClose={() => setIsAdminSettingsModalOpen(false)}
        onConfigUpdated={loadData}
      />

    </div>
  );
}
