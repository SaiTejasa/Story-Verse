
import React, { useState, useMemo } from 'react';
import { UNIVERSES } from '../constants';
import { Story, UniverseID } from '../types';

interface SidebarProps {
  onSelectStory: (story: Story) => void;
  onGoHome: () => void;
  onOpenAetheris: () => void;
  currentStoryId: string;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectStory, onGoHome, onOpenAetheris, currentStoryId, isOpen, setIsOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 border-r border-zinc-800 transition-all duration-300 ease-in-out transform shadow-2xl ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">ST</div>
              <h1 className="text-xl font-cinzel font-bold tracking-tighter leading-none">SAI TEJAS</h1>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
              title="Close Sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* AI Feature Section */}
          <div className="px-4 py-6">
             <button 
              onClick={onOpenAetheris}
              className="w-full group relative overflow-hidden p-[1px] rounded-2xl transition-transform hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#4338ca_0%,#a855f7_50%,#4338ca_100%)]" />
              <div className="relative h-full w-full rounded-2xl bg-zinc-950 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM14.95 13.536a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM6.464 14.95a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707z" /></svg>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-white font-cinzel font-bold tracking-[0.1em] leading-none">MAKE YOUR OWN STORY</p>
                    <p className="text-[8px] text-indigo-400 font-bold uppercase tracking-[0.2em] mt-1">WITH AETHERIS</p>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Search */}
          <div className="p-4 pt-0 space-y-3">
            <button 
              onClick={onGoHome}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all border border-transparent ${!currentStoryId ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-bold font-cinzel tracking-widest uppercase">Home Core</span>
            </button>

            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-zinc-600 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text"
                placeholder="Filter stories..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 no-scrollbar">
            {UNIVERSES.map(uni => (
              <UniverseSection 
                key={uni.id} 
                universe={uni} 
                searchTerm={searchTerm} 
                onSelect={onSelectStory}
                currentId={currentStoryId}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

const UniverseSection: React.FC<{ 
  universe: any, 
  searchTerm: string, 
  onSelect: (s: Story) => void,
  currentId: string
}> = ({ universe, searchTerm, onSelect, currentId }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredData = useMemo(() => {
    if (!searchTerm) return universe;
    const lowerTerm = searchTerm.toLowerCase();
    const filteredStandalone = universe.standaloneStories?.filter((s: Story) => s.title.toLowerCase().includes(lowerTerm));
    const filteredSeries = universe.series.map((ser: any) => {
      const filteredSeasons = ser.seasons.map((season: any) => {
        const filteredStories = season.stories.filter((s: Story) => s.title.toLowerCase().includes(lowerTerm));
        return filteredStories.length > 0 ? { ...season, stories: filteredStories } : null;
      }).filter(Boolean);
      return (filteredSeasons.length > 0 || ser.name.toLowerCase().includes(lowerTerm)) ? { ...ser, seasons: filteredSeasons } : null;
    }).filter(Boolean);
    const hasMatches = filteredStandalone?.length > 0 || filteredSeries.length > 0 || universe.name.toLowerCase().includes(lowerTerm);
    if (!hasMatches) return null;
    return { ...universe, series: filteredSeries, standaloneStories: filteredStandalone };
  }, [universe, searchTerm]);

  if (!filteredData) return null;

  return (
    <div className="mb-6">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between group py-1"
      >
        <div className="flex items-center space-x-2">
          <div className={`w-1 h-4 rounded-full ${universe.color.replace('border-', 'bg-')}`}></div>
          <span className="text-sm font-cinzel font-bold text-zinc-300 group-hover:text-white transition-colors uppercase tracking-widest">
            {universe.name}
          </span>
        </div>
        <svg className={`w-4 h-4 text-zinc-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-4 pl-3">
          {filteredData.series.map((ser: any) => (
            <div key={ser.name}>
              <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">{ser.name}</h4>
              <div className="space-y-3">
                {ser.seasons.map((season: any) => (
                  <div key={season.name} className="space-y-1">
                    <p className="text-[10px] text-zinc-600 italic px-2">{season.name}</p>
                    {season.stories.map((story: Story) => (
                      <StoryLink key={story.id} story={story} isActive={currentId === story.id} onSelect={onSelect} accentClass={universe.accent} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredData.standaloneStories?.map((story: Story) => (
            <StoryLink key={story.id} story={story} isActive={currentId === story.id} onSelect={onSelect} accentClass={universe.accent} />
          ))}
        </div>
      )}
    </div>
  );
};

const StoryLink: React.FC<{ 
  story: Story, isActive: boolean, onSelect: (s: Story) => void, accentClass: string
}> = ({ story, isActive, onSelect, accentClass }) => {
  return (
    <button
      onClick={() => onSelect(story)}
      className={`w-full text-left px-2 py-1.5 rounded text-xs transition-all duration-200 border-l-2 ${isActive ? `${accentClass} bg-zinc-900 border-current font-medium` : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border-transparent'}`}
    >
      {story.title}
    </button>
  );
};

export default Sidebar;
