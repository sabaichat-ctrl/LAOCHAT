import React, { useEffect, useState } from 'react';
import { Send, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import { Comment } from '../../types';
import { getComments, addComment, deleteComment } from '../../firebase/services';
import { useAuth } from '../../context/AuthContext';

interface CommentSectionProps {
  postId: string;
  onCommentCountChange?: (count: number) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, onCommentCountChange }) => {
  const { user, userProfile, isAdmin, signInWithGoogle } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const list = await getComments(postId);
      setComments(list);
      onCommentCountChange?.(list.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!user && !userProfile) {
      signInWithGoogle();
      return;
    }

    setSubmitting(true);
    try {
      const commentId = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newComment: Comment = {
        id: commentId,
        postId,
        authorId: userProfile?.id || user?.uid || 'user',
        authorName: userProfile?.displayName || user?.displayName || 'ຜູ້ໃຊ້ງານ LAOCHAT',
        authorAvatar: userProfile?.avatarUrl || user?.photoURL || undefined,
        content: text.trim(),
        createdAt: new Date().toISOString(),
      };

      await addComment(newComment);
      const updated = [...comments, newComment];
      setComments(updated);
      onCommentCountChange?.(updated.length);
      setText('');
    } catch (error) {
      console.error('Failed to post comment', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId, postId);
      const updated = comments.filter((c) => c.id !== commentId);
      setComments(updated);
      onCommentCountChange?.(updated.length);
    } catch (error) {
      console.error('Failed to delete comment', error);
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

  return (
    <div className="border-t border-slate-800 bg-slate-900/60 p-4 space-y-4">
      {/* Comment Input */}
      <form onSubmit={handleSend} className="flex gap-2.5 items-center">
        <img
          src={
            userProfile?.avatarUrl ||
            user?.photoURL ||
            'https://api.dicebear.com/7.x/bottts/svg?seed=laochat_guest'
          }
          alt="Avatar"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-slate-700"
        />
        <div className="flex-1 relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              user || userProfile
                ? 'ຂຽນຄຳຄິດເຫັນຂອງທ່ານທີ່ນີ້...'
                : 'ເຂົ້າສູ່ລະບົບເພື່ອສະແດງຄຳຄິດເຫັນ...'
            }
            className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/80"
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <p className="text-xs text-slate-400 text-center py-2">ກຳລັງໂຫຼດຄຳຄິດເຫັນ...</p>
      ) : comments.length === 0 ? (
        <div className="py-4 text-center text-slate-400">
          <MessageSquare className="w-6 h-6 mx-auto mb-1 opacity-50" />
          <p className="text-xs">ຍັງບໍ່ທັນມີຄຳຄິດເຫັນ ເປັນຄົນທຳອິດທີ່ສະແດງຄວາມເຫັນ!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {comments.map((comm) => {
            const isAuthor =
              comm.authorId === (userProfile?.id || user?.uid) || isAdmin;

            return (
              <div key={comm.id} className="flex gap-2.5 text-xs sm:text-sm group">
                <img
                  src={
                    comm.authorAvatar ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${comm.authorId}`
                  }
                  alt={comm.authorName}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 bg-slate-800/60 rounded-xl p-2.5 border border-slate-800">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-200">{comm.authorName}</span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <span>{formatLaoTime(comm.createdAt)}</span>
                      {isAuthor && (
                        <button
                          onClick={() => handleDelete(comm.id)}
                          className="text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-0.5"
                          title="ລຶບຄຳຄິດເຫັນ"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{comm.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
