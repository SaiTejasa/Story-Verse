
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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    const newHistory = [...history, userMsg];
    onUpdateHistory(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: newHistory.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: `You are Aetheris, the AI chronicler of the Sai Tejas Story Universe. 
          Your tone is cinematic, wise, and helpful. You possess deep knowledge of:
          1. Shouryanagar Universe: Modern heroes vs ancient horrors in a gritty urban landscape.
          2. Legend Verse: Lightning-fast warriors and lightning guardians.
          3. Agni Tech Vishwa: A fusion of technology and mysticism (mechanical spirits).
          Assists users in co-creating stories or explaining lore. Keep responses relatively concise but atmospheric.`
        }
      });

      const modelText = response.text || "The archives are silent for a moment... please try again.";
      const modelMsg: ChatMessage = { role: 'model', text: modelText, timestamp: Date.now() };
      onUpdateHistory([...newHistory, modelMsg]);
    } catch (error) {
      console.error("Aetheris Connection Error:", error);
      const errorMsg: ChatMessage = { role: 'model', text: "A temporal rift has interrupted our connection. Please try again later.", timestamp: Date.now() };
      onUpdateHistory([...newHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[100] w-full max-w-lg bg-zinc-950/95 border-l border-white/10 backdrop-blur-3xl shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-right duration-500">
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-cinzel font-bold text-white tracking-widest">AETHERIS</h2>
            <p className="text-[10px] text-indigo-400 uppercase tracking-[0.4em] font-bold">Multiverse Chronicler</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="font-cinzel text-xs tracking-[0.2em] uppercase">The archives await your inquiry.</p>
          </div>
        )}
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-zinc-900 border border-white/5 text-zinc-300 rounded-tl-none'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-white/5 p-4 rounded-3xl rounded-tl-none space-x-1 flex">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/10 bg-zinc-900/50">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Type your message..."
            className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-700 shadow-inner"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:scale-100 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
        <p className="mt-4 text-[8px] text-center text-zinc-600 uppercase tracking-widest">Powered by Aetheris Multiverse Intelligence</p>
      </div>
    </div>
  );
}
