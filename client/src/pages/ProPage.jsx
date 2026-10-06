import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Zap,
  Check,
  Crown,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Smartphone,
  ArrowRight,
  Trophy,
  X,
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ProPage = () => {
  const { user, refreshUser } = useAuth();

  const [subData, setSubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [upgraded, setUpgraded] = useState(false);

  useEffect(() => {
    const fetchSub = async () => {
      try {
        setLoading(true);
        const res = await API.get('/subscription');
        if (res.data?.success) {
          setSubData(res.data);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchSub();
  }, []);

  const handleUpgrade = async () => {
    try {
      setProcessing(true);
      const res = await API.post('/subscription/upgrade', {
        paymentMethod: `${paymentMethod} Simulation Gateway`,
        billingCycle: 'monthly',
      });
      if (res.data?.success) {
        setUpgraded(true);
        await refreshUser();
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#D4FF00', '#F59E0B', '#00F0FF'],
          });
        } catch (e) {}
      }
    } catch (err) {
      alert('Simulation error');
    } finally {
      setProcessing(false);
    }
  };

  const proFeatures = [
    { title: 'Advanced Biomechanical Analytics', desc: 'Deep Epley 1RM curve models and fatigue tracking.' },
    { title: 'Unlimited Custom Workouts & Splits', desc: 'Create and deploy unlimited periodized training routines.' },
    { title: 'Advanced Historical PR Analytics', desc: 'Complete breakdown of past volume, reps, and tonnage records.' },
    { title: 'AI Workout Recommendations', desc: 'Intelligent routine suggestions tailored to recovery days.' },
    { title: 'Elite Pro Workout Templates', desc: 'Curated programs designed for strength, power, and aesthetics.' },
    { title: 'Cloud Gym Telemetry Backup', desc: 'Real-time MongoDB synchronization with zero data loss.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in select-none">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-xs uppercase tracking-widest">
          <Crown className="w-4 h-4 fill-amber-400 text-amber-400" /> ELITE ATHLETE TIER
        </div>
        <h1 className="text-3xl md:text-5xl font-black font-display text-white tracking-tight">
          UNLOCK REPX <span className="text-repx-volt">PRO</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Elevate your gym sessions with professional telemetry, advanced periodization, and unlimited custom routines.
        </p>
      </div>

      {/* Main Pricing Card */}
      <div className="repx-card rounded-3xl p-6 md:p-10 border-2 border-repx-volt/50 bg-gradient-to-b from-repx-900 to-repx-950 relative overflow-hidden shadow-[0_0_60px_rgba(212,255,0,0.2)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-repx-volt/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-repx-border relative z-10">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">
              Subscription Plan
            </div>
            <h2 className="text-3xl font-black font-display text-white mt-1">REPX PRO</h2>
            <p className="text-xs text-slate-400 mt-0.5">Cancel or modify anytime with 1 click.</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black font-display text-repx-volt">₹199</span>
            <span className="text-sm font-bold text-slate-400">/ month</span>
          </div>
        </div>

        {/* Feature bullets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8 relative z-10">
          {proFeatures.map((feat, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-repx-volt/15 border border-repx-volt/40 flex items-center justify-center shrink-0 mt-0.5 text-repx-volt">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div>
                <div className="text-xs md:text-sm font-bold text-white">{feat.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{feat.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="pt-2 relative z-10">
          {user?.isPro ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-sm text-center flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 fill-amber-400" /> You Are Currently an Active REPX PRO Athlete
            </div>
          ) : (
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-4 rounded-2xl bg-repx-volt text-black font-black font-display text-base hover:bg-repx-voltHover transition-all flex items-center justify-center gap-2 shadow-volt-glow active:scale-95"
            >
              <Zap className="w-5 h-5 fill-current" /> UPGRADE TO PRO — ₹199 / MONTH
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
                <td className="py-3">AI Workout Recommendations</td>
                <td className="py-3 text-center text-slate-500">—</td>
                <td className="py-3 text-center text-repx-volt font-bold">✓ Active</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CHECKOUT MODAL (Payment-ready mock architecture) */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="repx-card w-full max-w-md rounded-3xl p-6 md:p-8 border border-repx-volt/40 shadow-2xl relative">
            <button
              onClick={() => setShowCheckout(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {upgraded ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-repx-volt/20 border border-repx-volt/40 text-repx-volt mx-auto flex items-center justify-center shadow-volt-glow">
                  <Crown className="w-8 h-8 fill-repx-volt" />
                </div>
                <h3 className="text-2xl font-black font-display text-white">
                  Welcome to REPX PRO!
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your subscription is now active in MongoDB. All analytics, unlimited routines, and
                  PR tracking features are unlocked.
                </p>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="w-full py-3 rounded-xl bg-repx-volt text-black font-extrabold font-display text-xs"
                >
                  Enter PRO Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-black uppercase text-slate-400">Payment Gateway</div>
                  <h3 className="text-xl font-black font-display text-white mt-0.5">
                    Activate REPX PRO
                  </h3>
                  <div className="text-sm font-black font-display text-repx-volt mt-1">
                    Amount Due: ₹199 / month
                  </div>
                </div>

                {/* Method selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-400">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === 'UPI'
                          ? 'bg-repx-volt/15 border-repx-volt text-repx-volt'
                          : 'bg-repx-900 border-repx-border text-slate-400'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" /> UPI / QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Card')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === 'Card'
                          ? 'bg-repx-volt/15 border-repx-volt text-repx-volt'
                          : 'bg-repx-900 border-repx-border text-slate-400'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" /> Credit / Debit
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-repx-850 border border-repx-border text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Architecture test gateway. No real billing credentials charged.</span>
                </div>

                <button
                  type="button"
                  disabled={processing}
                  onClick={handleUpgrade}
                  className="w-full py-3.5 rounded-xl bg-repx-volt text-black font-black font-display text-xs hover:bg-repx-voltHover transition-all shadow-volt-glow disabled:opacity-50 active:scale-95"
                >
                  {processing ? 'Processing Payment...' : 'Confirm Payment & Upgrade (₹199)'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProPage;
