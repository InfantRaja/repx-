import React, { useState } from 'react';
import {
  User,
  Shield,
  Zap,
  Ruler,
  Globe,
  Moon,
  Download,
  Code,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('Profile');
  const [name, setName] = useState(user?.name || 'INFANT RAJA');
  const [bio, setBio] = useState(user?.bio || '');
  const [link, setLink] = useState('https://example.com');
  const [unit, setUnit] = useState(() => user?.preferences?.unit || localStorage.getItem('repx_unit') || 'kg');
  const [distanceUnit, setDistanceUnit] = useState(() => localStorage.getItem('repx_distance_unit') || 'km');
  const [theme, setTheme] = useState(() => localStorage.getItem('repx_theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('repx_lang') || 'en');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const displayName = name || 'INFANT RAJA';
  const initial = displayName.charAt(0).toUpperCase() || 'I';

  const handleUnitChange = async (newUnit) => {
    setUnit(newUnit);
    localStorage.setItem('repx_unit', newUnit);
    try {
      await updateProfile({
        name,
        bio,
        preferences: { unit: newUnit },
      });
      setSuccessMsg(`Weight unit updated to ${newUnit.toUpperCase()}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.warn('Failed to update remote unit preference:', e);
      setSuccessMsg(`Weight unit set to ${newUnit.toUpperCase()}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('repx_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
    setSuccessMsg(`Theme set to ${newTheme.toUpperCase()} mode!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleLanguageChange = (langCode, langName) => {
    setLanguage(langCode);
    localStorage.setItem('repx_lang', langCode);
    setSuccessMsg(`Language switched to ${langName}!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      await updateProfile({
        name,
        bio,
        preferences: { unit },
      });
      localStorage.setItem('repx_unit', unit);
      setSuccessMsg('Changes saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast */}
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg animate-fade-in flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Two Column Layout (Exact Hevy Screenshot 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sub-Navigation (4 cols on desktop) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-5">
          {/* Account Group */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              Account
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => setActiveTab('Profile')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                  activeTab === 'Profile'
                    ? 'bg-sky-50 text-blue-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('Account')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                  activeTab === 'Account'
                    ? 'bg-sky-50 text-blue-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Account</span>
              </button>

              <button
                onClick={() => setActiveTab('PRO')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                  activeTab === 'PRO'
                    ? 'bg-sky-50 text-blue-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>PRO Manage Subscription</span>
              </button>
            </div>
          </div>

          {/* Preferences Group */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              Preferences
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => setActiveTab('Units')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                  activeTab === 'Units'
                    ? 'bg-sky-50 text-blue-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Ruler className="w-4 h-4" />
                <span>Units</span>
              </button>

              <button
                onClick={() => setActiveTab('Language')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                  activeTab === 'Language'
                    ? 'bg-sky-50 text-blue-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Language</span>
              </button>

              <button
                onClick={() => setActiveTab('Theme')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                  activeTab === 'Theme'
                    ? 'bg-sky-50 text-blue-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Theme</span>
              </button>

              <button
                onClick={() => setActiveTab('Export')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                  activeTab === 'Export'
                    ? 'bg-sky-50 text-blue-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>

              <button
                onClick={() => setActiveTab('Developer')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                  activeTab === 'Developer'
                    ? 'bg-sky-50 text-blue-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Code className="w-4 h-4" />
                <span>Developer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Card (8 cols on desktop, Exact Hevy Screenshot 5) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">{activeTab}</h2>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-slate-400 hover:bg-blue-600 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {activeTab === 'Profile' && (
            <div className="space-y-6">
              {/* Profile Avatar & Change Picture Button */}
              <div className="flex items-center gap-5">
                <div className="w-18 h-18 rounded-full bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-sm">
                  {initial}
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-slate-700 transition-all"
                >
                  Change Picture
                </button>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Bio
                  </label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe yourself"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Link
                  </label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Units' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Weight Unit</label>
                <p className="text-xs text-slate-400 mb-3">Choose whether exercises, charts, and PRs display in kilograms or pounds.</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleUnitChange('kg')}
                    className={`py-3.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                      unit === 'kg'
                        ? 'bg-blue-50 border-blue-400 text-blue-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Kilograms (kg)</span>
                    {unit === 'kg' && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitChange('lbs')}
                    className={`py-3.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                      unit === 'lbs'
                        ? 'bg-blue-50 border-blue-400 text-blue-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Pounds (lbs)</span>
                    {unit === 'lbs' && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-2">Distance Unit</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDistanceUnit('km');
                      localStorage.setItem('repx_distance_unit', 'km');
                      setSuccessMsg('Distance unit set to Kilometers (km)');
                      setTimeout(() => setSuccessMsg(''), 3000);
                    }}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                      distanceUnit === 'km'
                        ? 'bg-blue-50 border-blue-400 text-blue-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Kilometers (km)</span>
                    {distanceUnit === 'km' && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDistanceUnit('mi');
                      localStorage.setItem('repx_distance_unit', 'mi');
                      setSuccessMsg('Distance unit set to Miles (mi)');
                      setTimeout(() => setSuccessMsg(''), 3000);
                    }}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                      distanceUnit === 'mi'
                        ? 'bg-blue-50 border-blue-400 text-blue-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Miles (mi)</span>
                    {distanceUnit === 'mi' && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Theme' && (
            <div className="space-y-4 max-w-xl">
              <label className="block text-xs font-bold text-slate-700 mb-1">Appearance & Interface Theme</label>
              <p className="text-xs text-slate-400 mb-4">Select your preferred color scheme for REPX.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    theme === 'light'
                      ? 'border-2 border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-500 mb-3 shadow-xs">
                    ☀️
                  </div>
                  <div className="font-bold text-xs text-slate-900">Light Mode</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Clean gym aesthetic</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    theme === 'dark'
                      ? 'border-2 border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-3 shadow-xs">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">Dark Mode</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">OLED high contrast</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange('system')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    theme === 'system'
                      ? 'border-2 border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-3 shadow-xs">
                    ⚙️
                  </div>
                  <div className="font-bold text-xs text-slate-900">System Default</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Follows device</div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Language' && (
            <div className="space-y-4 max-w-xl">
              <label className="block text-xs font-bold text-slate-700 mb-1">Display Language</label>
              <p className="text-xs text-slate-400 mb-4">Select your language for navigation, coach messages, and workout cues.</p>

              <div className="space-y-2">
                {[
                  { code: 'en', name: 'English', native: 'English (US)', flag: '🇺🇸' },
                  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
                  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
                  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
                  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇧🇷' },
                  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
                  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code, lang.name)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      language === lang.code
                        ? 'border-blue-400 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{lang.name}</div>
                        <div className="text-[10px] text-slate-400">{lang.native}</div>
                      </div>
                    </div>
                    {language === lang.code && (
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Account' && (
            <div className="space-y-5 max-w-xl">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs text-slate-400">Account Email</div>
                <div className="text-sm font-bold text-slate-800 font-mono">{user?.email || 'athlete@repx.fit'}</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs text-slate-400">User ID</div>
                <div className="text-xs font-mono text-slate-600">{user?._id || 'athlete_repx_active_id'}</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs text-slate-400">Account Status</div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-emerald-600">Active REPX Athlete</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PRO' && (
            <div className="space-y-4 max-w-xl">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-amber-600 tracking-wider uppercase">REPX PRO LIFETIME</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">ACTIVE</span>
                </div>
                <p className="text-xs text-slate-600">Unlimited custom workout splits, AI Coach assistance, advanced strength analytics, and cloud sync.</p>
              </div>
            </div>
          )}

          {activeTab !== 'Profile' && activeTab !== 'Units' && activeTab !== 'Theme' && activeTab !== 'Language' && activeTab !== 'Account' && activeTab !== 'PRO' && (
            <div className="text-center py-10 text-xs text-slate-400">
              {activeTab} settings configured.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
