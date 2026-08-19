import React from 'react';
import { Play, Pause, SkipForward, Heart, Maximize2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useUser } from '../../context/UserContext';

export const MiniPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    progress,
    togglePlay,
    nextSong,
    openFullScreen,
    isFullScreenOpen,
    isSwipeModeOpen,
  } = usePlayer();
  const { isLiked, toggleLike } = useUser();

  if (!currentSong || isFullScreenOpen || isSwipeModeOpen) {
    return null;
  }

  const liked = isLiked(currentSong.id);

  return (
    <div
      id="mini-player"
      className="fixed bottom-16 left-2 right-2 z-20 max-w-md mx-auto"
    >
      <div
        onClick={openFullScreen}
        className="relative group overflow-hidden rounded-2xl glass bg-[#050505]/85 backdrop-blur-2xl border border-white/10 shadow-2xl p-2.5 flex items-center justify-between cursor-pointer transition-all hover:border-rose-500/40 red-glow"
      >
        {/* Subtle dynamic red glow */}
        <div
          className="absolute -inset-1 opacity-20 blur-xl pointer-events-none transition-opacity group-hover:opacity-40"
          style={{ backgroundColor: currentSong.color?.primary || '#e11d48' }}
        />

        {/* Left: Thumbnail & Info */}
        <div className="relative flex items-center gap-3 overflow-hidden min-w-0 flex-1 mr-2">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-md border border-white/10">
            <img
              src={currentSong.artwork}
              alt={currentSong.title}
              className={`w-full h-full object-cover transition-transform ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-rose-400 rounded-full animate-bounce h-2" />
                  <span className="w-0.5 bg-rose-400 rounded-full animate-bounce h-3 delay-75" />
                  <span className="w-0.5 bg-rose-400 rounded-full animate-bounce h-1.5 delay-150" />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs text-white truncate font-display">
              {currentSong.title}
            </span>
            <span className="text-[11px] text-zinc-400 truncate font-medium">
              {currentSong.artist}
            </span>
          </div>
        </div>

        {/* Right: Controls */}
        <div
          className="relative flex items-center gap-1 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Like button */}
          <button
            id="mini-player-like-btn"
            onClick={() => toggleLike(currentSong)}
            aria-label={liked ? 'Unlike song' : 'Like song'}
            className="p-2 text-zinc-400 hover:text-rose-500 active:scale-90 transition-all"
          >
            <Heart
              className={`w-4 h-4 ${
                liked ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'
              }`}
            />
          </button>

          {/* Play/Pause */}
          <button
            id="mini-player-play-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-9 h-9 rounded-full bg-white text-black active:scale-95 flex items-center justify-center shadow-lg hover:bg-zinc-200 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black text-black" />
            ) : (
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            id="mini-player-next-btn"
            onClick={() => nextSong()}
            aria-label="Next Song"
            className="p-2 text-zinc-400 hover:text-white active:scale-90 transition-all"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Expand icon */}
          <button
            id="mini-player-expand-btn"
            onClick={openFullScreen}
            aria-label="Open Full Player"
            className="p-1.5 text-zinc-500 hover:text-zinc-300 active:scale-90 transition-all hidden sm:block"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress bar at bottom of pill */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
          <div
            className="h-full bg-rose-600 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
