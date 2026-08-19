import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { Song, RepeatMode } from '../types';
import { MOCK_SONGS } from '../data/mockMusic';
import { trackListeningEvent } from '../services/eventTracker';
import { recommendSongs } from '../services/recommendationService';
import { audioSynthesizer } from '../utils/audioSynthesizer';
import { useUser } from './UserContext';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number; // 0 to 100
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  queue: Song[];
  history: Song[];
  
  // Modals & Screen States
  isFullScreenOpen: boolean;
  isSwipeModeOpen: boolean;
  isLyricsOpen: boolean;
  isQueueOpen: boolean;
  isAddToPlaylistOpen: boolean;
  isShareOpen: boolean;
  isInspectorOpen: boolean;

  // Actions
  playSong: (song: Song, newQueue?: Song[], source?: string) => void;
  togglePlay: () => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: (isAutoEnded?: boolean) => void;
  prevSong: () => void;
  seek: (timeInSeconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setPlaybackRate: (rate: number) => void;
  
  // Swipe Gestures
  playNextSwipe: () => void;
  playPrevSwipe: () => void;

  // UI state toggles
  openFullScreen: () => void;
  closeFullScreen: () => void;
  openSwipeMode: (initialSong?: Song) => void;
  closeSwipeMode: () => void;
  openLyrics: () => void;
  closeLyrics: () => void;
  openQueue: () => void;
  closeQueue: () => void;
  openAddToPlaylist: () => void;
  closeAddToPlaylist: () => void;
  openShare: () => void;
  closeShare: () => void;
  openInspector: () => void;
  closeInspector: () => void;

  // Queue actions
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [currentSong, setCurrentSong] = useState<Song | null>(MOCK_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(MOCK_SONGS[0]?.duration || 180);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRateState] = useState<number>(1.0);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [queue, setQueue] = useState<Song[]>(() => MOCK_SONGS.slice(1));
  const [history, setHistory] = useState<Song[]>([]);

  // UI screens / drawers
  const [isFullScreenOpen, setIsFullScreenOpen] = useState<boolean>(false);
  const [isSwipeModeOpen, setIsSwipeModeOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  // Audio elements & tracking refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const songStartTimeRef = useRef<number>(0);
  const accumulatedPlayTimeRef = useRef<number>(0);
  const lastTickTimeRef = useRef<number>(0);
  const synthActiveRef = useRef<boolean>(false);

  // Initialize HTML Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      handleSongEnded();
    };

    const handleError = () => {
      // Switch seamlessly to Web Audio synthesizer fallback so user experience is smooth
      if (!synthActiveRef.current && currentSong) {
        synthActiveRef.current = true;
        audioSynthesizer.start(currentSong.genre);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audioSynthesizer.stop();
    };
  }, []);

  // Track play duration tick
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      lastTickTimeRef.current = Date.now();
      interval = window.setInterval(() => {
        const now = Date.now();
        const delta = (now - lastTickTimeRef.current) / 1000;
        accumulatedPlayTimeRef.current += delta;
        lastTickTimeRef.current = now;

        // If using synth fallback, tick synthetic time
        if (synthActiveRef.current) {
          setCurrentTime((prev) => {
            const next = prev + 1;
            if (next >= (currentSong?.duration || 180)) {
              handleSongEnded();
              return 0;
            }
            return next;
          });
        }
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, currentSong]);

  // Record Listening Event on end / skip
  const recordCurrentSongEvent = useCallback(
    (eventType: 'song_completed' | 'song_skipped' | 'song_replayed') => {
      if (!currentSong) return;

      const dur = currentSong.duration || duration || 180;
      const playedSeconds = Math.round(accumulatedPlayTimeRef.current);
      const completionPercentage = Math.min(100, Math.round((playedSeconds / dur) * 100));

      trackListeningEvent({
        userId: user.id,
        songId: currentSong.id,
        eventType,
        duration: playedSeconds,
        completionPercentage,
        context: {
          source: isSwipeModeOpen ? 'swipe_feed' : 'for_you',
          genre: currentSong.genre,
          artistId: currentSong.artistId,
        } as any,
      });

      // Reset timers for next track
      accumulatedPlayTimeRef.current = 0;
    },
    [currentSong, duration, user.id, isSwipeModeOpen]
  );

  // Play a specific song
  const playSong = useCallback(
    async (song: Song, newQueue?: Song[], source = 'user_click') => {
      if (currentSong && currentSong.id !== song.id) {
        // Record skipped or finished on previous
        const dur = currentSong.duration || 180;
        const played = accumulatedPlayTimeRef.current;
        if (played > 5) {
          const comp = Math.min(100, Math.round((played / dur) * 100));
          if (comp < 80) {
            recordCurrentSongEvent('song_skipped');
          }
        }
      }

      if (currentSong && currentSong.id !== song.id) {
        setHistory((prev) => [currentSong, ...prev.slice(0, 20)]);
      }

      setCurrentSong(song);
      setCurrentTime(0);
      setDuration(song.duration);
      accumulatedPlayTimeRef.current = 0;
      songStartTimeRef.current = Date.now();

      if (newQueue) {
        setQueue(newQueue.filter((s) => s.id !== song.id));
      } else {
        // Automatically replenish queue with smart recommendations if queue is running short
        recommendSongs(user.id, { currentSongId: song.id, limit: 6 }).then((recs) => {
          setQueue((prevQueue) => {
            if (prevQueue.length < 3) {
              const existingIds = new Set(prevQueue.map((s) => s.id));
              const fresh = recs.filter((r) => r.id !== song.id && !existingIds.has(r.id));
              return [...prevQueue, ...fresh];
            }
            return prevQueue;
          });
        });
      }

      // Track song_started
      trackListeningEvent({
        userId: user.id,
        songId: song.id,
        eventType: 'song_started',
        duration: 0,
        completionPercentage: 0,
        context: {
          source: source as any,
          genre: song.genre,
          artistId: song.artistId,
        },
      });

      // Audio playback
      synthActiveRef.current = false;
      audioSynthesizer.stop();

      if (audioRef.current) {
        audioRef.current.src = song.audioUrl;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.volume = isMuted ? 0 : volume;

        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch {
          // If browser policy or CORS restricts, start synth fallback immediately
          synthActiveRef.current = true;
          audioSynthesizer.start(song.genre);
          audioSynthesizer.setVolume(isMuted ? 0 : volume);
          setIsPlaying(true);
        }
      }
    },
    [currentSong, user.id, playbackRate, isMuted, volume, recordCurrentSongEvent]
  );

  const pauseSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioSynthesizer.stop();
    setIsPlaying(false);
  }, []);

  const resumeSong = useCallback(() => {
    if (!currentSong) {
      if (MOCK_SONGS.length > 0) {
        playSong(MOCK_SONGS[0]);
      }
      return;
    }

    if (audioRef.current && !synthActiveRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          synthActiveRef.current = true;
          audioSynthesizer.start(currentSong.genre);
          setIsPlaying(true);
        });
    } else {
      synthActiveRef.current = true;
      audioSynthesizer.start(currentSong.genre);
      setIsPlaying(true);
    }
  }, [currentSong, playSong]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  }, [isPlaying, pauseSong, resumeSong]);

  // Handle End of Song
  const handleSongEnded = useCallback(() => {
    if (repeatMode === 'one' && currentSong) {
      recordCurrentSongEvent('song_replayed');
      seek(0);
      resumeSong();
      return;
    }

    recordCurrentSongEvent('song_completed');

    if (queue.length > 0) {
      const next = queue[0];
      const remaining = queue.slice(1);
      playSong(next, remaining, 'auto_queue');
    } else if (repeatMode === 'all') {
      const all = MOCK_SONGS;
      playSong(all[0], all.slice(1), 'repeat_all');
    } else {
      // Auto recommend more songs
      recommendSongs(user.id, { currentSongId: currentSong?.id, limit: 5 }).then((recs) => {
        if (recs.length > 0) {
          playSong(recs[0], recs.slice(1), 'recommendation_continuation');
        } else {
          setIsPlaying(false);
        }
      });
    }
  }, [repeatMode, currentSong, queue, user.id, recordCurrentSongEvent, playSong, resumeSong]);

  const nextSong = useCallback(
    (_isAutoEnded = false) => {
      if (queue.length > 0) {
        let nextIndex = 0;
        if (shuffle && queue.length > 1) {
          nextIndex = Math.floor(Math.random() * queue.length);
        }
        const next = queue[nextIndex];
        const newQueue = queue.filter((_, idx) => idx !== nextIndex);
        playSong(next, newQueue, 'next_button');
      } else {
        recommendSongs(user.id, { currentSongId: currentSong?.id, limit: 5 }).then((recs) => {
          if (recs.length > 0) {
            playSong(recs[0], recs.slice(1), 'next_recommendation');
          }
        });
      }
    },
    [queue, shuffle, user.id, currentSong?.id, playSong]
  );

  const prevSong = useCallback(() => {
    if (currentTime > 4) {
      seek(0);
      return;
    }

    if (history.length > 0) {
      const prev = history[0];
      const remainingHistory = history.slice(1);
      setHistory(remainingHistory);
      if (currentSong) {
        setQueue((q) => [currentSong, ...q]);
      }
      playSong(prev, undefined, 'prev_history');
    } else {
      seek(0);
    }
  }, [currentTime, history, currentSong, playSong]);

  // Swipe Feed Actions
  const playNextSwipe = useCallback(() => {
    recordCurrentSongEvent('song_skipped');
    if (queue.length > 0) {
      const next = queue[0];
      playSong(next, queue.slice(1), 'swipe_up');
    } else {
      recommendSongs(user.id, { currentSongId: currentSong?.id, limit: 5 }).then((recs) => {
        if (recs.length > 0) {
          playSong(recs[0], recs.slice(1), 'swipe_recommendation');
        }
      });
    }
  }, [queue, user.id, currentSong?.id, recordCurrentSongEvent, playSong]);

  const playPrevSwipe = useCallback(() => {
    if (history.length > 0) {
      const prev = history[0];
      setHistory((h) => h.slice(1));
      if (currentSong) {
        setQueue((q) => [currentSong, ...q]);
      }
      playSong(prev, undefined, 'swipe_down');
    } else {
      seek(0);
    }
  }, [history, currentSong, playSong]);

  const seek = useCallback(
    (timeInSeconds: number) => {
      const bounded = Math.max(0, Math.min(timeInSeconds, duration));
      setCurrentTime(bounded);
      if (audioRef.current) {
        audioRef.current.currentTime = bounded;
      }
    },
    [duration]
  );

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    audioSynthesizer.setVolume(clamped);
    if (clamped === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.volume = next ? 0 : volume;
      }
      audioSynthesizer.setVolume(next ? 0 : volume);
      return next;
    });
  }, [volume]);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  // Queue actions
  const addToQueue = useCallback((song: Song) => {
    setQueue((prev) => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        progress,
        volume,
        isMuted,
        playbackRate,
        shuffle,
        repeatMode,
        queue,
        history,
        isFullScreenOpen,
        isSwipeModeOpen,
        isLyricsOpen,
        isQueueOpen,
        isAddToPlaylistOpen,
        isShareOpen,
        isInspectorOpen,
        playSong,
        togglePlay,
        pauseSong,
        resumeSong,
        nextSong,
        prevSong,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        setPlaybackRate,
        playNextSwipe,
        playPrevSwipe,
        openFullScreen: () => setIsFullScreenOpen(true),
        closeFullScreen: () => setIsFullScreenOpen(false),
        openSwipeMode: (initialSong?: Song) => {
          if (initialSong && initialSong.id !== currentSong?.id) {
            playSong(initialSong, undefined, 'swipe_open');
          }
          setIsSwipeModeOpen(true);
        },
        closeSwipeMode: () => setIsSwipeModeOpen(false),
        openLyrics: () => setIsLyricsOpen(true),
        closeLyrics: () => setIsLyricsOpen(false),
        openQueue: () => setIsQueueOpen(true),
        closeQueue: () => setIsQueueOpen(false),
        openAddToPlaylist: () => setIsAddToPlaylistOpen(true),
        closeAddToPlaylist: () => setIsAddToPlaylistOpen(false),
        openShare: () => setIsShareOpen(true),
        closeShare: () => setIsShareOpen(false),
        openInspector: () => setIsInspectorOpen(true),
        closeInspector: () => setIsInspectorOpen(false),
        addToQueue,
        removeFromQueue,
        clearQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
