import React, { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { UserProfile } from '../types';
import { loginEmail, loginGoogle, switchRole } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onAuthSuccess: (user: UserProfile) => void;
  onLogout?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout
}) => {
  const [authTab, setAuthTab] = useState<'email' | 'google'>('email');
  const [isSignUp, setIsSignUp] = useState(false);

  // Email form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginEmail(email.trim(), password, isSignUp, name);
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
              <div className="font-extrabold text-slate-900 truncate">
                {currentUser.isLoggedIn ? currentUser.name : 'Guest Visitor (Not Logged In)'}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {currentUser.isLoggedIn ? currentUser.email : 'Log in to access Admin features'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUser.isLoggedIn ? (
              <>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  currentUser.role === 'SUPER_ADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : currentUser.plan === 'PREMIUM'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {currentUser.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : `${currentUser.plan} ORGANIZER`}
                </span>
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-[10px] transition-all cursor-pointer border border-red-200"
                  >
                    Sign Out
                  </button>
                )}
              </>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                GUEST
              </span>
            )}
          </div>
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
            {isSignUp && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
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
                  placeholder="Enter email or username"
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
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!googleEmail) return;
            setIsLoading(true);
            setErrorMsg(null);
            try {
              const gName = googleEmail.split('@')[0] || 'Google User';
              const res = await loginGoogle(googleEmail.trim(), gName);
              onAuthSuccess(res.user);
              onClose();
            } catch (err: any) {
              setErrorMsg(err.message || 'Google Auth failed');
            } finally {
              setIsLoading(false);
            }
          }} className="space-y-4 text-xs">
            <p className="text-slate-500 leading-relaxed">
              Authenticate using your Google Workspace or Gmail account:
            </p>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Google Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={googleEmail}
                  onChange={e => setGoogleEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isLoading ? 'Connecting Google Account...' : 'Continue with Google'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
