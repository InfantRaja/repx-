import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, UserPlus, UserCheck, Flame, Trophy, Dumbbell, ArrowRight } from 'lucide-react';
import API from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState('Following');
  const [friendsData, setFriendsData] = useState({
    friends: [],
    following: [],
    followers: [],
    requests: [],
    suggestions: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await API.get('/friends');
      if (res.data?.success) {
        setFriendsData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load friends:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleFollow = async (userId) => {
    try {
      await API.post(`/users/${userId}/follow`);
      fetchFriends();
    } catch (e) {}
  };

  const handleUnfollow = async (userId) => {
    try {
      await API.delete(`/users/${userId}/follow`);
      fetchFriends();
    } catch (e) {}
  };

  const tabs = [
    { label: 'Following', count: friendsData.following?.length || 0 },
    { label: 'Followers', count: friendsData.followers?.length || 0 },
    { label: 'Mutual Friends', count: friendsData.friends?.length || 0 },
    { label: 'Discover Athletes', count: friendsData.suggestions?.length || 0 },
  ];

  let currentList = [];
  if (activeTab === 'Following') currentList = friendsData.following || [];
  else if (activeTab === 'Followers') currentList = friendsData.followers || [];
  else if (activeTab === 'Mutual Friends') currentList = friendsData.friends || [];
  else if (activeTab === 'Discover Athletes') currentList = friendsData.suggestions || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight">
          Athletes & Network
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-0.5">
          Follow other athletes, benchmark strength numbers, and build competitive accountability.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-repx-900 rounded-2xl border border-repx-border overflow-x-auto scrollbar-none w-fit">
        {tabs.map((t) => (
          <button
            key={t.label}
            onClick={() => setActiveTab(t.label)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === t.label
                ? 'bg-repx-volt text-black shadow-volt-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === t.label ? 'bg-black/20 text-black' : 'bg-repx-800 text-slate-300'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LoadingSkeleton type="card" count={4} />
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-16 repx-card rounded-2xl border border-dashed border-repx-border">
          <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <div className="text-sm font-bold text-white">No athletes in this list</div>
          <div className="text-xs text-slate-400 mt-1">
            Check the 'Discover Athletes' tab to find teammates.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((athlete) => {
            const isFollowing = friendsData.following?.some((f) => f._id === athlete._id);

            return (
              <div
                key={athlete._id}
                className="repx-card-interactive rounded-3xl p-5 border border-repx-border flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <NavLink to={`/users/${athlete._id}`} className="flex items-center gap-3">
                      <img
                        src={
                          athlete.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
                        }
                        alt={athlete.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-repx-borderLight"
                      />
                      <div>
                        <div className="text-sm font-black font-display text-white flex items-center gap-1.5">
                          {athlete.name}
                          {athlete.isPro && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                              PRO
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">@{athlete.username}</div>
                      </div>
                    </NavLink>

                    {isFollowing ? (
                      <button
                        onClick={() => handleUnfollow(athlete._id)}
                        className="px-3 py-1.5 rounded-xl bg-repx-850 hover:bg-repx-800 border border-repx-border text-xs font-bold text-slate-300"
                      >
                        Unfollow
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollow(athlete._id)}
                        className="px-3.5 py-1.5 rounded-xl bg-repx-volt text-black font-extrabold font-display text-xs hover:bg-repx-voltHover shadow-volt-glow active:scale-95"
                      >
                        + Follow
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                    {athlete.bio || 'Chasing continuous strength and discipline on REPX.'}
                  </p>
                </div>

                {/* Athlete stats mini bar */}
                <div className="mt-4 pt-3 border-t border-repx-border/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-repx-crimson font-bold">
                    <Flame className="w-3.5 h-3.5 fill-repx-crimson" />
                    <span>{athlete.stats?.currentStreak || 0}d streak</span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{athlete.stats?.prCount || 0} PRs</span>
                  </div>

                  <NavLink
                    to={`/users/${athlete._id}`}
                    className="text-repx-volt font-bold flex items-center gap-1 hover:underline"
                  >
                    Profile <ArrowRight className="w-3 h-3" />
                  </NavLink>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
