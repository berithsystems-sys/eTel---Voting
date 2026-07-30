import React from 'react';
import {
  Vote,
  ShieldCheck,
  Crown,
  KeyRound,
  Lock,
  Zap,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Server,
  Building2,
  Globe,
  ExternalLink,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { Election, UserProfile, AdminTierConfig } from '../types';

interface LandingPageProps {
  election: Election;
  currentUser: UserProfile;
  tierConfig: AdminTierConfig;
  onSelectVoterPortal: () => void;
  onSelectOrganizerPortal: () => void;
  onOpenAuthModal: () => void;
  onOpenPaymentModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  election,
  currentUser,
  tierConfig,
  onSelectVoterPortal,
  onSelectOrganizerPortal,
  onOpenAuthModal,
  onOpenPaymentModal
}) => {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const voterPortalLink = `${currentOrigin}/?view=voter`;
  const adminPortalLink = `${currentOrigin}/?view=admin`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Landing Top Navigation Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-black">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                e<span className="text-indigo-600">Telna</span>
              </span>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block -mt-1">
                Voting Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <button
              onClick={onSelectVoterPortal}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-indigo-700 border border-slate-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>Voter Ballot Portal</span>
            </button>

            <button
              onClick={onSelectOrganizerPortal}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Organizer & Admin Dashboard</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8 overflow-hidden">
        
        {/* Soft Glowing Ambient Background FX */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-200/40 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Next-Generation Cryptographic Online Voting Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Secure, Audit-Ready Elections for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600">Organizations & Trade Unions</span>
        </h1>

        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          eTelna powers transparent digital voting with SHA-256 verifiable ballot receipts, weighted voting, and dual-tier management for Free and Premium organizers.
        </p>

        {/* Portal Direct Selection Cards */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
          
          {/* CARD 1: VOTER BALLOT PORTAL */}
          <div className="group bg-white hover:border-indigo-400 border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/60 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <KeyRound className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  Voter Direct Link
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Voter Ballot Login Portal
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Cast your confidential ballot using your unique Voter ID and secret Voter Key. Instant cryptographic receipt provided.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[11px] font-mono text-slate-600 flex items-center justify-between gap-2">
                <span className="truncate">{voterPortalLink}</span>
                <button
                  onClick={() => copyToClipboard(voterPortalLink, 'Voter Link')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-xs text-slate-800 border border-slate-200 rounded-lg font-sans font-bold shadow-xs shrink-0 cursor-pointer"
                >
                  Copy Link
                </button>
              </div>
            </div>

            <button
              onClick={onSelectVoterPortal}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Access Voter Ballot Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* CARD 2: ORGANIZER & ADMIN DASHBOARD */}
          <div className="group bg-white hover:border-purple-400 border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/60 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                  Organizer Link
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">
                  Organizer & Admin Dashboard
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Setup ballot questions, candidate profiles, import voters list, view real-time vote analytics, and audit fraud logs.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[11px] font-mono text-slate-600 flex items-center justify-between gap-2">
                <span className="truncate">{adminPortalLink}</span>
                <button
                  onClick={() => copyToClipboard(adminPortalLink, 'Admin Link')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-xs text-slate-800 border border-slate-200 rounded-lg font-sans font-bold shadow-xs shrink-0 cursor-pointer"
                >
                  Copy Link
                </button>
              </div>
            </div>

            <button
              onClick={onSelectOrganizerPortal}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Organizer Control Panel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </section>

      {/* PLAN COMPARISON & FEATURES SECTION */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Flexible Organizer Tiers</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Super admins can configure Free plan candidate limits and online payment gateways directly from the management console.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* FREE PLAN */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 space-y-6 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 uppercase tracking-widest">
                  eTelna Free Starter
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">₹0</div>
                  <div className="text-xs text-slate-500 mt-1">Free Forever for Small Elections</div>
                </div>

                <ul className="space-y-3 text-xs text-slate-700 pt-2">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Up to <strong>{tierConfig.freeMaxCandidates} Candidate Options</strong> per ballot</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Allowed <strong>{tierConfig.freeMaxElections} Election Setup</strong> (One-time only)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cryptographic Ballot Receipts</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Email Voter Login Credentials</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onSelectOrganizerPortal}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer"
              >
                Start Free Election
              </button>
            </div>

            {/* PREMIUM PLAN */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 rounded-3xl p-8 border border-indigo-500/50 shadow-2xl space-y-6 flex flex-col justify-between relative overflow-hidden text-white">
              
              <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
                Unlimited Pro
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-widest">
                  <Crown className="w-3.5 h-3.5" />
                  eTelna Premium Tier
                </div>
                <div>
                  <div className="text-3xl font-black text-white flex items-baseline gap-1">
                    <span>{tierConfig.currency === 'USD' ? '$' : '₹'}{tierConfig.premiumPrice.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-indigo-200 font-normal">/ {tierConfig.pricingPeriod.toLowerCase()}</span>
                  </div>
                  <div className="text-xs text-indigo-200 mt-1">Full-Featured Corporate & Institutional Tier</div>
                </div>

                <ul className="space-y-3 text-xs text-slate-200 pt-2">
                  <li className="flex items-center gap-2.5 font-bold text-amber-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>UNLIMITED Candidates</strong> (No 10 limit)</span>
                  </li>
                  <li className="flex items-center gap-2.5 font-bold text-amber-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>UNLIMITED Elections</strong> (No 1 limit)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Weighted Voting Power Calculations</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Custom Subdomain & cPanel Hosting Package</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onOpenPaymentModal}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Premium ({tierConfig.currency === 'USD' ? '$' : '₹'}{tierConfig.premiumPrice})
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Bright Footer with Always Visible 'Powered by: BerithSystems.com' on the right side */}
      <footer className="py-6 border-t border-slate-200 bg-white text-slate-600 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Vote className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-900">eTelna Online Voting Engine</span>
            <span className="text-slate-400">•</span>
            <span>Cryptographically Secure</span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-500 hidden sm:inline">© 2026 eTelna Systems Inc.</span>
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
  );
};

