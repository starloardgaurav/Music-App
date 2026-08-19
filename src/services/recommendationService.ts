import { Song, RecommendationContext, ScoredRecommendation } from '../types';
import { MOCK_SONGS } from '../data/mockMusic';
import { getListeningEvents } from './eventTracker';

/**
 * Recommendation Service Interface
 * Modular architecture designed to easily swap between local Content-Based ML ranking
 * and a remote Python/FastAPI microservice endpoint.
 */

export interface IRecommendationService {
  recommendSongs(userId: string, context?: RecommendationContext): Promise<Song[]>;
  getScoredRecommendations(userId: string, context?: RecommendationContext): Promise<ScoredRecommendation[]>;
  getSimilarSongs(songId: string, limit?: number): Promise<Song[]>;
  getTrendingSongs(limit?: number): Promise<Song[]>;
}

class ContentBasedRecommendationService implements IRecommendationService {
  /**
   * Primary recommendation pipeline:
   * 1. Candidate Retrieval (all library songs or filtered pool)
   * 2. Feature Extraction & User Affinity Vector calculation
   * 3. Similarity & Implicit Feedback Scoring
   * 4. Exploration / Diversity Re-ranking
   */
  public async getScoredRecommendations(
    userId: string,
    context?: RecommendationContext
  ): Promise<ScoredRecommendation[]> {
    // 1. Gather user signals from storage and history
    const events = getListeningEvents(150).filter((e) => e.userId === userId);
    
    // Build user taste affinities
    const genreAffinities: Record<string, number> = {};
    const artistAffinities: Record<string, number> = {};
    const tagAffinities: Record<string, number> = {};
    const skippedSongIds = new Set<string>();
    const likedSongIds = new Set<string>();
    const completedSongIds = new Set<string>();

    // Initial baseline weights from user history
    events.forEach((ev) => {
      const song = MOCK_SONGS.find((s) => s.id === ev.songId);
      if (!song) return;

      if (ev.eventType === 'song_liked') {
        likedSongIds.add(song.id);
        genreAffinities[song.genre] = (genreAffinities[song.genre] || 0) + 4.0;
        artistAffinities[song.artistId] = (artistAffinities[song.artistId] || 0) + 5.0;
        song.tags.forEach((t) => (tagAffinities[t] = (tagAffinities[t] || 0) + 2.0));
      } else if (ev.eventType === 'song_completed') {
        completedSongIds.add(song.id);
        genreAffinities[song.genre] = (genreAffinities[song.genre] || 0) + 2.5;
        artistAffinities[song.artistId] = (artistAffinities[song.artistId] || 0) + 2.0;
        song.tags.forEach((t) => (tagAffinities[t] = (tagAffinities[t] || 0) + 1.5));
      } else if (ev.eventType === 'song_skipped') {
        skippedSongIds.add(song.id);
        genreAffinities[song.genre] = (genreAffinities[song.genre] || 0) - 1.5;
        artistAffinities[song.artistId] = (artistAffinities[song.artistId] || 0) - 2.0;
      }
    });

    // Default warm-up tastes if history is low
    if (Object.keys(genreAffinities).length === 0) {
      genreAffinities['Synthwave'] = 3.0;
      genreAffinities['Lo-Fi Chill'] = 2.5;
      genreAffinities['R&B / Soul'] = 2.0;
    }

    // 2. Candidate Generation
    let candidates = [...MOCK_SONGS];

    // Exclude current song or explicit exclusions
    if (context?.currentSongId) {
      candidates = candidates.filter((s) => s.id !== context.currentSongId);
    }
    if (context?.excludeSongIds && context.excludeSongIds.length > 0) {
      const excludeSet = new Set(context.excludeSongIds);
      candidates = candidates.filter((s) => !excludeSet.has(s.id));
    }

    // Optional genre filtering
    if (context?.genreFilter && context.genreFilter !== 'All') {
      candidates = candidates.filter(
        (s) => s.genre.toLowerCase() === context.genreFilter?.toLowerCase()
      );
    }

    // Optional mood filtering
    if (context?.moodFilter && context.moodFilter !== 'All') {
      candidates = candidates.filter((s) => s.mood === context.moodFilter);
    }

    // 3. Scoring each candidate
    const scoredList: ScoredRecommendation[] = candidates.map((song) => {
      let score = 50; // base score
      const reasons: string[] = [];

      // Genre affinity match
      const genreScore = genreAffinities[song.genre] || 0;
      if (genreScore > 0) {
        score += genreScore * 6;
        reasons.push(`High affinity for ${song.genre}`);
      } else if (genreScore < 0) {
        score += genreScore * 4;
      }

      // Artist affinity match
      const artistScore = artistAffinities[song.artistId] || 0;
      if (artistScore > 0) {
        score += artistScore * 8;
        reasons.push(`You listen frequently to ${song.artist}`);
      }

      // Tag overlap match
      let tagMatchCount = 0;
      song.tags.forEach((tag) => {
        if (tagAffinities[tag] && tagAffinities[tag] > 0) {
          score += tagAffinities[tag] * 2.5;
          tagMatchCount++;
        }
      });
      if (tagMatchCount > 1) {
        reasons.push(`Matches your ${song.tags.slice(0, 2).join(' & ')} taste`);
      }

      // Liked songs boost
      if (likedSongIds.has(song.id)) {
        score += 25;
        reasons.push('In your Liked collection');
      }

      // Completed songs boost
      if (completedSongIds.has(song.id)) {
        score += 15;
      }

      // Skipped songs penalty
      if (skippedSongIds.has(song.id)) {
        score -= 20;
        reasons.push('Previously skipped');
      }

      // Popularity prior (normalize by log of plays)
      const popularityBonus = Math.log10(song.playsCount || 1000) * 3;
      score += popularityBonus;

      // Current song context similarity (if continuing playback session)
      if (context?.currentSongId) {
        const currentSong = MOCK_SONGS.find((s) => s.id === context.currentSongId);
        if (currentSong) {
          if (currentSong.genre === song.genre) {
            score += 18;
            reasons.push(`Similar vibes to ${currentSong.title}`);
          }
          if (currentSong.mood === song.mood) {
            score += 10;
          }
          if (currentSong.bpm && song.bpm && Math.abs(currentSong.bpm - song.bpm) <= 15) {
            score += 8;
            reasons.push(`Matching rhythm tempo (~${song.bpm} BPM)`);
          }
        }
      }

      // Fallback reason if none
      if (reasons.length === 0) {
        reasons.push('Trending on AURA');
      }

      // Add a tiny random exploration noise (diversity factor)
      score += Math.random() * 5;

      return {
        song,
        score: Math.round(score),
        reasons,
      };
    });

    // 4. Rank candidates descending by score
    scoredList.sort((a, b) => b.score - a.score);

    const limit = context?.limit || scoredList.length;
    return scoredList.slice(0, limit);
  }

  /**
   * Main recommendation entrypoint
   */
  public async recommendSongs(
    userId: string,
    context?: RecommendationContext
  ): Promise<Song[]> {
    const scored = await this.getScoredRecommendations(userId, context);
    return scored.map((item) => item.song);
  }

  /**
   * Returns songs musically similar to a specific song
   */
  public async getSimilarSongs(songId: string, limit = 5): Promise<Song[]> {
    const target = MOCK_SONGS.find((s) => s.id === songId);
    if (!target) return MOCK_SONGS.slice(0, limit);

    const scored = MOCK_SONGS.filter((s) => s.id !== songId).map((candidate) => {
      let score = 0;
      if (candidate.genre === target.genre) score += 40;
      if (candidate.artistId === target.artistId) score += 30;
      if (candidate.mood === target.mood) score += 20;

      const sharedTags = candidate.tags.filter((t) => target.tags.includes(t));
      score += sharedTags.length * 10;

      return { song: candidate, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.song);
  }

  /**
   * Returns top trending songs based on plays & likes
   */
  public async getTrendingSongs(limit = 6): Promise<Song[]> {
    return [...MOCK_SONGS]
      .sort((a, b) => (b.playsCount + b.likesCount * 3) - (a.playsCount + a.likesCount * 3))
      .slice(0, limit);
  }
}

// Export default singleton instance
export const recommendationService: IRecommendationService = new ContentBasedRecommendationService();

/**
 * Helper hookable function per user requirements: recommendSongs(userId, context)
 */
export async function recommendSongs(
  userId: string,
  context?: RecommendationContext
): Promise<Song[]> {
  return recommendationService.recommendSongs(userId, context);
}
