import React from 'react';
import { Vote, Shield, Smartphone, Server, CheckCircle2, Clock, Crown, User, LogIn, Sparkles, Home } from 'lucide-react';
import { Election, UserProfile } from '../types';

interface NavbarProps {
  election: Election;
  activeView: 'landing' | 'admin' | 'voter';
  setActiveView: (view: 'landing' | 'admin' | 'voter') => void;
  onOpenCpanelModal: () => void;
  currentUser: UserProfile;
  onOpenAuthModal: () => void;
  onOpenPaymentModal: () => void;
  onOpenAdminSettingsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  election,
  activeView,
  setActiveView,
  onOpenCpanelModal,
  currentUser,
  onOpenAuthModal,
  onOpenPaymentModal,
  onOpenAdminSettingsModal
}) => {
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
        
        {/* Brand & Election Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-bold text-lg">
            <Vote className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                e<span className="text-indigo-600 font-black">Telna</span>
              </span>
              <span className="hidden md:inline-block text-slate-300">|</span>
              <span className="hidden md:inline-block font-medium text-slate-700 text-sm max-w-[180px] lg:max-w-[280px] truncate">
                {election.title}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {getStatusBadge()}
              <span className="text-xs text-slate-500 hidden sm:inline">
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
              <span className="hidden sm:inline">Admin</span> Dashboard
            </button>
          </div>

          {/* Upgrade Button (if Free plan) */}
          {currentUser.role === 'ORGANIZER' && currentUser.plan === 'FREE' && (
            <button
              onClick={onOpenPaymentModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs hover:shadow-md transition-all animate-pulse"
              title="Upgrade to eTelna Premium"
            >
              <Crown className="w-3.5 h-3.5" />
              Upgrade to Premium
            </button>
          )}

          {/* Super Admin Control Panel Trigger */}
          {currentUser.role === 'SUPER_ADMIN' && (
            <button
              onClick={onOpenAdminSettingsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-100 text-purple-800 hover:bg-purple-200 transition-all border border-purple-200"
              title="Super Admin Controls"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Admin</span> Controls
            </button>
          )}

          {/* User Auth Profile Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
            title="Account & Auth"
          >
            <img
              src={currentUser.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover"
            />
            <div className="hidden sm:block text-left text-xs leading-tight">
              <div className="font-bold text-slate-900 max-w-[90px] truncate">{currentUser.name}</div>
              <div className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                {currentUser.role === 'SUPER_ADMIN' ? 'Admin' : `${currentUser.plan}`}
              </div>
            </div>
          </button>

          {/* cPanel / Hostinger Hosting Button */}
          <button
            id="nav-btn-cpanel"
            onClick={onOpenCpanelModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs"
            title="cPanel / hPanel Deployment Instructions"
          >
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline">cPanel / Hostinger</span> Deploy
          </button>

        </div>

      </div>
    </header>
  );
};

