
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
        return <strong key={i} className="font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const handleSend = async () => {
    const currentInput = input.trim();
    if (!currentInput || isLoading) return;

    // Use the environment variable directly as per guidelines
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === 'undefined') {
      const errM: ChatMessage = { 
        role: 'model', 
        text: "The terminal key is missing or invalid. Please ensure your API key is correctly configured in your environment variables.", 
        timestamp: Date.now() 
      };
      
      // Update local state to show error if necessary
      return;
    }

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

    const callAi = async (retryCount = 0): Promise<string> => {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const activeMessages = updatedChats.find(c => c.id === targetChatId)?.messages || [];
        
        // Prepare conversation history
        let historyParts = activeMessages.slice(-10).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

        // Gemini API Requirement: First message must be 'user'
        while (historyParts.length > 0 && historyParts[0].role !== 'user') {
          historyParts.shift();
        }

        if (historyParts.length === 0) {
           historyParts = [{ role: 'user', parts: [{ text: currentInput }] }];
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: historyParts,
          config: {
            systemInstruction: `# 🌌 AETHERIS – BEHAVIOUR PROTOCOL
You are Aetheris, an intelligent guide for the Sai Tejas multiverse.

## 1. CORE IDENTITY
- Friendly, conversational AI first.
- ONLY assist with storytelling and creative writing.
- Defaults: English, Switch to Hindi or Odia only if used by user.

## 2. CONVERSATION HANDLING
### Friendly Conversation
- Respond warmly and naturally to casual starts (hi, hello).
- Do not push features. Keep responses short and human-like.
- If user is unsure, gently ask what they want to do.

### Hindi / Odia
- Hindi: दोस्ताना और आसान जवाब दें। नियम ज़बरदस्ती न बताएं।
- Odia: ସହଜ ଏବଂ ବନ୍ଧୁତ୍ୱପୂର୍ଣ୍ଣ ଉତ୍ତର ଦିଅ। ନିୟମ ଜୋର କରି କହିବେ ନାହିଁ।

### Story Intent Confirmation
- If a story name/idea is mentioned casually, ask ONE clarification question: “Do you want to talk about it or write a story?”
- Hindi: “आप इसके बारे में बात करना चाहते हैं या कहानी लिखवानी है?”
- Odia: “ଆପଣ କଥା ହେବାକୁ ଚାହୁଁଛନ୍ତି କି କାହାଣୀ ଲେଖାଇବାକୁ?”

## 3. CORE RESTRICTIONS (MANDATORY)
Aetheris must NOT assist with:
- Programming, coding, algorithms, or technical tutorials.
- Solving math problems or academic/exam questions.
- Debugging software or writing scripts/logic.

### Refusal Behaviour
- Politely refuse non-story tasks.
- Example: “I’m built only for storytelling and creative writing, not for coding or programming.”
- Hindi: “मैं केवल कहानी और रचनात्मक लेखन के लिए बना हूँ, कोडिंग या प्रोग्रामिंग के लिए नहीं।”
- Odia: “ମୁଁ କେବଳ କାହାଣୀ ଓ ସୃଜନାତ୍ମକ ଲେଖନ ପାଇଁ ତିଆରି, କୋଡିଂ ବା ପ୍ରୋଗ୍ରାମିଂ ପାଇଁ ନୁହେଁ।”`,
            temperature: 0.7,
            topP: 0.8,
            topK: 40
          }
        });

        return response.text || "The archives are momentarily veiled.";
      } catch (error: any) {
        console.error(`Aetheris Connection Error (Attempt ${retryCount + 1}):`, error);
        
        if (error.message?.includes('API key not valid')) {
          return "The terminal reports an invalid key. Please verify the API key in your environment configuration.";
        }

        if (retryCount < 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return callAi(retryCount + 1);
        }
        throw error;
      }
    };

    try {
      const modelText = await callAi();
      const modelMsg: ChatMessage = { role: 'model', text: modelText, timestamp: Date.now() };
      
      const finalChats = updatedChats.map(c => {
        if (c.id === targetChatId) {
          return { ...c, messages: [...c.messages, modelMsg], updatedAt: Date.now() };
        }
        return c;
      });
      onUpdateChats(finalChats, targetChatId);
    } catch (error: any) {
      const errM: ChatMessage = { 
        role: 'model', 
        text: "A temporal flux has interrupted our link. This could be due to an invalid API key or network restrictions. Please check your local setup and try again.", 
        timestamp: Date.now() 
      };
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
    <div className="fixed inset-y-0 right-0 z-[100] w-full max-w-[100vw] lg:max-w-4xl bg-zinc-950 border-l border-white/10 shadow-2xl flex overflow-hidden animate-in slide-in-from-right duration-300 font-inter text-base">
      
      {/* Navigation Sidebar */}
      <div className={`w-72 md:w-80 bg-zinc-900/40 border-r border-white/10 flex flex-col transition-all duration-300 ${showHistory ? 'translate-x-0' : '-translate-x-full absolute pointer-events-none'}`}>
        <div className="p-6 space-y-4">
          <button 
            type="button"
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-3 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-cinzel font-bold text-sm tracking-widest shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>NEW CHAT</span>
          </button>
          
          <div className="relative">
            <input 
              ref={searchRef}
              type="text"
              placeholder="Search archives..."
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

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
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
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Terminal Connected</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12 no-scrollbar">
          {!currentChat || currentChat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20">
              <div className="w-20 h-20 border border-white/10 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <p className="font-cinzel text-xs tracking-[0.4em] uppercase max-w-[250px] leading-relaxed">The terminal awaits. Whisper your thoughts.</p>
            </div>
          ) : (
            currentChat.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-6 duration-500`}>
                <div className={`max-w-[90%] p-8 rounded-[3rem] shadow-2xl ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-zinc-900 border border-white/10 text-zinc-100 rounded-tl-none font-normal leading-relaxed'
                }`}>
                  <p className="text-lg whitespace-pre-wrap leading-relaxed break-words">{renderMessageText(msg.text)}</p>
                  <span className="text-[10px] opacity-30 mt-5 block text-right font-mono tracking-tighter uppercase font-bold">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 border border-white/10 p-8 rounded-[3rem] rounded-tl-none flex items-center space-x-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" />
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
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
                placeholder="Consult with Aetheris..."
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
              className="h-16 w-16 shrink-0 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all disabled:opacity-20 active:scale-90 shadow-xl"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
