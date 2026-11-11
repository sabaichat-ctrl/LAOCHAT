import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  BarChart3,
  Shield,
  LogIn,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_CREATORS } from '../../data/mockSeedData';

interface NavbarProps {
  onOpenCreate: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreate,
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  onOpenMobileMenu,
}) => {
  const { user, userProfile, isAdmin, signInWithGoogle, signOut, loginAsDemoUser } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="ເມນູ"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveView('feed')}
            className="flex items-center gap-2.5 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-xl font-black bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  LC
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  LAOCHAT
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  ສື່ລາວ
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block leading-none">
                ສື່ຂອງຄົນລາວ ໂອກາດຂອງທຸກຄົນ
              </p>
            </div>
          </button>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ຄົ້ນຫາວິດີໂອ, ຮູບພາບ, ບົດຄວາມ, ຫຼື ແຮຊແທັກ..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-full text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Post Button */}
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full font-medium text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden xs:inline">ສ້າງໂພສຕ໌</span>
          </button>

          {/* Creator Studio Shortcut */}
          <button
            onClick={() => setActiveView('studio')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
              activeView === 'studio'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
            title="ຫ້ອງສະຕູດິໂອຜູ້ສ້າງ"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">ສະຕູດິໂອ</span>
          </button>

          {/* Admin Dashboard (if admin) */}
          {isAdmin && (
            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeView === 'admin'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
              title="ກະດານຜູ້ດູແລລະບົບ"
            >
              <Shield className="w-4 h-4 text-rose-400" />
              <span className="hidden md:inline">ແອດມິນ</span>
            </button>
          )}

          {/* User profile / Login */}
          {user || userProfile ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full bg-slate-800/80 hover:bg-slate-750 border border-slate-700 transition-colors"
              >
                <img
                  src={
                    userProfile?.avatarUrl ||
                    user?.photoURL ||
                    'https://api.dicebear.com/7.x/bottts/svg?seed=laochat'
                  }
                  alt={userProfile?.displayName || 'ໂປຣໄຟລ໌'}
                  className="w-7 h-7 rounded-full object-cover border border-amber-500/40"
                />
                <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[100px] truncate">
                  {userProfile?.displayName?.split(' ')[0] || 'ໂປຣໄຟລ໌'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="text-xs text-slate-400">ເຂົ້າສູ່ລະບົບໃນນາມ</p>
                    <p className="text-sm font-bold text-white truncate">
                      {userProfile?.displayName || user?.displayName}
                    </p>
                    <p className="text-xs text-amber-400 font-mono truncate">
                      @{userProfile?.handle || 'user'}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveView('profile')}
                    className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    ໂປຣໄຟລ໌ຂອງຂ້ອຍ
                  </button>

                  <button
                    onClick={() => setActiveView('studio')}
                    className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5"
                  >
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    Creator Studio (ສ້າງລາຍໄດ້)
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setActiveView('admin')}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-rose-300 hover:text-rose-200 hover:bg-slate-800 flex items-center gap-2.5"
                    >
                      <Shield className="w-4 h-4 text-rose-400" />
                      ກະດານແອດມິນ
                    </button>
                  )}

                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-rose-400 hover:text-rose-300 hover:bg-slate-800 flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4" />
                      ອອກຈາກລະບົບ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600 transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>ເຂົ້າສູ່ລະບົບ</span>
              </button>

              {/* Demo switch helper */}
              <div className="relative">
                <button
                  onClick={() => setShowDemoMenu(!showDemoMenu)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                  title="ທົດລອງເຂົ້າສູ່ລະບົບດ້ວຍບັນຊີຕົວຢ່າງ"
                >
                  <Sparkles className="w-4 h-4" />
                </button>

                {showDemoMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
                    <p className="text-xs font-semibold text-slate-400 px-2 py-1">
                      ທົດລອງເຂົ້າສູ່ລະບົບດ້ວຍບັນຊີຕົວຢ່າງ:
                    </p>
                    {INITIAL_CREATORS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          loginAsDemoUser(c.id);
                          setShowDemoMenu(false);
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                      >
                        <img
                          src={c.avatarUrl}
                          alt={c.displayName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">{c.displayName}</p>
                          <p className="text-[10px] text-amber-400">@{c.handle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
