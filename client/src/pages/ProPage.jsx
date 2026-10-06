import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Zap,
  Check,
  Crown,
  Sparkles,
  ShieldCheck,
  Copy,
  CheckCheck,
  ExternalLink,
  Smartphone,
  ArrowRight,
  Trophy,
  X,
  QrCode,
  CheckCircle2,
  Calendar,
  Lock,
  Layers,
  Flame
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ProPage = () => {
  const { user, refreshUser } = useAuth();

  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showCheckout, setShowCheckout] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [upgraded, setUpgraded] = useState(false);
  const [activatedSub, setActivatedSub] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const plans = {
    monthly: {
      name: 'Monthly Pro Pass',
      price: 199,
      period: '/ month',
      desc: 'Billed monthly. Cancel or renew anytime.',
      badge: 'POPULAR'
    },
    yearly: {
      name: 'Annual Pro Athlete',
      price: 1499,
      period: '/ year',
      desc: 'Save 40% — equivalent to ₹125/month.',
      badge: 'BEST VALUE (SAVE 40%)'
    }
  };

  const selectedPlan = plans[billingCycle];

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('infantraja777@okaxis');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleQuickDemoUtr = () => {
    const randomUtr = `42${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setUtrNumber(randomUtr);
  };

  const handleVerifyPayment = async (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      setErrorMsg('Please enter your 12-digit UPI Reference / UTR Number from Google Pay.');
      return;
    }

    try {
      setProcessing(true);
      setErrorMsg('');

      const res = await API.post('/subscription/upgrade', {
        paymentMethod: 'Google Pay UPI (infantraja777@okaxis)',
        billingCycle,
        amount: selectedPlan.price,
        utrNumber: utrNumber.trim(),
      });

      if (res.data?.success) {
        setUpgraded(true);
        setActivatedSub(res.data.subscription);
        await refreshUser();

        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#D4FF00', '#F59E0B', '#10B981', '#00F0FF'],
          });
        } catch (e) {}
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setErrorMsg(err.response?.data?.message || 'Could not verify transaction. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const proFeatures = [
    { title: 'Unlimited AI Coach Queries', desc: 'Instant biomechanics form cues, nutrition calculations & recovery advice.' },
    { title: 'Unlimited Custom Workouts & Splits', desc: 'Build and deploy unlimited periodized Push-Pull-Legs and custom routines.' },
    { title: 'Advanced 1RM Progression Models', desc: 'Predictive 1RM fatigue tracking and full volume progression curves.' },
    { title: 'All-Time Historical PR Cabinet', desc: 'Permanent breakdown of your lifetime tonnage, rep records, and badges.' },
    { title: 'Automated Voice Logging', desc: 'Hands-free set logging during workout sessions with speech recognition.' },
    { title: 'Elite PRO Verified Badge', desc: 'Golden glowing PRO badge next to your profile on social feeds and leaderboards.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in select-none">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-xs uppercase tracking-widest shadow-amber-500/20">
          <Crown className="w-4 h-4 fill-amber-400 text-amber-400" /> ELITE ATHLETE MEMBERSHIP
        </div>
        <h1 className="text-3xl md:text-5xl font-black font-display text-white tracking-tight">
          ELEVATE TO REPX <span className="text-repx-volt">PRO</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Unlock the full power of your training: unlimited AI Coach doubts, advanced biomechanics telemetry, unlimited splits, and voice logging.
        </p>

        {/* Plan Switcher Pills */}
        <div className="pt-2 flex justify-center">
          <div className="bg-repx-900 p-1 rounded-2xl border border-repx-border flex items-center gap-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-repx-volt text-black shadow-volt-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MONTHLY (₹199)
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-repx-volt text-black shadow-volt-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>ANNUAL (₹1,499)</span>
              <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-black">
                SAVE 40%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Pricing & Upgrade Card */}
      <div className="repx-card rounded-3xl p-6 md:p-10 border-2 border-repx-volt/50 bg-gradient-to-b from-repx-900 to-repx-950 relative overflow-hidden shadow-[0_0_60px_rgba(212,255,0,0.2)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-repx-volt/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-repx-border relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                {selectedPlan.name}
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-repx-volt/20 text-repx-volt border border-repx-volt/40">
                {selectedPlan.badge}
              </span>
            </div>
            <h2 className="text-3xl font-black font-display text-white mt-1">REPX PRO ELITE</h2>
            <p className="text-xs text-slate-400 mt-0.5">{selectedPlan.desc}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black font-display text-repx-volt">
              ₹{selectedPlan.price}
            </span>
            <span className="text-sm font-bold text-slate-400">{selectedPlan.period}</span>
          </div>
        </div>

        {/* Feature bullets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8 relative z-10">
          {proFeatures.map((feat, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-repx-volt/15 border border-repx-volt/40 flex items-center justify-center shrink-0 mt-0.5 text-repx-volt shadow-volt-glow">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div>
                <div className="text-xs md:text-sm font-bold text-white">{feat.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{feat.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button / Active State */}
        <div className="pt-2 relative z-10">
          {user?.isPro ? (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 font-bold text-sm text-center flex flex-col sm:flex-row items-center justify-between gap-3 shadow-amber-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
                  <Crown className="w-6 h-6 fill-current" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-black tracking-wider text-amber-400 uppercase">
                    ACTIVE PRO ATHLETE
                  </div>
                  <div className="text-xs text-slate-300">
                    All elite telemetry, AI coaching, and splits unlocked.
                  </div>
                </div>
              </div>
              <span className="text-xs px-3 py-1.5 rounded-xl bg-amber-400/20 text-amber-200 border border-amber-400/30 font-black">
                PRO ACTIVE ✓
              </span>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowCheckout(true);
                setUpgraded(false);
                setErrorMsg('');
              }}
              className="w-full py-4 rounded-2xl bg-repx-volt text-black font-black font-display text-base hover:bg-repx-voltHover transition-all flex items-center justify-center gap-2 shadow-volt-glow active:scale-95 group"
            >
              <Zap className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              <span>PAY & UPGRADE VIA GPAY — ₹{selectedPlan.price}</span>
            </button>
          )}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="repx-card rounded-3xl p-6 md:p-8 border border-repx-border space-y-4">
        <h3 className="text-lg font-black font-display text-white">Tier Comparison</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-repx-border text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3">Feature</th>
                <th className="py-3 text-center">Free Athlete</th>
                <th className="py-3 text-center text-repx-volt font-black">REPX PRO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-repx-border/40 text-slate-300">
              <tr>
                <td className="py-3">Workout Logging & Rest Timer</td>
                <td className="py-3 text-center text-emerald-400 font-bold">✓ Included</td>
                <td className="py-3 text-center text-repx-volt font-bold">✓ Included</td>
              </tr>
              <tr>
                <td className="py-3">AI Coach & Biomechanics Doubts</td>
                <td className="py-3 text-center text-slate-500">Basic Guidance</td>
                <td className="py-3 text-center text-repx-volt font-bold">✓ Unlimited Queries</td>
              </tr>
              <tr>
                <td className="py-3">Personal Record Detection</td>
                <td className="py-3 text-center text-emerald-400 font-bold">✓ Included</td>
                <td className="py-3 text-center text-repx-volt font-bold">✓ Real-time + Deep Analysis</td>
              </tr>
              <tr>
                <td className="py-3">Custom Workout Routines</td>
                <td className="py-3 text-center text-slate-500">Up to 3 routines</td>
                <td className="py-3 text-center text-repx-volt font-bold">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3">Weekly Split Builder</td>
                <td className="py-3 text-center text-slate-500">1 split</td>
                <td className="py-3 text-center text-repx-volt font-bold">Unlimited Splits</td>
              </tr>
              <tr>
                <td className="py-3">Big 3 1RM Progression Curves</td>
                <td className="py-3 text-center text-slate-500">30 Days</td>
                <td className="py-3 text-center text-repx-volt font-bold">1 Year + Lifetime</td>
              </tr>
              <tr>
                <td className="py-3">Voice Workout Assistant</td>
                <td className="py-3 text-center text-slate-500">Standard</td>
                <td className="py-3 text-center text-repx-volt font-bold">✓ Voice Set Logging</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* GOOGLE PAY / UPI SCANNER CHECKOUT MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="repx-card w-full max-w-lg rounded-3xl p-6 md:p-8 border border-repx-volt/40 shadow-2xl relative my-auto">
            <button
              onClick={() => setShowCheckout(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-repx-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {upgraded ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-amber-400/20 border-2 border-amber-400 text-amber-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)] animate-bounce">
                  <Crown className="w-10 h-10 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black font-display text-white">
                    WELCOME TO REPX PRO!
                  </h3>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mt-1">
                    ELITE ATHLETE PRIVILEGES UNLOCKED
                  </div>
                </div>

                <div className="bg-repx-900 border border-repx-borderLight rounded-2xl p-4 text-left text-xs space-y-2">
                  <div className="flex justify-between border-b border-repx-border pb-1.5">
                    <span className="text-slate-400">Plan:</span>
                    <span className="font-bold text-white">{activatedSub?.plan || selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-repx-border pb-1.5">
                    <span className="text-slate-400">Amount Paid:</span>
                    <span className="font-bold text-repx-volt">₹{activatedSub?.price || selectedPlan.price}</span>
                  </div>
                  <div className="flex justify-between border-b border-repx-border pb-1.5">
                    <span className="text-slate-400">Google Pay UTR Ref:</span>
                    <span className="font-mono text-cyan-400">{activatedSub?.utrNumber || utrNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valid Until:</span>
                    <span className="font-bold text-white">
                      {new Date(activatedSub?.endDate || Date.now() + 30 * 86400000).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Your payment has been logged and confirmed. Your glowing PRO badge is now active across REPX!
                </p>

                <button
                  onClick={() => setShowCheckout(false)}
                  className="w-full py-3.5 rounded-xl bg-repx-volt text-black font-black font-display text-xs hover:bg-repx-voltHover transition-all shadow-volt-glow"
                >
                  RETURN TO DASHBOARD
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Modal Title */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 fill-amber-400" /> REPX PRO UPGRADE
                    </div>
                    <span className="text-[10px] bg-repx-volt/15 text-repx-volt border border-repx-volt/40 px-2 py-0.5 rounded-full font-bold">
                      {billingCycle === 'yearly' ? 'ANNUAL PASS' : 'MONTHLY PASS'}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black font-display text-white mt-1">
                    Google Pay / UPI Scanner
                  </h3>
                  <div className="text-sm font-bold text-slate-300 mt-0.5">
                    Pay <span className="text-repx-volt font-black text-lg">₹{selectedPlan.price}</span> to activate your PRO subscription.
                  </div>
                </div>

                {/* THE GOOGLE PAY SCANNER CARD */}
                <div className="bg-white rounded-2xl p-4 text-center shadow-xl border-2 border-slate-200 relative overflow-hidden group">
                  <div className="flex items-center justify-center gap-2 mb-2 pb-2 border-b border-slate-200">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg"
                      alt="Google Pay"
                      className="h-5 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <span className="text-slate-800 font-black text-sm tracking-wide">
                      SCAN TO PAY WITH GPAY
                    </span>
                  </div>

                  {/* QR Code Image */}
                  <div className="relative mx-auto w-56 sm:w-64 max-w-full aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center p-2">
                    <img
                      src="/gpay-scanner.jpg"
                      alt="Google Pay UPI Scanner - INFANT RAJA"
                      className="w-full h-full object-contain rounded-lg shadow-sm"
                    />
                  </div>

                  {/* Merchant Details */}
                  <div className="mt-3 pt-2 border-t border-slate-200 text-slate-800">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-600">
                      Verified Payee
                    </div>
                    <div className="font-extrabold text-sm text-slate-900 flex items-center justify-center gap-1.5 mt-0.5">
                      INFANT RAJA
                      <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-600 text-white" />
                    </div>

                    {/* Copy UPI ID Pill */}
                    <div className="mt-2 inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-full border border-slate-300 text-xs font-mono transition-all">
                      <span>UPI ID: <strong>infantraja777@okaxis</strong></span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                      >
                        {copiedUpi ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCheck className="w-3.5 h-3.5" /> Copied!
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Intent Button */}
                <div className="block sm:hidden">
                  <a
                    href={`upi://pay?pa=infantraja777@okaxis&pn=INFANT%20RAJA&am=${selectedPlan.price}&cu=INR&tn=REPX%20PRO%20Upgrade`}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Open in Google Pay / UPI App (₹{selectedPlan.price})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Instructions & UTR Submission Form */}
                <form onSubmit={handleVerifyPayment} className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                      <span>Enter 12-Digit UPI Reference / UTR No.</span>
                      <button
                        type="button"
                        onClick={handleQuickDemoUtr}
                        className="text-[10px] text-repx-volt hover:underline normal-case font-medium"
                      >
                        ⚡ Fill Demo UTR
                      </button>
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9A-Za-z-]/g, ''))}
                      placeholder="e.g. 427819283741 (from your GPay receipt)"
                      className="w-full bg-repx-950 border border-repx-borderLight focus:border-repx-volt text-white text-xs px-4 py-3 rounded-xl outline-none font-mono tracking-wide placeholder:text-slate-400 transition-all"
                    />
                    <div className="text-[10px] text-slate-400">
                      💡 Found under <em>"UPI transaction ID"</em> or <em>"Google transaction ID"</em> in your GPay payment history.
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-medium animate-shake">
                      {errorMsg}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-repx-900 border border-repx-borderLight text-[11px] text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Instant automated verification. Your PRO status is activated immediately upon submission.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-4 rounded-xl bg-repx-volt text-black font-black font-display text-xs hover:bg-repx-voltHover transition-all shadow-volt-glow disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Verifying with Google Pay...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>VERIFY PAYMENT & ACTIVATE REPX PRO (₹{selectedPlan.price})</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProPage;
