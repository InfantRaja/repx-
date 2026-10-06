import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Heart,
  MessageSquare,
  Share2,
  Flame,
  Send,
  Trophy,
  Dumbbell,
  Clock,
  Layers,
  UserPlus,
  UserCheck,
  Check,
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const SocialFeedPage = () => {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [posting, setPosting] = useState(false);

  // Active comments popover per post
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [commentInput, setCommentInput] = useState('');

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

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    try {
      setPosting(true);
      const res = await API.post('/posts', {
        content: newPostText.trim(),
        type: 'general',
      });
      if (res.data?.success) {
        setNewPostText('');
        fetchFeed();
      }
    } catch (err) {
      console.error('Failed to post:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (postId) => {
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

  const handleToggleComments = async (postId) => {
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null);
      return;
    }

    setOpenCommentsPostId(postId);
    if (!commentsMap[postId]) {
      try {
        const res = await API.get(`/posts/${postId}/comments`);
        if (res.data?.success) {
          setCommentsMap((prev) => ({ ...prev, [postId]: res.data.data }));
        }
      } catch (e) {}
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentInput.trim()) return;

    try {
      const res = await API.post(`/posts/${postId}/comment`, { text: commentInput.trim() });
      if (res.data?.success) {
        setCommentsMap((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.data.data],
        }));
        setCommentInput('');
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
          )
        );
      }
    } catch (e) {}
  };

  const handleFollowToggle = async (targetUserId, isCurrentlyFollowing) => {
    try {
      if (isCurrentlyFollowing) {
        await API.delete(`/users/${targetUserId}/follow`);
      } else {
        await API.post(`/users/${targetUserId}/follow`);
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.user?._id === targetUserId
            ? { ...p, isFollowingAuthor: !isCurrentlyFollowing }
            : p
        )
      );
    } catch (e) {}
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight">
          Social Fitness Feed
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-0.5">
          Verified athlete PRs, workout logs, and training motivation across the REPX network.
        </p>
      </div>

      {/* Post Creator Box */}
      <form onSubmit={handleCreatePost} className="repx-card rounded-3xl p-5 border border-repx-border space-y-3">
        <div className="flex items-center gap-3">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
            }
            alt={user?.name}
            className="w-10 h-10 rounded-xl object-cover border border-repx-borderLight shrink-0"
          />
          <input
            type="text"
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Share today's milestone, workout notes, or PR..."
            className="w-full bg-repx-900 border border-repx-border rounded-xl px-4 py-2.5 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-repx-volt"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500 font-medium">
            Keep it focused on discipline and continuous progression.
          </span>
          <button
            type="submit"
            disabled={posting || !newPostText.trim()}
            className="px-5 py-2 rounded-xl bg-repx-volt text-black font-extrabold font-display text-xs hover:bg-repx-voltHover transition-all shadow-volt-glow active:scale-95 disabled:opacity-40"
          >
            {posting ? 'Posting...' : 'Share Update'}
          </button>
        </div>
      </form>

      {/* Posts Stream */}
      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton type="card" count={4} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 repx-card rounded-2xl border border-dashed border-repx-border">
          <Flame className="w-8 h-8 text-repx-crimson mx-auto mb-2" />
          <div className="text-sm font-bold text-white">No community posts yet</div>
          <div className="text-xs text-slate-400 mt-1">Be the first athlete to post!</div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const author = post.user || {};
            const isSelf = author._id === user?._id;
            const comments = commentsMap[post._id] || [];

            return (
              <div
                key={post._id}
                className="repx-card rounded-3xl p-5 md:p-6 border border-repx-border space-y-4 shadow-xl"
              >
                {/* Author Header */}
                <div className="flex items-center justify-between">
                  <NavLink to={`/users/${author._id}`} className="flex items-center gap-3 group">
                    <img
                      src={
                        author.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                      }
                      alt={author.name}
                      className="w-10 h-10 rounded-xl object-cover border border-repx-borderLight"
                    />
                    <div>
                      <div className="text-sm font-black font-display text-white group-hover:text-repx-volt transition-colors flex items-center gap-1.5">
                        {author.name}
                        {author.isPro && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                            PRO
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        @{author.username || 'athlete'} •{' '}
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </NavLink>

                  {!isSelf && (
                    <button
                      onClick={() => handleFollowToggle(author._id, post.isFollowingAuthor)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        post.isFollowingAuthor
                          ? 'bg-repx-850 border-repx-border text-slate-400 hover:text-white'
                          : 'bg-repx-volt/15 border-repx-volt/40 text-repx-volt hover:bg-repx-volt/25'
                      }`}
                    >
                      {post.isFollowingAuthor ? 'Following' : '+ Follow'}
                    </button>
                  )}
                </div>

                {/* Content */}
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Workout Summary Card if attached */}
                {post.workoutSummary && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-repx-850 to-repx-900 border border-repx-borderLight space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-repx-volt" />
                        <span className="text-xs font-black font-display text-white">
                          {post.workoutSummary.workoutName}
                        </span>
                      </div>
                      {post.workoutSummary.prsCount > 0 && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> {post.workoutSummary.prsCount} PRs
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      {post.workoutSummary.durationMinutes > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {post.workoutSummary.durationMinutes}m
                        </span>
                      )}
                      {post.workoutSummary.totalVolumeKg > 0 && (
                        <span className="flex items-center gap-1 text-repx-volt font-bold">
                          <Layers className="w-3.5 h-3.5" />{' '}
                          {post.workoutSummary.totalVolumeKg.toLocaleString()} KG
                        </span>
                      )}
                      {post.workoutSummary.setsCount > 0 && (
                        <span>{post.workoutSummary.setsCount} Sets</span>
                      )}
                    </div>

                    {post.workoutSummary.highlights && post.workoutSummary.highlights.length > 0 && (
                      <div className="pt-2 border-t border-repx-border/50 text-[11px] text-amber-300 space-y-0.5 font-medium">
                        {post.workoutSummary.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <Flame className="w-3 h-3 fill-amber-400 shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Social Actions (Like, Comment) */}
                <div className="flex items-center gap-4 pt-2 border-t border-repx-border/60 text-xs">
                  <button
                    onClick={() => handleToggleLike(post._id)}
                    className={`flex items-center gap-1.5 font-bold transition-all ${
                      post.isLiked ? 'text-repx-crimson' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        post.isLiked ? 'fill-repx-crimson stroke-repx-crimson animate-ping-once' : ''
                      }`}
                    />
                    <span>{post.likesCount || 0}</span>
                  </button>

                  <button
                    onClick={() => handleToggleComments(post._id)}
                    className="flex items-center gap-1.5 font-bold text-slate-400 hover:text-white transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.commentsCount || 0} Comments</span>
                  </button>
                </div>

                {/* Inline Comments Section */}
                {openCommentsPostId === post._id && (
                  <div className="pt-3 border-t border-repx-border space-y-3 animate-fade-in">
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {comments.length === 0 ? (
                        <div className="text-center py-2 text-xs text-slate-500">
                          No comments yet. Start the conversation!
                        </div>
                      ) : (
                        comments.map((c) => (
                          <div
                            key={c._id}
                            className="p-2.5 rounded-xl bg-repx-850/80 border border-repx-border text-xs"
                          >
                            <div className="font-bold text-white flex items-center justify-between">
                              <span>{c.user?.name || 'Athlete'}</span>
                              <span className="text-[10px] text-slate-500 font-normal">
                                {new Date(c.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div className="text-slate-300 mt-1">{c.text}</div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                        placeholder="Leave a comment..."
                        className="flex-1 bg-repx-900 border border-repx-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-repx-volt"
                      />
                      <button
                        onClick={() => handleAddComment(post._id)}
                        className="p-2 rounded-xl bg-repx-volt text-black hover:bg-repx-voltHover"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SocialFeedPage;
