import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export const ShareModal: React.FC = () => {
  const { currentSong, isShareOpen, closeShare } = usePlayer();
  const [copied, setCopied] = useState(false);

  if (!isShareOpen || !currentSong) return null;

  const shareUrl = `${window.location.origin}/?track=${currentSong.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${currentSong.title} — ${currentSong.artist} on AURA`,
          text: `Listen to ${currentSong.title} by ${currentSong.artist} on AURA Music!`,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm glass bg-[#050505]/95 border border-white/10 rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-200 red-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-rose-500" />
            <h3 className="font-display font-bold text-lg text-white">Share Music</h3>
          </div>
          <button
            onClick={closeShare}
            className="p-2 rounded-2xl glass hover:bg-white/10 text-zinc-300 transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Music Card Preview */}
        <div className="mt-4 p-4 rounded-2xl glass border border-white/10 flex items-center gap-3">
          <img
            src={currentSong.artwork}
            alt={currentSong.title}
            className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-white/10"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-white text-sm truncate font-display">{currentSong.title}</span>
            <span className="text-xs text-rose-500 font-medium truncate">{currentSong.artist}</span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-rose-400 font-semibold">
              <Sparkles className="w-3 h-3 text-rose-400" />
              <span>AURA Stream</span>
            </div>
          </div>
        </div>

        {/* Copy Link Input */}
        <div className="mt-4 flex items-center gap-2 p-2 rounded-2xl glass bg-[#09090b] border border-white/10">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="bg-transparent text-xs text-zinc-300 px-2 flex-1 focus:outline-none truncate font-mono"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold active:scale-95 transition-all shadow-md"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleNativeShare}
          className="w-full mt-4 py-3 rounded-2xl bg-white text-black hover:bg-zinc-200 font-bold text-sm transition-all shadow"
        >
          Share via Apps
        </button>
      </div>
    </div>
  );
};
