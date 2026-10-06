import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Dumbbell,
  Check,
  Search,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import API from '../services/api';

export const CreateWorkoutPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(60);
  const [targetMuscles, setTargetMuscles] = useState(['Chest', 'Triceps']);

  const [selectedExercises, setSelectedExercises] = useState([]);

  // Modal for picking exercise
  const [showPicker, setShowPicker] = useState(false);
  const [libraryExercises, setLibraryExercises] = useState([]);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerMuscle, setPickerMuscle] = useState('All');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const availableMuscleGroups = [
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Legs',
    'Abs',
    'Cardio',
    'Full Body',
  ];

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await API.get('/exercises');
        if (res.data?.success) {
          setLibraryExercises(res.data.data);
        }
      } catch (e) {}
    };
    fetchExercises();
  }, []);

  const toggleTargetMuscle = (muscle) => {
    if (targetMuscles.includes(muscle)) {
      setTargetMuscles(targetMuscles.filter((m) => m !== muscle));
    } else {
      setTargetMuscles([...targetMuscles, muscle]);
    }
  };

  const handleAddExerciseFromLibrary = (exercise) => {
    setSelectedExercises([
      ...selectedExercises,
      {
        exercise: exercise._id,
        exerciseName: exercise.name,
        muscleGroup: exercise.muscleGroup,
        order: selectedExercises.length + 1,
        notes: '',
        defaultSets: [
          { setNumber: 1, targetWeight: 60, targetReps: 10, isWarmup: false },
          { setNumber: 2, targetWeight: 70, targetReps: 8, isWarmup: false },
          { setNumber: 3, targetWeight: 80, targetReps: 6, isWarmup: false },
        ],
      },
    ]);
    setShowPicker(false);
  };

  const handleRemoveExercise = (idx) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== idx));
  };

  const handleMoveExercise = (idx, direction) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= selectedExercises.length) return;
    const items = [...selectedExercises];
    const [moved] = items.splice(idx, 1);
    items.splice(newIdx, 0, moved);
    setSelectedExercises(items);
  };

  const handleAddSetToExercise = (exIdx) => {
    const updated = [...selectedExercises];
    const sets = updated[exIdx].defaultSets;
    const lastSet = sets[sets.length - 1];
    sets.push({
      setNumber: sets.length + 1,
      targetWeight: lastSet ? lastSet.targetWeight : 60,
      targetReps: lastSet ? lastSet.targetReps : 10,
      isWarmup: false,
    });
    setSelectedExercises(updated);
  };

  const handleRemoveSetFromExercise = (exIdx, setIdx) => {
    const updated = [...selectedExercises];
    updated[exIdx].defaultSets = updated[exIdx].defaultSets
      .filter((_, i) => i !== setIdx)
      .map((s, i) => ({ ...s, setNumber: i + 1 }));
    setSelectedExercises(updated);
  };

  const handleSetChange = (exIdx, setIdx, field, val) => {
    const updated = [...selectedExercises];
    updated[exIdx].defaultSets[setIdx][field] = val;
    setSelectedExercises(updated);
  };

  const handleSaveRoutine = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please specify a routine title.');
      return;
    }
    if (selectedExercises.length === 0) {
      setErrorMsg('Add at least one exercise to the routine.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await API.post('/workouts', {
        name: name.trim(),
        description: description.trim(),
        difficulty,
        estimatedDurationMinutes: Number(estimatedDurationMinutes) || 60,
        targetMuscles,
        exercises: selectedExercises,
      });

      if (res.data?.success) {
        navigate('/workouts');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save workout routine.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPickerExercises = libraryExercises.filter((ex) => {
    const matchSearch =
      ex.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      (ex.targetMuscles || []).some((m) => m.toLowerCase().includes(pickerSearch.toLowerCase()));
    if (!matchSearch) return false;
    if (pickerMuscle !== 'All' && ex.muscleGroup !== pickerMuscle) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/workouts')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Routines
        </button>

        <h1 className="text-xl md:text-2xl font-black font-display text-white">
          Build Custom Workout
        </h1>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-repx-crimson/15 border border-repx-crimson/40 text-repx-crimson text-xs">
          {errorMsg}
        </div>
      )}

      {/* Routine Metadata Card */}
      <div className="repx-card rounded-3xl p-6 border border-repx-border space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Routine Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Heavy Upper Body Push"
            className="w-full bg-repx-900 border border-repx-border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-repx-volt font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes on volume, intensity, rest tempo, or RPE targets..."
            className="w-full bg-repx-900 border border-repx-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-repx-volt"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    difficulty === lvl
                      ? 'bg-repx-volt/15 border-repx-volt text-repx-volt'
                      : 'bg-repx-900 border-repx-border text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Estimated Duration (Mins)
            </label>
            <input
              type="number"
              value={estimatedDurationMinutes}
              onChange={(e) => setEstimatedDurationMinutes(e.target.value)}
              className="w-full bg-repx-900 border border-repx-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-repx-volt"
            />
          </div>
        </div>

        {/* Target Muscles Badges */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Target Muscle Groups
          </label>
          <div className="flex flex-wrap gap-2">
            {availableMuscleGroups.map((muscle) => {
              const isSelected = targetMuscles.includes(muscle);
              return (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => toggleTargetMuscle(muscle)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-repx-volt text-black border-repx-volt shadow-volt-glow'
                      : 'bg-repx-900 border-repx-border text-slate-400 hover:text-white'
                  }`}
                >
                  {muscle}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Programmed Exercises Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black font-display text-white">
            Programmed Exercises ({selectedExercises.length})
          </h2>

          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="px-4 py-2 rounded-xl bg-repx-volt text-black font-extrabold font-display text-xs hover:bg-repx-voltHover transition-all flex items-center gap-1.5 shadow-volt-glow"
          >
            <Plus className="w-4 h-4" /> Add Exercise
          </button>
        </div>

        {selectedExercises.length === 0 ? (
          <div className="repx-card rounded-2xl p-8 text-center border-dashed border-repx-border">
            <Dumbbell className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <div className="text-sm font-bold text-white">No exercises added yet</div>
            <div className="text-xs text-slate-400 mt-1 mb-4">
              Click 'Add Exercise' to select movements from the library.
            </div>
            <button
              onClick={() => setShowPicker(true)}
              className="px-4 py-2 rounded-xl bg-repx-800 hover:bg-repx-750 text-xs font-bold text-slate-200"
            >
              Browse Library
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedExercises.map((ex, exIdx) => (
              <div
                key={exIdx}
                className="repx-card rounded-2xl p-5 border border-repx-border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-repx-800 text-slate-300 font-bold text-xs flex items-center justify-center">
                      {exIdx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-black font-display text-white">{ex.exerciseName}</h4>
                      <span className="text-[10px] text-repx-volt uppercase font-bold">
                        {ex.muscleGroup}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveExercise(exIdx, -1)}
                      disabled={exIdx === 0}
                      className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveExercise(exIdx, 1)}
                      disabled={exIdx === selectedExercises.length - 1}
                      className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exIdx)}
                      className="p-1 rounded-lg text-repx-crimson/80 hover:text-repx-crimson ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Default Target Sets Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-500 uppercase tracking-wider text-[10px] border-b border-repx-border">
                        <th className="py-1.5 w-12">Set</th>
                        <th className="py-1.5">Target Weight (KG)</th>
                        <th className="py-1.5">Target Reps</th>
                        <th className="py-1.5 w-16 text-center">Warmup</th>
                        <th className="py-1.5 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-repx-border/40">
                      {ex.defaultSets.map((s, sIdx) => (
                        <tr key={sIdx}>
                          <td className="py-2 font-bold text-slate-300">{s.setNumber}</td>
                          <td className="py-2 pr-2">
                            <input
                              type="number"
                              value={s.targetWeight}
                              onChange={(e) =>
                                handleSetChange(exIdx, sIdx, 'targetWeight', Number(e.target.value))
                              }
                              className="w-20 bg-repx-900 border border-repx-border rounded-lg px-2.5 py-1 text-white font-bold"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="number"
                              value={s.targetReps}
                              onChange={(e) =>
                                handleSetChange(exIdx, sIdx, 'targetReps', Number(e.target.value))
                              }
                              className="w-16 bg-repx-900 border border-repx-border rounded-lg px-2.5 py-1 text-white font-bold"
                            />
                          </td>
                          <td className="py-2 text-center">
                            <input
                              type="checkbox"
                              checked={s.isWarmup}
                              onChange={(e) =>
                                handleSetChange(exIdx, sIdx, 'isWarmup', e.target.checked)
                              }
                              className="accent-repx-volt w-4 h-4 rounded cursor-pointer"
                            />
                          </td>
                          <td className="py-2 text-right">
                            {ex.defaultSets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSetFromExercise(exIdx, sIdx)}
                                className="text-slate-500 hover:text-repx-crimson"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddSetToExercise(exIdx)}
                  className="text-[11px] font-bold text-repx-volt hover:underline flex items-center gap-1 pt-1"
                >
                  <Plus className="w-3 h-3" /> Add Target Set
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="pt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate('/workouts')}
          className="px-5 py-3 rounded-xl bg-repx-850 hover:bg-repx-800 text-xs font-bold text-slate-300"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={handleSaveRoutine}
          className="px-8 py-3 rounded-xl bg-repx-volt text-black font-extrabold font-display text-sm hover:bg-repx-voltHover transition-all shadow-volt-glow disabled:opacity-50 active:scale-95"
        >
          {submitting ? 'Saving...' : 'Save Workout Routine'}
        </button>
      </div>

      {/* Exercise Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="repx-card w-full max-w-2xl max-h-[85vh] rounded-3xl p-6 border border-repx-border flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-repx-border">
              <h3 className="text-lg font-black font-display text-white">Select Exercise</h3>
              <button
                onClick={() => setShowPicker(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Category Filter */}
            <div className="py-4 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search 30+ exercises..."
                  className="w-full bg-repx-900 border border-repx-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-repx-volt"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['All', ...availableMuscleGroups].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPickerMuscle(m)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      pickerMuscle === m
                        ? 'bg-repx-volt text-black'
                        : 'bg-repx-850 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredPickerExercises.map((ex) => (
                <div
                  key={ex._id}
                  onClick={() => handleAddExerciseFromLibrary(ex)}
                  className="p-3 rounded-xl bg-repx-850/80 hover:bg-repx-800 border border-repx-border hover:border-repx-volt/40 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{ex.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {ex.muscleGroup} • {ex.equipment} • {ex.difficulty}
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-repx-volt" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateWorkoutPage;
