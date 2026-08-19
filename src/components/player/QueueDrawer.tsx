import React from 'react';
import { X, Play, Trash2, Sparkles, Music2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export const QueueDrawer: React.FC = () => {
  const {
    currentSong,
    queue,
    isQueueOpen,
    closeQueue,
    playSong,
    removeFromQueue,
    clearQueue,
    isPlaying,
  } = usePlayer();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg glass bg-[#050505]/95 border-t border-white/10 rounded-t-[32px] p-5 shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300 red-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-rose-500" />
            <h3 className="font-display font-bold text-lg text-white">Playback Queue</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/60 border border-rose-800/40 text-rose-300 font-mono">
              {queue.length + (currentSong ? 1 : 0)} tracks
            </span>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-xs text-zinc-400 hover:text-rose-400 px-2.5 py-1 rounded-xl glass border border-white/5 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeQueue}
              className="p-1.5 rounded-2xl glass hover:bg-white/10 text-zinc-300 transition-all border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto py-3 space-y-3 flex-1 no-scrollbar">
          {/* Currently Playing Card */}
          {currentSong && (
            <div className="mb-4">
              <span className="text-[10px] uppercase tracking-wider font-bold text-rose-500 pl-1 block mb-2">
                Now Playing
              </span>
              <div className="flex items-center justify-between p-3.5 rounded-2xl glass bg-rose-950/30 border border-rose-800/40 red-glow">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                    <img
                      src={currentSong.artwork}
                      alt={currentSong.title}
                      className="w-full h-full object-cover"
                    />
                    {isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-white truncate font-display">
                      {currentSong.title}
                    </span>
                    <span className="text-xs text-rose-300 truncate">
                      {currentSong.artist}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] font-bold text-rose-300 px-2.5 py-1 rounded-full bg-rose-900/60 border border-rose-700/50">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Up Next List */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                Up Next
              </span>
              <span className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                <Sparkles className="w-3 h-3 text-rose-400" />
                Adaptive Feed
              </span>
            </div>

            {queue.length === 0 ? (
              <div className="text-center py-8 rounded-2xl glass border border-white/5 p-4">
                <p className="text-sm text-zinc-300 font-semibold font-display">Queue is clear</p>
                <p className="text-xs text-zinc-500 mt-1">
                  AURA Machine Learning will automatically suggest the next songs based on your taste.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {queue.map((song, index) => (
                  <div
                    key={`${song.id}-${index}`}
                    className="group flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                  >
                    <div
                      onClick={() => playSong(song, queue.slice(index + 1))}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <span className="text-xs font-mono font-semibold text-zinc-500 w-4 text-center">
                        {index + 1}
                      </span>
                      <img
                        src={song.artwork}
                        alt={song.title}
                        className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-white/5"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-zinc-200 truncate group-hover:text-white font-display">
                          {song.title}
                        </span>
                        <span className="text-xs text-zinc-400 truncate">
                          {song.artist} • {song.genre}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => playSong(song, queue.slice(index + 1))}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                        title="Play Now"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={() => removeFromQueue(index)}
                        className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-white/10 rounded-xl transition-colors"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
