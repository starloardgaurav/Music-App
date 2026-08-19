import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { PlayerProvider } from './context/PlayerContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { MiniPlayer } from './components/player/MiniPlayer';
import { FullScreenPlayer } from './components/player/FullScreenPlayer';
import { SwipePlayer } from './components/player/SwipePlayer';
import { LyricsView } from './components/player/LyricsView';
import { QueueDrawer } from './components/player/QueueDrawer';
import { AddToPlaylistModal } from './components/modals/AddToPlaylistModal';
import { ShareModal } from './components/modals/ShareModal';
import { RecommendationInspector } from './components/debug/RecommendationInspector';

// Pages
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Library } from './pages/Library';
import { PlaylistDetail } from './pages/PlaylistDetail';
import { ArtistDetail } from './pages/ArtistDetail';

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <PlayerProvider>
          <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-rose-600 selection:text-white relative overflow-hidden">
            {/* Ambient Background Radial Glow */}
            <div className="fixed inset-0 gradient-bg pointer-events-none z-0 opacity-80" />

            {/* Top Bar Header */}
            <Header />

            {/* Main Page Routing */}
            <main className="flex-1 w-full overflow-x-hidden relative z-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/library" element={<Library />} />
                <Route path="/playlist/:id" element={<PlaylistDetail />} />
                <Route path="/artist/:id" element={<ArtistDetail />} />
              </Routes>
            </main>

            {/* Global Persistent Mini-Player */}
            <MiniPlayer />

            {/* Mobile Bottom Navigation */}
            <BottomNav />

            {/* Modals & Full-Screen Overlays */}
            <FullScreenPlayer />
            <SwipePlayer />
            <LyricsView />
            <QueueDrawer />
            <AddToPlaylistModal />
            <ShareModal />
            <RecommendationInspector />
          </div>
        </PlayerProvider>
      </UserProvider>
    </BrowserRouter>
  );
}
