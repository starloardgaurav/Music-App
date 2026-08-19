import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Heart,
  Sparkles,
  Flame,
  Radio,
  Clock,
  Music2,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useUser } from '../context/UserContext';
import { recommendSongs } from '../services/recommendationService';
import { MOCK_SONGS, MOCK_ARTISTS, MOCK_PLAYLISTS } from '../data/mockMusic';
import { Song, Artist, Playlist } from '../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { playSong, openFullScreen, openSwipeMode, currentSong, isPlaying } = usePlayer();
  const { user, isLiked, toggleLike, allPlaylists } = useUser();

  const [forYouSongs, setForYouSongs] = useState<Song[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('All');
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(true);

  const moods = ['All', 'Late Night', 'Chill', 'Energetic', 'Focus', 'Dark', 'Euphoric'];

  useEffect(() => {
    let isMounted = true;
    setIsLoadingRecs(true);

    const moodFilter = selectedMood === 'All' ? undefined : (selectedMood as any);
    recommendSongs(user.id, { moodFilter, limit: 8 })
      .then((songs) => {
        if (isMounted) {
          setForYouSongs(songs);
          setIsLoadingRecs(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setForYouSongs(MOCK_SONGS.slice(0, 6));
          setIsLoadingRecs(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user.id, selectedMood, user.likedSongs]);

  const trendingSongs = [...MOCK_SONGS]
    .sort((a, b) => b.playsCount - a.playsCount)
    .slice(0, 6);

  const recentlyPlayed = user.listeningHistory
    .map((h) => MOCK_SONGS.find((s) => s.id === h.songId))
    .filter((s): s is Song => Boolean(s))
    .slice(0, 5);

  const handleSongClick = (song: Song, playlistList?: Song[]) => {
    playSong(song, playlistList);
    openFullScreen();
  };

  return (
    <div className="pb-36 pt-2 px-4 max-w-2xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Dynamic Vibe Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950/70 via-zinc-900 to-zinc-950 border border-rose-900/40 p-5 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-rose-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-900/60 border border-rose-700/50 text-xs font-semibold text-rose-200">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              Machine Learning Mix
            </span>

            <span className="text-xs text-zinc-400 font-medium">Updated 2m ago</span>
          </div>

          <div>
            <h1 className="font-display font-extrabold text-2xl text-white tracking-tight">
              Personalized Vibe Radar
            </h1>
            <p className="text-xs text-zinc-300 mt-1 max-w-sm">
              Tailored for <span className="text-white font-semibold">{user.name}</span> based on your skip patterns and genre affinity.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              id="hero-play-radar"
              onClick={() => {
                if (forYouSongs.length > 0) {
                  playSong(forYouSongs[0], forYouSongs.slice(1));
                  openFullScreen();
                }
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-sm shadow-lg shadow-rose-950/60 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play Radar</span>
            </button>

            {/* Launch Swipe Feed */}
            <button
              onClick={() => openSwipeMode()}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold active:scale-95 transition-all"
            >
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Launch Swipe Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mood Filters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500" />
            Filter by Vibe
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedMood === mood
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                  : 'bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* 1. FOR YOU (Horizontal Rail) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <h2 className="font-display font-bold text-lg text-white">Recommended For You</h2>
          </div>
          <span className="text-xs text-rose-400 font-semibold cursor-pointer hover:underline" onClick={() => openSwipeMode()}>
            Swipe Feed &rarr;
          </span>
        </div>

        {isLoadingRecs ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-36 flex-shrink-0 animate-pulse space-y-2">
                <div className="w-36 h-36 rounded-2xl bg-zinc-900" />
                <div className="w-24 h-3 rounded bg-zinc-900" />
                <div className="w-16 h-2 rounded bg-zinc-900" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
            {forYouSongs.map((song) => {
              const isSongActive = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  onClick={() => handleSongClick(song, forYouSongs)}
                  className="w-36 flex-shrink-0 group cursor-pointer space-y-2 select-none"
                >
                  <div className="relative w-36 h-36 rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80 group-hover:border-rose-500/50 transition-all">
                    <img
                      src={song.artwork}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-rose-950/60 group-hover:scale-110">
                        {isSongActive && isPlaying ? (
                          <span className="w-3 h-3 bg-white rounded-sm" />
                        ) : (
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Genre tag badge */}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-semibold text-rose-300 border border-white/10">
                      {song.genre}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-xs text-white truncate group-hover:text-rose-400 transition-colors">
                      {song.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 truncate">{song.artist}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. RECENTLY PLAYED */}
      {recentlyPlayed.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-500" />
            <h2 className="font-display font-bold text-lg text-white">Recently Played</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recentlyPlayed.map((song) => {
              const liked = isLiked(song.id);
              return (
                <div
                  key={song.id}
                  onClick={() => handleSongClick(song)}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={song.artwork}
                      alt={song.title}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-xs text-white truncate group-hover:text-rose-400">
                        {song.title}
                      </span>
                      <span className="text-[11px] text-zinc-400 truncate">
                        {song.artist}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(song);
                    }}
                    className="p-2 text-zinc-500 hover:text-rose-500 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        liked ? 'fill-rose-500 text-rose-500' : 'text-zinc-500'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. TRENDING NOW */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <h2 className="font-display font-bold text-lg text-white">Trending on AURA</h2>
          </div>
          <span className="text-xs text-zinc-400">Top Velocity</span>
        </div>

        <div className="space-y-2">
          {trendingSongs.map((song, idx) => {
            const liked = isLiked(song.id);
            const isSongActive = currentSong?.id === song.id;

            return (
              <div
                key={song.id}
                onClick={() => handleSongClick(song, trendingSongs)}
                className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer group ${
                  isSongActive
                    ? 'bg-rose-950/40 border border-rose-800/60'
                    : 'bg-zinc-900/50 hover:bg-zinc-800/70 border border-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center font-display font-extrabold text-sm text-rose-500">
                    0{idx + 1}
                  </span>

                  <img
                    src={song.artwork}
                    alt={song.title}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  />

                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm text-white truncate group-hover:text-rose-400 transition-colors">
                      {song.title}
                    </span>
                    <span className="text-xs text-zinc-400 truncate">
                      {song.artist} • {song.genre}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
                    {(song.playsCount / 1000).toFixed(0)}k plays
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(song);
                    }}
                    className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        liked ? 'fill-rose-500 text-rose-500' : 'text-zinc-500'
                      }`}
                    />
                  </button>

                  <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-rose-600 text-white flex items-center justify-center transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CURATED VIBE PLAYLISTS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-rose-500" />
            <h2 className="font-display font-bold text-lg text-white">Vibe Playlists</h2>
          </div>
          <span
            onClick={() => navigate('/library')}
            className="text-xs text-rose-400 hover:underline cursor-pointer"
          >
            View All
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
          {allPlaylists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => navigate(`/playlist/${pl.id}`)}
              className="w-40 flex-shrink-0 group cursor-pointer space-y-2 select-none"
            >
              <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80 group-hover:border-rose-500/50 transition-all">
                <img
                  src={pl.artwork}
                  alt={pl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-xs font-semibold text-white truncate max-w-[130px]">
                  {pl.songIds.length} tracks
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-xs text-white truncate group-hover:text-rose-400">
                  {pl.name}
                </h3>
                <p className="text-[10px] text-zinc-400 line-clamp-1">{pl.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. RECOMMENDED ARTISTS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <h2 className="font-display font-bold text-lg text-white">Recommended Artists</h2>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
          {MOCK_ARTISTS.map((artist) => (
            <div
              key={artist.id}
              onClick={() => navigate(`/artist/${artist.id}`)}
              className="flex flex-col items-center gap-2 w-24 flex-shrink-0 group cursor-pointer text-center"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-rose-500 transition-all shadow-lg">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div>
                <span className="font-semibold text-xs text-white truncate block group-hover:text-rose-400">
                  {artist.name}
                </span>
                <span className="text-[10px] text-zinc-500 block truncate">
                  {artist.genre.split('/')[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
