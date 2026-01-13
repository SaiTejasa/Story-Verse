
import { UserProgress, ChatMessage } from '../types';

const STORAGE_KEY = 'st_universe_user_data';

const getOrGenerateUserId = (): string => {
  let userId = localStorage.getItem('st_universe_user_id');
  if (!userId) {
    userId = `st-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('st_universe_user_id', userId);
  }
  return userId;
};

export const getUserProgress = (): UserProgress => {
  const data = localStorage.getItem(STORAGE_KEY);
  const userId = getOrGenerateUserId();

  if (data) {
    const parsed = JSON.parse(data);
    return {
      userId,
      ...parsed,
      likes: new Set(parsed.likes || []),
      bookmarks: parsed.bookmarks || {},
      chatHistory: parsed.chatHistory || [],
    };
  }

  return {
    userId,
    lastStoryId: '',
    scrollPosition: 0,
    likes: new Set(),
    ratings: {},
    bookmarks: {},
    chatHistory: [],
  };
};

export const saveUserProgress = (progress: UserProgress) => {
  const data = {
    ...progress,
    likes: Array.from(progress.likes),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const syncEngagement = async (
  userId: string,
  storyId: string,
  type: 'like' | 'rating' | 'bookmark',
  value: any
) => {
  try {
    const response = await fetch('/.netlify/functions/engagement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, storyId, type, value, timestamp: Date.now() }),
    });
    
    if (!response.ok) {
      console.warn('[Sync] Failed to sync. Saving locally.');
    }
  } catch (error) {
    console.error('[Sync] Network error:', error);
  }
};
