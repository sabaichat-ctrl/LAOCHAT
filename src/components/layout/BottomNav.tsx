import React from 'react';
import { Compass, Search, PlusCircle, BarChart3, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenCreate: () => void;
  onOpenSearch?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  setActiveView,
  onOpenCreate,
}) => {
  const { userProfile, isAdmin } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 lg:hidden shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {/* Home Feed */}
        <button
          onClick={() => setActiveView('feed')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeView === 'feed' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">ໜ້າຫຼັກ</span>
        </button>

        {/* Studio */}
        <button
          onClick={() => setActiveView('studio')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeView === 'studio' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px]">ສະຕູດິໂອ</span>
        </button>

        {/* Create Post Center Button */}
        <button
          onClick={onOpenCreate}
          className="flex flex-col items-center justify-center -mt-5"
          aria-label="ສ້າງໂພສຕ໌ໃໝ່"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/30 text-slate-950 hover:scale-105 active:scale-95 transition-all">
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] mt-1 font-semibold text-amber-300">ໂພສຕ໌</span>
        </button>

        {/* Admin or Discover */}
        {isAdmin ? (
          <button
            onClick={() => setActiveView('admin')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeView === 'admin' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px]">ແອດມິນ</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveView('feed')}
            className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-200"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px]">ຄົ້ນຫາ</span>
          </button>
        )}

        {/* Profile */}
        <button
          onClick={() => setActiveView('profile')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeView === 'profile' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {userProfile?.avatarUrl ? (
            <img
              src={userProfile.avatarUrl}
              alt="ໂປຣໄຟລ໌"
              className={`w-5 h-5 rounded-full object-cover ${
                activeView === 'profile' ? 'ring-2 ring-amber-400' : ''
              }`}
            />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px]">ໂປຣໄຟລ໌</span>
        </button>
      </div>
    </nav>
  );
};
