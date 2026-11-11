import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { testConnection } from './firebase/config';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { PostCard } from './components/feed/PostCard';
import { SponsoredAdCard } from './components/feed/SponsoredAdCard';
import { CreatePostModal } from './components/feed/CreatePostModal';
import { ReportModal } from './components/feed/ReportModal';
import { ArticleReaderModal } from './components/article/ArticleReaderModal';
import { CreatorStudio } from './components/creator/CreatorStudio';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProfileView } from './components/profile/ProfileView';
import { CATEGORIES } from './data/categories';
import { Post, Advertisement } from './types';
import { getPosts, getAdvertisements } from './firebase/services';
import {
  Sparkles,
  Compass,
  PlaySquare,
  Image as ImageIcon,
  BookOpen,
  Filter,
  RefreshCw,
  HelpCircle,
  X,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

function MainApp() {
  const { user, userProfile, isAdmin } = useAuth();
  const [activeView, setActiveView] = useState<'feed' | 'studio' | 'admin' | 'profile'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | undefined>(undefined);

  // Data state
  const [posts, setPosts] = useState<Post[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [reportTargetPost, setReportTargetPost] = useState<Post | null>(null);
  const [readerArticlePost, setReaderArticlePost] = useState<Post | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Test connection on boot per Firebase skill guidelines
  useEffect(() => {
    testConnection();
  }, []);

  // Fetch posts and ads on category or search change
  useEffect(() => {
    loadFeed();
  }, [selectedCategory, searchQuery]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const [postList, adList] = await Promise.all([
        getPosts({
          category: selectedCategory,
          searchQuery: searchQuery,
        }),
        getAdvertisements(),
      ]);
      setPosts(postList);
      setAds(adList);
    } catch (e) {
      console.error('Failed to load feed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
    setActiveView('feed');
  };

  const handleSelectCreator = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    setActiveView('profile');
    setIsMobileDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16 lg:pb-0">
      {/* Top Navbar */}
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        activeView={activeView}
        setActiveView={(view: any) => {
          setActiveView(view);
          if (view === 'profile') setSelectedCreatorId(undefined);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
      />

      {/* Mobile Slide Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between h-full z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-extrabold text-amber-400 text-lg">LAOCHAT</span>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Drawer Links */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveView('feed');
                    setSelectedCategory('all');
                    setIsMobileDrawerOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-800 flex items-center gap-3 text-slate-200"
                >
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>ໜ້າຫຼັກ (Home)</span>
                </button>
                <button
                  onClick={() => {
                    setActiveView('feed');
                    setSelectedCategory('video');
                    setIsMobileDrawerOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-800 flex items-center gap-3 text-slate-200"
                >
                  <PlaySquare className="w-4 h-4 text-rose-400" />
                  <span>ວິດີໂອ (Videos)</span>
                </button>
                <button
                  onClick={() => {
                    setActiveView('feed');
                    setSelectedCategory('photo');
                    setIsMobileDrawerOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-800 flex items-center gap-3 text-slate-200"
                >
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>ຮູບພາບ (Photos)</span>
                </button>
                <button
                  onClick={() => {
                    setActiveView('feed');
                    setSelectedCategory('article');
                    setIsMobileDrawerOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-800 flex items-center gap-3 text-slate-200"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>ບົດຄວາມ (Articles)</span>
                </button>

                <div className="border-t border-slate-800 my-2" />

                <button
                  onClick={() => {
                    setActiveView('studio');
                    setIsMobileDrawerOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-800 flex items-center justify-between text-slate-200"
                >
                  <span>Creator Studio</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                    ສ້າງລາຍໄດ້
                  </span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setActiveView('admin');
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-800 flex items-center justify-between text-rose-300"
                  >
                    <span>ແອດມິນ (Admin Center)</span>
                    <Shield className="w-4 h-4 text-rose-400" />
                  </button>
                )}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-4 border-t border-slate-800">
              LAOCHAT • ສື່ຂອງຄົນລາວ ໂອກາດຂອງທຸກຄົນ
            </div>
          </div>
        </div>
      )}

      {/* Main Body Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="flex gap-6 items-start">
          {/* Left Sidebar (Desktop) */}
          <Sidebar
            selectedCategory={selectedCategory}
            setSelectedCategory={(cat) => {
              setSelectedCategory(cat);
              setActiveView('feed');
            }}
            activeView={activeView}
            setActiveView={(v: any) => {
              setActiveView(v);
              if (v === 'profile') setSelectedCreatorId(undefined);
            }}
            onSelectCreator={handleSelectCreator}
          />

          {/* Center Main Content Area */}
          <main className="flex-1 min-w-0 max-w-2xl mx-auto w-full space-y-6">
            {/* View: Social Feed */}
            {activeView === 'feed' && (
              <div className="space-y-6">
                {/* Horizontal Category Selector Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
                        selectedCategory === cat.id
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-amber-500/20 scale-105'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {cat.labelLao}
                    </button>
                  ))}
                </div>

                {/* Feed Header / Refresh Button */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-300">
                      {selectedCategory === 'all'
                        ? 'ຟີດເນື້ອຫາຫຼ້າສຸດ'
                        : `ໝວດໝູ່: ${
                            CATEGORIES.find((c) => c.id === selectedCategory)?.labelLao ||
                            selectedCategory
                          }`}
                    </h2>
                    {searchQuery && (
                      <span className="text-xs text-amber-400 font-mono">
                        (ຜົນການຄົ້ນຫາ: "{searchQuery}")
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="ໂຫຼດໃໝ່"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Loading Skeleton */}
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800" />
                          <div className="space-y-1.5">
                            <div className="w-28 h-3 bg-slate-800 rounded" />
                            <div className="w-20 h-2 bg-slate-800 rounded" />
                          </div>
                        </div>
                        <div className="w-full h-4 bg-slate-800 rounded" />
                        <div className="w-3/4 h-4 bg-slate-800 rounded" />
                        <div className="w-full h-48 bg-slate-800 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  /* Empty State */
                  <div className="py-16 px-4 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                      <Filter className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">ບໍ່ພົບເນື້ອຫາໃນໝວດນີ້</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      ລອງປ່ຽນໝວດໝູ່ ຫຼື ກົດ "ສ້າງໂພສຕ໌" ເພື່ອເປັນຄົນທຳອິດທີ່ເຜີຍແຜ່ເນື້ອຫາ!
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400"
                    >
                      ເບິ່ງເນື້ອຫາທັງໝົດ
                    </button>
                  </div>
                ) : (
                  /* Posts List with In-Feed Sponsored Ads */
                  <div className="space-y-6">
                    {posts.map((post, index) => (
                      <React.Fragment key={post.id}>
                        <PostCard
                          post={post}
                          onPostDeleted={(id) => setPosts(posts.filter((p) => p.id !== id))}
                          onOpenReport={(p) => setReportTargetPost(p)}
                          onOpenArticleReader={(p) => setReaderArticlePost(p)}
                          onSelectCreator={handleSelectCreator}
                        />

                        {/* In-feed Sponsored Ad insertion every 3 posts */}
                        {index === 1 && ads.length > 0 && (
                          <SponsoredAdCard ad={ads[0]} />
                        )}
                        {index === 3 && ads.length > 1 && (
                          <SponsoredAdCard ad={ads[1]} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View: Creator Studio */}
            {activeView === 'studio' && <CreatorStudio />}

            {/* View: Admin Dashboard */}
            {activeView === 'admin' && <AdminDashboard />}

            {/* View: Profile View */}
            {activeView === 'profile' && (
              <ProfileView
                creatorId={selectedCreatorId}
                onOpenReport={(p) => setReportTargetPost(p)}
                onOpenArticleReader={(p) => setReaderArticlePost(p)}
              />
            )}
          </main>

          {/* Right Sidebar (Wide Desktop Only) */}
          <aside className="w-80 flex-shrink-0 hidden xl:block sticky top-20 self-start space-y-5">
            {/* Sponsored Campaign Showcase Card */}
            {ads.length > 0 && (
              <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-500/20 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                    ຜູ້ສະໜັບສະໜູນຫຼັກ
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="space-y-2">
                  <img
                    src={ads[0].mediaUrl}
                    alt={ads[0].title}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <h4 className="text-xs font-bold text-white line-clamp-2">
                    {ads[0].title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {ads[0].description}
                  </p>
                  <a
                    href={ads[0].targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-amber-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>ເຂົ້າຊົມເວັບໄຊ</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Lao Creator Mission Box */}
            <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-800 space-y-2.5 text-xs">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>ວິໄສທັດ LAOCHAT</span>
              </h4>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                LAOCHAT ແມ່ນເວທີສື່ສັງຄົມອອນລາຍຂອງຄົນລາວ ທີ່ສ້າງຂຶ້ນເພື່ອສະໜັບສະໜູນຜູ້ສ້າງສັນເນື້ອຫາທ້ອງຖິ່ນ ໃຫ້ມີພື້ນທີ່ສະແດງຄວາມສາມາດ ແລະ ສ້າງລາຍໄດ້ທີ່ໝັ້ນຄົງຜ່ານລະບົບໂຄສະນາທີ່ໂປ່ງໃສ.
              </p>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                <span>ຮອງຮັບພາສາລາວ 100%</span>
                <span className="text-amber-400 font-semibold">🇱🇦 ສປປ ລາວ</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeView={activeView}
        setActiveView={(v: any) => {
          setActiveView(v);
          if (v === 'profile') setSelectedCreatorId(undefined);
        }}
        onOpenCreate={() => setIsCreateOpen(true)}
      />

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={handlePostCreated}
      />

      <ReportModal
        post={reportTargetPost}
        onClose={() => setReportTargetPost(null)}
      />

      <ArticleReaderModal
        post={readerArticlePost}
        onClose={() => setReaderArticlePost(null)}
        onOpenReport={(p) => setReportTargetPost(p)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
