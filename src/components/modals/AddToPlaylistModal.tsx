import React, { useState } from 'react';
import { X, Plus, Check, Music } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useUser } from '../../context/UserContext';

export const AddToPlaylistModal: React.FC = () => {
  const { currentSong, isAddToPlaylistOpen, closeAddToPlaylist } = usePlayer();
  const { user, allPlaylists, addSongToPlaylist, removeSongFromPlaylist, createPlaylist } = useUser();
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  if (!isAddToPlaylistOpen || !currentSong) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const pl = createPlaylist(newTitle, newDesc, currentSong.artwork);
    addSongToPlaylist(pl.id, currentSong.id);
    setNewTitle('');
    setNewDesc('');
    setIsCreatingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md glass bg-[#050505]/95 border border-white/10 rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-200 red-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div>
            <h3 className="font-display font-bold text-lg text-white">Add to Playlist</h3>
            <p className="text-xs text-rose-500 font-medium truncate max-w-[240px]">
              {currentSong.title} — {currentSong.artist}
            </p>
          </div>
          <button
            onClick={closeAddToPlaylist}
            className="p-2 rounded-2xl glass hover:bg-white/10 text-zinc-300 transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick New Playlist Toggle */}
        {!isCreatingNew ? (
          <button
            onClick={() => setIsCreatingNew(true)}
            className="w-full mt-4 flex items-center gap-3 p-3.5 rounded-2xl glass bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 text-rose-300 font-bold text-sm transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center">
              <Plus className="w-5 h-5 text-rose-400" />
            </div>
            <span>Create New Playlist</span>
          </button>
        ) : (
          <form onSubmit={handleCreate} className="mt-4 p-3.5 rounded-2xl glass border border-white/10 space-y-3">
            <h4 className="text-xs uppercase font-bold text-rose-500">New Playlist</h4>
            <input
              type="text"
              placeholder="Playlist name..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-white/10 text-white text-sm focus:outline-none focus:border-rose-500 font-medium"
              autoFocus
            />
            <input
              type="text"
              placeholder="Optional description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#09090b] border border-white/10 text-zinc-300 text-xs focus:outline-none focus:border-rose-500"
            />
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all shadow"
              >
                Create & Add
              </button>
            </div>
          </form>
        )}

        {/* Existing Playlists list */}
        <div className="mt-4 max-h-60 overflow-y-auto space-y-2 no-scrollbar">
          {allPlaylists.map((pl) => {
            const hasSong = pl.songIds.includes(currentSong.id);
            return (
              <div
                key={pl.id}
                onClick={() => {
                  if (hasSong) {
                    removeSongFromPlaylist(pl.id, currentSong.id);
                  } else {
                    addSongToPlaylist(pl.id, currentSong.id);
                  }
                }}
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all ${
                  hasSong
                    ? 'bg-rose-950/40 border-rose-800/60 text-white red-glow'
                    : 'glass border-white/5 hover:border-white/20 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 flex-shrink-0 flex items-center justify-center">
                    {pl.artwork ? (
                      <img src={pl.artwork} alt={pl.name} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold truncate font-display">{pl.name}</span>
                    <span className="text-xs text-zinc-500 font-mono">{pl.songIds.length} tracks</span>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    hasSong
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'border-zinc-700 bg-zinc-900'
                  }`}
                >
                  {hasSong && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Done */}
        <div className="mt-5 pt-3 border-t border-white/5 flex justify-end">
          <button
            onClick={closeAddToPlaylist}
            className="w-full py-3 rounded-2xl bg-white text-black hover:bg-zinc-200 font-bold text-sm transition-all shadow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
