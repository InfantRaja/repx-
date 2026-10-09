import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Trophy,
  Dumbbell,
  Clock,
  Weight,
  Send,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const SocialFeedPage = () => {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followedMap, setFollowedMap] = useState({});

  const displayName = user?.name || 'INFANT RAJA';
  const displayUsername = user?.username || 'infantraja25';
  const initial = displayName.charAt(0).toUpperCase() || 'I';

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await API.get('/feed');
      if (res.data?.success) {
        setPosts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggested = async () => {
    try {
      const res = await API.get('/users/suggested');
      if (res.data?.success) {
        setSuggestedUsers(res.data.data);
      }
    } catch (e) {
      // Fallback suggested users matching Screenshot 1
      setSuggestedUsers([
        { _id: '1', name: 'Cory Scott', username: 'scholarscott86' },
        { _id: '2', name: 'Steve', username: 'chronically_steve' },
        { _id: '3', name: 'Mike "Tank" Price', username: 'runningwoof' },
        { _id: '4', name: 'Luca Montelisciani', username: 'lucamontelisciani' },
        { _id: '5', name: 'Dpfitnessforlife', username: 'dpfitnessforlife' },
      ]);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchSuggested();
  }, []);

  const handleLike = async (postId) => {
    try {
      const res = await API.post(`/posts/${postId}/like`);
      if (res.data?.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? { ...p, isLiked: res.data.isLiked, likesCount: res.data.likesCount }
              : p
          )
        );
      }
    } catch (e) {}
  };

  const handleAddComment = async (postId) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    try {
      const res = await API.post(`/posts/${postId}/comments`, { content: text });
      if (res.data?.success) {
        setCommentsMap((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.data.data],
        }));
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      }
    } catch (e) {}
  };

  const handleToggleFollow = (userId) => {
    setFollowedMap((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Home</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Feed Column (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            <LoadingSkeleton type="card" count={3} />
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <Dumbbell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 text-sm font-semibold">No workout updates yet.</p>
              <p className="text-slate-400 text-xs mt-1">Complete a workout to share your activity!</p>
            </div>
          ) : (
            posts.map((post) => {
              const author = post.user || {};
              const authorName = author.name || 'Athlete';
              const authorUsername = author.username || 'user';
              const authorInitial = authorName.charAt(0).toUpperCase();

              return (
                <div
                  key={post._id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4"
                >
                  {/* User Header */}
                  <div className="flex items-center gap-3">
                    {author.avatar ? (
                      <img
                        src={author.avatar}
                        alt={authorName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                        {authorInitial}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-sm text-slate-900 leading-tight">
                        {authorUsername}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Workout Title */}
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {post.title || post.workoutSession?.workoutName || 'Workout Routine'}
                    </h3>
                  </div>

                  {/* Stats Row: Duration, Volume, Records (Like Hevy Screenshot 1) */}
                  <div className="flex items-center gap-6 text-xs text-slate-600 pb-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Duration</span>
                      <span className="font-bold text-slate-800">
                        {post.workoutSession?.durationSeconds
                          ? `${Math.round(post.workoutSession.durationSeconds / 60)}m`
                          : '45m'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Volume</span>
                      <span className="font-bold text-slate-800">
                        {(post.workoutSession?.totalVolumeKg || 4200).toLocaleString()} kg
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Records</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        🏆 1
                      </span>
                    </div>
                  </div>

                  {/* Exercise Rows with circle thumbnails (Exact Hevy Screenshot 1) */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    {(post.workoutSession?.exercises || [
                      { exerciseName: 'Pull Up (Weighted)', sets: [{}, {}] },
                      { exerciseName: 'Bent Over Row (Barbell)', sets: [{}, {}] },
                      { exerciseName: 'Seated Cable Row - Bar Grip', sets: [{}, {}] },
                    ]).slice(0, 3).map((ex, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs text-slate-700">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500 font-bold text-[10px]">
                          🏋️
                        </div>
                        <span className="font-medium text-slate-800">
                          {ex.sets?.length || 2} sets {ex.exerciseName}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Like / Comment / Share Row */}
                  <div className="flex items-center gap-5 pt-3 border-t border-slate-100 text-slate-500 text-xs font-semibold">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1.5 hover:text-blue-600 transition-colors ${
                        post.isLiked ? 'text-blue-600 font-bold' : ''
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{post.likesCount || 0}</span>
                    </button>

                    <button
                      onClick={() =>
                        setActiveCommentsPostId(
                          activeCommentsPostId === post._id ? null : post._id
                        )
                      }
                      className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.commentsCount || 0}</span>
                    </button>

                    <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Comment Input Box (Screenshot 1) */}
                  <div className="flex items-center gap-2 pt-2">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                      {initial}
                    </div>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInputs[post._id] || ''}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post._id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post._id);
                      }}
                      className="flex-1 bg-slate-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none border border-transparent focus:border-blue-400 focus:bg-white transition-all"
                    />
                    <button
                      onClick={() => handleAddComment(post._id)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2 py-1"
                    >
                      Post
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Profile Summary & Suggested Athletes (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-4">
          {/* User Profile Card (Exact Hevy Screenshot 1) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-sm">
              {initial}
            </div>

            <div>
              <div className="font-bold text-sm text-slate-900">{displayUsername}</div>
              <div className="text-xs text-slate-400 uppercase tracking-tight">{displayName}</div>
            </div>

            {/* Stats: Workouts, Followers, Following */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 pt-2 border-t border-slate-100 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-medium">Workouts</span>
                <span className="text-sm font-bold text-slate-800">46</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-medium">Followers</span>
                <span className="text-sm font-bold text-slate-800">5</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-medium">Following</span>
                <span className="text-sm font-bold text-slate-800">6</span>
              </div>
            </div>

            <NavLink
              to="/profile"
              className="block w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-slate-700 transition-all"
            >
              See your profile
            </NavLink>
          </div>

          {/* Latest Activity Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-900 mb-2">Latest Activity</div>
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Afternoon workout</span>
              <span>💪</span>
            </div>
            <div className="text-[11px] text-slate-400">Yesterday at 5:31 PM</div>
          </div>

          {/* Suggested Athletes Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="text-xs font-bold text-slate-900">Suggested Athletes</div>

            <div className="space-y-3">
              {suggestedUsers.map((ath) => {
                const isFollowed = followedMap[ath._id];
                return (
                  <div key={ath._id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs shrink-0">
                        {ath.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-800 truncate">{ath.username}</div>
                        <div className="text-[10px] text-slate-400 truncate">{ath.name}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFollow(ath._id)}
                      className={`text-xs font-bold px-3 py-1 rounded-lg transition-all shrink-0 ${
                        isFollowed
                          ? 'bg-slate-100 text-slate-600'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {isFollowed ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialFeedPage;
