import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Search, Library } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export const BottomNav: React.FC = () => {
  const { openSwipeMode } = usePlayer();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 glass bg-[#050505]/85 backdrop-blur-2xl border-t border-white/5 px-2 py-2 safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Home / For You */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
              isActive && location.pathname === '/'
                ? 'text-rose-500 font-bold bg-white/5 border border-white/10 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`
          }
          id="nav-tab-home"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] uppercase font-semibold tracking-wider">For You</span>
        </NavLink>

        {/* Vibe Stream Swipe Mode Button */}
        <button
          id="nav-tab-swipe-feed"
          onClick={() => openSwipeMode()}
          className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl text-zinc-300 hover:text-white transition-all group"
        >
          <div className="relative p-1.5 rounded-xl bg-rose-600/20 group-hover:bg-rose-600/30 border border-rose-500/40 transition-all red-glow">
            <Compass className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform animate-pulse" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">Discovery</span>
        </button>

        {/* Search */}
        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
              isActive
                ? 'text-rose-500 font-bold bg-white/5 border border-white/10 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`
          }
          id="nav-tab-search"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] uppercase font-semibold tracking-wider">Search</span>
        </NavLink>

        {/* Library */}
        <NavLink
          to="/library"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
              isActive
                ? 'text-rose-500 font-bold bg-white/5 border border-white/10 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`
          }
          id="nav-tab-library"
        >
          <Library className="w-5 h-5" />
          <span className="text-[10px] uppercase font-semibold tracking-wider">Library</span>
        </NavLink>
      </div>
    </nav>
  );
};
