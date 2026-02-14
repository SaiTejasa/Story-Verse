
import React, { useState, useEffect, useMemo } from 'react';
import { Story, UserProgress, ChatSession } from './types';
import { UNIVERSES } from './constants';
import { getUserProgress, saveUserProgress, syncEngagement } from './utils/storage';
import Sidebar from './components/Sidebar';
import PDFReader from './components/PDFReader';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [progress, setProgress] = useState<UserProgress>(getUserProgress());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
  }, [allStories, progress.lastStoryId]);

  const handleSelectStory = (story: Story) => {
    setCurrentStory(story);
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
  };

  const handleUpdateChats = (chats: ChatSession[], currentId: string) => {
    setProgress(prev => {
      const updated = { ...prev, chats, currentChatId: currentId };
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
    <div className={`flex h-screen w-screen overflow-hidden text-zinc-100 font-inter transition-colors duration-700 text-base ${readerTheme === 'parchment' && currentStory ? 'bg-[#f4eccf]' : 'bg-zinc-950'}`}>
      <Sidebar 
        onSelectStory={handleSelectStory} 
        onGoHome={handleGoHome} 
        onOpenAetheris={() => setIsChatOpen(true)}
        currentStoryId={currentStory?.id || ''} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      <main className="flex-1 flex flex-col relative overflow-hidden transition-all duration-300 min-w-0">
        <header className={`absolute top-0 inset-x-0 z-40 h-20 border-b flex items-center justify-between px-4 md:px-8 transition-all duration-700 ${readerTheme === 'parchment' && currentStory ? 'bg-[#f4eccf]/90 backdrop-blur-xl border-zinc-300 shadow-sm' : 'bg-zinc-950/90 backdrop-blur-xl border-zinc-800 shadow-2xl'}`}>
          <div className="flex items-center space-x-2 md:space-x-3 overflow-hidden min-w-0">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 md:p-2.5 transition-all rounded-xl shrink-0 ${readerTheme === 'parchment' && currentStory ? 'text-zinc-800 hover:bg-black/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`} title="Toggle Sidebar">
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button onClick={handleGoHome} className={`p-2 md:p-2.5 transition-all rounded-xl shrink-0 ${readerTheme === 'parchment' && currentStory ? 'text-zinc-800 hover:bg-black/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`} title="Go to Home">
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </button>
            <div className="flex items-center space-x-2 md:space-x-3 pl-2 md:pl-3 border-l border-white/10 ml-1 overflow-hidden">
              <span className={`font-bold font-cinzel text-sm md:text-lg tracking-wide truncate max-w-[100px] md:max-w-[250px] lg:max-w-[400px] ${readerTheme === 'parchment' && currentStory ? 'text-zinc-900' : 'text-white'}`}>{currentStory?.title || 'ORIGIN MAP'}</span>
            </div>
          </div>
          
          <div className="flex items-center shrink-0 ml-2">
            <button 
              onClick={() => setIsChatOpen(true)} 
              className="group relative h-10 md:h-12 px-4 md:px-10 flex items-center justify-center overflow-hidden rounded-full font-cinzel text-[9px] md:text-xs font-bold tracking-[0.1em] md:tracking-[0.4em] text-white transition-all active:scale-95 shadow-xl bg-zinc-950 border border-white/10"
            >
              <div className="absolute inset-[-400%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,transparent_40%,#6366f1_50%,transparent_60%,transparent_100%)] opacity-20 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-center space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                <span className="group-hover:text-indigo-300 transition-colors uppercase whitespace-nowrap">Aetheris AI</span>
              </div>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {currentStory ? (
            <PDFReader 
              story={currentStory} zoom={zoom} setZoom={setZoom} theme={readerTheme} setTheme={setReaderTheme} 
              initialScroll={progress.scrollPosition} isLiked={progress.likes.has(currentStory.id)} onLike={handleLike} 
              rating={progress.ratings[currentStory.id] || 0} onRate={handleRate}
              bookmarks={progress.bookmarks[currentStory.id] || []} onToggleBookmark={handleToggleBookmark}
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center p-6 md:p-8 bg-[url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center relative overflow-hidden">
              <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-sm"></div>
              <div className="relative z-10 text-center space-y-8 md:space-y-10 w-full max-w-4xl px-4 flex flex-col items-center">
                <div className="inline-block p-8 md:p-10 border border-white/5 rounded-[2.5rem] bg-white/5 backdrop-blur-3xl animate-pulse">
                   <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white text-3xl md:text-4xl font-cinzel font-bold shadow-2xl">ST</div>
                </div>
                <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
                  <h1 className="text-5xl md:text-8xl lg:text-9xl font-cinzel font-bold text-white tracking-tighter leading-none truncate max-w-full">SAI TEJAS</h1>
                  <p className="text-zinc-500 text-[10px] md:text-sm lg:text-base font-medium uppercase tracking-[0.6em] md:tracking-[1.5em] mb-2 truncate max-w-full">The Narrative Core</p>
                  <p className="text-zinc-400 text-base md:text-xl lg:text-2xl font-light italic leading-relaxed font-cinzel opacity-70 break-words max-w-lg mx-auto">"Architecture of imagination, rendered in light."</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-12 w-full max-w-md">
                  <button onClick={() => setIsSidebarOpen(true)} className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-white text-black font-cinzel font-bold tracking-[0.4em] text-[10px] md:text-xs rounded-full hover:bg-zinc-200 transition-all shadow-xl active:scale-95 uppercase whitespace-nowrap">Library Access</button>
                  <button onClick={() => setIsChatOpen(true)} className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-indigo-600 text-white font-cinzel font-bold tracking-[0.4em] text-[10px] md:text-xs rounded-full hover:bg-indigo-500 transition-all shadow-xl active:scale-95 uppercase whitespace-nowrap">Consult Aetheris</button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <ChatBot 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          chats={progress.chats}
          currentChatId={progress.currentChatId}
          onUpdateChats={handleUpdateChats}
        />
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
