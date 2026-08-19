import React, { useEffect, useState } from 'react';
import { X, Activity, RefreshCw, Trash2, Cpu, BarChart3, Database } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useUser } from '../../context/UserContext';
import {
  getListeningEvents,
  clearListeningEvents,
  computeUserTasteProfile,
  TasteProfile,
  subscribeToEvents,
} from '../../services/eventTracker';
import { recommendationService } from '../../services/recommendationService';
import { ScoredRecommendation, ListeningEvent } from '../../types';

export const RecommendationInspector: React.FC = () => {
  const { isInspectorOpen, closeInspector, currentSong } = usePlayer();
  const { user } = useUser();
  const [events, setEvents] = useState<ListeningEvent[]>([]);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const [recommendationBreakdown, setRecommendationBreakdown] = useState<ScoredRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'events' | 'taste' | 'architecture'>('pipeline');

  const loadData = async () => {
    const evs = getListeningEvents(40);
    setEvents(evs);
    const profile = computeUserTasteProfile(user.id);
    setTasteProfile(profile);

    const scored = await recommendationService.getScoredRecommendations(user.id, {
      currentSongId: currentSong?.id,
      limit: 6,
    });
    setRecommendationBreakdown(scored);
  };

  useEffect(() => {
    if (isInspectorOpen) {
      loadData();
    }
  }, [isInspectorOpen, currentSong?.id]);

  // Real-time subscription to events
  useEffect(() => {
    const unsubscribe = subscribeToEvents(() => {
      if (isInspectorOpen) {
        loadData();
      }
    });
    return unsubscribe;
  }, [isInspectorOpen]);

  if (!isInspectorOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-800/50 text-rose-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                AURA Recommendation Pipeline
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 uppercase font-mono">
                  Live Telemetry
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Real-time ML candidate scoring, user taste modeling & event telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Refresh Pipeline"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={closeInspector}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-3 pb-2 border-b border-zinc-900 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'pipeline'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Ranked Candidates</span>
          </button>

          <button
            onClick={() => setActiveTab('taste')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'taste'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>User Taste Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'events'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Events Log ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'architecture'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <span>ML Architecture</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">
          {/* TAB 1: Ranked Candidates & Explainability */}
          {activeTab === 'pipeline' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300">
                <span className="font-semibold text-rose-400">Current Context: </span>
                Playing "{currentSong?.title || 'None'}" • Genre: {currentSong?.genre} • User: {user.name}
              </div>

              <div className="space-y-2">
                {recommendationBreakdown.map((item, idx) => (
                  <div
                    key={item.song.id}
                    className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-rose-950/80 border border-rose-800/50 flex items-center justify-center font-mono font-bold text-xs text-rose-300">
                        #{idx + 1}
                      </div>
                      <img
                        src={item.song.artwork}
                        alt={item.song.title}
                        className="w-11 h-11 rounded-xl object-cover"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-white truncate">
                          {item.song.title}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {item.song.artist} • {item.song.genre}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">Score:</span>
                        <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-lg">
                          {item.score} pts
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.reasons.map((reason, rIdx) => (
                          <span
                            key={rIdx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-rose-300"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Taste Profile */}
          {activeTab === 'taste' && tasteProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
                  <span className="text-[11px] text-zinc-400 block">Total Plays</span>
                  <span className="text-lg font-bold text-white font-mono">{tasteProfile.totalPlays}</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
                  <span className="text-[11px] text-zinc-400 block">Avg Completion</span>
                  <span className="text-lg font-bold text-rose-400 font-mono">
                    {tasteProfile.averageCompletion}%
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
                  <span className="text-[11px] text-zinc-400 block">Skip Rate</span>
                  <span className="text-lg font-bold text-zinc-200 font-mono">{tasteProfile.skipRate}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
                  <span className="text-[11px] text-zinc-400 block">Listening Time</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">
                    {Math.round(tasteProfile.totalListenedSeconds / 60)}m
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-semibold text-zinc-400 mb-2">
                  Top Genre Affinity Vectors
                </h4>
                <div className="space-y-2">
                  {tasteProfile.topGenres.map((g) => (
                    <div key={g.genre} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-zinc-200">{g.genre}</span>
                        <span className="text-rose-400 font-mono">Score: {g.score.toFixed(1)}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-600 to-red-400"
                          style={{
                            width: `${Math.min(100, Math.max(10, g.score * 8))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Event Tracker Log */}
          {activeTab === 'events' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs text-zinc-400">
                  Tracked raw event stream stored in localStorage
                </span>
                <button
                  onClick={() => {
                    clearListeningEvents();
                    loadData();
                  }}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Events
                </button>
              </div>

              <div className="space-y-1.5 max-h-80 overflow-y-auto no-scrollbar font-mono text-xs">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                          ev.eventType === 'song_liked'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : ev.eventType === 'song_completed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : ev.eventType === 'song_skipped'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {ev.eventType}
                      </span>
                      <span className="text-zinc-300 truncate">{ev.songId}</span>
                    </div>

                    <div className="flex items-center gap-3 text-zinc-500 text-[11px] flex-shrink-0">
                      <span>{ev.completionPercentage}% comp</span>
                      <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ML Architecture */}
          {activeTab === 'architecture' && (
            <div className="space-y-4 text-xs text-zinc-300 p-2">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <h4 className="font-bold text-sm text-white">Current Frontend Pipeline</h4>
                <div className="p-3 rounded-xl bg-zinc-950 font-mono text-rose-400 border border-zinc-800">
                  User Gestures (Swipe / Play / Like)
                  <br />→ Event Tracker (Local Persistence)
                  <br />→ Recommendation Service (Content-Based Scoring)
                  <br />→ Ranked Candidate Feed (UI)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-3">
                <h4 className="font-bold text-sm text-rose-300">ML Backend Migration Path</h4>
                <p className="text-zinc-400 leading-relaxed">
                  The <code className="text-rose-300">recommendationService.ts</code> is isolated with a clean TypeScript interface <code className="text-rose-300">IRecommendationService</code>.
                  To plug in a Python / FastAPI / Two-Tower neural network recommendation model, only the internal fetch handler in that file needs to be connected to the API endpoint.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800/80 flex justify-end">
          <button
            onClick={closeInspector}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
