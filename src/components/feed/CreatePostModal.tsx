import React, { useState } from 'react';
import {
  X,
  PlaySquare,
  Image,
  FileText,
  BookOpen,
  Sparkles,
  Upload,
  Link2,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { Post, ContentType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { createPost } from '../../firebase/services';
import { CATEGORIES } from '../../data/categories';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (newPost: Post) => void;
}

const SAMPLE_MEDIA_PRESETS = [
  {
    label: 'ແມ່ນ້ຳຂອງ (ວິດີໂອ)',
    type: 'video' as ContentType,
    url: 'https://assets.mixkit.co/videos/preview/mixkit-sunset-over-a-calm-river-42777-large.mp4',
    thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&auto=format&fit=crop&q=60',
  },
  {
    label: 'ຫຼວງພະບາງ (ຮູບພາບ)',
    type: 'image' as ContentType,
    url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=120&auto=format&fit=crop&q=60',
  },
  {
    label: 'ອາຫານລາວ (ຮູບພາບ)',
    type: 'image' as ContentType,
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=120&auto=format&fit=crop&q=60',
  },
  {
    label: 'ກາເຟບໍລະເວນ (ຮູບພາບ)',
    type: 'image' as ContentType,
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=120&auto=format&fit=crop&q=60',
  },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const { user, userProfile, signInWithGoogle } = useAuth();
  const [contentType, setContentType] = useState<ContentType>('video');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [category, setCategory] = useState('ອາຫານ & ທ່ອງທ່ຽວ');
  const [tags, setTags] = useState('#LAOCHAT #ທ່ຽວລາວ');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('ຂະໜາດໄຟລ໌ໃຫຍ່ເກີນໄປ (ສູງສຸດບໍ່ເກີນ 20MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setMediaUrl(result);
      if (file.type.startsWith('video/')) {
        setContentType('video');
      } else if (file.type.startsWith('image/')) {
        setContentType('image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user && !userProfile) {
      signInWithGoogle();
      return;
    }

    if (!content.trim()) {
      setErrorMsg('ກະລຸນາປ້ອນເນື້ອຫາ ຫຼື ຄຳອະທິບາຍໂພສຕ໌');
      return;
    }

    if (contentType === 'article' && !title.trim()) {
      setErrorMsg('ບົດຄວາມຕ້ອງມີຫົວຂໍ້');
      return;
    }

    setLoading(true);
    try {
      const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newPost: Post = {
        id: postId,
        authorId: userProfile?.id || user?.uid || 'user',
        authorName: userProfile?.displayName || user?.displayName || 'ຜູ້ສ້າງ LAOCHAT',
        authorHandle: userProfile?.handle || 'user',
        authorAvatar: userProfile?.avatarUrl || user?.photoURL || undefined,
        type: contentType,
        title: title.trim() || undefined,
        content: content.trim(),
        mediaUrl: mediaUrl.trim() || undefined,
        category,
        tags: tags.trim() || '#LAOCHAT',
        likesCount: 0,
        commentsCount: 0,
        viewsCount: 1,
        sharesCount: 0,
        status: 'active',
        readTimeMinutes: contentType === 'article' ? Math.max(1, Math.ceil(content.length / 400)) : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createPost(newPost);
      onPostCreated?.(newPost);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'ບໍ່ສາມາດເຜີຍແຜ່ໂພສຕ໌ໄດ້ ກະລຸນາລອງໃໝ່');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                ສ້າງໂພສຕ໌ໃໝ່ (Create Post)
              </h2>
              <p className="text-xs text-slate-400">
                ແບ່ງປັນວິດີໂອ, ຮູບພາບ ຫຼື ບົດຄວາມສູ່ສັງຄົມ LAOCHAT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Type Selector Tabs */}
        <div className="grid grid-cols-4 p-2 gap-1.5 bg-slate-950/60 border-b border-slate-800">
          <button
            type="button"
            onClick={() => setContentType('video')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              contentType === 'video'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <PlaySquare className="w-4 h-4 text-rose-400" />
            <span>ວິດີໂອ</span>
          </button>

          <button
            type="button"
            onClick={() => setContentType('image')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              contentType === 'image'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Image className="w-4 h-4 text-amber-400" />
            <span>ຮູບພາບ</span>
          </button>

          <button
            type="button"
            onClick={() => setContentType('text')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              contentType === 'text'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>ຂໍ້ຄວາມ</span>
          </button>

          <button
            type="button"
            onClick={() => setContentType('article')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              contentType === 'article'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>ບົດຄວາມ</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePublish} className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title (for articles and videos) */}
          {(contentType === 'article' || contentType === 'video' || contentType === 'image') && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ຫົວຂໍ້ {contentType === 'article' ? '(ຈຳເປັນ)' : '(ຖ້າມີ)'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ຕົວຢ່າງ: ພາທ່ຽວຫຼວງພະບາງ 3 ມື້ 2 ຄືນ..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Content / Caption */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {contentType === 'article' ? 'ເນື້ອຫາບົດຄວາມ (Lao/English Content)' : 'ຄຳບັນຍາຍ (Caption)'}
            </label>
            <textarea
              rows={contentType === 'article' ? 8 : 4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                contentType === 'article'
                  ? 'ຂຽນບົດຄວາມຂອງທ່ານທີ່ນີ້ ສາມາດໃສ່ຂໍ້ຄວາມຍາວໆ, ເລື່ອງລາວ, ເທັກນິກ ຫຼື ປະສົບການ...'
                  : 'ແບ່ງປັນຄວາມຮູ້ສຶກ, ບອກເລົ່າເລື່ອງລາວ ຫຼື ຄວາມຄິດເຫັນຂອງທ່ານ...'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          {/* Media Section (Video or Image) */}
          {contentType !== 'text' && (
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {contentType === 'video' ? 'ວິດີໂອ (ໄຟລ໌ ຫຼື URL)' : 'ຮູບພາບ (ໄຟລ໌ ຫຼື URL)'}
                </span>
                <span className="text-[11px] text-slate-400">ຮອງຮັບ MP4, JPG, PNG, WebP</span>
              </div>

              {/* Upload or URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-700 hover:border-amber-500/80 bg-slate-900/60 hover:bg-slate-900 cursor-pointer text-xs font-medium text-slate-300 transition-all">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>ອັບໂຫລດຈາກອຸປະກອນ</span>
                  <input
                    type="file"
                    accept={contentType === 'video' ? 'video/*' : 'image/*'}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="ຫຼື ວາງ URL ສື່..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Quick Presets for testing */}
              <div>
                <p className="text-[11px] text-slate-400 mb-1.5">
                  ຫຼື ເລືອກສື່ຕົວຢ່າງລາວງາມໆເພື່ອທົດສອບໄວ:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SAMPLE_MEDIA_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMediaUrl(p.url);
                        setContentType(p.type);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left flex items-center gap-2 group transition-colors"
                    >
                      <img
                        src={p.thumb}
                        alt={p.label}
                        className="w-7 h-7 rounded object-cover flex-shrink-0"
                      />
                      <span className="text-[10px] text-slate-300 group-hover:text-amber-300 truncate">
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Preview */}
              {mediaUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-700 relative max-h-48 bg-black flex items-center justify-center">
                  {contentType === 'video' ? (
                    <video src={mediaUrl} controls className="max-h-48 w-full object-contain" />
                  ) : (
                    <img src={mediaUrl} alt="Preview" className="max-h-48 w-full object-contain" />
                  )}
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-rose-400 hover:bg-slate-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Category & Tags Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ໝວດໝູ່ເນື້ອຫາ (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.labelLao}>
                    {c.labelLao} ({c.labelEn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ແຮຊແທັກ (Hashtags)
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="#LAOCHAT #ທ່ຽວລາວ #ອາຫານລາວ"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? 'ກຳລັງເຜີຍແຜ່...' : 'ເຜີຍແຜ່ໂພສຕ໌ (Publish)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
