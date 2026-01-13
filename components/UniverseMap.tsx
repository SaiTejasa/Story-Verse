
import React, { useState, useMemo, useEffect } from 'react';
import { UNIVERSES } from '../constants';
import { Story, Universe } from '../types';

interface UniverseMapProps {
  onClose: () => void;
  onSelectStory: (s: Story) => void;
}

export default function UniverseMap({ onClose, onSelectStory }: UniverseMapProps) {
  const [hoveredUniverse, setHoveredUniverse] = useState<Universe | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTooltipDismissed, setIsTooltipDismissed] = useState(false);

  // Mouse tracking for parallax and tooltip
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleHoverNode = (uni: Universe | null) => {
    if (uni) {
      setHoveredUniverse(uni);
      setIsTooltipDismissed(false); // Reset dismissal on new hover
    } else {
      setHoveredUniverse(null);
    }
  };

  // Parallax effect for depth
  const parallaxStyle = useMemo(() => {
    const xOffset = (mousePos.x - window.innerWidth / 2) / 40;
    const yOffset = (mousePos.y - window.innerHeight / 2) / 40;
    return {
      transform: `translate3d(${xOffset}px, ${yOffset}px, 0)`,
    };
  }, [mousePos]);

  // Tooltip positioning logic with screen boundary checks
  const getTooltipStyle = () => {
    if (!hoveredUniverse || isTooltipDismissed) return { opacity: 0, pointerEvents: 'none' as const };
    
    const tooltipWidth = 320;
    const tooltipHeight = 160;
    let x = mousePos.x + 20;
    let y = mousePos.y + 20;

    // Boundary checks to keep tooltip on screen
    if (x + tooltipWidth > window.innerWidth) x = mousePos.x - tooltipWidth - 20;
    if (y + tooltipHeight > window.innerHeight) y = mousePos.y - tooltipHeight - 20;
    if (x < 10) x = 10;
    if (y < 10) y = 10;

    return {
      opacity: 1,
      transform: `translate3d(${x}px, ${y}px, 0)`,
      transition: 'opacity 0.2s ease-out, transform 0.05s linear',
      pointerEvents: 'auto' as const
    };
  };

  const firstStoryOfUniverse = (uni: Universe): Story => {
    if (uni.series.length > 0 && uni.series[0].seasons.length > 0 && uni.series[0].seasons[0].stories.length > 0) {
      return uni.series[0].seasons[0].stories[0];
    }
    if (uni.standaloneStories && uni.standaloneStories.length > 0) {
      return uni.standaloneStories[0];
    }
    return {} as Story;
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-zinc-950/98 backdrop-blur-3xl flex items-center justify-center p-4 cursor-default animate-in fade-in duration-500 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Background Star Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div 
          className="absolute inset-[-20%] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] transition-transform duration-1000 ease-out"
          style={parallaxStyle}
        />
      </div>

      {/* Floating Tooltip */}
      <div 
        className="fixed top-0 left-0 z-[110] pointer-events-none"
        style={getTooltipStyle()}
      >
        {hoveredUniverse && (
          <div className="bg-zinc-900/90 border border-white/10 backdrop-blur-2xl p-6 rounded-[2rem] shadow-2xl w-[320px] ring-1 ring-white/10 relative overflow-hidden group">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsTooltipDismissed(true); }}
              className="absolute top-4 right-4 p-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white transition-colors pointer-events-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className={`text-lg font-cinzel font-bold mb-2 tracking-tight ${hoveredUniverse.accent}`}>{hoveredUniverse.name}</h3>
            <p className="text-zinc-400 text-[10px] leading-relaxed uppercase tracking-wider mb-4 line-clamp-3">{hoveredUniverse.description}</p>
            <button 
              onClick={() => onSelectStory(firstStoryOfUniverse(hoveredUniverse))}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-bold font-cinzel tracking-[0.2em] text-white uppercase transition-all active:scale-95 pointer-events-auto"
            >
              Initialize Sync
            </button>
          </div>
        )}
      </div>

      <div className="relative bg-zinc-900/40 border border-white/5 rounded-[4rem] w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.8)]">
        {/* Navigation Header */}
        <div className="p-8 md:p-12 border-b border-white/5 flex justify-between items-center relative z-10 bg-gradient-to-b from-white/5 to-transparent">
          <div>
            <h2 className="text-3xl md:text-5xl font-cinzel font-bold text-white tracking-tighter">VERSE NAVIGATOR</h2>
            <p className="text-zinc-500 text-[10px] md:text-xs font-light mt-1 uppercase tracking-[0.4em]">Spatial Awareness Interface // Active</p>
          </div>
          <button onClick={onClose} className="p-5 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white border border-white/10 active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Map Interactive Area */}
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.03)_0%,_transparent_70%)]" />
          
          {/* Spatial Mapping container - increased size to prevent overlaps */}
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="relative w-full h-full max-w-5xl max-h-[700px] transition-transform duration-1000 ease-out" style={parallaxStyle}>
              
              {/* Universe Nodes with larger spacing */}
              
              {/* Shouryanagar Universe - Apex */}
              <div className="absolute top-[5%] left-1/2 -translate-x-1/2 z-20">
                <MapNode 
                  universe={UNIVERSES[0]} 
                  onSelect={() => onSelectStory(firstStoryOfUniverse(UNIVERSES[0]))}
                  onHover={() => handleHoverNode(UNIVERSES[0])} 
                  onLeave={() => handleHoverNode(null)}
                  color="rgb(168, 85, 247)" icon="🌌"
                />
              </div>

              {/* Legend Verse - Left Wing */}
              <div className="absolute bottom-[10%] left-[5%] md:left-[10%] z-20">
                <MapNode 
                  universe={UNIVERSES[1]} 
                  onSelect={() => onSelectStory(firstStoryOfUniverse(UNIVERSES[1]))}
                  onHover={() => handleHoverNode(UNIVERSES[1])} 
                  onLeave={() => handleHoverNode(null)}
                  color="rgb(59, 130, 246)" icon="⚡"
                />
              </div>

              {/* Agni Tech Vishwa - Right Wing */}
              <div className="absolute bottom-[10%] right-[5%] md:right-[10%] z-20">
                <MapNode 
                  universe={UNIVERSES[2]} 
                  onSelect={() => onSelectStory(firstStoryOfUniverse(UNIVERSES[2]))}
                  onHover={() => handleHoverNode(UNIVERSES[2])} 
                  onLeave={() => handleHoverNode(null)}
                  color="rgb(239, 68, 68)" icon="🔥"
                />
              </div>

              {/* Central Background Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />
              <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 1000 1000">
                <circle cx="500" cy="500" r="300" stroke="white" strokeWidth="0.5" fill="none" strokeDasharray="5 10" />
                <circle cx="500" cy="500" r="150" stroke="white" strokeWidth="0.5" fill="none" strokeDasharray="10 20" />
              </svg>
            </div>
          </div>
        </div>

        {/* Informational Status Bar */}
        <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-xl flex justify-center">
          <p className="text-zinc-600 text-[9px] md:text-[10px] uppercase font-bold tracking-[0.5em] animate-pulse">
            Spatial Anchor Point: Verified // Ready for Sub-Space Jump
          </p>
        </div>
      </div>
    </div>
  );
}

const MapNode: React.FC<{ 
  universe: Universe, 
  onSelect: () => void, 
  onHover: () => void, 
  onLeave: () => void, 
  color: string, 
  icon: string 
}> = ({ universe, onSelect, onHover, onLeave, color, icon }) => {
  return (
    <div 
      className="group flex flex-col items-center transition-all duration-500"
      onMouseEnter={onHover} 
      onMouseLeave={onLeave}
      onClick={onSelect}
    >
      <div 
        className="w-28 h-28 md:w-40 md:h-40 rounded-full flex items-center justify-center relative transition-all duration-700 border border-white/5 cursor-pointer"
        style={{ backgroundColor: `${color}10` }}
      >
        <div className="absolute inset-0 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-all duration-700" style={{ backgroundColor: color }} />
        <div className="absolute -inset-2 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out" />
        
        <span className="text-4xl md:text-6xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all duration-500 group-hover:scale-125 select-none z-10">
          {icon}
        </span>
      </div>
      
      <div className="mt-6 text-center transform group-hover:translate-y-2 transition-all duration-500">
        <h3 className="text-white font-cinzel text-xs md:text-xl font-bold tracking-[0.2em] uppercase drop-shadow-lg">
          {universe.name}
        </h3>
        <div className="flex items-center justify-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
           <div className={`w-1 h-1 rounded-full ${universe.accent.replace('text-', 'bg-')}`} />
           <p className="text-[8px] text-zinc-500 uppercase tracking-[0.3em] font-bold">Synchronizing...</p>
        </div>
      </div>
    </div>
  );
};
