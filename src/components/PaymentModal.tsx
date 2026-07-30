import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  Crown,
  Check,
  ShieldCheck,
  Zap,
  Lock,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { UserProfile, AdminTierConfig, PaymentGatewayConfig } from '../types';
import { processPaymentCheckout } from '../services/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  tierConfig: AdminTierConfig;
  paymentGateway: Partial<PaymentGatewayConfig>;
  onPaymentSuccess: (updatedUser: UserProfile) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  tierConfig,
  paymentGateway,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | 'paypal'>('upi');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [upiId, setUpiId] = useState('organizer@okaxis');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await processPaymentCheckout({
        paymentMethod: selectedMethod,
        cardLast4: cardNumber.slice(-4),
        upiId: selectedMethod === 'upi' ? upiId : undefined
      });

      setSuccessMsg(res.message);
      onPaymentSuccess(res.user);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Upgrade to eTelna Premium</h2>
              <p className="text-xs text-slate-500">Unlock unlimited candidates, unlimited elections, and white-label branding</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUCCESS BANNER */}
        {successMsg ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-emerald-950 text-base">{successMsg}</h3>
            <p className="text-xs text-emerald-700">Your account plan is now upgraded to Premium!</p>
          </div>
        ) : (
          <>
            {/* PRICE & PLAN COMPARISON */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-3xl space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">eTelna Premium Plan</span>
                  <div className="text-2xl font-black flex items-baseline gap-1 mt-0.5">
                    <span>{tierConfig.currency === 'USD' ? '$' : '₹'}{tierConfig.premiumPrice.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-400 font-medium">/ {tierConfig.pricingPeriod.toLowerCase()}</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-[11px] rounded-full uppercase tracking-wider">
                  Lifetime Access
                </span>
              </div>

              {/* Benefits Checklist */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-indigo-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Unlimited Candidates</strong> (No 10 limit)</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Unlimited Elections</strong> (No 1 limit)</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cryptographic Ballot Receipts</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom Brand Subdomains</span>
                </div>
              </div>
            </div>

            {/* PAYMENT GATEWAY METHOD SELECTOR */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Select Payment Gateway</label>
              
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    selectedMethod === 'card'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <span>Stripe Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    selectedMethod === 'upi'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Zap className="w-5 h-5 text-indigo-600" />
                  <span>Razorpay / UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('paypal')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    selectedMethod === 'paypal'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                  <span>PayPal</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* CHECKOUT FORM */}
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
              
              {selectedMethod === 'card' && (
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">CVC / CVV</label>
                      <input
                        type="text"
                        required
                        value={cardCvc}
                        onChange={e => setCardCvc(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'upi' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="font-semibold text-slate-700 block">UPI ID / VPA</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                  />
                  <p className="text-[11px] text-slate-500">GPay, PhonePe, Paytm, or BHIM UPI ID</p>
                </div>
              )}

              {selectedMethod === 'paypal' && (
                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-sky-900 space-y-1">
                  <div className="font-bold text-xs">PayPal One-Touch Checkout</div>
                  <p className="text-[11px]">Clicking Pay Now will instantly complete your PayPal authorization.</p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  {isProcessing
                    ? 'Processing Payment...'
                    : `Pay ${tierConfig.currency === 'USD' ? '$' : '₹'}${tierConfig.premiumPrice} & Upgrade to Premium`}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit SSL Encryption • Instant Account Upgrade</span>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
