import React, { useState, useEffect } from 'react';
import {
  User,
  CheckCircle,
  Edit3,
  Calendar,
  Grid,
  PlaySquare,
  Image as ImageIcon,
  BookOpen,
  UserPlus,
  UserCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { UserProfile, Post } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  getUserProfile,
  getPosts,
  toggleFollow,
  checkUserFollowing,
} from '../../firebase/services';
import { PostCard } from '../feed/PostCard';

interface ProfileViewProps {
  creatorId?: string;
  onOpenReport?: (post: Post) => void;
  onOpenArticleReader?: (post: Post) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  creatorId,
  onOpenReport,
  onOpenArticleReader,
}) => {
  const { user, userProfile, updateProfileData, signInWithGoogle } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'image' | 'article'>('all');
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const targetId = creatorId || userProfile?.id || user?.uid || '';
  const isOwnProfile = (userProfile?.id || user?.uid) === targetId;

  useEffect(() => {
    if (targetId) {
      loadProfileAndPosts();
    } else {
      setLoading(false);
    }
  }, [targetId]);

  const loadProfileAndPosts = async () => {
    try {
      setLoading(true);
      const [uProfile, uPosts] = await Promise.all([
        getUserProfile(targetId),
        getPosts({ authorId: targetId }),
      ]);

      if (uProfile) {
        setProfile(uProfile);
      } else if (isOwnProfile && userProfile) {
        setProfile(userProfile);
      }

      setPosts(uPosts);

      if (!isOwnProfile && (userProfile?.id || user?.uid)) {
        const isF = await checkUserFollowing(userProfile?.id || user?.uid || '', targetId);
        setFollowing(isF);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user && !userProfile) {
      signInWithGoogle();
      return;
    }
    const currentUid = userProfile?.id || user?.uid;
    if (!currentUid || !profile) return;

    try {
      const isNowFollowing = await toggleFollow(currentUid, profile.id);
      setFollowing(isNowFollowing);
      setProfile({
        ...profile,
        followersCount: isNowFollowing
          ? profile.followersCount + 1
          : Math.max(0, profile.followersCount - 1),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEdit = () => {
    if (!profile) return;
    setEditName(profile.displayName);
    setEditBio(profile.bio || '');
    setEditAvatar(profile.avatarUrl || '');
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSavingProfile(true);
    try {
      const updates = {
        displayName: editName.trim() || profile.displayName,
        bio: editBio.trim(),
        avatarUrl: editAvatar.trim() || profile.avatarUrl,
      };
      await updateProfileData(updates);
      setProfile({ ...profile, ...updates });
      setShowEditModal(false);
    } catch (e) {
      alert('ບໍ່ສາມາດບັນທຶກໂປຣໄຟລ໌ໄດ້');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-sm">ກຳລັງໂຫຼດຂໍ້ມູນໂປຣໄຟລ໌...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-16 text-center text-slate-400 space-y-3">
        <User className="w-12 h-12 mx-auto opacity-50" />
        <h3 className="text-lg font-bold text-white">ບໍ່ພົບຂໍ້ມູນໂປຣໄຟລ໌</h3>
        <p className="text-xs">ກະລຸນາເຂົ້າສູ່ລະບົບ ຫຼື ກວດສອບລິ້ງໂປຣໄຟລ໌ໃໝ່</p>
      </div>
    );
  }

  const filteredPosts = posts.filter((p) => {
    if (activeTab === 'all') return true;
    return p.type === activeTab;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Profile Header Banner & Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Banner Cover */}
        <div className="h-36 sm:h-48 bg-gradient-to-r from-slate-950 via-amber-950/40 to-slate-900 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            <div className="relative inline-block">
              <img
                src={
                  profile.avatarUrl ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.id}`
                }
                alt={profile.displayName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-slate-900 shadow-xl bg-slate-800"
              />
              {profile.isVerifiedCreator && (
                <div
                  className="absolute bottom-1 right-1 p-1 rounded-full bg-amber-500 text-slate-950 ring-2 ring-slate-900"
                  title="ຢືນຢັນຄີເອເຕີ້ລາວແລ້ວ"
                >
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <button
                  onClick={handleOpenEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>ແກ້ໄຂໂປຣໄຟລ໌</span>
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md ${
                    following
                      ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  }`}
                >
                  {following ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>ກຳລັງຕິດຕາມ</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>ຕິດຕາມ</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Name & Bio */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {profile.displayName}
              </h1>
              {profile.isVerifiedCreator && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Lao Creator
                </span>
              )}
            </div>
            <p className="text-xs text-amber-400 font-mono">@{profile.handle}</p>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed whitespace-pre-line pt-1">
              {profile.bio || 'ຍັງບໍ່ມີຄຳອະທິບາຍໂປຣໄຟລ໌'}
            </p>

            {/* Counts */}
            <div className="flex items-center gap-6 pt-3 border-t border-slate-800 text-xs sm:text-sm">
              <div>
                <span className="font-bold text-white font-mono">{posts.length}</span>{' '}
                <span className="text-slate-400">ໂພສຕ໌</span>
              </div>
              <div>
                <span className="font-bold text-white font-mono">
                  {(profile.followersCount || 0).toLocaleString()}
                </span>{' '}
                <span className="text-slate-400">ຜູ້ຕິດຕາມ</span>
              </div>
              <div>
                <span className="font-bold text-white font-mono">
                  {(profile.followingCount || 0).toLocaleString()}
                </span>{' '}
                <span className="text-slate-400">ກຳລັງຕິດຕາມ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>ທັງໝົດ ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'video'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PlaySquare className="w-4 h-4 text-rose-400" />
          <span>ວິດີໂອ</span>
        </button>

        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'image'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span>ຮູບພາບ</span>
        </button>

        <button
          onClick={() => setActiveTab('article')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'article'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>ບົດຄວາມ</span>
        </button>
      </div>

      {/* Feed list */}
      {filteredPosts.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
          <p className="text-sm">ຍັງບໍ່ມີເນື້ອຫາໃນໝວດໝູ່ນີ້</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostDeleted={(postId) => setPosts(posts.filter((p) => p.id !== postId))}
              onOpenReport={onOpenReport}
              onOpenArticleReader={onOpenArticleReader}
            />
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-white mb-4">ແກ້ໄຂຂໍ້ມູນໂປຣໄຟລ໌ LAOCHAT</h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ຊື່ສະແດງ (Display Name)
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ຄຳອະທິບາຍຕົວທ່ານ (Bio in Lao/English)
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="ແນະນຳຕົວທ່ານ ຫຼື ຜົນງານ..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL ຮູບໂປຣໄຟລ໌ (Avatar URL)
                </label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50"
                >
                  {savingProfile ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
