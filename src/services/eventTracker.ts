import { ListeningEvent, ListeningEventType } from '../types';

const STORAGE_KEY = 'aura_listening_events';
const MAX_STORED_EVENTS = 500;

export interface TasteProfile {
  topGenres: { genre: string; score: number; count: number }[];
  topArtists: { artistId: string; score: number; count: number }[];
  topTags: { tag: string; count: number }[];
  averageCompletion: number;
  skipRate: number;
  totalPlays: number;
  totalListenedSeconds: number;
}

// Event listeners for real-time telemetry subscribers (e.g., debug inspector or UI analytics)
type EventCallback = (event: ListeningEvent) => void;
const subscribers: Set<EventCallback> = new Set();

export function subscribeToEvents(callback: EventCallback): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

/**
 * Record a user listening event into local storage and emit to active subscribers
 */
export function trackListeningEvent(
  eventInput: Omit<ListeningEvent, 'id' | 'timestamp'>
): ListeningEvent {
  const event: ListeningEvent = {
    id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    ...eventInput,
  };

  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY);
    const events: ListeningEvent[] = existingRaw ? JSON.parse(existingRaw) : [];
    
    // Prepend latest event
    events.unshift(event);
    
    // Cap event storage
    if (events.length > MAX_STORED_EVENTS) {
      events.length = MAX_STORED_EVENTS;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.warn('Could not persist listening event to localStorage:', err);
  }

  // Notify active listeners
  subscribers.forEach((cb) => {
    try {
      cb(event);
    } catch {
      // ignore
    }
  });

  return event;
}

/**
 * Retrieve all tracked listening events from storage
 */
export function getListeningEvents(limit = 100): ListeningEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const events: ListeningEvent[] = JSON.parse(raw);
    return events.slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Clear listening events from storage
 */
export function clearListeningEvents(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Computes an implicit ML Taste Vector from tracked listening events
 */
export function computeUserTasteProfile(userId: string): TasteProfile {
  const events = getListeningEvents(200).filter((e) => e.userId === userId);
  
  let totalPlays = 0;
  let totalSkips = 0;
  let totalDuration = 0;
  let totalCompletionSum = 0;

  const genreMap = new Map<string, { score: number; count: number }>();
  const artistMap = new Map<string, { score: number; count: number }>();
  const tagMap = new Map<string, number>();

  events.forEach((ev) => {
    const multiplier =
      ev.eventType === 'song_completed' ? 1.5 :
      ev.eventType === 'song_liked' ? 2.5 :
      ev.eventType === 'song_added_to_playlist' ? 2.0 :
      ev.eventType === 'song_replayed' ? 2.0 :
      ev.eventType === 'song_skipped' ? -0.8 :
      ev.eventType === 'song_unliked' ? -1.5 : 0.5;

    if (ev.eventType === 'song_started' || ev.eventType === 'song_completed' || ev.eventType === 'song_skipped') {
      totalPlays++;
      totalDuration += ev.duration;
      totalCompletionSum += ev.completionPercentage;
      if (ev.eventType === 'song_skipped') totalSkips++;
    }

    // Process context tags/genres if available
    const genre = (ev.context as any)?.genre;
    if (genre) {
      const current = genreMap.get(genre) || { score: 0, count: 0 };
      genreMap.set(genre, {
        score: current.score + multiplier,
        count: current.count + 1,
      });
    }

    const artistId = (ev.context as any)?.artistId;
    if (artistId) {
      const current = artistMap.get(artistId) || { score: 0, count: 0 };
      artistMap.set(artistId, {
        score: current.score + multiplier,
        count: current.count + 1,
      });
    }
  });

  const topGenres = Array.from(genreMap.entries())
    .map(([genre, val]) => ({ genre, score: val.score, count: val.count }))
    .sort((a, b) => b.score - a.score);

  const topArtists = Array.from(artistMap.entries())
    .map(([artistId, val]) => ({ artistId, score: val.score, count: val.count }))
    .sort((a, b) => b.score - a.score);

  const topTags = Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return {
    topGenres,
    topArtists,
    topTags,
    averageCompletion: totalPlays > 0 ? Math.round(totalCompletionSum / totalPlays) : 0,
    skipRate: totalPlays > 0 ? Math.round((totalSkips / totalPlays) * 100) : 0,
    totalPlays,
    totalListenedSeconds: Math.round(totalDuration),
  };
}
