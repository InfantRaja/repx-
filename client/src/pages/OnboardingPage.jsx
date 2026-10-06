import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Award,
  Calendar,
  Check,
  ChevronRight,
  ChevronLeft,
  Dumbbell,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const OnboardingPage = () => {
  const { user, saveOnboarding } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.onboarding?.age || 25,
    height: user?.onboarding?.height || 178,
    weight: user?.onboarding?.weight || 75,
    gender: user?.onboarding?.gender || 'Male',
    fitnessGoal: user?.onboarding?.fitnessGoal || 'Muscle Gain',
    experienceLevel: user?.onboarding?.experienceLevel || 'Intermediate',
    trainingDays: user?.onboarding?.trainingDays || 5,
    preferredSplit: user?.onboarding?.preferredSplit || 'Push Pull Legs',
    availableEquipment: user?.onboarding?.availableEquipment || 'Commercial Gym',
  });

  const goals = [
    { title: 'Muscle Gain', desc: 'Hypertrophy and lean muscle mass maximization', icon: Dumbbell },
    { title: 'Strength', desc: 'Heavy compound power and 1RM progression', icon: Zap },
    { title: 'Fat Loss', desc: 'Caloric expenditure with high-density training', icon: Activity },
    { title: 'General Fitness', desc: 'Cardiovascular health, mobility, and stamina', icon: Target },
    { title: 'Bodybuilding', desc: 'Symmetry, mind-muscle isolation, and definition', icon: Award },
  ];

  const experienceLevels = [
    { title: 'Beginner', desc: '< 1 year of consistent lifting' },
    { title: 'Intermediate', desc: '1 - 3 years of structured progression' },
    { title: 'Advanced', desc: '3+ years with dialed periodization' },
  ];

  const splits = [
    { title: 'Push Pull Legs', desc: 'Gold standard 6-day or 3-day high frequency' },
    { title: 'Upper Lower', desc: '4-day balanced upper and lower body split' },
    { title: 'Bro Split', desc: '1 muscle group per day high-volume annihilation' },
    { title: 'Full Body', desc: '3-day systemic full-body compound workouts' },
    { title: 'Custom', desc: 'Custom schedule built with the split builder' },
  ];

  const equipmentOptions = [
    'Commercial Gym',
    'Home Gym Dumbbells',
    'Bodyweight only',
    'Barbell & Rack',
  ];

  const handleNext = () => {
    setStep((s) => Math.min(3, s + 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await saveOnboarding(formData);
      if (res?.success) {
        navigate('/dashboard');
      } else {
        setErrorMsg(res?.message || 'Failed to save setup profile.');
      }
    } catch (err) {
      setErrorMsg('Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-repx-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-repx-volt/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-2xl mx-auto w-full relative z-10">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <span>Step {step} of 3</span>
            <span className="text-repx-volt">
              {step === 1 && 'Biomarkers'}
              {step === 2 && 'Training Goals'}
              {step === 3 && 'Schedule & Split'}
            </span>
          </div>
          <div className="w-full bg-repx-900 h-2 rounded-full overflow-hidden border border-repx-border">
            <div
              className="bg-repx-volt h-full transition-all duration-300 rounded-full shadow-volt-glow"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="repx-card rounded-3xl p-6 sm:p-10 border border-repx-borderLight shadow-2xl backdrop-blur-xl">
          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-repx-crimson/15 border border-repx-crimson/40 text-repx-crimson text-xs">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: BIOMARKERS */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black font-display text-white">Athlete Biomarkers</h2>
                <p className="text-xs text-slate-400 mt-1">
                  We calibrate your volume, PR estimation, and strength baseline using your metrics.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-repx-900 border border-repx-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-repx-volt"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full bg-repx-900 border border-repx-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-repx-volt"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Height (CM)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                    className="w-full bg-repx-900 border border-repx-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-repx-volt"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Current Body Weight (KG)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="w-full bg-repx-900 border border-repx-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-repx-volt font-bold text-repx-volt"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: g })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        formData.gender === g
                          ? 'bg-repx-volt/15 border-repx-volt text-repx-volt'
                          : 'bg-repx-900 border-repx-border text-slate-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: GOALS & EXPERIENCE */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black font-display text-white">Target Fitness Goal</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select your primary objective to customize dashboard telemetry.
                </p>
              </div>

              <div className="space-y-2">
                {goals.map((g) => {
                  const Icon = g.icon;
                  const isSelected = formData.fitnessGoal === g.title;
                  return (
                    <div
                      key={g.title}
                      onClick={() => setFormData({ ...formData, fitnessGoal: g.title })}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-repx-volt/15 border-repx-volt text-white shadow-volt-glow'
                          : 'bg-repx-900 border-repx-border text-slate-300 hover:bg-repx-850'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-repx-volt text-black' : 'bg-repx-800 text-slate-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">{g.title}</div>
                          <div className="text-[11px] text-slate-400">{g.desc}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-repx-volt shrink-0" />}
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Experience Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {experienceLevels.map((lvl) => {
                    const isSelected = formData.experienceLevel === lvl.title;
                    return (
                      <div
                        key={lvl.title}
                        onClick={() => setFormData({ ...formData, experienceLevel: lvl.title })}
                        className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                          isSelected
                            ? 'bg-repx-volt/15 border-repx-volt text-repx-volt font-bold'
                            : 'bg-repx-900 border-repx-border text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">{lvl.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{lvl.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SCHEDULE & SPLIT */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black font-display text-white">Routine & Equipment</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure training frequency and your preferred weekly workout split.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Training Days Per Week: <span className="text-repx-volt font-black">{formData.trainingDays} Days</span>
                </label>
                <div className="flex gap-2">
                  {[3, 4, 5, 6].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setFormData({ ...formData, trainingDays: days })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold font-display border transition-all ${
                        formData.trainingDays === days
                          ? 'bg-repx-volt text-black border-repx-volt shadow-volt-glow'
                          : 'bg-repx-900 border-repx-border text-slate-400 hover:text-white'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Preferred Split
                </label>
                <div className="space-y-2">
                  {splits.map((split) => {
                    const isSelected = formData.preferredSplit === split.title;
                    return (
                      <div
                        key={split.title}
                        onClick={() => setFormData({ ...formData, preferredSplit: split.title })}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-repx-volt/15 border-repx-volt text-white font-bold'
                            : 'bg-repx-900 border-repx-border text-slate-300 hover:bg-repx-850'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{split.title}</div>
                          <div className="text-[10px] text-slate-400">{split.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-repx-volt" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Available Equipment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {equipmentOptions.map((eq) => {
                    const isSelected = formData.availableEquipment === eq;
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => setFormData({ ...formData, availableEquipment: eq })}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all truncate text-left ${
                          isSelected
                            ? 'bg-repx-volt/15 border-repx-volt text-repx-volt'
                            : 'bg-repx-900 border-repx-border text-slate-400 hover:text-white'
                        }`}
                      >
                        {eq}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-repx-border flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="py-2.5 px-4 rounded-xl bg-repx-850 hover:bg-repx-800 text-xs font-bold text-slate-300 border border-repx-border flex items-center gap-1.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="py-2.5 px-6 rounded-xl bg-repx-volt text-black font-extrabold font-display text-xs hover:bg-repx-voltHover transition-all flex items-center gap-1.5 shadow-volt-glow active:scale-95"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="py-2.5 px-6 rounded-xl bg-repx-volt text-black font-extrabold font-display text-xs hover:bg-repx-voltHover transition-all flex items-center gap-2 shadow-volt-glow active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Building REPX Dashboard...' : 'Complete & Launch REPX'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
