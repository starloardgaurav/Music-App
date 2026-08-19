import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Play,
  Shuffle,
  Heart,
  Plus,
  Trash2,
  Clock,
  Music,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { usePlayer } from '../context/PlayerContext';
import { MOCK_SONGS } from '../data/mockMusic';
import { Song } from '../types';

export const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPlaylistById, isLiked, toggleLike, removeSongFromPlaylist, addSongToPlaylist, deletePlaylist } = useUser();
  const { playSong, openFullScreen, currentSong, isPlaying } = usePlayer();
  const [showAddSong, setShowAddSong] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const playlist = id ? getPlaylistById(id) : undefined;

  if (!playlist) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-zinc-400">Playlist not found.</p>
        <button
          onClick={() => navigate('/library')}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
        >
          Back to Library
        </button>
      </div>
    );
  }

  const songs = playlist.songIds
    .map((songId) => MOCK_SONGS.find((s) => s.id === songId))
    .filter((s): s is Song => Boolean(s));

  const totalDurationSeconds = songs.reduce((acc, s) => acc + s.duration, 0);
  const totalMinutes = Math.floor(totalDurationSeconds / 60);

  const handlePlayAll = (shuffle = false) => {
    if (songs.length === 0) return;
    let list = [...songs];
    if (shuffle) {
      list = list.sort(() => Math.random() - 0.5);
    }
    playSong(list[0], list.slice(1), 'playlist_play_all');
    openFullScreen();
  };

  const candidateSongsToAdd = MOCK_SONGS.filter(
    (s) =>
      !playlist.songIds.includes(s.id) &&
      (s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="pb-36 pt-2 px-4 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {playlist.isCustom && (
          <button
            onClick={() => {
              if (window.confirm('Delete this playlist?')) {
                deletePlaylist(playlist.id);
                navigate('/library');
              }
            }}
            className="p-2 text-zinc-500 hover:text-rose-400 transition-colors"
            title="Delete Playlist"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Playlist Hero Info */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex-shrink-0">
          <img
            src={playlist.artwork}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-2">
          <span className="px-2.5 py-1 rounded-md bg-rose-950/60 border border-rose-800/40 text-[10px] font-bold text-rose-300 uppercase tracking-widest">
            {playlist.creatorName || 'Playlist'}
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            {playlist.name}
          </h1>
          <p className="text-xs text-zinc-400 max-w-md">{playlist.description}</p>
          <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-zinc-400 font-medium pt-1">
            <span>{songs.length} tracks</span>
            <span>•</span>
            <span>{totalMinutes} mins</span>
          </div>
        </div>
      </div>

      {/* Play Controls Row */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => handlePlayAll(false)}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-sm shadow-xl shadow-rose-950/50 active:scale-95 transition-all"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Play All</span>
        </button>

        <button
          onClick={() => handlePlayAll(true)}
          className="p-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all active:scale-95"
          title="Shuffle Playlist"
        >
          <Shuffle className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowAddSong(true)}
          className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-rose-300 text-xs font-semibold transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Songs</span>
        </button>
      </div>

      {/* Song List */}
      <div className="space-y-2 pt-2">
        {songs.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-zinc-900/40 rounded-3xl border border-zinc-800">
            <Music className="w-10 h-10 mx-auto text-zinc-600" />
            <p className="text-sm text-zinc-400 font-medium">This playlist is currently empty.</p>
            <button
              onClick={() => setShowAddSong(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
            >
              Add Your First Track
            </button>
          </div>
        ) : (
          songs.map((song, index) => {
            const isSongActive = currentSong?.id === song.id;
            const liked = isLiked(song.id);

            return (
              <div
                key={song.id}
                onClick={() => {
                  playSong(song, songs.slice(index + 1), 'playlist_row');
                  openFullScreen();
                }}
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all group ${
                  isSongActive
                    ? 'bg-rose-950/40 border border-rose-800/60'
                    : 'bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-zinc-500 w-4 text-center">
                    {index + 1}
                  </span>
                  <img
                    src={song.artwork}
                    alt={song.title}
                    className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm text-white truncate group-hover:text-rose-400">
                      {song.title}
                    </span>
                    <span className="text-xs text-zinc-400 truncate">{song.artist}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
                    {Math.floor(song.duration / 60)}:
                    {(song.duration % 60).toString().padStart(2, '0')}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(song);
                    }}
                    className="p-2 text-zinc-400 hover:text-rose-500"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        liked ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'
                      }`}
                    />
                  </button>

                  {playlist.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSongFromPlaylist(playlist.id, song.id);
                      }}
                      className="p-2 text-zinc-500 hover:text-rose-400"
                      title="Remove from playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Song Modal */}
      {showAddSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-display font-bold text-lg text-white">Add Songs to Playlist</h3>
              <button
                onClick={() => setShowAddSong(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Done
              </button>
            </div>

            <input
              type="text"
              placeholder="Search music to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-3 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:outline-none focus:border-rose-500"
            />

            <div className="mt-3 overflow-y-auto space-y-2 flex-1 no-scrollbar">
              {candidateSongsToAdd.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={song.artwork}
                      alt={song.title}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-xs text-white truncate">
                        {song.title}
                      </span>
                      <span className="text-[11px] text-zinc-400 truncate">{song.artist}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => addSongToPlaylist(playlist.id, song.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
