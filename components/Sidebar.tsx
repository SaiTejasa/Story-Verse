
import React, { useState, useMemo, useRef } from 'react';
import { UNIVERSES } from '../constants';
import { Story } from '../types';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setIsScrolled(scrollTop > 20);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[45] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 md:w-80 bg-zinc-950 border-r border-zinc-800 transition-all duration-500 ease-in-out transform shadow-2xl ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className={`transition-all duration-300 border-b border-zinc-800 flex items-center justify-between shrink-0 ${isScrolled ? 'p-4 md:p-5' : 'p-6 md:p-8'}`}>
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className={`bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shrink-0 transition-all duration-300 ${isScrolled ? 'w-8 h-8 md:w-10 md:h-10 text-base' : 'w-10 h-10 md:w-12 md:h-12 text-lg md:text-xl'}`}>ST</div>
              <h1 className={`font-cinzel font-bold tracking-tighter leading-none truncate transition-all duration-300 ${isScrolled ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'}`}>SAI TEJAS</h1>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors shrink-0"
            >
              <svg className={`transition-all duration-300 ${isScrolled ? 'w-5 h-5 md:w-6 md:h-6' : 'w-6 h-6 md:w-8 md:h-8'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* AI Feature Section */}
          <div className={`shrink-0 transition-all duration-300 ${isScrolled ? 'px-4 md:px-5 py-3 md:py-4' : 'px-5 md:px-6 py-6 md:py-8'}`}>
             <button 
              onClick={onOpenAetheris}
              className="w-full group relative overflow-hidden p-[1px] rounded-2xl transition-transform active:scale-95"
            >
              <div className="absolute inset-[-1000%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#4338ca_0%,#a855f7_50%,#4338ca_100%)] opacity-40" />
              <div className={`relative h-full w-full rounded-2xl bg-zinc-950 transition-all duration-300 ${isScrolled ? 'p-3 md:p-4' : 'p-4 md:p-6'}`}>
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className={`bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 transition-all duration-300 ${isScrolled ? 'w-8 h-8 md:w-10 md:h-10' : 'w-10 h-10 md:w-12 md:h-12'}`}>
                    <svg className={`transition-all duration-300 ${isScrolled ? 'w-4 h-4 md:w-5 md:h-5' : 'w-5 h-5 md:w-6 md:h-6'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM14.95 13.536a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM6.464 14.95a1 1 0 10-1.414-1.414l-.707.707a1 1 0 00-1.414 1.414l.707-.707z" /></svg>
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className={`text-white font-cinzel font-bold tracking-[0.1em] uppercase leading-none truncate transition-all duration-300 ${isScrolled ? 'text-[9px] md:text-[10px]' : 'text-[10px] md:text-xs'}`}>Consult AI</p>
                    <p className={`text-indigo-400 font-bold uppercase tracking-[0.2em] mt-1 truncate transition-all duration-300 ${isScrolled ? 'text-[7px] md:text-[8px]' : 'text-[8px] md:text-[9px]'}`}>With Aetheris</p>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Controls */}
          <div className={`shrink-0 transition-all duration-300 space-y-3 md:space-y-4 ${isScrolled ? 'p-4 md:p-5 pt-0' : 'p-5 md:p-6 pt-0'}`}>
            <button 
              onClick={onGoHome}
              className={`w-full flex items-center space-x-4 rounded-xl border border-transparent transition-all ${isScrolled ? 'px-4 md:px-5 py-2 md:py-2.5' : 'px-5 md:px-6 py-3.5 md:py-4'} ${!currentStoryId ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
            >
              <svg className={`shrink-0 transition-all duration-300 ${isScrolled ? 'w-4 h-4 md:w-5 md:h-5' : 'w-5 h-5 md:w-6 md:h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className={`font-bold font-cinzel tracking-widest uppercase truncate transition-all duration-300 ${isScrolled ? 'text-[11px] md:text-xs' : 'text-sm'}`}>Home</span>
            </button>

            <div className="relative group">
              <input 
                type="text"
                placeholder="Search..."
                className={`w-full bg-zinc-900 border border-zinc-800 rounded-xl transition-all placeholder:text-zinc-700 text-zinc-300 focus:outline-none focus:border-indigo-500 ${isScrolled ? 'py-2 md:py-2.5 pl-10 pr-4 text-xs' : 'py-3.5 md:py-4 pl-12 pr-4 text-sm'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className={`absolute flex items-center transition-all duration-300 text-zinc-600 group-focus-within:text-indigo-500 ${isScrolled ? 'left-3 top-2.5 w-4 h-4' : 'left-4 top-4 md:top-4.5 w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Navigation */}
          <nav 
            ref={navRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-5 md:px-6 py-4 no-scrollbar"
          >
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
    <div className="mb-8">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between group py-2"
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className={`w-1.5 md:w-2 h-5 md:h-6 rounded-full shrink-0 ${universe.color.replace('border-', 'bg-')}`}></div>
          <span className="text-sm md:text-base font-cinzel font-bold text-zinc-300 group-hover:text-white transition-colors uppercase tracking-widest truncate leading-tight">
            {universe.name}
          </span>
        </div>
        <svg className={`w-4 h-4 md:w-5 md:h-5 text-zinc-600 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-6 pl-4 border-l border-zinc-900 ml-1">
          {filteredData.series.map((ser: any) => (
            <div key={ser.name} className="space-y-4">
              <h4 className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2 truncate">{ser.name}</h4>
              {ser.seasons.map((season: any) => (
                <div key={season.name} className="space-y-1">
                  <p className="text-[10px] text-zinc-600 italic px-3 mb-1 truncate">{season.name}</p>
                  <div className="space-y-1">
                    {season.stories.map((story: Story) => (
                      <StoryLink key={story.id} story={story} isActive={currentId === story.id} onSelect={onSelect} accentClass={universe.accent} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          {filteredData.standaloneStories?.length > 0 && (
            <div className="space-y-1 pt-2">
              <h4 className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2 opacity-60">Standalone</h4>
              {filteredData.standaloneStories.map((story: Story) => (
                <StoryLink key={story.id} story={story} isActive={currentId === story.id} onSelect={onSelect} accentClass={universe.accent} />
              ))}
            </div>
          )}
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
      className={`w-full text-left px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base transition-all duration-200 border-l-4 ${isActive ? `${accentClass} bg-indigo-600/10 border-current font-bold` : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50 border-transparent'}`}
    >
      <span className="truncate block">{story.title}</span>
    </button>
  );
};

export default Sidebar;
