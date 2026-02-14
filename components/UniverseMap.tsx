
import React, { useState, useEffect } from 'react';
import { UNIVERSES } from '../constants';
import { Story, Universe } from '../types';

interface UniverseMapProps {
  onClose: () => void;
  onSelectStory: (s: Story) => void;
}

export default function UniverseMap({ onClose, onSelectStory }: UniverseMapProps) {
  const [hoveredUniverse, setHoveredUniverse] = useState<Universe | null>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setRotation(prev => (prev + 0.1) % 360);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const firstStoryOfUniverse = (uni: Universe): Story => {
    if (uni.series.length > 0 && uni.series[0].seasons.length > 0 && uni.series[0].seasons[0].stories.length > 0) {
      return uni.series[0].seasons[0].stories[0];
    }
    return (uni.standaloneStories?.[0]) || {} as Story;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-2xl flex items-center justify-center animate-in fade-in zoom-in-95 duration-700 overflow-hidden select-none">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.05)_0%,_transparent_70%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full" />
      
      <div className="relative w-full max-w-6xl aspect-video flex flex-col">
        {/* Header */}
        <div className="absolute top-8 left-8 z-20">
          <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-white tracking-tighter">AETHERIS NEXUS</h2>
          <p className="text-zinc-500 text-[8px] tracking-[0.5em] uppercase mt-1">Orbital Narrative Plane</p>
        </div>

        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 z-20 p-4 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all hover:scale-110 active:scale-90"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* The Orbital System - Scaled Down */}
        <div className="flex-1 relative flex items-center justify-center scale-90 md:scale-100">
          
          {/* Central Sun */}
          <div className="relative z-10 w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 bg-indigo-500/10 blur-3xl animate-pulse rounded-full" />
            <div className="relative w-16 h-16 bg-zinc-950 border border-indigo-500/40 rounded-2xl rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <span className="font-cinzel text-xl font-bold text-indigo-400 -rotate-45">ST</span>
            </div>
          </div>

          {/* Orbiting Universes */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {UNIVERSES.map((uni, i) => {
              const angle = (i * (360 / UNIVERSES.length) + rotation) * (Math.PI / 180);
              // Reduced radius from 350 to 220
              const radius = 220;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <div 
                  key={uni.id}
                  className="absolute pointer-events-auto cursor-pointer group"
                  style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}
                  onMouseEnter={() => setHoveredUniverse(uni)}
                  onMouseLeave={() => setHoveredUniverse(null)}
                  onClick={() => onSelectStory(firstStoryOfUniverse(uni))}
                >
                  {/* Connection Line */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-left w-[220px] h-[1px] bg-gradient-to-r from-transparent to-white/5" 
                    style={{ transform: `rotate(${angle + Math.PI}rad) translateX(110px)` }} />

                  <div className="relative flex flex-col items-center">
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center relative overflow-hidden transition-all duration-700 group-hover:scale-110 group-hover:border-indigo-500/50">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color)_0%,_transparent_70%)] opacity-0 group-hover:opacity-20 transition-opacity" 
                        style={{ '--color': uni.accent.replace('text-', '') } as any} />
                      <span className="text-2xl md:text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        {i === 0 ? '🌌' : i === 1 ? '⚡' : '🔥'}
                      </span>
                    </div>
                    <div className="mt-4 text-center">
                      <h4 className="text-white font-cinzel text-[8px] md:text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 group-hover:opacity-100 group-hover:text-indigo-400">{uni.name}</h4>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Panel */}
        <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-3xl h-48 flex items-center justify-center text-center relative">
          {hoveredUniverse ? (
            <div className="max-w-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className={`text-2xl font-cinzel font-bold mb-2 ${hoveredUniverse.accent}`}>{hoveredUniverse.name}</h3>
              <p className="text-zinc-500 text-[10px] font-light leading-relaxed uppercase tracking-widest">{hoveredUniverse.description}</p>
            </div>
          ) : (
            <p className="text-zinc-700 text-[8px] font-bold tracking-[1em] uppercase animate-pulse">Select a destination</p>
          )}
        </div>
      </div>
    </div>
  );
}
