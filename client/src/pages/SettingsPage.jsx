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
  const [unit, setUnit] = useState(user?.preferences?.unit || 'kg');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const displayName = name || 'INFANT RAJA';
  const initial = displayName.charAt(0).toUpperCase() || 'I';

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      await updateProfile({
        name,
        bio,
        preferences: { unit },
      });
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
            <div className="space-y-4 max-w-sm">
              <label className="block text-xs font-bold text-slate-700">Weight Unit</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setUnit('kg')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    unit === 'kg'
                      ? 'bg-blue-50 border-blue-300 text-blue-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Kilograms (kg)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('lbs')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    unit === 'lbs'
                      ? 'bg-blue-50 border-blue-300 text-blue-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Pounds (lbs)
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'Profile' && activeTab !== 'Units' && (
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
