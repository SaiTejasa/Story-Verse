
import React from 'react';

interface EngagementProps {
  isLiked: boolean;
  onLike: () => void;
  rating: number;
  onRate: (score: number) => void;
  accentColor: string;
}

const Engagement: React.FC<EngagementProps> = ({ isLiked, onLike, rating, onRate, accentColor }) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-full px-6 py-3 shadow-2xl space-x-6">
      <div className="flex items-center space-x-2">
        <button 
          onClick={onLike}
          className={`group transition-transform active:scale-90 ${isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-white'}`}
        >
          <svg className={`w-6 h-6 ${isLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Endorse</span>
      </div>

      <div className="w-px h-6 bg-zinc-800"></div>

      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => onRate(star)}
              className={`transition-colors ${star <= rating ? 'text-yellow-400' : 'text-zinc-700 hover:text-zinc-500'}`}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Rate</span>
      </div>
    </div>
  );
};

export default Engagement;
