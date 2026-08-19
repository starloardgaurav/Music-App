import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, Play, Heart, Disc, Music, Flame, History } from 'lucide-react';
import { MOCK_SONGS, MOCK_ARTISTS, MOCK_PLAYLISTS } from '../data/mockMusic';
import { usePlayer } from '../context/PlayerContext';
import { useUser } from '../context/UserContext';
import { Song } from '../types';

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const { playSong, openFullScreen } = usePlayer();
  const { isLiked, toggleLike, allPlaylists } = useUser();

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Synthwave',
    'Cyber Echo',
    'Lo-Fi Beats',
    'Midnight Whispers',
  ]);

  const genres = [
    { name: 'Synthwave', color: 'from-rose-900 to-red-950', count: '12 tracks' },
    { name: 'Lo-Fi Chill', color: 'from-zinc-900 to-rose-950', count: '8 tracks' },
    { name: 'R&B / Soul', color: 'from-pink-950 to-rose-950', count: '10 tracks' },
    { name: 'Techno / Darkwave', color: 'from-red-950 to-zinc-950', count: '6 tracks' },
    { name: 'Indie Pop', color: 'from-rose-900 to-amber-950', count: '9 tracks' },
    { name: 'Hip Hop / Trap', color: 'from-red-900 to-zinc-900', count: '14 tracks' },
  ];

  const handleSearchSubmit = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    if (!recentSearches.includes(searchTerm)) {
      setRecentSearches((prev) => [searchTerm, ...prev.slice(0, 5)]);
    }
  };

  const removeRecent = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => prev.filter((t) => t !== term));
  };

  // Filtered Results
  const searchResults = useMemo(() => {
    if (!query.trim()) return { songs: [], artists: [], playlists: [] };
    const q = query.toLowerCase().trim();

    const songs = MOCK_SONGS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );

    const artists = MOCK_ARTISTS.filter(
      (a) => a.name.toLowerCase().includes(q) || a.genre.toLowerCase().includes(q)
    );

    const playlists = allPlaylists.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );

    return { songs, artists, playlists };
  }, [query, allPlaylists]);

  const hasResults =
    searchResults.songs.length > 0 ||
    searchResults.artists.length > 0 ||
    searchResults.playlists.length > 0;

  return (
    <div className="pb-36 pt-2 px-4 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <SearchIcon className="absolute left-4 w-5 h-5 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search songs, artists, genres, vibes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearchSubmit(query);
          }}
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 focus:border-rose-500 text-white placeholder-zinc-500 text-sm focus:outline-none transition-all shadow-lg"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* When NO query typed: Show Recent Searches & Explore Genres */}
      {!query.trim() && (
        <div className="space-y-6">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-rose-500" />
                  Recent Searches
                </span>
                <button
                  onClick={() => setRecentSearches([])}
                  className="text-xs text-zinc-500 hover:text-rose-400"
                >
                  Clear All
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    onClick={() => setQuery(term)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white cursor-pointer transition-all"
                  >
                    <span>{term}</span>
                    <button
                      onClick={(e) => removeRecent(term, e)}
                      className="text-zinc-500 hover:text-rose-400 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Browse Categories */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <h2 className="font-display font-bold text-lg text-white">Explore Genres & Vibes</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {genres.map((g) => (
                <div
                  key={g.name}
                  onClick={() => setQuery(g.name)}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${g.color} border border-zinc-800/80 cursor-pointer hover:border-rose-500/40 transition-all group relative overflow-hidden shadow-lg`}
                >
                  <div className="relative z-10">
                    <h3 className="font-display font-bold text-base text-white group-hover:text-rose-300 transition-colors">
                      {g.name}
                    </h3>
                    <span className="text-xs text-zinc-400 mt-0.5 block">{g.count}</span>
                  </div>
                  <Disc className="absolute -bottom-3 -right-3 w-16 h-16 text-white/10 group-hover:text-white/20 transition-all group-hover:rotate-45" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* When SEARCH RESULTS exist */}
      {query.trim() && (
        <div className="space-y-6">
          {!hasResults ? (
            <div className="text-center py-16 space-y-2">
              <Music className="w-12 h-12 mx-auto text-zinc-600 animate-pulse" />
              <p className="text-base font-semibold text-zinc-300">No matches found for "{query}"</p>
              <p className="text-xs text-zinc-500">
                Try searching for Synthwave, Kaito Beats, Luna Vane, or Lo-Fi.
              </p>
            </div>
          ) : (
            <>
              {/* Songs List */}
              {searchResults.songs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-base text-white">Songs ({searchResults.songs.length})</h3>
                  <div className="space-y-2">
                    {searchResults.songs.map((song) => {
                      const liked = isLiked(song.id);
                      return (
                        <div
                          key={song.id}
                          onClick={() => {
                            playSong(song, searchResults.songs);
                            openFullScreen();
                          }}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={song.artwork}
                              alt={song.title}
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-sm text-white truncate group-hover:text-rose-400">
                                {song.title}
                              </span>
                              <span className="text-xs text-zinc-400 truncate">
                                {song.artist} • {song.genre}
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
                            <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-rose-600 text-white flex items-center justify-center transition-colors">
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Artists List */}
              {searchResults.artists.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-base text-white">Artists</h3>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
                    {searchResults.artists.map((artist) => (
                      <div
                        key={artist.id}
                        onClick={() => navigate(`/artist/${artist.id}`)}
                        className="flex flex-col items-center gap-2 w-24 flex-shrink-0 cursor-pointer group text-center"
                      >
                        <img
                          src={artist.avatar}
                          alt={artist.name}
                          className="w-18 h-18 rounded-full object-cover border-2 border-zinc-800 group-hover:border-rose-500 transition-colors"
                        />
                        <span className="text-xs font-semibold text-white truncate block group-hover:text-rose-400">
                          {artist.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Playlists List */}
              {searchResults.playlists.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-base text-white">Playlists</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {searchResults.playlists.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => navigate(`/playlist/${pl.id}`)}
                        className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 cursor-pointer transition-all group"
                      >
                        <img
                          src={pl.artwork}
                          alt={pl.name}
                          className="w-full aspect-square rounded-xl object-cover mb-2 group-hover:scale-105 transition-transform"
                        />
                        <span className="font-semibold text-xs text-white truncate block group-hover:text-rose-400">
                          {pl.name}
                        </span>
                        <span className="text-[11px] text-zinc-500">{pl.songIds.length} tracks</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
