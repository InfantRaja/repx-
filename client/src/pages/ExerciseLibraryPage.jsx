import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Dumbbell, Filter, ArrowRight } from 'lucide-react';
import API from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const ExerciseLibraryPage = () => {
  const navigate = useNavigate();

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState('All');
  const [equipment, setEquipment] = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  const muscleCategories = [
    'All',
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Legs',
  ];

  const equipmentOptions = [
    'All',
    'Barbell',
    'Dumbbell',
    'Cable',
    'Machine',
    'Bodyweight',
  ];

  const difficultyOptions = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        let url = `/exercises?muscle=${muscle}&equipment=${equipment}&difficulty=${difficulty}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const res = await API.get(url);
        if (res.data?.success) {
          setExercises(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load exercises:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [search, muscle, equipment, difficulty]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight">
          Exercise Encyclopedia
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-0.5">
          Browse biomechanically structured movements with execution queues and target muscular anatomy.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="repx-card rounded-3xl p-5 border border-repx-border space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises by name, muscle group, or keywords..."
            className="w-full bg-repx-900 border border-repx-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-repx-volt"
          />
        </div>

        {/* Muscle Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {muscleCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setMuscle(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                muscle === cat
                  ? 'bg-repx-volt text-black shadow-volt-glow'
                  : 'bg-repx-900 text-slate-400 hover:text-white border border-repx-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary filters (Equipment & Difficulty) */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-repx-border/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Equipment:</span>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="bg-repx-900 border border-repx-border text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-repx-volt"
            >
              {equipmentOptions.map((eq) => (
                <option key={eq} value={eq}>
                  {eq}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Difficulty:</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-repx-900 border border-repx-border text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-repx-volt"
            >
              {difficultyOptions.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-slate-500 text-[11px] font-bold">
            Showing <span className="text-white">{exercises.length}</span> movements
          </div>
        </div>
      </div>

      {/* Exercises Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton type="card" count={6} />
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-16 repx-card rounded-2xl border border-dashed border-repx-border">
          <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <div className="text-sm font-bold text-white">No exercises matched your filters</div>
          <div className="text-xs text-slate-400 mt-1">
            Try resetting filters or adjusting search keywords.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <div
              key={ex._id}
              onClick={() => navigate(`/exercises/${ex._id}`)}
              className="repx-card-interactive rounded-3xl p-5 border border-repx-border cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-lg bg-repx-volt/15 text-repx-volt border border-repx-volt/30">
                    {ex.muscleGroup}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{ex.equipment}</span>
                </div>

                <h3 className="text-lg font-black font-display text-white group-hover:text-repx-volt transition-colors">
                  {ex.name}
                </h3>

                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {ex.instructions?.[0] || 'Execute with full range of motion and locked control.'}
                </p>

                {/* Target muscles preview */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {(ex.targetMuscles || []).slice(0, 2).map((m, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-repx-850 text-[10px] font-medium text-slate-300"
                    >
                      {m}
                    </span>
                  ))}
                  {(ex.targetMuscles || []).length > 2 && (
                    <span className="text-[10px] text-slate-500 self-center">
                      +{ex.targetMuscles.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-repx-border/50 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] text-slate-400">{ex.equipment}</span>
                <span className="text-repx-volt font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Guide <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ExerciseLibraryPage;
