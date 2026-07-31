import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, KeyRound, LogIn } from 'lucide-react';
import { loginEmail } from '../services/api';
import { UserProfile } from '../types';

interface AdminLoginGuardProps {
  onLoginSuccess: (user: UserProfile) => void;
  onOpenAuthModal?: () => void;
  onBackToLanding: () => void;
}

export const AdminLoginGuard: React.FC<AdminLoginGuardProps> = ({
  onLoginSuccess,
  onOpenAuthModal,
  onBackToLanding
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginEmail(email.trim(), password, false);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-900 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-md">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
            <Lock className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Admin Login
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            Log in with your administrator credentials to access the organizer dashboard.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">Email or Username</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Enter email or username"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1.5">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-indigo-600/30"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {onOpenAuthModal && (
          <div className="text-center">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
            >
              Or use Google / Email Sign Up Modal
            </button>
          </div>
        )}

        {/* Back to Public Portal Button */}
        <div className="pt-2 text-center border-t border-slate-700/60">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Portal Hub</span>
          </button>
        </div>

      </div>
    </div>
  );
};
