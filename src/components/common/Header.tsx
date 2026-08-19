import React from 'react';
import { Sparkles, Activity } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { usePlayer } from '../../context/PlayerContext';

export const Header: React.FC = () => {
  const { user } = useUser();
  const { openInspector } = usePlayer();

  return (
    <header className="sticky top-0 z-30 w-full px-4 sm:px-6 py-3.5 glass bg-[#050505]/70 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between">
      {/* Brand logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-rose-600 shadow-md shadow-rose-950/60 flex-shrink-0">
          <span className="font-display font-extrabold text-base text-white tracking-tight">V</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-display font-extrabold text-lg tracking-tight text-white uppercase">
            AURA<span className="text-rose-600 italic">SYNC</span>
          </span>
          <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 hidden sm:inline-block">
            Engine v2
          </span>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-2.5">
        {/* ML Recommendation Inspector Badge */}
        <button
          id="btn-open-inspector"
          onClick={openInspector}
          aria-label="View Recommendation ML Pipeline"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 transition-all active:scale-95 shadow-sm"
        >
          <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="hidden sm:inline">Telemetry & Taste</span>
          <span className="sm:hidden">Engine</span>
        </button>

        {/* User profile avatar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-white/10 shadow-md ring-1 ring-rose-500/20"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-[#050505]" />
          </div>
        </div>
      </div>
    </header>
  );
};
