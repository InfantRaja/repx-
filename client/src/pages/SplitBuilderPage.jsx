import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Check,
  Trash2,
  Edit2,
  Moon,
  Dumbbell,
  Sparkles,
  Layers,
  Flame,
  Clock,
  RotateCcw,
  Zap,
} from 'lucide-react';
import API from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { allSplitsData } from '../data/splitsData';

export const SplitBuilderPage = () => {
  const [splits, setSplits] = useState(allSplitsData);
  const [loading, setLoading] = useState(false);
  const [activeSplitId, setActiveSplitId] = useState(allSplitsData[0]._id);
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'my-splits'
  const [selectedDayFilter, setSelectedDayFilter] = useState('all'); // 'all' | '6' | '5' | '4' | '3'
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Edit / Create mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editingSplitId, setEditingSplitId] = useState(null);
  const [splitName, setSplitName] = useState('My Custom Split');
  const [splitDescription, setSplitDescription] = useState('Personalized 7-day schedule.');

  const defaultDays = [
    { dayNumber: 1, dayName: 'Monday', title: 'Push Day (Heavy)', isRestDay: false, targetMuscles: ['Chest', 'Shoulders', 'Triceps'] },
    { dayNumber: 2, dayName: 'Tuesday', title: 'Pull Day (Heavy)', isRestDay: false, targetMuscles: ['Back', 'Biceps'] },
    { dayNumber: 3, dayName: 'Wednesday', title: 'Legs Day (Quad Focus)', isRestDay: false, targetMuscles: ['Quads', 'Hamstrings', 'Calves'] },
    { dayNumber: 4, dayName: 'Thursday', title: 'Rest & Recovery', isRestDay: true, targetMuscles: ['Mobility'] },
    { dayNumber: 5, dayName: 'Friday', title: 'Push Day (Hypertrophy)', isRestDay: false, targetMuscles: ['Chest', 'Shoulders', 'Triceps'] },
    { dayNumber: 6, dayName: 'Saturday', title: 'Pull Day (Hypertrophy)', isRestDay: false, targetMuscles: ['Back', 'Biceps'] },
    { dayNumber: 7, dayName: 'Sunday', title: 'Legs & Core', isRestDay: false, targetMuscles: ['Hamstrings', 'Calves', 'Abs'] },
  ];

  const [days, setDays] = useState(defaultDays);
  const [submitting, setSubmitting] = useState(false);

  // Compute current day of week (1 = Monday, 7 = Sunday)
  const currentDayOfWeek = (() => {
    const d = new Date().getDay();
    return d === 0 ? 7 : d; // Sunday is 7
  })();

  const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchSplits = async () => {
    try {
      const res = await API.get('/splits');
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setSplits(res.data.data);
        const active = res.data.data.find((s) => s.isActive);
        if (active) setActiveSplitId(active._id);
      } else {
        setSplits(allSplitsData);
        setActiveSplitId(allSplitsData[0]._id);
      }
    } catch (e) {
      console.warn('Using client-side splits templates fallback:', e);
      setSplits(allSplitsData);
      setActiveSplitId(allSplitsData[0]._id);
    }
  };

  useEffect(() => {
    fetchSplits();
  }, []);

  const showNotification = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const handleActivateSplit = async (id, name) => {
    try {
      const res = await API.put(`/splits/${id}/activate`);
      if (res.data?.success) {
        setActiveSplitId(res.data.data?._id || id);
        showNotification(`⚡ "${name}" activated as your current weekly program!`);
        fetchSplits();
      }
    } catch (e) {
      console.error('Failed to activate split:', e);
    }
  };

  const handleReSeedSplits = async () => {
    try {
      setLoading(true);
      const res = await API.post('/splits/seed-templates');
      if (res.data?.success) {
        showNotification('✅ Successfully re-seeded all 10 workout splits!');
        fetchSplits();
      }
    } catch (e) {
      console.error('Failed to reseed splits:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingSplitId(null);
    setSplitName('Custom Workout Split');
    setSplitDescription('Tailored 7-day schedule designed for my fitness goals.');
    setDays(defaultDays);
    setIsEditing(true);
  };

  const handleEditSplit = (split) => {
    setEditingSplitId(split._id);
    setSplitName(split.name);
    setSplitDescription(split.description || '');
    setDays(split.days?.length ? split.days : defaultDays);
    setIsEditing(true);
  };

  const handleDeleteSplit = async (id) => {
    if (!window.confirm('Delete this custom split schedule?')) return;
    try {
      await API.delete(`/splits/${id}`);
      showNotification('Split deleted successfully.');
      fetchSplits();
    } catch (e) {
      console.error('Failed to delete split:', e);
    }
  };

  const handleDayTitleChange = (idx, newTitle) => {
    const updated = [...days];
    updated[idx].title = newTitle;
    setDays(updated);
  };

  const handleToggleRestDay = (idx) => {
    const updated = [...days];
    updated[idx].isRestDay = !updated[idx].isRestDay;
    if (updated[idx].isRestDay) {
      updated[idx].title = 'Rest & Recovery';
      updated[idx].targetMuscles = ['Recovery'];
    } else {
      updated[idx].title = 'Workout Day';
      updated[idx].targetMuscles = ['Full Body'];
    }
    setDays(updated);
  };

  const handleDayMusclesChange = (idx, muscleStr) => {
    const updated = [...days];
    updated[idx].targetMuscles = muscleStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setDays(updated);
  };

  const handleSaveSplit = async (e) => {
    e.preventDefault();
    if (!splitName.trim()) return;

    try {
      setSubmitting(true);
      if (editingSplitId) {
        await API.put(`/splits/${editingSplitId}`, {
          name: splitName.trim(),
          description: splitDescription.trim(),
          days,
        });
        showNotification(`Updated "${splitName}" successfully!`);
      } else {
        await API.post('/splits', {
          name: splitName.trim(),
          description: splitDescription.trim(),
          days,
          isActive: true,
        });
        showNotification(`Created and activated "${splitName}"!`);
      }
      setIsEditing(false);
      fetchSplits();
    } catch (err) {
      console.error('Failed to save split:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Find the currently active split
  const effectiveSplits = splits.length > 0 ? splits : allSplitsData;
  const activeSplit = effectiveSplits.find((s) => s._id === activeSplitId || s.isActive) || effectiveSplits[0];
  const todayWorkout = activeSplit?.days?.find((d) => d.dayNumber === currentDayOfWeek) || activeSplit?.days?.[0];

  // Filter splits for library
  const templateSplits = effectiveSplits.filter((s) => s.isTemplate);
  const displayTemplates = templateSplits.length > 0 ? templateSplits : allSplitsData;
  const userCustomSplits = effectiveSplits.filter((s) => !s.isTemplate);

  const filteredTemplates = displayTemplates.filter((split) => {
    if (selectedDayFilter === 'all') return true;
    const workoutDaysCount = (split.days || []).filter((d) => !d.isRestDay).length;
    return workoutDaysCount.toString() === selectedDayFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-5 right-5 z-50 bg-repx-900 border border-repx-volt/60 shadow-volt-glow text-white px-5 py-3 rounded-2xl flex items-center gap-3 animate-fade-in text-sm font-bold">
          <Zap className="w-5 h-5 text-repx-volt shrink-0 animate-pulse" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-black tracking-wider uppercase">
              10 SCIENCE-BACKED SPLITS
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Workout Split Builder
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
            Choose from all 10 battle-tested workout splits (PPL, Upper/Lower, Arnold, Bro Split, Full Body, PHUL, PHAT) or craft your own personalized weekly cadence.
          </p>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReSeedSplits}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all"
              title="Ensure all 10 split templates are inserted"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Splits
            </button>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" /> Build Custom Split
            </button>
          </div>
        )}
      </div>

      {/* TODAY'S WORKOUT HIGHLIGHT BANNER (Hevy Light Theme) */}
      {activeSplit && (
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                {todayWorkout?.isRestDay ? <Moon className="w-6 h-6" /> : <Flame className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                    TODAY ({dayNames[currentDayOfWeek]})
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-medium">
                    Active Program: <strong className="text-slate-900">{activeSplit.name}</strong>
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mt-0.5">
                  {todayWorkout?.title || 'Scheduled Workout'}
                </h3>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {todayWorkout?.isRestDay ? (
                    <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                      Rest & System Recovery Day
                    </span>
                  ) : (
                    (todayWorkout?.targetMuscles || []).map((m, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {m}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                {activeSplit.days?.filter((d) => !d.isRestDay).length} Workout Days / Week
              </span>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION TABS */}
      {!isEditing && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-repx-border pb-3 gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-black font-display shrink-0 transition-all ${
                activeTab === 'library'
                  ? 'bg-repx-volt text-black shadow-volt-glow'
                  : 'bg-repx-850 text-slate-400 hover:text-white border border-repx-border'
              }`}
            >
              <Layers className="w-4 h-4" />
              Split Library ({templateSplits.length})
            </button>

            <button
              onClick={() => setActiveTab('my-splits')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-black font-display shrink-0 transition-all ${
                activeTab === 'my-splits'
                  ? 'bg-repx-volt text-black shadow-volt-glow'
                  : 'bg-repx-850 text-slate-400 hover:text-white border border-repx-border'
              }`}
            >
              <Calendar className="w-4 h-4" />
              My Custom Splits ({userCustomSplits.length})
            </button>
          </div>

          {/* Days per week filter for library */}
          {activeTab === 'library' && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { label: 'All (10)', val: 'all' },
                { label: '6 Days', val: '6' },
                { label: '5 Days', val: '5' },
                { label: '4 Days', val: '4' },
                { label: '3 Days', val: '3' },
              ].map((f) => (
                <button
                  key={f.val}
                  onClick={() => setSelectedDayFilter(f.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    selectedDayFilter === f.val
                      ? 'bg-repx-volt/20 text-repx-volt border border-repx-volt/40'
                      : 'text-slate-400 hover:text-white bg-repx-850/60 border border-transparent'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDIT / CREATE SPLIT FORM */}
      {isEditing ? (
        <form onSubmit={handleSaveSplit} className="space-y-6">
          <div className="repx-card rounded-3xl p-6 border border-repx-volt/40 shadow-volt-glow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-repx-border">
              <h3 className="text-lg font-black font-display text-white">
                {editingSplitId ? 'Customize Split Schedule' : 'Create New Split'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-repx-800"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Split Title *
                </label>
                <input
                  type="text"
                  required
                  value={splitName}
                  onChange={(e) => setSplitName(e.target.value)}
                  placeholder="e.g. Elite PPL 6-Day"
                  className="w-full bg-repx-900 border border-repx-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-repx-volt font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={splitDescription}
                  onChange={(e) => setSplitDescription(e.target.value)}
                  placeholder="e.g. High intensity hypertrophy schedule"
                  className="w-full bg-repx-900 border border-repx-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-repx-volt"
                />
              </div>
            </div>
          </div>

          {/* 7 Days Matrix */}
          <div className="space-y-3">
            <h3 className="text-base font-black font-display text-white">
              7-Day Weekly Program Schedule
            </h3>

            {days.map((day, idx) => (
              <div
                key={day.dayNumber}
                className={`repx-card rounded-2xl p-4 border transition-all ${
                  day.isRestDay
                    ? 'border-repx-border bg-repx-900/50'
                    : 'border-repx-borderLight bg-repx-900'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-repx-800 text-repx-volt font-black font-display text-xs flex items-center justify-center shrink-0 border border-repx-border">
                      {day.dayName.slice(0, 3)}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-400">{day.dayName}</div>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => handleDayTitleChange(idx, e.target.value)}
                        placeholder="Day Title"
                        className="bg-transparent border-b border-repx-border focus:border-repx-volt text-sm font-black font-display text-white focus:outline-none mt-0.5"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!day.isRestDay && (
                      <input
                        type="text"
                        value={(day.targetMuscles || []).join(', ')}
                        onChange={(e) => handleDayMusclesChange(idx, e.target.value)}
                        placeholder="Muscles (comma separated)"
                        className="bg-repx-850 border border-repx-border rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-repx-volt min-w-[200px]"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleRestDay(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                        day.isRestDay
                          ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                          : 'bg-repx-850 border-repx-border text-slate-400 hover:text-white'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      {day.isRestDay ? 'Rest Day' : 'Workout'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-3 rounded-xl bg-repx-850 hover:bg-repx-800 text-xs font-bold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-repx-volt text-black font-extrabold font-display text-sm hover:bg-repx-voltHover transition-all shadow-volt-glow active:scale-95"
            >
              {submitting ? 'Saving...' : 'Save & Deploy Split'}
            </button>
          </div>
        </form>
      ) : (
        /* SPLITS LIST */
        <div className="space-y-6">
          {loading ? (
            <LoadingSkeleton type="card" count={3} />
          ) : (
            <>
              {/* TAB 1: SPLIT LIBRARY */}
              {activeTab === 'library' && (
                <div className="space-y-6">
                  {filteredTemplates.length === 0 ? (
                    <div className="repx-card rounded-3xl p-8 text-center border border-repx-border">
                      <p className="text-slate-400 text-sm">No split templates match this day filter.</p>
                      <button
                        onClick={() => setSelectedDayFilter('all')}
                        className="mt-3 px-4 py-2 rounded-xl bg-repx-800 text-xs font-bold text-repx-volt"
                      >
                        Reset Filter
                      </button>
                    </div>
                  ) : (
                    filteredTemplates.map((split) => {
                      const isActive = split._id === activeSplitId || split.isActive;
                      const workoutDays = (split.days || []).filter((d) => !d.isRestDay).length;

                      return (
                        <div
                          key={split._id}
                          className={`bg-white rounded-2xl p-6 md:p-8 border transition-all shadow-sm ${
                            isActive
                              ? 'border-2 border-blue-600'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {isActive && (
                                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-sm">
                                    ACTIVE SPLIT
                                  </span>
                                )}
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                  {workoutDays} DAYS / WEEK
                                </span>
                              </div>
                              <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                                {split.name}
                              </h2>
                              <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
                                {split.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {!isActive ? (
                                <button
                                  onClick={() => handleActivateSplit(split._id, split.name)}
                                  className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                                >
                                  <Zap className="w-3.5 h-3.5" /> SET AS ACTIVE
                                </button>
                              ) : (
                                <span className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 font-bold text-xs flex items-center gap-1.5">
                                  <Check className="w-3.5 h-3.5" /> CURRENT PROGRAM
                                </span>
                              )}
                              <button
                                onClick={() => handleEditSplit(split)}
                                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                                title="Customize this split"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Customize
                              </button>
                            </div>
                          </div>

                          {/* 7 Days Cards - Horizontal swipeable on phone, responsive grid on desktop */}
                          <div className="flex overflow-x-auto pb-2 gap-2.5 mt-5 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-7">
                            {(split.days || defaultDays).map((day) => (
                              <div
                                key={day.dayNumber}
                                className={`min-w-[135px] sm:min-w-0 rounded-2xl p-3 border flex flex-col justify-between min-h-[110px] shrink-0 sm:shrink ${
                                  day.isRestDay
                                    ? 'bg-slate-50 border-slate-100 text-slate-400'
                                    : 'bg-slate-50/80 border-slate-200 text-slate-700'
                                }`}
                              >
                                <div>
                                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    {day.dayName}
                                  </div>
                                  <div className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                                    {day.title}
                                  </div>
                                </div>

                                <div className="mt-2">
                                  {day.isRestDay ? (
                                    <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                                      <Moon className="w-3 h-3" /> Recovery
                                    </span>
                                  ) : (
                                    <div className="flex flex-wrap gap-1">
                                      {(day.targetMuscles || []).slice(0, 2).map((m, i) => (
                                        <span
                                          key={i}
                                          className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white text-blue-600 border border-slate-200"
                                        >
                                          {m}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: MY CUSTOM SPLITS */}
              {activeTab === 'my-splits' && (
                <div className="space-y-6">
                  {userCustomSplits.length === 0 ? (
                    <div className="repx-card rounded-3xl p-10 text-center border border-repx-border space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-repx-850 flex items-center justify-center mx-auto text-repx-volt border border-repx-border">
                        <Calendar className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-black font-display text-white">No Custom Splits Yet</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        You can build a split from scratch, or pick any split from the library and click "Customize" to personalize it for your body.
                      </p>
                      <button
                        onClick={handleCreateNew}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-repx-volt text-black font-black font-display text-xs hover:bg-repx-voltHover transition-all shadow-volt-glow"
                      >
                        <Plus className="w-4 h-4" /> Create Custom Split
                      </button>
                    </div>
                  ) : (
                    userCustomSplits.map((split) => {
                      const isActive = split._id === activeSplitId || split.isActive;

                      return (
                        <div
                          key={split._id}
                          className={`repx-card rounded-3xl p-6 md:p-8 border transition-all ${
                            isActive
                              ? 'border-2 border-repx-volt/70 bg-repx-900 shadow-volt-glow'
                              : 'border-repx-border bg-repx-850/60'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-repx-border">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                {isActive && (
                                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-repx-volt text-black shadow-volt-glow">
                                    ACTIVE SPLIT
                                  </span>
                                )}
                                <span className="text-xs text-slate-400 font-medium">Custom User Split</span>
                              </div>
                              <h2 className="text-2xl font-black font-display text-white">
                                {split.name}
                              </h2>
                              <p className="text-xs text-slate-400 mt-0.5">{split.description}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              {!isActive && (
                                <button
                                  onClick={() => handleActivateSplit(split._id, split.name)}
                                  className="px-4 py-2.5 rounded-xl bg-repx-volt text-black font-extrabold font-display text-xs hover:bg-repx-voltHover transition-all shadow-volt-glow"
                                >
                                  SET AS ACTIVE
                                </button>
                              )}
                              <button
                                onClick={() => handleEditSplit(split)}
                                className="p-2.5 rounded-xl bg-repx-800 hover:bg-repx-750 text-slate-300 border border-repx-border text-xs font-bold"
                                title="Edit Split"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSplit(split._id)}
                                className="p-2.5 rounded-xl bg-repx-800 hover:bg-repx-crimson/20 text-repx-crimson border border-repx-border text-xs font-bold"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* 7 Days Schedule Cards - Horizontal swipeable on phone, responsive grid on desktop */}
                          <div className="flex overflow-x-auto pb-2 gap-2.5 mt-5 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-7">
                            {(split.days || defaultDays).map((day) => (
                              <div
                                key={day.dayNumber}
                                className={`min-w-[135px] sm:min-w-0 rounded-2xl p-3 border flex flex-col justify-between min-h-[110px] shrink-0 sm:shrink ${
                                  day.isRestDay
                                    ? 'bg-repx-950/60 border-repx-border/50 text-slate-500'
                                    : 'bg-repx-900 border-repx-borderLight text-slate-200'
                                }`}
                              >
                                <div>
                                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    {day.dayName}
                                  </div>
                                  <div className="text-xs font-black font-display text-white mt-1 leading-snug">
                                    {day.title}
                                  </div>
                                </div>

                                <div className="mt-2">
                                  {day.isRestDay ? (
                                    <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                                      <Moon className="w-3 h-3" /> Recovery
                                    </span>
                                  ) : (
                                    <div className="flex flex-wrap gap-1">
                                      {(day.targetMuscles || []).slice(0, 2).map((m, i) => (
                                        <span
                                          key={i}
                                          className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-repx-800 text-repx-volt"
                                        >
                                          {m}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SplitBuilderPage;
