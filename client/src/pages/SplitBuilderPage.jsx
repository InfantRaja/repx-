import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Check,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  Moon,
  Dumbbell,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import API from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const SplitBuilderPage = () => {
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSplitId, setActiveSplitId] = useState(null);

  // Edit / Create mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editingSplitId, setEditingSplitId] = useState(null);
  const [splitName, setSplitName] = useState('My Custom Split');
  const [splitDescription, setSplitDescription] = useState('High frequency personalized schedule.');

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

  const fetchSplits = async () => {
    try {
      setLoading(true);
      const res = await API.get('/splits');
      if (res.data?.success) {
        setSplits(res.data.data);
        const active = res.data.data.find((s) => s.isActive);
        if (active) setActiveSplitId(active._id);
      }
    } catch (e) {
      console.error('Failed to load splits:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSplits();
  }, []);

  const handleActivateSplit = async (id) => {
    try {
      const res = await API.put(`/splits/${id}/activate`);
      if (res.data?.success) {
        setActiveSplitId(id);
        fetchSplits();
      }
    } catch (e) {}
  };

  const handleCreateNew = () => {
    setEditingSplitId(null);
    setSplitName('Custom PPL Split');
    setSplitDescription('Tailored 7-day schedule with active recovery.');
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
    if (!window.confirm('Delete this split schedule?')) return;
    try {
      await API.delete(`/splits/${id}`);
      fetchSplits();
    } catch (e) {}
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
      } else {
        await API.post('/splits', {
          name: splitName.trim(),
          description: splitDescription.trim(),
          days,
          isActive: true,
        });
      }
      setIsEditing(false);
      fetchSplits();
    } catch (err) {
      console.error('Failed to save split:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight">
            Workout Split Builder
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Organize weekly training cadence, assign muscle focuses, and schedule muscle recovery.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-repx-volt text-black font-black font-display text-sm hover:bg-repx-voltHover transition-all shadow-volt-glow active:scale-95"
          >
            <Plus className="w-4 h-4" /> Build Custom Split
          </button>
        )}
      </div>

      {/* EDIT / CREATE SPLIT FORM */}
      {isEditing ? (
        <form onSubmit={handleSaveSplit} className="space-y-6">
          <div className="repx-card rounded-3xl p-6 border border-repx-volt/40 shadow-volt-glow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-repx-border">
              <h3 className="text-lg font-black font-display text-white">
                {editingSplitId ? 'Edit Split Schedule' : 'Create New Split'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-slate-400 hover:text-white"
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
                  placeholder="e.g. Quad focus on Wed, Hamstring focus on Sun"
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
        /* LIST OF SAVED SPLITS */
        <div className="space-y-6">
          {loading ? (
            <LoadingSkeleton type="card" count={3} />
          ) : (
            <div className="space-y-6">
              {splits.map((split) => {
                const isActive = split._id === activeSplitId || split.isActive;

                return (
                  <div
                    key={split._id}
                    className={`repx-card rounded-3xl p-6 md:p-8 border transition-all ${
                      isActive
                        ? 'border-2 border-repx-volt/60 bg-repx-900 shadow-volt-glow'
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
                          <span className="text-xs text-slate-400 font-medium">
                            7 Days Cycle
                          </span>
                        </div>
                        <h2 className="text-2xl font-black font-display text-white">
                          {split.name}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">{split.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isActive && (
                          <button
                            onClick={() => handleActivateSplit(split._id)}
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
                        {!split.isTemplate && (
                          <button
                            onClick={() => handleDeleteSplit(split._id)}
                            className="p-2.5 rounded-xl bg-repx-800 hover:bg-repx-crimson/20 text-repx-crimson border border-repx-border text-xs font-bold"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 7 Days Schedule Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5 mt-6">
                      {(split.days || defaultDays).map((day) => (
                        <div
                          key={day.dayNumber}
                          className={`rounded-2xl p-3 border flex flex-col justify-between min-h-[110px] ${
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
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SplitBuilderPage;
