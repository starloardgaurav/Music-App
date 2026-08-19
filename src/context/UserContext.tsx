import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Playlist, Song } from '../types';
import { INITIAL_USER, MOCK_PLAYLISTS, MOCK_SONGS } from '../data/mockMusic';
import { trackListeningEvent } from '../services/eventTracker';

interface UserContextType {
  user: User;
  allPlaylists: Playlist[];
  isLiked: (songId: string) => boolean;
  toggleLike: (song: Song) => void;
  isFollowed: (artistId: string) => boolean;
  toggleFollow: (artistId: string) => void;
  isDownloaded: (songId: string) => boolean;
  toggleDownload: (songId: string) => void;
  createPlaylist: (name: string, description: string, artwork?: string) => Playlist;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  getUserLikedSongs: () => Song[];
  getPlaylistById: (playlistId: string) => Playlist | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'aura_user_profile_v1';
const PLAYLISTS_STORAGE_KEY = 'aura_playlists_v1';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [allPlaylists, setAllPlaylists] = useState<Playlist[]>(() => {
    try {
      const stored = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [...MOCK_PLAYLISTS, ...INITIAL_USER.playlists];
    } catch {
      return [...MOCK_PLAYLISTS, ...INITIAL_USER.playlists];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(allPlaylists));
    } catch {
      // ignore
    }
  }, [allPlaylists]);

  const isLiked = useCallback((songId: string) => {
    return user.likedSongs.includes(songId);
  }, [user.likedSongs]);

  const toggleLike = useCallback((song: Song) => {
    setUser((prev) => {
      const isCurrentlyLiked = prev.likedSongs.includes(song.id);
      const newLiked = isCurrentlyLiked
        ? prev.likedSongs.filter((id) => id !== song.id)
        : [...prev.likedSongs, song.id];

      // Track event
      trackListeningEvent({
        userId: prev.id,
        songId: song.id,
        eventType: isCurrentlyLiked ? 'song_unliked' : 'song_liked',
        duration: 0,
        completionPercentage: 0,
        context: {
          genre: song.genre,
          artistId: song.artistId,
        } as any,
      });

      return {
        ...prev,
        likedSongs: newLiked,
      };
    });
  }, []);

  const isFollowed = useCallback((artistId: string) => {
    return user.followedArtists.includes(artistId);
  }, [user.followedArtists]);

  const toggleFollow = useCallback((artistId: string) => {
    setUser((prev) => {
      const isCurrentlyFollowed = prev.followedArtists.includes(artistId);
      const newFollowed = isCurrentlyFollowed
        ? prev.followedArtists.filter((id) => id !== artistId)
        : [...prev.followedArtists, artistId];
      return {
        ...prev,
        followedArtists: newFollowed,
      };
    });
  }, []);

  const isDownloaded = useCallback((songId: string) => {
    return (user.downloadedSongIds || []).includes(songId);
  }, [user.downloadedSongIds]);

  const toggleDownload = useCallback((songId: string) => {
    setUser((prev) => {
      const current = prev.downloadedSongIds || [];
      const exists = current.includes(songId);
      const next = exists ? current.filter((id) => id !== songId) : [...current, songId];
      return {
        ...prev,
        downloadedSongIds: next,
      };
    });
  }, []);

  const createPlaylist = useCallback((name: string, description: string, artwork?: string): Playlist => {
    const newPlaylist: Playlist = {
      id: `custom-pl-${Date.now()}`,
      name: name.trim() || 'My Favorite Vibe',
      description: description.trim() || 'Curated music playlist',
      artwork: artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      songIds: [],
      createdAt: Date.now(),
      isCustom: true,
      creatorName: user.name,
      color: '#e11d48',
    };

    setAllPlaylists((prev) => [newPlaylist, ...prev]);
    setUser((prev) => ({
      ...prev,
      playlists: [newPlaylist, ...prev.playlists],
    }));

    return newPlaylist;
  }, [user.name]);

  const addSongToPlaylist = useCallback((playlistId: string, songId: string) => {
    setAllPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          if (!pl.songIds.includes(songId)) {
            return { ...pl, songIds: [...pl.songIds, songId] };
          }
        }
        return pl;
      })
    );

    setUser((prev) => ({
      ...prev,
      playlists: prev.playlists.map((pl) => {
        if (pl.id === playlistId && !pl.songIds.includes(songId)) {
          return { ...pl, songIds: [...pl.songIds, songId] };
        }
        return pl;
      }),
    }));

    const song = MOCK_SONGS.find((s) => s.id === songId);
    trackListeningEvent({
      userId: user.id,
      songId,
      eventType: 'song_added_to_playlist',
      duration: 0,
      completionPercentage: 0,
      context: {
        playlistId,
        genre: song?.genre,
        artistId: song?.artistId,
      } as any,
    });
  }, [user.id]);

  const removeSongFromPlaylist = useCallback((playlistId: string, songId: string) => {
    setAllPlaylists((prev) =>
      prev.map((pl) => (pl.id === playlistId ? { ...pl, songIds: pl.songIds.filter((id) => id !== songId) } : pl))
    );
    setUser((prev) => ({
      ...prev,
      playlists: prev.playlists.map((pl) =>
        pl.id === playlistId ? { ...pl, songIds: pl.songIds.filter((id) => id !== songId) } : pl
      ),
    }));
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setAllPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
    setUser((prev) => ({
      ...prev,
      playlists: prev.playlists.filter((pl) => pl.id !== playlistId),
    }));
  }, []);

  const getUserLikedSongs = useCallback((): Song[] => {
    return user.likedSongs
      .map((id) => MOCK_SONGS.find((s) => s.id === id))
      .filter((s): s is Song => Boolean(s));
  }, [user.likedSongs]);

  const getPlaylistById = useCallback((playlistId: string): Playlist | undefined => {
    return allPlaylists.find((p) => p.id === playlistId);
  }, [allPlaylists]);

  return (
    <UserContext.Provider
      value={{
        user,
        allPlaylists,
        isLiked,
        toggleLike,
        isFollowed,
        toggleFollow,
        isDownloaded,
        toggleDownload,
        createPlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        deletePlaylist,
        getUserLikedSongs,
        getPlaylistById,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
