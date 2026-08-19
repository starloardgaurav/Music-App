import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Heart, Check, Users, Sparkles } from 'lucide-react';
import { MOCK_ARTISTS, MOCK_SONGS } from '../data/mockMusic';
import { useUser } from '../context/UserContext';
import { usePlayer } from '../context/PlayerContext';
import { Song } from '../types';

export const ArtistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFollowed, toggleFollow, isLiked, toggleLike } = useUser();
  const { playSong, openFullScreen, currentSong, isPlaying } = usePlayer();

  const artist = MOCK_ARTISTS.find((a) => a.id === id);

  if (!artist) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-zinc-400">Artist not found.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
        >
          Back Home
        </button>
      </div>
    );
  }

  const followed = isFollowed(artist.id);

  // Artist's songs
  const artistSongs = MOCK_SONGS.filter((s) => s.artistId === artist.id);

  const handlePlayTopSongs = () => {
    if (artistSongs.length > 0) {
      playSong(artistSongs[0], artistSongs.slice(1), 'artist_play_top');
      openFullScreen();
    }
  };

  return (
    <div className="pb-36 pt-2 px-4 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Artist Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl h-64 border border-zinc-800 shadow-2xl flex flex-col justify-end p-6">
        <img
          src={artist.banner}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        <div className="relative z-10 flex items-end justify-between">
          <div className="flex items-center gap-4">
            <img
              src={artist.avatar}
              alt={artist.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-rose-500 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-black text-2xl text-white">{artist.name}</h1>
                {artist.isVerified && (
                  <span className="p-0.5 rounded-full bg-rose-600 text-white" title="Verified Artist">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                {artist.monthlyListeners.toLocaleString()} monthly listeners
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleFollow(artist.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-md active:scale-95 ${
              followed
                ? 'bg-zinc-800 text-rose-300 border border-zinc-700'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {followed ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>

      {/* Bio Card */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">About Artist</h3>
        <p className="text-xs text-zinc-300 leading-relaxed">{artist.bio}</p>
      </div>

      {/* Popular Tracks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-white">Popular Tracks</h2>
          <button
            onClick={handlePlayTopSongs}
            className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:underline"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play Top</span>
          </button>
        </div>

        <div className="space-y-2">
          {artistSongs.map((song, idx) => {
            const isSongActive = currentSong?.id === song.id;
            const liked = isLiked(song.id);

            return (
              <div
                key={song.id}
                onClick={() => {
                  playSong(song, artistSongs.slice(idx + 1), 'artist_track_click');
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
                    {idx + 1}
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
                    <span className="text-xs text-zinc-400 truncate">
                      {song.album} • {(song.playsCount / 1000).toFixed(0)}k plays
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
