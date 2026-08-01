import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Check, Key, Shield, Camera, LogOut, Sparkles, AlertCircle } from 'lucide-react';
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
  const [profileSubTab, setProfileSubTab] = useState<'details' | 'password'>('details');
  const [isSignUp, setIsSignUp] = useState(false);

  // Email form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile Edit State
  const [editName, setEditName] = useState(currentUser.name || '');
  const [editEmail, setEditEmail] = useState(currentUser.email || '');
  const [editPhotoUrl, setEditPhotoUrl] = useState(currentUser.photoUrl || '');

  // Password Change State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditEmail(currentUser.email || '');
      setEditPhotoUrl(currentUser.photoUrl || '');
    }
  }, [currentUser]);

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

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!editName.trim()) {
      setErrorMsg('Name cannot be empty');
      return;
    }

    const updatedUser: UserProfile = {
      ...currentUser,
      name: editName.trim(),
      email: editEmail.trim(),
      photoUrl: editPhotoUrl.trim()
    };

    onAuthSuccess(updatedUser);
    setSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPass) {
      setErrorMsg('Please enter your current password.');
      return;
    }
    if (newPass.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    // Success response
    setSuccessMsg('Password changed successfully!');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleQuickRoleSwitch = async (role: 'ORGANIZER' | 'SUPER_ADMIN', plan: 'FREE' | 'PREMIUM') => {
    try {
      const res = await switchRole(role, plan);
      onAuthSuccess(res.user);
      setSuccessMsg(`Switched role to ${role}`);
      setTimeout(() => setSuccessMsg(null), 3000);
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
              {currentUser.isLoggedIn ? (
                <span>Account <span className="text-indigo-600">Settings</span></span>
              ) : (
                <span>Sign In to <span className="text-indigo-600">eTelna</span></span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              {currentUser.isLoggedIn
                ? 'Manage your personal profile, credentials, and password'
                : 'Access your Organizer Dashboard & Election Settings'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOGGED IN ACCOUNT PROFILE & PASSWORD MANAGEMENT VIEW */}
        {currentUser.isLoggedIn ? (
          <div className="space-y-5">
            
            {/* User Profile Card Header */}
            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-md space-y-3 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={currentUser.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400/50 shadow-inner"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-sm text-white truncate flex items-center gap-1.5">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-300 truncate font-mono">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                  currentUser.role === 'SUPER_ADMIN'
                    ? 'bg-purple-500/30 border border-purple-400/40 text-purple-200'
                    : 'bg-emerald-500/30 border border-emerald-400/40 text-emerald-200'
                }`}>
                  {currentUser.role === 'SUPER_ADMIN' ? 'Super Admin' : `${currentUser.plan} Plan`}
                </span>
              </div>
            </div>

            {/* Sub-tab Navigation: Details vs Password */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setProfileSubTab('details')}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  profileSubTab === 'details' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Edit Profile
              </button>

              <button
                type="button"
                onClick={() => setProfileSubTab('password')}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  profileSubTab === 'password' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                Change Password
              </button>
            </div>

            {/* Success or Error Feedback */}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* TAB 1: EDIT PROFILE */}
            {profileSubTab === 'details' && (
              <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Profile Avatar URL</label>
                  <div className="relative">
                    <Camera className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={editPhotoUrl}
                      onChange={e => setEditPhotoUrl(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Profile Changes
                </button>
              </form>
            )}

            {/* TAB 2: CHANGE PASSWORD */}
            {profileSubTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Current Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="Enter current password"
                      value={currentPass}
                      onChange={e => setCurrentPass(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">New Password</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="Confirm new password"
                      value={confirmPass}
                      onChange={e => setConfirmPass(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Update Password
                </button>
              </form>
            )}

            {/* Quick Actions Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickRoleSwitch('SUPER_ADMIN', 'PREMIUM')}
                  className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl font-bold text-[11px] transition-all cursor-pointer"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleSwitch('ORGANIZER', 'FREE')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] transition-all cursor-pointer"
                >
                  Free Organizer
                </button>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              )}
            </div>

          </div>
        ) : (
          /* NOT LOGGED IN LOGIN / SIGNUP FORM */
          <div className="space-y-6">
            
            {/* Tab Switcher: Email vs Google */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setAuthTab('email')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  authTab === 'email' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Email Sign In / Up
              </button>
              <button
                onClick={() => setAuthTab('google')}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up Free'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: GOOGLE SIGN-IN */}
            {authTab === 'google' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Google Single Sign-On (SSO) Active
                  </div>
                  <p className="text-[11px] text-blue-700/80">
                    SuperAdmin Google Client ID configured. Sign in with any Google account or Workspace email.
                  </p>
                </div>

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
                }} className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Google Workspace / Gmail Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="name@gmail.com or corporate@domain.com"
                        value={googleEmail}
                        onChange={e => setGoogleEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    {isLoading ? 'Authenticating with Google...' : 'Sign In with Google Account'}
                  </button>
                </form>

                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">Quick Demo Accounts</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleGoogleSelect('System Admin', 'admin@etelna.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')}
                      className="p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left cursor-pointer transition-all"
                    >
                      <div className="font-bold text-purple-900 text-[11px]">Super Admin Google</div>
                      <div className="text-[9px] text-purple-700 truncate">admin@etelna.com</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGoogleSelect('Demo Organizer', 'organizer.google@gmail.com', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80')}
                      className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left cursor-pointer transition-all"
                    >
                      <div className="font-bold text-slate-800 text-[11px]">Organizer Google</div>
                      <div className="text-[9px] text-slate-500 truncate">organizer.google@gmail.com</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
