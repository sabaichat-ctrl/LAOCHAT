import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  CheckCircle,
  Play,
  Volume2,
  VolumeX,
  BookOpen,
  Trash2,
  Flag,
  Sparkles,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import { Post } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  toggleLike,
  checkUserLiked,
  toggleFollow,
  checkUserFollowing,
  deletePost,
  trackPostView,
} from '../../firebase/services';
import { CommentSection } from './CommentSection';

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
  onOpenReport?: (post: Post) => void;
  onOpenArticleReader?: (post: Post) => void;
  onSelectCreator?: (creatorId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostDeleted,
  onOpenReport,
  onOpenArticleReader,
  onSelectCreator,
}) => {
  const { user, userProfile, isAdmin, signInWithGoogle } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [following, setFollowing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);

  const currentUserId = userProfile?.id || user?.uid;
  const isAuthor = currentUserId === post.authorId;

  useEffect(() => {
    if (currentUserId) {
      checkUserLiked(post.id, currentUserId).then(setLiked);
      if (!isAuthor) {
        checkUserFollowing(currentUserId, post.authorId).then(setFollowing);
      }
    }
  }, [post.id, currentUserId, post.authorId, isAuthor]);

  // Track view once
  useEffect(() => {
    trackPostView(post.id, post.authorId);
  }, [post.id]);

  const handleLike = async () => {
    if (!currentUserId) {
      signInWithGoogle();
      return;
    }
    const prevLiked = liked;
    const prevCount = likesCount;

    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const isNowLiked = await toggleLike(post.id, currentUserId);
      setLiked(isNowLiked);
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleFollow = async () => {
    if (!currentUserId) {
      signInWithGoogle();
      return;
    }
    try {
      const isNowFollowing = await toggleFollow(currentUserId, post.authorId);
      setFollowing(isNowFollowing);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: post.title || 'LAOCHAT Post',
      text: post.content.slice(0, 100),
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // fallback
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleDelete = async () => {
    if (!confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບໂພສຕ໌ນີ້?')) return;
    try {
      await deletePost(post.id, post.authorId);
      onPostDeleted?.(post.id);
    } catch (e) {
      alert('ບໍ່ສາມາດລຶບໂພສຕ໌ໄດ້');
    }
  };

  const formatLaoTime = (isoString?: string) => {
    if (!isoString) return 'ຕອນນີ້';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'ຫາກໍ່ໂພສຕ໌';
    if (mins < 60) return `${mins} ນາທີກ່ອນ`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ຊົ່ວໂມງກ່ອນ`;
    const days = Math.floor(hours / 24);
    return `${days} ມື້ກ່ອນ`;
  };

  // Render text with clickable styled hashtags
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(#[a-zA-Z0-9_\u0E80-\u0EFF]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <span key={i} className="text-amber-400 font-medium hover:underline cursor-pointer">
            {part}{' '}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <article className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700/80 transition-all">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="bg-amber-500 text-slate-950 text-xs font-bold px-4 py-2 text-center animate-in fade-in">
          ຄັດລອກລິ້ງໂພສຕ໌ສຳເລັດແລ້ວ!
        </div>
      )}

      {/* Post Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => onSelectCreator?.(post.authorId)}
            className="relative flex-shrink-0 group"
          >
            <img
              src={
                post.authorAvatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${post.authorId}`
              }
              alt={post.authorName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800 group-hover:ring-amber-500 transition-all"
            />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => onSelectCreator?.(post.authorId)}
                className="font-bold text-sm sm:text-base text-white hover:text-amber-400 transition-colors truncate"
              >
                {post.authorName}
              </button>

              <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 fill-amber-400/20" />

              {!isAuthor && currentUserId && (
                <button
                  onClick={handleFollow}
                  className={`ml-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                    following
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {following ? 'ກຳລັງຕິດຕາມ' : '+ ຕິດຕາມ'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>@{post.authorHandle}</span>
              <span>•</span>
              <span>{formatLaoTime(post.createdAt)}</span>
              <span>•</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                {post.category}
              </span>
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="ຕົວເລືອກໂພສຕ໌"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-850 border border-slate-700 shadow-xl py-1 z-30"
              onClick={() => setShowMenu(false)}
            >
              <button
                onClick={() => onOpenReport?.(post)}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:text-amber-400 hover:bg-slate-800 flex items-center gap-2"
              >
                <Flag className="w-3.5 h-3.5 text-amber-400" />
                ລາຍງານເນື້ອຫາບໍ່ເໝາະສົມ
              </button>

              {(isAuthor || isAdmin) && (
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-3.5 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-slate-800 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  ລຶບໂພສຕ໌ນີ້
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text & Title */}
      <div className="px-4 sm:px-5 pb-3 space-y-2">
        {post.title && (
          <h2
            onClick={() => {
              if (post.type === 'article') onOpenArticleReader?.(post);
            }}
            className={`font-bold text-base sm:text-lg text-white ${
              post.type === 'article'
                ? 'cursor-pointer hover:text-amber-400 transition-colors'
                : ''
            }`}
          >
            {post.title}
          </h2>
        )}

        <p className="text-sm sm:text-base text-slate-200 whitespace-pre-line leading-relaxed">
          {renderFormattedContent(post.content)}
        </p>

        {post.type === 'article' && (
          <div className="pt-2">
            <button
              onClick={() => onOpenArticleReader?.(post)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ອ່ານບົດຄວາມເຕັມ ({post.readTimeMinutes || 3} ນາທີ)</span>
            </button>
          </div>
        )}
      </div>

      {/* Media Renderer */}
      {post.mediaUrl && (
        <div className="relative bg-slate-950 overflow-hidden border-y border-slate-800/80">
          {post.type === 'video' ? (
            <div className="relative aspect-video max-h-[500px] flex items-center justify-center bg-black">
              <video
                src={post.mediaUrl}
                controls
                muted={videoMuted}
                playsInline
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setVideoMuted(!videoMuted)}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-sm z-10 transition-colors"
                title={videoMuted ? 'ເປີດສຽງ' : 'ປິດສຽງ'}
              >
                {videoMuted ? (
                  <VolumeX className="w-4 h-4 text-amber-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>
            </div>
          ) : (
            <div className="relative max-h-[550px] flex items-center justify-center bg-slate-950">
              <img
                src={post.mediaUrl}
                alt={post.title || 'ຮູບພາບ'}
                className="w-full max-h-[550px] object-cover sm:object-contain hover:scale-[1.01] transition-transform duration-300"
                loading="lazy"
              />
            </div>
          )}
        </div>
      )}

      {/* Stats and Action Buttons */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-xs sm:text-sm">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors ${
              liked ? 'text-rose-500 font-bold' : 'hover:text-rose-400'
            }`}
          >
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform active:scale-125 ${
                liked ? 'fill-rose-500' : ''
              }`}
            />
            <span>{likesCount}</span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{commentsCount}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-sky-400 transition-colors"
            title="ແບ່ງປັນລິ້ງ"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">ແບ່ງປັນ</span>
          </button>
        </div>

        {/* Views count */}
        <div className="text-[11px] text-slate-400 font-mono">
          {(post.viewsCount || 0).toLocaleString()} ວິວ
        </div>
      </div>

      {/* Expandable Comment Section */}
      {showComments && (
        <CommentSection
          postId={post.id}
          onCommentCountChange={(count) => setCommentsCount(count)}
        />
      )}
    </article>
  );
};
