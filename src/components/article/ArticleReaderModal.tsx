import React from 'react';
import { X, Clock, Calendar, CheckCircle, Share2, Heart, MessageSquare } from 'lucide-react';
import { Post } from '../../types';

interface ArticleReaderModalProps {
  post: Post | null;
  onClose: () => void;
  onOpenReport?: (post: Post) => void;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({
  post,
  onClose,
  onOpenReport,
}) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
            {post.category || 'ບົດຄວາມ LAOCHAT'}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-10 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Article Header */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {post.title || post.content.slice(0, 60)}
            </h1>

            {/* Author details */}
            <div className="flex items-center gap-3 py-3 border-y border-slate-800">
              <img
                src={
                  post.authorAvatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${post.authorId}`
                }
                alt={post.authorName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-500/30"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm sm:text-base text-white">
                    {post.authorName}
                  </span>
                  <CheckCircle className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>@{post.authorHandle}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {post.readTimeMinutes || 3} ນາທີອ່ານ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {post.mediaUrl && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-800">
              <img
                src={post.mediaUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Body */}
          <div className="prose prose-invert max-w-none text-slate-200 text-base sm:text-lg leading-relaxed whitespace-pre-line font-normal space-y-4">
            {post.content}
          </div>

          {/* Tags */}
          {post.tags && (
            <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-2">
              {post.tags.split(' ').map((t, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-amber-300"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Footer note */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>ເຜີຍແຜ່ເທິງເວທີ LAOCHAT • ສື່ຂອງຄົນລາວ ໂອກາດຂອງທຸກຄົນ</span>
            <button
              onClick={() => onOpenReport?.(post)}
              className="text-slate-400 hover:text-rose-400"
            >
              ລາຍງານເນື້ອຫາ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
