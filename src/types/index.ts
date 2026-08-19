export interface LyricLine {
  time: number; // in seconds
  text: string;
  translation?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  artwork: string;
  audioUrl: string;
  duration: number; // seconds
  genre: string;
  tags: string[];
  bpm?: number;
  mood?: 'Energetic' | 'Chill' | 'Melancholic' | 'Euphoric' | 'Focus' | 'Dark';
  lyrics?: LyricLine[];
  color?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  playsCount: number;
  likesCount: number;
  year?: number;
  description?: string;
}

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  banner: string;
  genre: string;
  monthlyListeners: number;
  bio: string;
  topSongIds: string[];
  isVerified?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  artwork: string;
  songIds: string[];
  createdAt: number;
  isCustom?: boolean;
  creatorName?: string;
  color?: string;
}

export type ListeningEventType =
  | 'song_started'
  | 'song_completed'
  | 'song_skipped'
  | 'song_liked'
  | 'song_unliked'
  | 'song_replayed'
  | 'song_added_to_playlist';

export interface ListeningEvent {
  id: string;
  userId: string;
  songId: string;
  eventType: ListeningEventType;
  timestamp: number;
  duration: number; // seconds played before event
  completionPercentage: number; // 0 to 100
  context?: {
    source?: string;
    playlistId?: string;
    device?: string;
    genre?: string;
    artistId?: string;
    tags?: string[];
    [key: string]: any;
  };
}

export interface UserHistoryItem {
  songId: string;
  playedAt: number;
  completion: number;
  duration: number;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  likedSongs: string[]; // song ids
  followedArtists: string[]; // artist ids
  playlists: Playlist[];
  listeningHistory: UserHistoryItem[];
  downloadedSongIds?: string[];
}

export interface RecommendationContext {
  currentSongId?: string;
  genreFilter?: string;
  moodFilter?: string;
  excludeSongIds?: string[];
  limit?: number;
  vibePreference?: 'all' | 'high_energy' | 'late_night' | 'chill' | 'focus';
}

export interface ScoredRecommendation {
  song: Song;
  score: number;
  reasons: string[];
}

export type RepeatMode = 'off' | 'all' | 'one';
