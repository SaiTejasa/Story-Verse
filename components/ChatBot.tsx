
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage, ChatSession } from '../types';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatSession[];
  currentChatId: string;
  onUpdateChats: (chats: ChatSession[], currentId: string) => void;
}

export default function ChatBot({ isOpen, onClose, chats, currentChatId, onUpdateChats }: ChatBotProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistory, setShowHistory] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const currentChat = useMemo(() => 
    chats.find(c => c.id === currentChatId) || null, 
  [chats, currentChatId]);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    return chats.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [chats, searchQuery]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentChat?.messages, isOpen]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.ctrlKey && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        handleNewChat();
      }
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowHistory(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newChat: ChatSession = {
      id: newId,
      title: 'New Conversation',
      messages: [],
      updatedAt: Date.now()
    };
    onUpdateChats([newChat, ...chats], newId);
    setInput('');
    if (window.innerWidth < 1024) setShowHistory(false);
  };

  const handleSelectChat = (id: string) => {
    onUpdateChats(chats, id);
    if (window.innerWidth < 1024) setShowHistory(false);
  };

  const renderMessageText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const handleSend = async () => {
    const currentInput = input.trim();
    if (!currentInput || isLoading) return;

    let targetChatId = currentChatId;
    let currentChatsList = [...chats];

    if (!targetChatId) {
      const newId = `chat-${Date.now()}`;
      const newChat: ChatSession = {
        id: newId,
        title: currentInput.slice(0, 30),
        messages: [],
        updatedAt: Date.now()
      };
      currentChatsList = [newChat, ...currentChatsList];
      targetChatId = newId;
    }

    const userMsg: ChatMessage = { role: 'user', text: currentInput, timestamp: Date.now() };
    const updatedChats = currentChatsList.map(c => {
      if (c.id === targetChatId) {
        return {
          ...c,
          messages: [...c.messages, userMsg],
          updatedAt: Date.now(),
          title: c.messages.length === 0 ? currentInput.slice(0, 30) : c.title
        };
      }
      return c;
    });

    onUpdateChats(updatedChats, targetChatId);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const activeMessages = updatedChats.find(c => c.id === targetChatId)?.messages || [];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: activeMessages.slice(-20).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: `You are Aetheris, an intelligent guide. Respond in a friendly, conversational tone. Only use Story Mode if explicitly asked. Default to English.`,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      const modelText = response.text || "The archives are momentarily veiled.";
      const modelMsg: ChatMessage = { role: 'model', text: modelText, timestamp: Date.now() };
      
      const finalChats = updatedChats.map(c => {
        if (c.id === targetChatId) {
          return { ...c, messages: [...c.messages, modelMsg], updatedAt: Date.now() };
        }
        return c;
      });
      onUpdateChats(finalChats, targetChatId);
    } catch (error: any) {
      console.error("Aetheris Connection Error:", error);
      const errM: ChatMessage = { role: 'model', text: "A temporal flux has interrupted our link.", timestamp: Date.now() };
      const final = updatedChats.map(c => c.id === targetChatId ? { ...c, messages: [...c.messages, errM] } : c);
      onUpdateChats(final, targetChatId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[100] w-full max-w-[100vw] lg:max-w-4xl bg-zinc-950 border-l border-white/10 shadow-2xl flex overflow-hidden animate-in slide-in-from-right duration-300 font-inter">
      
      {/* Internal Navigation */}
      <div className={`w-72 md:w-80 bg-zinc-900/40 border-r border-white/10 flex flex-col transition-all duration-300 ${showHistory ? 'translate-x-0' : '-translate-x-full absolute pointer-events-none'}`}>
        <div className="p-6 space-y-4">
          <button 
            type="button"
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-3 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-cinzel font-bold text-sm tracking-widest"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>NEW CHAT</span>
          </button>
          
          <div className="relative">
            <input 
              ref={searchRef}
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-700"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 no-scrollbar">
          {filteredChats.map(chat => (
            <button
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={`w-full text-left p-4 rounded-xl transition-all border ${
                currentChatId === chat.id 
                  ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' 
                  : 'border-transparent text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
              }`}
            >
              <p className="text-sm font-semibold truncate leading-tight">{chat.title || 'Untitled Branch'}</p>
              <p className="text-[10px] opacity-40 mt-1 uppercase tracking-widest font-mono">{new Date(chat.updatedAt).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversation Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 text-zinc-500 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
            >
              <svg className={`w-6 h-6 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
            </button>
            <div>
              <h2 className="text-xl font-cinzel font-bold text-white uppercase tracking-widest leading-none">Aetheris</h2>
              <div className="flex items-center space-x-2 mt-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Terminal Online</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 no-scrollbar">
          {!currentChat || currentChat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20">
              <div className="w-20 h-20 border border-white/10 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <p className="font-cinzel text-xs tracking-[0.4em] uppercase max-w-[250px] leading-relaxed">The terminal awaits. Whispering the threads of reality.</p>
            </div>
          ) : (
            currentChat.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
                <div className={`max-w-[90%] p-6 rounded-[2rem] shadow-xl ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-zinc-900 border border-white/10 text-zinc-100 rounded-tl-none font-normal leading-relaxed'
                }`}>
                  <p className="text-base whitespace-pre-wrap">{renderMessageText(msg.text)}</p>
                  <span className="text-[10px] opacity-30 mt-4 block text-right font-mono tracking-tighter uppercase font-bold">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 border border-white/10 p-6 rounded-[2rem] rounded-tl-none flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" />
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 border-t border-white/10 bg-black/40">
          <div className="relative flex items-end space-x-4 max-w-full">
            <div className="flex-1 relative min-w-0">
              <textarea 
                ref={inputRef}
                rows={1}
                placeholder="Talk to Aetheris..."
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-5 px-6 text-base text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-700 font-inter resize-none max-h-48 no-scrollbar"
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={handleInputKeyDown}
              />
            </div>
            <button 
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="h-14 w-14 shrink-0 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all disabled:opacity-20 active:scale-90"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
