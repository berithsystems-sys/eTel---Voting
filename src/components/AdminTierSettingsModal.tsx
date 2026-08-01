import React, { useState, useEffect } from 'react';
import {
  Shield,
  Settings,
  CreditCard,
  Users,
  Save,
  CheckCircle2,
  X,
  Lock,
  Zap,
  DollarSign,
  Crown,
  Key,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Globe,
  ExternalLink
} from 'lucide-react';
import { AdminTierConfig, PaymentGatewayConfig, PaymentTransaction, GoogleOAuthConfig } from '../types';
import { fetchAdminTierConfig, updateAdminTierConfig, updateAdminPaymentGateway, updateAdminGoogleOAuth } from '../services/api';

interface AdminTierSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const AdminTierSettingsModal: React.FC<AdminTierSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'limits' | 'google_oauth' | 'gateway' | 'transactions'>('limits');
  
  const [tierConfig, setTierConfig] = useState<AdminTierConfig>({
    freeMaxCandidates: 10,
    freeMaxElections: 1,
    premiumPrice: 2499,
    currency: 'INR',
    pricingPeriod: 'LIFETIME'
  });

  const [paymentGateway, setPaymentGateway] = useState<PaymentGatewayConfig>({
    provider: 'razorpay',
    publishableKey: 'rzp_test_eTelnaLive9918237',
    secretKey: 'sk_test_eTelnaSecretPrivKey',
    webhookSecret: 'whsec_eTelnaWebhookSignature',
    mode: 'test',
    isEnabled: true,
    currency: 'INR'
  });

  const [googleOAuthConfig, setGoogleOAuthConfig] = useState<GoogleOAuthConfig>({
    clientId: '94f5335a-b171-4a1d-b88c-cb1ca96c9177.apps.googleusercontent.com',
    clientSecret: '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2',
    redirectUri: window.location.origin + '/auth/google/callback',
    isEnabled: true,
    enableOneTap: true
  });

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAdminTierConfig().then(res => {
        if (res.tierConfig) setTierConfig(res.tierConfig);
        if (res.paymentGateway) setPaymentGateway(res.paymentGateway);
        if (res.googleOAuthConfig) setGoogleOAuthConfig(res.googleOAuthConfig);
        if (res.transactions) setTransactions(res.transactions);
      }).catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveTierConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateAdminTierConfig(tierConfig);
      await updateAdminPaymentGateway(paymentGateway);
      await updateAdminGoogleOAuth(googleOAuthConfig);
      setSaveSuccess(true);
      onConfigUpdated();
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-600/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">eTelna Super Admin Panel</h2>
              <p className="text-xs text-slate-500">Configure Free Tier limits, Payment Gateways & Subscription pricing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Nav Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveSubTab('limits')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'limits' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            Plan Limits
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('google_oauth')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'google_oauth' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Google OAuth
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('gateway')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'gateway' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Payments
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('transactions')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'transactions' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Logs
          </button>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Super Admin settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSaveTierConfig} className="space-y-5 text-xs">
          
          {/* TAB 1: LIMITS & PRICING */}
          {activeSubTab === 'limits' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-3">
                <h3 className="font-extrabold text-purple-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-purple-600" />
                  Free Tier Quota Controls
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Max Free Candidates / Options</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={tierConfig.freeMaxCandidates}
                      onChange={e => setTierConfig({ ...tierConfig, freeMaxCandidates: parseInt(e.target.value) || 10 })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Max Free Elections Count</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={tierConfig.freeMaxElections}
                      onChange={e => setTierConfig({ ...tierConfig, freeMaxElections: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Premium Upgrade Pricing
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Price Amount</label>
                    <input
                      type="number"
                      min="0"
                      value={tierConfig.premiumPrice}
                      onChange={e => setTierConfig({ ...tierConfig, premiumPrice: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Currency Code</label>
                    <select
                      value={tierConfig.currency}
                      onChange={e => setTierConfig({ ...tierConfig, currency: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE API & OAUTH CONFIGURATION */}
          {activeSubTab === 'google_oauth' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-blue-900 flex items-center gap-1.5 text-xs">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Google API & OAuth 2.0 Credentials
                  </h3>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    Google Cloud Console
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-blue-700/90 leading-relaxed">
                  Paste your Google Client ID and Client Secret key here so organizers and voters can log in using Google Single Sign-On (SSO).
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Enable Google OAuth Sign-In for Users</div>
                    <div className="text-[10px] text-slate-500">Allows users to log in directly using Google credentials</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGoogleOAuthConfig({ ...googleOAuthConfig, isEnabled: !googleOAuthConfig.isEnabled })}
                    className="cursor-pointer text-indigo-600"
                  >
                    {googleOAuthConfig.isEnabled ? <ToggleRight className="w-8 h-8 text-indigo-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                  </button>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Google OAuth Client ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 123456789-xxx.apps.googleusercontent.com"
                    value={googleOAuthConfig.clientId}
                    onChange={e => setGoogleOAuthConfig({ ...googleOAuthConfig, clientId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-purple-500/20 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Google OAuth Client Secret</label>
                  <input
                    type="password"
                    placeholder="e.g. GOCSPX-xxxxxx..."
                    value={googleOAuthConfig.clientSecret}
                    onChange={e => setGoogleOAuthConfig({ ...googleOAuthConfig, clientSecret: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-purple-500/20 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Authorized Redirect URI</label>
                  <input
                    type="text"
                    value={googleOAuthConfig.redirectUri}
                    onChange={e => setGoogleOAuthConfig({ ...googleOAuthConfig, redirectUri: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-600"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <div>
                    <div className="font-bold text-slate-800">Enable Google One-Tap Prompt</div>
                    <div className="text-[10px] text-slate-500">Auto-prompt returning users with Google One-Tap widget</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGoogleOAuthConfig({ ...googleOAuthConfig, enableOneTap: !googleOAuthConfig.enableOneTap })}
                    className="cursor-pointer text-indigo-600"
                  >
                    {googleOAuthConfig.enableOneTap ? <ToggleRight className="w-8 h-8 text-indigo-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENT GATEWAY SETUP */}
          {activeSubTab === 'gateway' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <div className="font-bold text-slate-900">Enable Online Payment Gateway</div>
                  <div className="text-[11px] text-slate-500">Allow organizers to upgrade accounts online using credit card, UPI, or PayPal</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentGateway({ ...paymentGateway, isEnabled: !paymentGateway.isEnabled })}
                  className="p-1"
                >
                  {paymentGateway.isEnabled ? (
                    <ToggleRight className="w-8 h-8 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary Payment Provider</label>
                  <select
                    value={paymentGateway.provider}
                    onChange={e => setPaymentGateway({ ...paymentGateway, provider: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                  >
                    <option value="stripe">Stripe (Credit Cards / Apple Pay)</option>
                    <option value="razorpay">Razorpay (UPI / NetBanking)</option>
                    <option value="paypal">PayPal Express</option>
                    <option value="upi">Direct UPI / Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Environment Mode</label>
                  <select
                    value={paymentGateway.mode}
                    onChange={e => setPaymentGateway({ ...paymentGateway, mode: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                  >
                    <option value="test">Test / Sandbox Mode</option>
                    <option value="live">Live Production Mode</option>
                  </select>
                </div>
              </div>

              {/* API Credentials */}
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-purple-600" />
                  Gateway Credentials & Keys
                </h4>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Publishable Key / Key ID</label>
                  <input
                    type="text"
                    value={paymentGateway.publishableKey}
                    onChange={e => setPaymentGateway({ ...paymentGateway, publishableKey: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Secret Key / API Secret</label>
                  <input
                    type="password"
                    value={paymentGateway.secretKey}
                    onChange={e => setPaymentGateway({ ...paymentGateway, secretKey: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Webhook Signing Secret</label>
                  <input
                    type="text"
                    value={paymentGateway.webhookSecret}
                    onChange={e => setPaymentGateway({ ...paymentGateway, webhookSecret: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSACTIONS LOG */}
          {activeSubTab === 'transactions' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900">Recent Payment Transactions</h3>
              {transactions.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl">No transactions recorded yet</div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {transactions.map(tx => (
                    <div key={tx.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{tx.userName} ({tx.userEmail})</div>
                        <div className="text-[10px] text-slate-500 font-mono">{tx.transactionRef} • {new Date(tx.timestamp).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-900">{tx.currency === 'USD' ? '$' : '₹'}{tx.amount}</div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                          {tx.status} ({tx.provider})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab !== 'transactions' && (
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Configurations...' : 'Save Admin Settings'}
            </button>
          )}

        </form>

      </div>
    </div>
  );
};
