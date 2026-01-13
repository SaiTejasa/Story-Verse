
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Story, UserProgress, ChatMessage } from './types';
import { UNIVERSES } from './constants';
import { getUserProgress, saveUserProgress, syncEngagement } from './utils/storage';
import Sidebar from './components/Sidebar';
import PDFReader from './components/PDFReader';
import UniverseMap from './components/UniverseMap';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [progress, setProgress] = useState<UserProgress>(getUserProgress());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [zoom, setZoom] = useState(1.4);
  const [readerTheme, setReaderTheme] = useState<'night' | 'parchment'>('night');

  const allStories = useMemo(() => {
    const stories: Story[] = [];
    UNIVERSES.forEach(u => {
      u.series.forEach(ser => ser.seasons.forEach(sea => stories.push(...sea.stories)));
      if (u.standaloneStories) stories.push(...u.standaloneStories);
    });
    return stories;
  }, []);

  useEffect(() => {
    if (progress.lastStoryId) {
      const found = allStories.find(s => s.id === progress.lastStoryId);
      if (found) setCurrentStory(found);
    }
  }, [allStories]);

  const handleSelectStory = (story: Story) => {
    setCurrentStory(story);
    setIsMapOpen(false);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    if (story.id !== progress.lastStoryId) {
      const newProgress = { ...progress, lastStoryId: story.id, scrollPosition: 0 };
      setProgress(newProgress);
      saveUserProgress(newProgress);
    }
  };

  const handleGoHome = () => {
    setCurrentStory(null);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    setIsMapOpen(false);
  };

  const handleUpdateChatHistory = (history: ChatMessage[]) => {
    setProgress(prev => {
      const updated = { ...prev, chatHistory: history };
      saveUserProgress(updated);
      return updated;
    });
  };

  const handleLike = () => {
    if (!currentStory) return;
    const storyId = currentStory.id;
    setProgress(prev => {
      const newLikes = new Set(prev.likes);
      const isNowLiked = !newLikes.has(storyId);
      isNowLiked ? newLikes.add(storyId) : newLikes.delete(storyId);
      const updated = { ...prev, likes: newLikes };
      saveUserProgress(updated);
      syncEngagement(prev.userId, storyId, 'like', isNowLiked);
      return updated;
    });
  };

  const handleRate = (score: number) => {
    if (!currentStory) return;
    const storyId = currentStory.id;
    setProgress(prev => {
      const updated = { ...prev, ratings: { ...prev.ratings, [storyId]: score } };
      saveUserProgress(updated);
      syncEngagement(prev.userId, storyId, 'rating', score);
      return updated;
    });
  };

  const handleToggleBookmark = (pageNum: number) => {
    if (!currentStory) return;
    const storyId = currentStory.id;
    setProgress(prev => {
      const currentBookmarks = prev.bookmarks[storyId] || [];
      const newBookmarks = currentBookmarks.includes(pageNum) 
        ? currentBookmarks.filter(p => p !== pageNum)
        : [...currentBookmarks, pageNum];
      const updated = { ...prev, bookmarks: { ...prev.bookmarks, [storyId]: newBookmarks } };
      saveUserProgress(updated);
      syncEngagement(prev.userId, storyId, 'bookmark', newBookmarks);
      return updated;
    });
  };

  return (
    <div className={`flex h-screen text-zinc-100 overflow-hidden font-inter transition-colors duration-700 ${readerTheme === 'parchment' && currentStory ? 'bg-[#f4eccf]' : 'bg-zinc-950'}`}>
      <Sidebar 
        onSelectStory={handleSelectStory} 
        onGoHome={handleGoHome} 
        onOpenAetheris={() => setIsChatOpen(true)}
        currentStoryId={currentStory?.id || ''} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      <main className="flex-1 flex flex-col relative transition-all duration-300">
        <header className={`absolute top-0 inset-x-0 z-40 h-16 border-b flex items-center justify-between px-6 transition-all duration-700 ${readerTheme === 'parchment' && currentStory ? 'bg-[#f4eccf]/80 backdrop-blur-md border-zinc-300' : 'bg-zinc-950/80 backdrop-blur-md border-zinc-800'}`}>
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 transition-all rounded-lg ${readerTheme === 'parchment' && currentStory ? 'text-zinc-800 hover:bg-black/5' : 'text-zinc-400 hover:text-white'}`} title="Toggle Sidebar">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button onClick={handleGoHome} className={`p-2 transition-all rounded-lg ${readerTheme === 'parchment' && currentStory ? 'text-zinc-800 hover:bg-black/5' : 'text-zinc-400 hover:text-white'}`} title="Go to Home">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </button>
            <div className="flex items-center space-x-2 pl-2 border-l border-white/10 ml-2">
              <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] hidden md:inline text-zinc-500">Manifest:</span>
              <span className={`font-bold font-cinzel text-sm tracking-wide truncate max-w-[150px] ${readerTheme === 'parchment' && currentStory ? 'text-zinc-900' : 'text-white'}`}>{currentStory?.title || 'Origin Point'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* AETHERIS AI SHINING BUTTON */}
            <button 
              onClick={() => setIsChatOpen(true)} 
              className="group relative h-10 px-8 flex items-center justify-center overflow-hidden rounded-full font-cinzel text-[9px] font-bold tracking-[0.4em] text-white transition-all active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
            >
              {/* Spinning Border Container */}
              <div className="absolute inset-0 bg-zinc-950 border border-white/10 rounded-full" />
              <div className="absolute inset-[-400%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,transparent_40%,#6366f1_50%,transparent_60%,transparent_100%)] opacity-40 group-hover:opacity-100" />
              <div className="absolute inset-[1.5px] bg-zinc-950 rounded-full" />

              {/* Shining Sweep Effect */}
              <div className="absolute inset-0 w-full h-full">
                <div className="absolute inset-0 w-[40px] h-full bg-white/10 skew-x-[45deg] -translate-x-[300%] animate-[shining_2.5s_ease-in-out_infinite] group-hover:bg-white/20" />
              </div>
              
              <div className="relative z-10 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full group-hover:animate-ping" />
                <span>AETHERIS AI</span>
              </div>
            </button>

            <button onClick={() => setIsMapOpen(true)} className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-[10px] font-bold font-cinzel tracking-[0.3em] border border-white/5 shadow-xl active:scale-95 transition-all">VERSE NAVIGATOR</button>
          </div>
        </header>

        {currentStory ? (
          <PDFReader 
            story={currentStory} zoom={zoom} setZoom={setZoom} theme={readerTheme} setTheme={setReaderTheme} 
            initialScroll={progress.scrollPosition} isLiked={progress.likes.has(currentStory.id)} onLike={handleLike} 
            rating={progress.ratings[currentStory.id] || 0} onRate={handleRate}
            bookmarks={progress.bookmarks[currentStory.id] || []} onToggleBookmark={handleToggleBookmark}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-zinc-950/95"></div>
            <div className="relative z-10 text-center space-y-10 max-w-3xl">
              <div className="inline-block p-8 border border-white/5 rounded-[2rem] bg-white/5 backdrop-blur-xl animate-pulse">
                 <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-cinzel font-bold shadow-2xl">ST</div>
              </div>
              <div>
                <h1 className="text-6xl md:text-8xl font-cinzel font-bold text-white tracking-tighter leading-none mb-4">SAI TEJAS</h1>
                <p className="text-zinc-500 text-xs md:text-sm font-light uppercase tracking-[1em] mb-8">STORY UNIVERSE HUB</p>
                <p className="text-zinc-400 text-lg md:text-xl font-light italic leading-relaxed font-cinzel opacity-60">"The architecture of imagination, rendered in light."</p>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 mt-14">
                <button onClick={() => setIsMapOpen(true)} className="w-full md:w-auto px-12 py-5 bg-white text-black font-cinzel font-bold tracking-[0.5em] text-[10px] rounded-full hover:bg-zinc-200 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-95 uppercase">Access Verse Navigator</button>
                <button onClick={() => setIsChatOpen(true)} className="w-full md:w-auto px-12 py-5 bg-indigo-600 text-white font-cinzel font-bold tracking-[0.5em] text-[10px] rounded-full hover:bg-indigo-500 transition-all shadow-[0_0_50px_rgba(99,102,241,0.2)] active:scale-95 uppercase">Consult Aetheris</button>
              </div>
            </div>
          </div>
        )}
        {isMapOpen && <UniverseMap onClose={() => setIsMapOpen(false)} onSelectStory={handleSelectStory} />}
        
        <ChatBot 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          history={progress.chatHistory}
          onUpdateHistory={handleUpdateChatHistory}
        />
      </main>

      <style>{`
        @keyframes shining {
          0% { transform: translateX(-300%) skewX(45deg); }
          50% { transform: translateX(300%) skewX(45deg); }
          100% { transform: translateX(300%) skewX(45deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
