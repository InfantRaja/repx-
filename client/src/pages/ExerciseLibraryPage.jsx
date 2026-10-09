import React, { useState, useEffect } from 'react';
import { Search, Dumbbell, ChevronRight, Plus, ExternalLink, Activity } from 'lucide-react';
import API from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const ExerciseLibraryPage = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState('All');
  const [equipment, setEquipment] = useState('All');

  const muscleOptions = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Cardio'];
  const equipmentOptions = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight'];

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        let url = `/exercises?`;
        if (muscle !== 'All') url += `&muscle=${muscle}`;
        if (equipment !== 'All') url += `&equipment=${equipment}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const res = await API.get(url);
        if (res.data?.success) {
          setExercises(res.data.data);
          // Auto select first on desktop if none selected
          if (!selectedExercise && res.data.data.length > 0 && window.innerWidth >= 1024) {
            setSelectedExercise(res.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load exercises:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [search, muscle, equipment]);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Exercise</h1>

      {/* Two Column Layout matching Hevy Screenshot 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Center Column: Exercise Detail or Empty State (7 Cols on desktop) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 min-h-[480px] shadow-sm flex flex-col justify-center">
          {selectedExercise ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                      {selectedExercise.muscleGroup}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {selectedExercise.equipment}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {selectedExercise.difficulty}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedExercise.name}</h2>
                </div>
              </div>

              {/* Target Muscles */}
              {selectedExercise.targetMuscles?.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Target Muscles
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedExercise.targetMuscles.map((tm, i) => (
                      <span
                        key={i}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700"
                      >
                        {tm}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {selectedExercise.instructions?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Execution Instructions
                  </div>
                  <ol className="space-y-2 text-sm text-slate-700 leading-relaxed list-decimal list-inside bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedExercise.instructions.map((step, idx) => (
                      <li key={idx} className="font-medium">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Video or Form Cue */}
              {selectedExercise.videoUrl && (
                <a
                  href={selectedExercise.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Watch Video Demonstration
                </a>
              )}
            </div>
          ) : (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Dumbbell className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Select Exercise</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Click on an exercise to see statistics and execution details about it.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Library & Filters (5 Cols on desktop) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-slate-900">Library</h3>
            <button className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Custom Exercise
            </button>
          </div>

          {/* Equipment Dropdown */}
          <div>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium outline-none focus:border-blue-400 cursor-pointer"
            >
              <option value="All">All Equipment</option>
              {equipmentOptions.filter((o) => o !== 'All').map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Muscles Dropdown */}
          <div>
            <select
              value={muscle}
              onChange={(e) => setMuscle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium outline-none focus:border-blue-400 cursor-pointer"
            >
              <option value="All">All Muscles</option>
              {muscleOptions.filter((o) => o !== 'All').map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Exercises"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none border border-transparent focus:border-blue-400 focus:bg-white transition-all"
            />
          </div>

          {/* Exercises Scroll List */}
          <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1">
              All Exercises ({exercises.length})
            </div>

            {loading ? (
              <LoadingSkeleton type="card" count={5} />
            ) : exercises.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No exercises found.</div>
            ) : (
              exercises.map((ex) => {
                const isSelected = selectedExercise?._id === ex._id;
                return (
                  <button
                    key={ex._id}
                    onClick={() => setSelectedExercise(ex)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Circular thumbnail / icon like Hevy */}
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600 font-bold text-xs">
                        {ex.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {ex.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{ex.muscleGroup}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibraryPage;
