import React, { useState } from 'react';
import { X, Mail, Lock, User, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { loginEmail, loginGoogle, switchRole } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess
}) => {
  const [authTab, setAuthTab] = useState<'email' | 'google'>('email');
  const [isSignUp, setIsSignUp] = useState(false);

  // Email form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mock Google Accounts for One-Tap speed testing
  const mockGoogleAccounts = [
    {
      name: 'Sarah Jenkins',
      email: 'sarah.j@gmail.com',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'David Miller',
      email: 'dmiller.tech@gmail.com',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'Elena Rostova',
      email: 'elena.rostova@gmail.com',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }
  ];

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginEmail(email.trim(), password, 'ORGANIZER');
      onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSelect = async (gName: string, gEmail: string, gPhoto: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await loginGoogle(gEmail, gName, gPhoto);
      onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Auth failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRoleSwitch = async (role: 'ORGANIZER' | 'SUPER_ADMIN', plan: 'FREE' | 'PREMIUM') => {
    try {
      const res = await switchRole(role, plan);
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      alert('Failed to switch role');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Sign In to <span className="text-indigo-600">eTelna</span>
            </h2>
            <p className="text-xs text-slate-500">Access your Organizer Dashboard & Election Settings</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Login Status Banner */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={currentUser.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0">
              <div className="font-extrabold text-slate-900 truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{currentUser.email}</div>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            currentUser.role === 'SUPER_ADMIN'
              ? 'bg-purple-100 text-purple-800'
              : currentUser.plan === 'PREMIUM'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {currentUser.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : `${currentUser.plan} ORGANIZER`}
          </span>
        </div>

        {/* Tab Switcher: Email vs Google */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setAuthTab('email')}
            className={`py-2 rounded-xl transition-all ${
              authTab === 'email' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Email Sign In / Up
          </button>
          <button
            onClick={() => setAuthTab('google')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authTab === 'google' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Google Auth
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* TAB 1: EMAIL SIGN IN / SIGN UP */}
        {authTab === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-3 text-xs">
            {/* Super Admin Credentials Box */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-extrabold text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Admin Credentials</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@etelna.com');
                    setPassword('admin123');
                    setIsSignUp(false);
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer shadow-xs"
                >
                  Auto-Fill Admin
                </button>
              </div>
              <div className="text-[11px] text-amber-800 space-y-0.5 font-mono bg-white/70 p-2 rounded-xl border border-amber-100">
                <div><span className="font-bold">Email/Username:</span> admin@etelna.com</div>
                <div><span className="font-bold">Password:</span> admin123</div>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email or Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="admin@etelna.com or organizer@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isLoading ? 'Authenticating...' : isSignUp ? 'Create Organizer Account' : 'Sign In'}
            </button>

            <div className="text-center pt-2 text-slate-500">
              <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-indigo-600 font-bold hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up Free'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: GOOGLE SIGN-IN */}
        {authTab === 'google' && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-500 leading-relaxed">
              Authenticate instantly using your Google Account for seamless single sign-on:
            </p>

            <div className="space-y-2">
              {mockGoogleAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGoogleSelect(acc.name, acc.email, acc.photo)}
                  className="w-full p-3 bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-2xl flex items-center justify-between transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <img src={acc.photo} alt={acc.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-slate-900">{acc.name}</div>
                      <div className="text-[11px] text-slate-500">{acc.email}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-indigo-100">
                    Sign In
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SUPER ADMIN & ROLE SWITCHER (For Testing & Demo) */}
        <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl space-y-2 text-xs">
          <div className="font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Role Switcher
            </span>
            <span className="text-[10px] text-slate-400 font-mono">eTelna Auth Engine</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={() => handleQuickRoleSwitch('ORGANIZER', 'FREE')}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl text-[10px] border border-slate-700"
            >
              Free Organizer
            </button>
            <button
              onClick={() => handleQuickRoleSwitch('ORGANIZER', 'PREMIUM')}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-[10px] border border-slate-700"
            >
              Premium Organizer
            </button>
            <button
              onClick={() => handleQuickRoleSwitch('SUPER_ADMIN', 'PREMIUM')}
              className="py-1.5 px-2 bg-purple-900/60 hover:bg-purple-800 text-purple-300 font-bold rounded-xl text-[10px] border border-purple-700/50"
            >
              Super Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
