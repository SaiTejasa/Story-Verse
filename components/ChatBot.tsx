
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  history: ChatMessage[];
  onUpdateHistory: (history: ChatMessage[]) => void;
}

export default function ChatBot({ isOpen, onClose, history, onUpdateHistory }: ChatBotProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your conversation with Aetheris?")) {
      onUpdateHistory([]);
    }
  };

  const handleSend = async () => {
    const currentInput = input.trim();
    if (!currentInput || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: currentInput, timestamp: Date.now() };
    const updatedHistoryWithUser = [...history, userMsg];
    onUpdateHistory(updatedHistoryWithUser);
    setInput('');
    setIsLoading(true);

    try {
      // Initialize AI instance with the provided environment key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // We target the 2.0 Flash Experimental model as requested
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: updatedHistoryWithUser.slice(-12).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: `You are Aetheris, the AI chronicler of the Sai Tejas Multiverse. 
          Your voice is cinematic, wise, and helpful. 
          Context: 
          - Shouryanagar (SSU): Urban heroes vs Ancient Horrors.
          - Legend Verse: Lightning guardians and high-speed warriors.
          - Agni Tech Vishwa: Fusion of code and spiritual mechanical energy.
          Guidelines: Keep responses evocative and concise. Encourage the user to expand the lore.`,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      const modelText = response.text || "The chronicles are momentarily veiled. Please speak again.";
      const modelMsg: ChatMessage = { role: 'model', text: modelText, timestamp: Date.now() };
      onUpdateHistory([...updatedHistoryWithUser, modelMsg]);
    } catch (error: any) {
      console.error("Aetheris Connection Error:", error);
      let errMsg = "A temporal flux has interrupted our link. Please try again in a few moments.";
      if (error?.message?.includes('xhr') || error?.status === 'UNKNOWN') {
        errMsg = "Aetheris is currently recalibrating its neural archives (Network Error).";
      }
      onUpdateHistory([...updatedHistoryWithUser, { role: 'model', text: errMsg, timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[100] w-full max-w-lg bg-zinc-950/98 border-l border-white/10 backdrop-blur-3xl shadow-[-20px_0_100px_rgba(0,0,0,0.8)] flex flex-col animate-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-10 h-10 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-indigo-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-cinzel font-bold text-white tracking-widest uppercase">Aetheris</h2>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-bold">Chronicles Active</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={clearHistory}
            className="p-2.5 text-zinc-500 hover:text-red-400 transition-colors rounded-xl hover:bg-red-400/10"
            title="Clear History"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          <button onClick={onClose} className="p-2.5 text-zinc-500 hover:text-white transition-colors rounded-xl hover:bg-white/5">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar scroll-smooth">
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
            <div className="w-20 h-20 border border-white/10 rounded-full flex items-center justify-center animate-[pulse_4s_infinite]">
              <svg className="w-10 h-10 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <p className="font-cinzel text-[10px] tracking-[0.4em] uppercase leading-relaxed max-w-[200px]">The archives are empty. Propose a narrative to begin.</p>
          </div>
        )}
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-5 rounded-3xl shadow-2xl ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-zinc-900/60 border border-white/10 text-zinc-300 rounded-tl-none font-light leading-relaxed'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <span className="text-[8px] opacity-20 mt-2 block text-right font-mono">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900/60 border border-white/5 p-5 rounded-3xl rounded-tl-none space-x-1.5 flex items-center animate-pulse">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-8 border-t border-white/10 bg-black/40 backdrop-blur-3xl">
        <div className="relative group">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
          <input 
            type="text" 
            placeholder="Whisper to the archives..."
            className="relative w-full bg-zinc-950 border border-white/10 rounded-2xl py-5 pl-7 pr-16 text-sm text-white focus:outline-none focus:border-indigo-500/40 transition-all placeholder:text-zinc-700 font-inter"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-3 bottom-3 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-20 disabled:scale-100 active:scale-95 shadow-lg shadow-indigo-600/20 z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </button>
        </div>
        <div className="mt-5 flex items-center justify-center space-x-4 opacity-40">
           <span className="text-[7px] text-zinc-500 uppercase tracking-[0.5em] font-bold">Engine: 2.0 Flash Exp</span>
           <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
           <span className="text-[7px] text-zinc-500 uppercase tracking-[0.5em] font-bold">Status: Online</span>
        </div>
      </div>
    </div>
  );
}
