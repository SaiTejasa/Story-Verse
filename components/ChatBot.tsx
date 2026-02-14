
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
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  
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
  }, [isOpen, chats]);

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
    if (window.innerWidth < 768) setShowHistory(false);
  };

  const handleSelectChat = (id: string) => {
    onUpdateChats(chats, id);
    if (window.innerWidth < 768) setShowHistory(false);
  };

  const handleDeleteChat = (id: string) => {
    if (confirm("Permanently erase this narrative branch?")) {
      const updated = chats.filter(c => c.id !== id);
      const nextId = updated.length > 0 ? updated[0].id : '';
      onUpdateChats(updated, nextId);
      setMenuOpenId(null);
    }
  };

  const handleRenameChat = (id: string) => {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;
    const newTitle = prompt("Enter new title for this archive:", chat.title);
    if (newTitle && newTitle.trim()) {
      const updated = chats.map(c => c.id === id ? { ...c, title: newTitle.trim() } : c);
      onUpdateChats(updated, currentChatId);
    }
    setMenuOpenId(null);
  };

  const renderMessageText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{part.slice(2, -2)}</strong>;
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
          systemInstruction: `# 🌌 AETHERIS – FINAL PUBLIC BEHAVIOUR PROMPT

## 🧠 Core Identity (ENGLISH)
You are **Aetheris**, a friendly and intelligent AI. You help with: Casual conversation, Creative thinking, and Story writing (only when requested).
You are **not** only a story-writing machine. You behave like a **normal, polite conversational AI first**, and a **story assistant second**.

## 🗣️ Conversation First Rule (VERY IMPORTANT)
If users say things like: “hi”, “hello”, “hey”, “wassup”, “how are you”
👉 **You MUST reply normally**, like a human-friendly AI.
❌ DO NOT ask story-related questions. ❌ DO NOT mention word count. ❌ DO NOT show any story checklist.

## 🚨 Story Mode Trigger (STRICT RULE)
Only enter Story Mode if the user clearly asks to write/create/continue a story or mentions a specific story universe name.
👉 **Only then** you activate story-related questions.

## ✍️ Story Creation Protocol (ONLY WHEN TRIGGERED)
1. Word count (mandatory) 2. Type 3. Universe name 4. Characters 5. Tone

## 🌐 Language Rule
Default: Simple English. Switch to Hindi or Odia **only if the user starts using them**.

## 🇮🇳 पहचान (HINDI)
आप **Aetheris** हैं — एक दोस्ताना AI। पहले सामान्य बातचीत, बाद में कहानी-लेखन।

## 🌾 ପରିଚୟ (ODIA)
ତୁମେ **Aetheris** — ଏକ ସହଜ, ବନ୍ଧୁତ୍ୱପୂର୍ଣ୍ଣ AI। ପ୍ରଥମେ ସାଧାରଣ କଥାବାର୍ତ୍ତା।`,
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
    <div className="fixed inset-y-0 right-0 z-[100] w-full max-w-4xl bg-zinc-950 border-l border-white/10 shadow-[-20px_0_100px_rgba(0,0,0,0.8)] flex overflow-hidden animate-in slide-in-from-right duration-500 font-inter">
      
      {/* Internal Sidebar */}
      <div className={`w-80 bg-zinc-900/40 border-r border-white/10 flex flex-col transition-all duration-300 ${showHistory ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 absolute z-[-1]'}`}>
        <div className="p-6 space-y-4">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-3 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg active:scale-95 group"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span className="text-xs font-cinzel font-bold tracking-widest">NEW NARRATIVE</span>
          </button>
          
          <div className="relative">
            <input 
              ref={searchRef}
              type="text"
              placeholder="Filter archives... (Ctrl+K)"
              className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-[10px] text-zinc-400 focus:outline-none focus:border-indigo-500 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 no-scrollbar">
          <p className="px-4 py-2 text-[8px] text-zinc-600 font-bold tracking-[0.3em] uppercase">Archive Entries</p>
          {filteredChats.map(chat => (
            <div key={chat.id} className="relative group/item">
              <button
                onClick={() => handleSelectChat(chat.id)}
                className={`w-full text-left p-4 pr-10 rounded-2xl transition-all border ${
                  currentChatId === chat.id 
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' 
                    : 'border-transparent text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                }`}
              >
                <p className="text-[11px] font-medium truncate">{chat.title || 'Untitled Branch'}</p>
                <p className="text-[8px] opacity-40 mt-1 uppercase tracking-wider">{new Date(chat.updatedAt).toLocaleDateString()}</p>
              </button>
              
              <div className="absolute right-3 top-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === chat.id ? null : chat.id); }}
                  className="p-1 text-zinc-600 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 2a2 2 0 110 4 2 2 0 010-4zm0 6a2 2 0 110 4 2 2 0 010-4z" /></svg>
                </button>
                
                {menuOpenId === chat.id && (
                  <div className="absolute right-0 top-full mt-1 z-[110] bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[120px]">
                    <button onClick={() => handleRenameChat(chat.id)} className="w-full text-left px-4 py-2 text-[10px] text-zinc-300 hover:bg-indigo-600 hover:text-white transition-colors">Rename</button>
                    <button onClick={() => handleDeleteChat(chat.id)} className="w-full text-left px-4 py-2 text-[10px] text-red-400 hover:bg-red-600 hover:text-white transition-colors">Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950/50 backdrop-blur-3xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <svg className={`w-6 h-6 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
            </button>
            <div>
              <h2 className="text-xl font-cinzel font-bold text-white uppercase tracking-widest">Aetheris</h2>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Synchronized</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 text-zinc-500 hover:text-white transition-colors rounded-xl hover:bg-white/5">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
          {!currentChat || currentChat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
              <div className="w-20 h-20 border border-white/10 rounded-full flex items-center justify-center animate-[pulse_4s_infinite]">
                <svg className="w-10 h-10 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <p className="font-cinzel text-[10px] tracking-[0.4em] uppercase max-w-[200px]">The guide awaits.</p>
            </div>
          ) : (
            currentChat.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <div className={`max-w-[85%] p-6 rounded-[2rem] shadow-2xl ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-zinc-900/60 border border-white/10 text-zinc-300 rounded-tl-none font-light leading-relaxed'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{renderMessageText(msg.text)}</p>
                  <span className="text-[8px] opacity-20 mt-3 block text-right font-mono tracking-tighter">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-900/60 border border-white/5 p-6 rounded-[2rem] rounded-tl-none flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-white/5 bg-black/40 group/footer">
          <div className="relative flex items-end space-x-4">
            <div className="flex-1 relative">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
              <textarea 
                ref={inputRef}
                rows={1}
                placeholder="Talk to Aetheris..."
                className="relative w-full bg-zinc-950 border border-white/10 rounded-2xl py-5 pl-7 pr-7 text-sm text-white focus:outline-none focus:border-indigo-500/40 transition-all placeholder:text-zinc-700 font-inter resize-none max-h-40 no-scrollbar"
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
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="h-14 w-14 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all disabled:opacity-20 active:scale-90 shadow-xl shadow-indigo-600/20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            </button>
          </div>
          
          <div className="mt-6 flex items-center justify-center space-x-6 opacity-0 group-hover/footer:opacity-30 transition-opacity duration-500">
             <span className="text-[7px] text-zinc-500 uppercase tracking-[0.4em] font-bold">Shift+Enter: New Line</span>
             <span className="text-[7px] text-zinc-500 uppercase tracking-[0.4em] font-bold">Ctrl+Shift+O: New Chat</span>
             <span className="text-[7px] text-zinc-500 uppercase tracking-[0.4em] font-bold">Ctrl+K: Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
