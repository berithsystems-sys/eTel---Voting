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
  ToggleRight
} from 'lucide-react';
import { AdminTierConfig, PaymentGatewayConfig, PaymentTransaction } from '../types';
import { fetchAdminTierConfig, updateAdminTierConfig, updateAdminPaymentGateway } from '../services/api';

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
  const [activeSubTab, setActiveSubTab] = useState<'limits' | 'gateway' | 'transactions'>('limits');
  
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

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAdminTierConfig().then(res => {
        if (res.tierConfig) setTierConfig(res.tierConfig);
        if (res.paymentGateway) setPaymentGateway(res.paymentGateway);
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
        <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('limits')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'limits' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            Free Plan Limits
          </button>

          <button
            onClick={() => setActiveSubTab('gateway')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'gateway' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Payment Gateway Setup
          </button>

          <button
            onClick={() => setActiveSubTab('transactions')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'transactions' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Payment Logs
          </button>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Super Admin settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSaveTierConfig} className="space-y-5 text-xs">
          
          {/* TAB 1: FREE PLAN LIMITS */}
          {activeSubTab === 'limits' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Free Tier Constraints (Set by Admin)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Max Candidate Limit per Question
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={tierConfig.freeMaxCandidates}
                      onChange={e => setTierConfig({ ...tierConfig, freeMaxCandidates: parseInt(e.target.value) || 10 })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Default is 10 candidates max for Free organizers.</p>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Max Election Creation Count
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={tierConfig.freeMaxElections}
                      onChange={e => setTierConfig({ ...tierConfig, freeMaxElections: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Default is 1 election setup (one-time only).</p>
                  </div>
                </div>
              </div>

              {/* Pricing Config */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h3 className="font-bold text-slate-900">eTelna Premium Pricing Setup</h3>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Price Amount</label>
                    <input
                      type="number"
                      value={tierConfig.premiumPrice}
                      onChange={e => setTierConfig({ ...tierConfig, premiumPrice: parseFloat(e.target.value) || 29 })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Currency</label>
                    <select
                      value={tierConfig.currency}
                      onChange={e => setTierConfig({ ...tierConfig, currency: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Billing Period</label>
                    <select
                      value={tierConfig.pricingPeriod}
                      onChange={e => setTierConfig({ ...tierConfig, pricingPeriod: e.target.value as any })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    >
                      <option value="LIFETIME">Lifetime One-Time</option>
                      <option value="MONTHLY">Monthly Subscription</option>
                      <option value="PER_ELECTION">Per Election Setup</option>
                    </select>
                  </div>
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
