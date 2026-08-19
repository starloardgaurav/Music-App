import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Plus,
  Play,
  Shuffle,
  Music2,
  FolderHeart,
  Users,
  Download,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { usePlayer } from '../context/PlayerContext';
import { MOCK_ARTISTS, MOCK_SONGS } from '../data/mockMusic';

export const Library: React.FC = () => {
  const navigate = useNavigate();
  const { user, allPlaylists, getUserLikedSongs, createPlaylist, isFollowed, toggleFollow } = useUser();
  const { playSong, openFullScreen } = usePlayer();

  const [activeTab, setActiveTab] = useState<'all' | 'liked' | 'playlists' | 'artists' | 'downloaded'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const likedSongs = getUserLikedSongs();
  const followedArtists = MOCK_ARTISTS.filter((a) => isFollowed(a.id));
  const downloadedSongs = MOCK_SONGS.filter((s) => (user.downloadedSongIds || []).includes(s.id));

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const pl = createPlaylist(newTitle, newDesc);
    setNewTitle('');
    setNewDesc('');
    setShowCreateModal(false);
    navigate(`/playlist/${pl.id}`);
  };

  const handlePlayLiked = (shuffle = false) => {
    if (likedSongs.length === 0) return;
    let list = [...likedSongs];
    if (shuffle) {
      list = list.sort(() => Math.random() - 0.5);
    }
    playSong(list[0], list.slice(1));
    openFullScreen();
  };

  return (
    <div className="pb-36 pt-2 px-4 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header & Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-rose-500" />
            <h1 className="font-display font-extrabold text-2xl text-white">Your Music Library</h1>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Playlist</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: 'All Collections' },
            { id: 'liked', label: `Liked (${likedSongs.length})` },
            { id: 'playlists', label: `Playlists (${allPlaylists.length})` },
            { id: 'artists', label: `Artists (${followedArtists.length})` },
            { id: 'downloaded', label: `Offline (${downloadedSongs.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. LIKED SONGS HERO CARD */}
      {(activeTab === 'all' || activeTab === 'liked') && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-900/60 via-red-950/40 to-zinc-950 border border-rose-800/40 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-900/50">
                <Heart className="w-8 h-8 fill-white text-white" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-xl text-white">Liked Songs</h2>
                <p className="text-xs text-rose-200 mt-0.5">
                  {likedSongs.length} tracks favorited • High ML affinity
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePlayLiked(true)}
                className="p-3 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-all active:scale-95"
                title="Shuffle Liked Songs"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={() => handlePlayLiked(false)}
                className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-950/50 active:scale-95 transition-all"
                title="Play All"
              >
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PLAYLISTS SECTION */}
      {(activeTab === 'all' || activeTab === 'playlists') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-white">Your Playlists</h3>
            <span className="text-xs text-zinc-500">{allPlaylists.length} playlists</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allPlaylists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => navigate(`/playlist/${pl.id}`)}
                className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-rose-500/40 cursor-pointer transition-all group shadow-md"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 bg-zinc-800">
                  <img
                    src={pl.artwork}
                    alt={pl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {pl.isCustom && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white">
                      Custom
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-xs text-white truncate group-hover:text-rose-400">
                  {pl.name}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">{pl.songIds.length} tracks</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ARTISTS SECTION */}
      {(activeTab === 'all' || activeTab === 'artists') && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-500" />
            <h3 className="font-display font-bold text-lg text-white">Followed Artists</h3>
          </div>

          {followedArtists.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No followed artists yet.</p>
          ) : (
            <div className="space-y-2">
              {followedArtists.map((artist) => (
                <div
                  key={artist.id}
                  onClick={() => navigate(`/artist/${artist.id}`)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800/70 border border-zinc-800 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={artist.avatar}
                      alt={artist.name}
                      className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                    />
                    <div>
                      <span className="font-semibold text-sm text-white group-hover:text-rose-400">
                        {artist.name}
                      </span>
                      <span className="text-xs text-zinc-400 block">{artist.genre}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFollow(artist.id);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-800 hover:bg-rose-950 text-rose-300 border border-zinc-700 hover:border-rose-700 transition-colors"
                  >
                    Following
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. OFFLINE / DOWNLOADED SECTION */}
      {(activeTab === 'all' || activeTab === 'downloaded') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-rose-500" />
              <h3 className="font-display font-bold text-lg text-white">Offline Cache & Downloads</h3>
            </div>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Cached Locally
            </span>
          </div>

          <div className="space-y-2">
            {downloadedSongs.map((song) => (
              <div
                key={song.id}
                onClick={() => {
                  playSong(song);
                  openFullScreen();
                }}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800/70 border border-zinc-800 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={song.artwork}
                    alt={song.title}
                    className="w-11 h-11 rounded-xl object-cover"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs text-white truncate">{song.title}</span>
                    <span className="text-[11px] text-zinc-400 truncate">{song.artist}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Downloaded</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE PLAYLIST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <form
            onSubmit={handleCreatePlaylist}
            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
          >
            <h3 className="font-display font-bold text-lg text-white">Create Custom Playlist</h3>
            <input
              type="text"
              placeholder="Playlist name"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:outline-none focus:border-rose-500"
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-300 text-xs focus:outline-none focus:border-rose-500 resize-none h-20"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
