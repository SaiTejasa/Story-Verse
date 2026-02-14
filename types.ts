
export type UniverseID = 'agnitech' | 'legend' | 'ssu';

export interface Story {
  id: string;
  title: string;
  path: string;
  universe: UniverseID;
  series?: string;
  season?: string;
  order: number;
}

export interface Season {
  name: string;
  stories: Story[];
}

export interface Series {
  name: string;
  seasons: Season[];
}

export interface Universe {
  id: UniverseID;
  name: string;
  description?: string;
  color: string;
  accent: string;
  series: Series[];
  standaloneStories?: Story[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

export interface UserProgress {
  userId: string;
  lastStoryId: string;
  scrollPosition: number;
  likes: Set<string>;
  ratings: Record<string, number>;
  bookmarks: Record<string, number[]>;
  chats: ChatSession[];
  currentChatId: string;
}
