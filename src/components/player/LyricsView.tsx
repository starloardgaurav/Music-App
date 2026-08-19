import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Globe, Heart, Volume2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useUser } from '../../context/UserContext';

export const LyricsView: React.FC = () => {
  const {
    currentSong,
    currentTime,
    isPlaying,
    togglePlay,
    prevSong,
    nextSong,
    seek,
    isLyricsOpen,
    closeLyrics,
  } = usePlayer();
  const { isLiked, toggleLike } = useUser();
  const [showTranslations, setShowTranslations] = useState<boolean>(true);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const lyrics = currentSong?.lyrics || [];

  // Find index of current lyric line
  const currentLineIndex = lyrics.reduce((acc, line, idx) => {
    if (currentTime >= line.time) return idx;
    return acc;
  }, 0);

  // Auto-scroll to active line smoothly
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentLineIndex]);

  if (!isLyricsOpen || !currentSong) {
    return null;
  }

  const liked = isLiked(currentSong.id);

  return (
    <div
      id="full-screen-lyrics"
      className="fixed inset-0 z-50 flex flex-col bg-[#050505]/95 backdrop-blur-3xl text-zinc-100 animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Background artwork blurred atmospheric gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 blur-3xl pointer-events-none scale-125"
        style={{ backgroundImage: `url(${currentSong.artwork})` }}
      />
      <div className="absolute inset-0 gradient-bg opacity-80 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/90 to-[#050505] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-white/5">
        <button
          id="btn-close-lyrics"
          onClick={closeLyrics}
          aria-label="Close lyrics"
          className="p-2 rounded-2xl glass hover:bg-white/10 active:scale-95 text-zinc-300 transition-all border border-white/10"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center max-w-[200px]">
          <span className="text-[10px] uppercase tracking-widest text-rose-500 font-bold">
            Live Synchronized Lyrics
          </span>
          <span className="text-sm font-bold truncate text-zinc-100 font-display">
            {currentSong.title}
          </span>
        </div>

        <button
          onClick={() => setShowTranslations((prev) => !prev)}
          className={`p-2 rounded-2xl text-xs font-bold flex items-center gap-1 transition-all ${
            showTranslations
              ? 'bg-rose-950/80 text-rose-300 border border-rose-700/50 red-glow'
              : 'glass text-zinc-400 border border-white/10 hover:text-white'
          }`}
          title="Toggle Translations"
        >
          <Globe className="w-4 h-4" />
        </button>
      </div>

      {/* Lyrics Scrollable Area */}
      <div
        ref={containerRef}
        className="relative z-10 flex-1 overflow-y-auto px-6 py-12 flex flex-col items-center gap-7 no-scrollbar select-none"
      >
        {lyrics.length === 0 ? (
          <div className="my-auto text-center py-16">
            <Volume2 className="w-12 h-12 mx-auto text-zinc-600 mb-3 animate-pulse" />
            <p className="text-lg font-medium text-zinc-400 font-display">
              Instrumental or No Lyrics Available
            </p>
            <p className="text-xs text-zinc-600 mt-1">Enjoy the acoustic vibes</p>
          </div>
        ) : (
          lyrics.map((line, index) => {
            const isActive = index === currentLineIndex;
            const isPast = index < currentLineIndex;

            return (
              <div
                key={index}
                ref={isActive ? activeLineRef : null}
                onClick={() => seek(line.time)}
                className={`text-center cursor-pointer transition-all duration-300 max-w-lg group py-2 px-5 rounded-2xl ${
                  isActive
                    ? 'scale-105 opacity-100 font-extrabold text-2xl md:text-3xl text-white drop-shadow-[0_0_25px_rgba(225,29,72,0.7)] bg-white/5 border border-white/10'
                    : isPast
                    ? 'opacity-40 text-lg md:text-xl font-medium text-zinc-400 hover:opacity-75'
                    : 'opacity-40 text-lg md:text-xl font-medium text-zinc-400 hover:opacity-75'
                }`}
              >
                <p className="tracking-tight leading-relaxed">{line.text}</p>
                {showTranslations && line.translation && (
                  <p
                    className={`text-xs md:text-sm mt-1 transition-opacity ${
                      isActive ? 'text-rose-400 font-medium' : 'text-zinc-500'
                    }`}
                  >
                    {line.translation}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Sticky Player Bar */}
      <div className="relative z-10 px-6 py-4 glass bg-[#050505]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-between max-w-md mx-auto w-full">
        {/* Track Thumbnail */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={currentSong.artwork}
            alt={currentSong.title}
            className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate font-display">
              {currentSong.title}
            </span>
            <span className="text-xs text-zinc-400 truncate">
              {currentSong.artist}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleLike(currentSong)}
            className="p-2 text-zinc-400 hover:text-rose-500 transition-all active:scale-95"
          >
            <Heart
              className={`w-5 h-5 ${
                liked ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'
              }`}
            />
          </button>

          <button
            onClick={prevSong}
            className="p-2 text-zinc-400 hover:text-white transition-all active:scale-90"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-95 transition-all hover:bg-zinc-200"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black text-black" />
            ) : (
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={() => nextSong()}
            className="p-2 text-zinc-400 hover:text-white transition-all active:scale-90"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
