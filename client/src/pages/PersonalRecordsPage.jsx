import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Trophy, Flame, ArrowLeft, Dumbbell, Award, Calendar, Zap } from 'lucide-react';
import API from '../services/api';
import PRBadge from '../components/PRBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const PersonalRecordsPage = () => {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs'];

  useEffect(() => {
    const fetchPRs = async () => {
      try {
        setLoading(true);
        const url = activeCategory === 'All' ? '/progress/prs' : `/progress/prs?category=${activeCategory}`;
        const res = await API.get(url);
        if (res.data?.success) {
          setPrs(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load PRs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPRs();
  }, [activeCategory]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <NavLink
            to="/progress"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Analytics
          </NavLink>
          <h1 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight flex items-center gap-2">
            Personal Records Trophy Shelf <Trophy className="w-6 h-6 text-amber-400" />
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Automatic PR detection records your maximum weight, reps, and estimated 1RM.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 w-fit">
          <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
          <span className="text-sm font-black font-display text-amber-300">
            {prs.length} Official PRs Locked
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-amber-400 text-black font-black shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                : 'bg-repx-900 text-slate-400 hover:text-white border border-repx-border'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* PR Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton type="card" count={6} />
        </div>
      ) : prs.length === 0 ? (
        <div className="text-center py-16 repx-card rounded-2xl border border-dashed border-repx-border">
          <Trophy className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <div className="text-sm font-bold text-white">No PRs in this category yet</div>
          <div className="text-xs text-slate-400 mt-1">
            Complete a workout with heavy sets to trigger automatic PR detection.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prs.map((pr) => (
            <div
              key={pr._id}
              className="repx-card-interactive rounded-3xl p-6 border border-amber-500/20 bg-gradient-to-b from-repx-900 to-repx-850 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {pr.category}
                  </span>
                  <PRBadge text="ALL-TIME PR" size="xs" />
                </div>

                <h3 className="text-lg font-black font-display text-white">{pr.exerciseName}</h3>

                {/* Big numbers */}
                <div className="mt-4 pt-4 border-t border-repx-border/60 grid grid-cols-2 gap-3">
                  <div className="repx-card rounded-xl p-3 border border-repx-border">
                    <div className="text-[10px] uppercase font-extrabold text-slate-400">
                      Heaviest Set
                    </div>
                    <div className="text-2xl font-black font-display text-white mt-0.5">
                      {pr.maxWeightKg}{' '}
                      <span className="text-xs font-semibold text-slate-400">KG</span>
                    </div>
                    <div className="text-[11px] text-amber-400 font-bold mt-0.5">
                      for {pr.maxRepsAtMaxWeight || 1} clean reps
                    </div>
                  </div>

                  <div className="repx-card rounded-xl p-3 border border-repx-border">
                    <div className="text-[10px] uppercase font-extrabold text-slate-400">
                      Est. 1RM
                    </div>
                    <div className="text-2xl font-black font-display text-repx-volt mt-0.5">
                      {pr.best1RM || pr.maxWeightKg}{' '}
                      <span className="text-xs font-semibold text-slate-400">KG</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">Epley model</div>
                  </div>
                </div>

                {pr.bestSetVolumeKg > 0 && (
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>Best Set Volume:</span>
                    <span className="font-bold text-white">
                      {pr.bestSetVolumeKg.toLocaleString()} KG
                    </span>
                  </div>
                )}
              </div>

              {/* Achieved Date footer */}
              <div className="mt-5 pt-3 border-t border-repx-border/50 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(pr.achievedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-emerald-400 font-bold">Verified Gym PR</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonalRecordsPage;
