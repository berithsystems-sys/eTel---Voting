import React from 'react';
import { Vote, Shield, Smartphone, CheckCircle2, Clock, Crown, LogIn, Sparkles, Home, RefreshCw } from 'lucide-react';
import { Election, UserProfile } from '../types';

interface NavbarProps {
  election: Election;
  activeView: 'landing' | 'admin' | 'voter';
  setActiveView: (view: 'landing' | 'admin' | 'voter') => void;
  onOpenCpanelModal?: () => void;
  currentUser: UserProfile;
  onOpenAuthModal: () => void;
  onOpenPaymentModal: () => void;
  onOpenAdminSettingsModal: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  election,
  activeView,
  setActiveView,
  currentUser,
  onOpenAuthModal,
  onOpenPaymentModal,
  onOpenAdminSettingsModal,
  onLogout
}) => {
  const handleClearCacheAndReload = () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const getStatusBadge = () => {
    switch (election.status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active Election
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 border border-sky-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Draft Mode
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Permanent Brand & Platform Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-bold text-lg">
            <Vote className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                e<span className="text-indigo-600 font-black">Telna</span>
              </span>
              <span className="hidden sm:inline-block text-slate-300 font-light">|</span>
              <span className="hidden sm:inline-block font-bold text-slate-700 text-xs sm:text-sm tracking-tight">
                Digital Voting Engine
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {getStatusBadge()}
              <span className="text-[11px] font-bold text-slate-600 max-w-[150px] sm:max-w-[220px] md:max-w-[280px] truncate bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60" title={election.title}>
                {election.title}
              </span>
              <span className="text-xs text-slate-500 hidden md:inline">
                {election.timezone}
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              id="nav-btn-landing"
              onClick={() => setActiveView('landing')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'landing'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Portal Landing Page"
            >
              <Home className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Portal Hub</span>
            </button>

            <button
              id="nav-btn-voter"
              onClick={() => setActiveView('voter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'voter'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voter</span> Ballot
            </button>

            {currentUser.isLoggedIn && (
              <button
                id="nav-btn-admin"
                onClick={() => setActiveView('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'admin'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Organizer</span> Dashboard
              </button>
            )}
          </div>

          {/* Upgrade Button (if Free plan and logged in) */}
          {currentUser.isLoggedIn && currentUser.role === 'ORGANIZER' && currentUser.plan === 'FREE' && (
            <button
              onClick={onOpenPaymentModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs hover:shadow-md transition-all animate-pulse"
              title="Upgrade to eTelna Premium"
            >
              <Crown className="w-3.5 h-3.5" />
              Upgrade to Premium
            </button>
          )}

          {/* Clear Cache & Hard Refresh Button */}
          <button
            type="button"
            onClick={handleClearCacheAndReload}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1 font-bold"
            title="Clear Cache & Hard Reload Latest Code"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Clear Cache</span>
          </button>

          {/* User Auth Profile / Login Button */}
          {currentUser.isLoggedIn ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
                title="Account Settings"
              >
                <img
                  src={currentUser.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div className="hidden sm:block text-left text-xs leading-tight">
                  <div className="font-bold text-slate-900 max-w-[90px] truncate">{currentUser.name}</div>
                  <div className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                    {currentUser.plan} PLAN
                  </div>
                </div>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                  title="Sign Out"
                >
                  Sign Out
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

