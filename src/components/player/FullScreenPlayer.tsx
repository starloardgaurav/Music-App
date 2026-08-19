import React, { useState } from 'react';
import {
  ChevronDown,
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  FileText,
  Share2,
  PlusCircle,
  Volume2,
  VolumeX,
  Disc,
  Radio,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useUser } from '../../context/UserContext';
import confetti from 'canvas-confetti';

export const FullScreenPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    isFullScreenOpen,
    closeFullScreen,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    openLyrics,
    openQueue,
    openAddToPlaylist,
    openShare,
    openSwipeMode,
  } = usePlayer();
  const { isLiked, toggleLike } = useUser();

  const [viewMode, setViewMode] = useState<'art' | 'vinyl' | 'waveform'>('art');
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  if (!isFullScreenOpen || !currentSong) return null;

  const liked = isLiked(currentSong.id);

  const handleLikeWithConfetti = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!liked) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 25,
        spread: 60,
        origin: {
          x: rect.left / window.innerWidth,
          y: rect.top / window.innerHeight,
        },
        colors: ['#e11d48', '#fb7185', '#fda4af', '#ffffff'],
        disableForReducedMotion: true,
      });
    }
    toggleLike(currentSong);
  };

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${min}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      id="full-screen-music-player"
      className="fixed inset-0 z-40 flex flex-col bg-[#050505] text-white overflow-hidden animate-in slide-in-from-bottom duration-300 select-none"
    >
      {/* Dynamic blurred album-art background with radial dark vignette */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 blur-3xl scale-125 transition-all duration-700 pointer-events-none"
        style={{ backgroundImage: `url(${currentSong.artwork})` }}
      />
      <div className="absolute inset-0 gradient-bg opacity-90 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/70 via-[#050505]/85 to-[#050505] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2">
        <button
          id="btn-collapse-player"
          onClick={closeFullScreen}
          aria-label="Collapse player"
          className="p-2.5 rounded-2xl glass hover:bg-white/10 text-white/80 transition-all active:scale-95 border border-white/10"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-rose-500 font-bold">
            Now Playing
          </span>
          <span className="text-xs font-semibold text-zinc-300">
            {currentSong.album || 'AURA Radiance'}
          </span>
        </div>

        {/* Swipe Mode Switcher */}
        <button
          onClick={() => {
            closeFullScreen();
            openSwipeMode();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/40 text-xs font-bold text-rose-300 transition-all active:scale-95 shadow-sm red-glow"
          title="Switch to Vibe Discovery Stream"
        >
          <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>Swipe Feed</span>
        </button>
      </div>

      {/* Center Artwork / Vinyl Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-2 min-h-0">
        {/* View Mode Toggle Pills */}
        <div className="flex items-center gap-1 p-1 mb-4 rounded-full glass border border-white/10 backdrop-blur-xl">
          <button
            onClick={() => setViewMode('art')}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              viewMode === 'art' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Artwork
          </button>
          <button
            onClick={() => setViewMode('vinyl')}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              viewMode === 'vinyl' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>Vinyl</span>
          </button>
          <button
            onClick={() => setViewMode('waveform')}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              viewMode === 'waveform' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Wave
          </button>
        </div>

        {/* Main Visualizer Stage */}
        <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
          {viewMode === 'art' && (
            <div className="relative w-full h-full rounded-[36px] overflow-hidden shadow-2xl red-glow-lg border border-white/10 group album-art-grain">
              <img
                src={currentSong.artwork}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />
            </div>
          )}

          {viewMode === 'vinyl' && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Vinyl record */}
              <div
                className={`w-72 h-72 rounded-full bg-[#09090b] border-4 border-zinc-800 shadow-2xl red-glow flex items-center justify-center relative overflow-hidden ${
                  isPlaying ? 'animate-spin-slow' : ''
                }`}
                style={{
                  background:
                    'radial-gradient(circle, #1c0a0f 0%, #09090b 40%, #17070b 70%, #050505 100%)',
                }}
              >
                <div className="absolute inset-4 rounded-full border border-white/5" />
                <div className="absolute inset-8 rounded-full border border-white/5" />
                <div className="absolute inset-12 rounded-full border border-white/5" />
                <div className="absolute inset-16 rounded-full border border-white/5" />

                {/* Center label */}
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-rose-500/60 shadow-inner flex items-center justify-center">
                  <img
                    src={currentSong.artwork}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute w-5 h-5 rounded-full bg-[#050505] border border-zinc-700 shadow-md" />
              </div>
            </div>
          )}

          {viewMode === 'waveform' && (
            <div className="w-full h-full rounded-[36px] glass border border-white/10 p-6 flex flex-col items-center justify-center gap-4 red-glow">
              <div className="flex items-end justify-center gap-1.5 h-32 w-full">
                {Array.from({ length: 24 }).map((_, i) => {
                  const h = isPlaying
                    ? Math.sin(i * 0.4 + (currentTime % 10)) * 40 + 50
                    : 20;
                  return (
                    <div
                      key={i}
                      className="w-2 rounded-full bg-gradient-to-t from-rose-600 to-red-400 transition-all duration-150"
                      style={{ height: `${h}%` }}
                    />
                  );
                })}
              </div>
              <span className="text-xs text-rose-300 font-mono tracking-wider uppercase">
                {currentSong.genre} • {currentSong.bpm || 120} BPM
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Song Metadata & Like Row */}
      <div className="relative z-10 px-7 py-2 max-w-md mx-auto w-full flex items-center justify-between">
        <div className="flex flex-col min-w-0 pr-4">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white truncate tracking-tight">
            {currentSong.title}
          </h2>
          <p className="text-sm font-semibold text-rose-500 truncate mt-0.5">
            {currentSong.artist}
          </p>
        </div>

        <button
          id="btn-player-like"
          onClick={handleLikeWithConfetti}
          aria-label={liked ? 'Unlike song' : 'Like song'}
          className={`p-3 rounded-full border transition-all active:scale-90 flex-shrink-0 ${
            liked
              ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-950/60'
              : 'glass border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          <Heart
            className={`w-6 h-6 transition-transform duration-200 ${
              liked ? 'fill-white text-white scale-110' : 'text-zinc-400'
            }`}
          />
        </button>
      </div>

      {/* Progress & Scrub Bar */}
      <div className="relative z-10 px-7 py-2 max-w-md mx-auto w-full">
        <div className="relative flex items-center group cursor-pointer py-2">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.5"
            value={isScrubbing ? scrubTime : currentTime}
            onMouseDown={() => setIsScrubbing(true)}
            onTouchStart={() => setIsScrubbing(true)}
            onChange={(e) => setScrubTime(parseFloat(e.target.value))}
            onMouseUp={(e) => {
              setIsScrubbing(false);
              seek(parseFloat((e.target as HTMLInputElement).value));
            }}
            onTouchEnd={(e) => {
              setIsScrubbing(false);
              seek(parseFloat((e.target as HTMLInputElement).value));
            }}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-rose-600 cursor-pointer focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 -mt-1">
          <span>{formatTime(isScrubbing ? scrubTime : currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Primary Playback Controls */}
      <div className="relative z-10 px-7 py-3 max-w-md mx-auto w-full flex items-center justify-between">
        {/* Shuffle */}
        <button
          onClick={toggleShuffle}
          className={`p-2.5 rounded-full transition-all ${
            shuffle ? 'text-rose-500 bg-rose-950/40 border border-rose-800/40' : 'text-zinc-400 hover:text-white'
          }`}
          title="Shuffle"
        >
          <Shuffle className="w-5 h-5" />
        </button>

        {/* Prev */}
        <button
          onClick={prevSong}
          className="p-3 text-zinc-300 hover:text-white active:scale-90 transition-all"
          title="Previous Track"
        >
          <SkipBack className="w-7 h-7 fill-current" />
        </button>

        {/* Play/Pause High Contrast White Round Button */}
        <button
          id="btn-player-play-pause"
          onClick={togglePlay}
          className="relative w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl active:scale-95 transition-all hover:scale-105 hover:bg-zinc-100"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 fill-black text-black" />
          ) : (
            <Play className="w-7 h-7 fill-black text-black ml-1" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={() => nextSong()}
          className="p-3 text-zinc-300 hover:text-white active:scale-90 transition-all"
          title="Next Track"
        >
          <SkipForward className="w-7 h-7 fill-current" />
        </button>

        {/* Repeat */}
        <button
          onClick={toggleRepeat}
          className={`p-2.5 rounded-full transition-all ${
            repeatMode !== 'off' ? 'text-rose-500 bg-rose-950/40 border border-rose-800/40' : 'text-zinc-400 hover:text-white'
          }`}
          title={`Repeat: ${repeatMode}`}
        >
          {repeatMode === 'one' ? (
            <Repeat1 className="w-5 h-5" />
          ) : (
            <Repeat className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Bottom Auxiliary Actions Bar */}
      <div className="relative z-10 px-6 py-4 glass bg-[#050505]/90 border-t border-white/5 max-w-md mx-auto w-full flex items-center justify-between">
        {/* Lyrics Button */}
        <button
          onClick={openLyrics}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl glass hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold border border-white/10 transition-all active:scale-95"
        >
          <FileText className="w-4 h-4 text-rose-500" />
          <span>Lyrics</span>
        </button>

        {/* Add to Playlist */}
        <button
          onClick={openAddToPlaylist}
          className="p-2.5 rounded-2xl glass hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all active:scale-95"
          title="Add to Playlist"
        >
          <PlusCircle className="w-4 h-4" />
        </button>

        {/* Share */}
        <button
          onClick={openShare}
          className="p-2.5 rounded-2xl glass hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all active:scale-95"
          title="Share Track"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Volume Mute */}
        <button
          onClick={toggleMute}
          className="p-2.5 rounded-2xl glass hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all active:scale-95"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Queue Drawer */}
        <button
          onClick={openQueue}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl glass hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold border border-white/10 transition-all active:scale-95"
        >
          <ListMusic className="w-4 h-4 text-rose-500" />
          <span>Queue</span>
        </button>
      </div>
    </div>
  );
};
