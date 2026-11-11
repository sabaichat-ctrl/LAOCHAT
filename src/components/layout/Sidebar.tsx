import React from 'react';
import {
  Compass,
  PlaySquare,
  Image,
  BookOpen,
  BarChart3,
  Shield,
  TrendingUp,
  Hash,
  Award,
  Users,
  Info,
} from 'lucide-react';
import { CATEGORIES, TRENDING_TAGS } from '../../data/categories';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_CREATORS } from '../../data/mockSeedData';

interface SidebarProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  onSelectCreator?: (creatorId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedCategory,
  setSelectedCategory,
  activeView,
  setActiveView,
  onSelectCreator,
}) => {
  const { isAdmin } = useAuth();

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto space-y-6 pr-2">
      {/* Primary Navigation */}
      <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-2.5 border border-slate-800">
        <button
          onClick={() => {
            setActiveView('feed');
            setSelectedCategory('all');
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeView === 'feed' && selectedCategory === 'all'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span>ໜ້າຫຼັກ (Home)</span>
        </button>

        <button
          onClick={() => {
            setActiveView('feed');
            setSelectedCategory('video');
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeView === 'feed' && selectedCategory === 'video'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <PlaySquare className="w-4 h-4 text-rose-400" />
          <span>ວິດີໂອສັ້ນ & ຍາວ (Videos)</span>
        </button>

        <button
          onClick={() => {
            setActiveView('feed');
            setSelectedCategory('photo');
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeView === 'feed' && selectedCategory === 'photo'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Image className="w-4 h-4 text-amber-400" />
          <span>ຮູບພາບ (Photos)</span>
        </button>

        <button
          onClick={() => {
            setActiveView('feed');
            setSelectedCategory('article');
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeView === 'feed' && selectedCategory === 'article'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>ບົດຄວາມ & ສາລະ (Articles)</span>
        </button>

        <div className="my-1 border-t border-slate-800/80" />

        <button
          onClick={() => setActiveView('studio')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeView === 'studio'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Creator Studio</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            ສ້າງລາຍໄດ້
          </span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveView('admin')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeView === 'admin'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-rose-400" />
              <span>ກະດານແອດມິນ</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
              Admin
            </span>
          </button>
        )}
      </div>

      {/* Recommended Lao Creators */}
      <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-3.5 border border-slate-800">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>ຄີເອເຕີ້ແນະນຳ</span>
          </div>
          <Award className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <div className="space-y-2">
          {INITIAL_CREATORS.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCreator?.(c.id)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={c.avatarUrl}
                  alt={c.displayName}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-500/40"
                />
                <div className="min-w-0 truncate">
                  <p className="text-xs font-bold text-slate-200 group-hover:text-amber-300 truncate">
                    {c.displayName}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {(c.followersCount / 1000).toFixed(1)}k ຜູ້ຕິດຕາມ
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Lao Hashtags */}
      <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-3.5 border border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 px-1">
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          <span>ກຳລັງມາແຮງໃນລາວ</span>
        </div>

        <div className="space-y-1.5">
          {TRENDING_TAGS.map((item) => (
            <div
              key={item.tag}
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-xs"
            >
              <span className="font-medium text-slate-300 hover:text-amber-300">
                {item.tag}
              </span>
              <span className="text-[11px] text-slate-500">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Copyright / Platform info */}
      <div className="px-3 text-xs text-slate-400 space-y-1.5 border-t border-slate-800/80 pt-3">
        <p className="font-semibold text-slate-400">LAOCHAT © 2026</p>
        <p className="text-[11px] leading-relaxed">
          ແພລັດຟອມສື່ສັງຄົມອອນລາຍສຳລັບຄົນລາວ ທຸກລິຂະສິດໄດ້ຮັບການຄຸ້ມຄອງ.
        </p>
      </div>
    </aside>
  );
};
