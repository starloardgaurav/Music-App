import React, { useState, useRef, useEffect, TouchEvent } from 'react';
import {
  X,
  Heart,
  FileText,
  Share2,
  ListMusic,
  PlusCircle,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useUser } from '../../context/UserContext';
import confetti from 'canvas-confetti';

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

export const SwipePlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNextSwipe,
    playPrevSwipe,
    isSwipeModeOpen,
    closeSwipeMode,
    openLyrics,
    openQueue,
    openAddToPlaylist,
    openShare,
    isMuted,
    toggleMute,
    queue,
  } = usePlayer();
  const { isLiked, toggleLike } = useUser();

  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [heartBurst, setHeartBurst] = useState<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  });

  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const lastTapRef = useRef<number>(0);

  // Keyboard navigation support (Arrow Up / Down, Space)
  useEffect(() => {
    if (!isSwipeModeOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        playNextSwipe();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        playPrevSwipe();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'Escape') {
        closeSwipeMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSwipeModeOpen, playNextSwipe, playPrevSwipe, togglePlay, closeSwipeMode]);

  if (!isSwipeModeOpen || !currentSong) return null;

  const liked = isLiked(currentSong.id);
  const nextCandidate = queue[0];

  // Touch Handlers
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    currentYRef.current = e.touches[0].clientY;
    const diff = currentYRef.current - startYRef.current;
    // Dampen drag
    setDragOffset(diff * 0.75);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = currentYRef.current - startYRef.current;

    const threshold = 65;
    if (diff < -threshold) {
      // Swiped UP -> Next Song
      playNextSwipe();
    } else if (diff > threshold) {
      // Swiped DOWN -> Prev Song
      playPrevSwipe();
    }

    setDragOffset(0);
  };

  // Mouse Drag Fallback for Desktop
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    startYRef.current = e.clientY;
    currentYRef.current = e.clientY;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    currentYRef.current = e.clientY;
    const diff = currentYRef.current - startYRef.current;
    setDragOffset(diff * 0.6);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = currentYRef.current - startYRef.current;
    const threshold = 60;
    if (diff < -threshold) {
      playNextSwipe();
    } else if (diff > threshold) {
      playPrevSwipe();
    }
    setDragOffset(0);
  };

  // Double Tap to Like
  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Trigger like burst
      const clientX = 'touches' in e ? e.touches[0]?.clientX || window.innerWidth / 2 : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY || window.innerHeight / 2 : (e as React.MouseEvent).clientY;

      setHeartBurst({ active: true, x: clientX, y: clientY });
      setTimeout(() => setHeartBurst({ active: false, x: 0, y: 0 }), 800);

      if (!liked) {
        toggleLike(currentSong);
        confetti({
          particleCount: 20,
          spread: 45,
          origin: { x: clientX / window.innerWidth, y: clientY / window.innerHeight },
          colors: ['#e11d48', '#fda4af', '#ffffff'],
        });
      }
    } else {
      // Single tap -> toggle play/pause after brief pause if no double tap
      lastTapRef.current = now;
    }
  };

  const spawnReaction = (emoji: string) => {
    const newId = Date.now() + Math.random();
    setFloatingReactions((prev) => [
      ...prev,
      { id: newId, emoji, x: Math.random() * 40 - 20 },
    ]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== newId));
    }, 2000);
  };

  const lyricsPeek = currentSong.lyrics?.find((l) => currentTime >= l.time)?.text || currentSong.genre;

  return (
    <div
      id="swipe-music-player-container"
      className="fixed inset-0 z-50 bg-[#050505] text-white overflow-hidden flex flex-col select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Overlay Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 pt-4 pb-3 bg-gradient-to-b from-[#050505]/90 via-[#050505]/50 to-transparent pointer-events-auto">
        <button
          id="btn-close-swipe-mode"
          onClick={closeSwipeMode}
          className="p-2.5 rounded-2xl glass hover:bg-white/10 text-white/90 border border-white/10 transition-all active:scale-95 shadow-lg"
          aria-label="Exit Swipe Stream"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-950/60 backdrop-blur-md border border-rose-800/40 text-xs font-bold text-rose-300 shadow red-glow">
          <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>Vibe Discovery</span>
        </div>

        <button
          onClick={toggleMute}
          className="p-2.5 rounded-2xl glass hover:bg-white/10 text-white/90 border border-white/10 transition-all active:scale-95"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Swipeable Song Stage Card */}
      <div
        className="relative w-full h-full flex flex-col justify-end transition-transform duration-100 ease-out cursor-grab active:cursor-grabbing"
        style={{
          transform: `translateY(${dragOffset}px) scale(${1 - Math.abs(dragOffset) * 0.0004})`,
        }}
        onClick={handleDoubleTap}
      >
        {/* Full-bleed blurred background */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none opacity-40"
          style={{ backgroundImage: `url(${currentSong.artwork})` }}
        />
        <div className="absolute inset-0 gradient-bg opacity-80 pointer-events-none" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent pointer-events-none" />

        {/* Center Artwork Glow Stage */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-[38px] overflow-hidden shadow-2xl red-glow-lg border border-white/10 album-art-grain">
            <img
              src={currentSong.artwork}
              alt={currentSong.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />
            {/* Center Play/Pause Indicator on tap */}
            <div
              className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity ${
                isPlaying ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                <Play className="w-7 h-7 fill-black text-black ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Double-tap Burst Heart Animation */}
        {heartBurst.active && (
          <div
            className="absolute z-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping duration-500"
            style={{ left: `${heartBurst.x}px`, top: `${heartBurst.y}px` }}
          >
            <Heart className="w-24 h-24 fill-rose-600 text-rose-600 drop-shadow-[0_0_25px_rgba(225,29,72,0.9)]" />
          </div>
        )}

        {/* Floating Vibe Emoji Reactions */}
        <div className="absolute right-16 bottom-36 z-30 pointer-events-none">
          {floatingReactions.map((r) => (
            <div
              key={r.id}
              className="absolute bottom-0 text-3xl animate-bounce"
              style={{
                transform: `translateX(${r.x}px) translateY(-100px)`,
                transition: 'transform 1.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 1.8s ease-out',
                opacity: 0,
              }}
            >
              {r.emoji}
            </div>
          ))}
        </div>

        {/* Drag Helper Guides (Up / Down Indicators) */}
        {dragOffset !== 0 && (
          <div className="absolute top-20 left-0 right-0 flex justify-center pointer-events-none animate-bounce">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass bg-[#050505]/90 border border-rose-500/50 text-xs font-bold text-rose-300 red-glow">
              {dragOffset < 0 ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Release to play Next: {nextCandidate?.title || 'Next Track'}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Release to play Previous Track</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Bottom Content Area */}
        <div className="relative z-20 p-6 pb-8 flex items-end justify-between pointer-events-auto">
          {/* Left Metadata & Lyrics Peek */}
          <div className="flex-1 min-w-0 pr-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                {currentSong.genre}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {currentSong.bpm || 120} BPM
              </span>
            </div>

            <div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight line-clamp-1">
                {currentSong.title}
              </h1>
              <p className="text-sm font-semibold text-rose-500 truncate mt-0.5">
                {currentSong.artist}
              </p>
            </div>

            {/* Synchronized Live Lyrics Peek Bar */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                openLyrics();
              }}
              className="flex items-center gap-2.5 p-2.5 rounded-2xl glass hover:bg-white/10 border border-white/10 text-xs text-zinc-200 cursor-pointer group transition-all"
            >
              <FileText className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="font-medium truncate italic text-zinc-300">
                "{lyricsPeek}"
              </span>
            </div>

            {/* Live Progress Bar in Swipe Stream */}
            <div className="pt-2">
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-600 transition-all duration-200"
                  style={{
                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="swipe-indicator flex flex-col items-center gap-0.5 opacity-40 mt-3">
                <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Swipe for Next</span>
                <ChevronUp className="w-3.5 h-3.5 text-zinc-400 -mt-0.5" />
              </div>
            </div>
          </div>

          {/* Right Action Icons Column */}
          <div
            className="flex flex-col items-center gap-3.5 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Like Action */}
            <button
              onClick={() => toggleLike(currentSong)}
              className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
            >
              <div
                className={`p-3 rounded-full border transition-all ${
                  liked
                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-950/60'
                    : 'glass border-white/10 text-white group-hover:bg-white/10'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    liked ? 'fill-white text-white' : 'text-white'
                  }`}
                />
              </div>
              <span className="text-[10px] font-bold text-zinc-300">
                {currentSong.likesCount + (liked ? 1 : 0)}
              </span>
            </button>

            {/* Quick Vibe Reaction (🔥) */}
            <button
              onClick={() => spawnReaction('🔥')}
              className="p-3 rounded-full glass border border-white/10 text-white active:scale-90 hover:bg-white/10 transition-all"
              title="Send Fire Reaction"
            >
              <span className="text-lg leading-none">🔥</span>
            </button>

            {/* Lyrics View Trigger */}
            <button
              onClick={openLyrics}
              className="p-3 rounded-full glass border border-white/10 text-white active:scale-90 hover:bg-white/10 transition-all"
              title="Full Lyrics"
            >
              <FileText className="w-5 h-5 text-rose-500" />
            </button>

            {/* Add to Playlist */}
            <button
              onClick={openAddToPlaylist}
              className="p-3 rounded-full glass border border-white/10 text-white active:scale-90 hover:bg-white/10 transition-all"
              title="Add to Playlist"
            >
              <PlusCircle className="w-5 h-5" />
            </button>

            {/* Share */}
            <button
              onClick={openShare}
              className="p-3 rounded-full glass border border-white/10 text-white active:scale-90 hover:bg-white/10 transition-all"
              title="Share Track"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Queue */}
            <button
              onClick={openQueue}
              className="p-3 rounded-full glass border border-white/10 text-white active:scale-90 hover:bg-white/10 transition-all"
              title="Queue"
            >
              <ListMusic className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
