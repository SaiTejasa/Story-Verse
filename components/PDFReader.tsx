
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Story } from '../types';

interface PDFReaderProps {
  story: Story;
  zoom: number;
  setZoom: (val: number | ((prev: number) => number)) => void;
  theme: 'night' | 'parchment';
  setTheme: (val: 'night' | 'parchment') => void;
  onScroll?: (pos: number) => void;
  initialScroll?: number;
  isLiked: boolean;
  onLike: () => void;
  rating: number;
  onRate: (score: number) => void;
  bookmarks: number[];
  onToggleBookmark: (pageNum: number) => void;
}

const PageCanvas: React.FC<{ 
  pageNum: number; 
  renderPage: (n: number, c: HTMLCanvasElement) => Promise<void>; 
  theme: 'night' | 'parchment';
  isBookmarked: boolean;
  onToggleBookmark: (n: number) => void;
}> = ({ pageNum, renderPage, theme, isBookmarked, onToggleBookmark }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '1000px' });
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && canvasRef.current) {
      renderPage(pageNum, canvasRef.current);
    }
  }, [isVisible, renderPage, pageNum]);

  return (
    <div 
      id={`pdf-page-${pageNum}`}
      data-page={pageNum}
      className="pdf-page-wrapper flex flex-col items-center mb-16 relative group"
    >
      <button 
        onClick={() => onToggleBookmark(pageNum)}
        className={`absolute -right-4 top-0 p-3 transition-all duration-300 pointer-events-auto z-20 ${isBookmarked ? 'text-indigo-500 scale-110' : 'text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-zinc-400'}`}
        title={isBookmarked ? "Remove Bookmark" : "Bookmark Page"}
      >
        <svg className={`w-6 h-6 ${isBookmarked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>

      <canvas 
        ref={canvasRef} 
        className={`pdf-page-canvas transition-all duration-700 shadow-2xl rounded-sm ${theme === 'parchment' ? 'shadow-amber-900/20' : 'shadow-black'}`}
        style={{ minHeight: '600px', width: 'auto' }}
      />
      <div className={`mt-4 font-mono text-[10px] tracking-widest ${theme === 'parchment' ? 'text-zinc-500' : 'text-zinc-600'}`}>PAGE {pageNum}</div>
    </div>
  );
};

export default function PDFReader({ 
  story, zoom, setZoom, theme, setTheme,
  isLiked, onLike, rating, onRate, bookmarks, onToggleBookmark
}: PDFReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [loading, setLoading] = useState(true);
  const [renderMode, setRenderMode] = useState<'canvas' | 'iframe'>('canvas');
  const [showBookmarks, setShowBookmarks] = useState(false);
  const pdfInstance = useRef<any>(null);

  const driveInfo = React.useMemo(() => {
    const idMatch = story.path.match(/id=([a-zA-Z0-9_-]+)/) || story.path.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const id = idMatch ? idMatch[1] : null;
    return {
      downloadUrl: id ? `https://drive.google.com/uc?export=download&id=${id}` : story.path,
      previewUrl: id ? `https://drive.google.com/file/d/${id}/preview` : story.path
    };
  }, [story.path]);

  const renderPage = useCallback(async (pageNum: number, canvas: HTMLCanvasElement) => {
    if (!pdfInstance.current) return;
    try {
      const page = await pdfInstance.current.getPage(pageNum);
      const viewport = page.getViewport({ scale: zoom });
      const context = canvas.getContext('2d');
      if (!context) return;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderContext = { canvasContext: context, viewport: viewport };
      await page.render(renderContext).promise;
    } catch (err) { console.error(err); }
  }, [zoom]);

  const goToPage = (pageNum: number) => {
    const el = document.getElementById(`pdf-page-${pageNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setShowBookmarks(false);
  };

  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true);
      // For local development or restricted CORS, iframe is much safer
      try {
        const response = await fetch(driveInfo.downloadUrl, { mode: 'cors' });
        if (!response.ok) throw new Error('CORS or network error');
        
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const loadingTask = (window as any).pdfjsLib.getDocument({ 
          data: new Uint8Array(arrayBuffer),
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        });
        const pdf = await loadingTask.promise;
        pdfInstance.current = pdf;
        setNumPages(pdf.numPages);
        setRenderMode('canvas');
      } catch (err) {
        console.warn('Falling back to iframe preview for Drive file:', err);
        setRenderMode('iframe');
      } finally {
        setLoading(false);
      }
    };
    loadPdf();
  }, [driveInfo.downloadUrl]);

  useEffect(() => {
    if (renderMode !== 'canvas' || loading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const pageNum = parseInt(entry.target.getAttribute('data-page') || '1');
          setCurrentPage(pageNum);
          setPageInput(pageNum.toString());
        }
      });
    }, { root: containerRef.current, threshold: 0.5 });
    document.querySelectorAll('.pdf-page-wrapper').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [renderMode, loading]);

  return (
    <div ref={containerRef} className={`flex-1 overflow-y-auto relative flex flex-col items-center transition-colors duration-700 select-none ${theme === 'parchment' ? 'bg-[#f4eccf] parchment-mode' : 'bg-zinc-950'}`}>
      
      {showBookmarks && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-6 bg-black/40 backdrop-blur-sm" onClick={() => setShowBookmarks(false)}>
          <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-cinzel text-sm font-bold tracking-widest text-zinc-300">BOOKMARKS</h3>
              <button onClick={() => setShowBookmarks(false)} className="text-zinc-500 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 no-scrollbar">
              {bookmarks.length > 0 ? bookmarks.sort((a,b)=>a-b).map(p => (
                <button key={p} onClick={() => goToPage(p)} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                  <span className="text-xs font-mono text-zinc-400">PAGE {p}</span>
                  <svg className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              )) : <p className="text-center py-8 text-zinc-600 text-[10px] uppercase tracking-widest">No bookmarks yet</p>}
            </div>
          </div>
        </div>
      )}

      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] flex items-center bg-black/85 backdrop-blur-3xl border border-white/10 rounded-2xl p-1 shadow-2xl ring-1 ring-white/10 max-w-[95vw] overflow-x-auto no-scrollbar transition-all duration-500`}>
        {renderMode === 'canvas' && !loading && (
          <div className="flex items-center">
             <div className="flex items-center px-4 border-r border-white/10 space-x-2">
              <input 
                type="text" value={pageInput} 
                onChange={e => setPageInput(e.target.value)}
                onBlur={() => goToPage(parseInt(pageInput))}
                className="w-10 bg-zinc-800/50 border border-white/10 rounded text-center text-xs font-mono text-white py-1 focus:outline-none"
              />
              <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap">of {numPages}</span>
            </div>
            
            <button 
              onClick={() => setShowBookmarks(!showBookmarks)}
              className={`p-2 px-4 rounded-xl flex items-center space-x-2 transition-all border-r border-white/10 ${bookmarks.length > 0 ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              <span className="text-[10px] font-bold font-cinzel tracking-widest uppercase">Marks</span>
            </button>
          </div>
        )}

        <div className="flex items-center space-x-1 px-2 border-r border-white/10">
          <button onClick={() => setTheme(theme === 'night' ? 'parchment' : 'night')} className="p-2 text-zinc-400 hover:text-white" title="Toggle Theme"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg></button>
          <button onClick={onLike} className={`p-2 ${isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-white'}`} title="Like Story"><svg className={`w-4 h-4 ${isLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></button>
        </div>
        
        <div className="flex items-center space-x-0.5 px-3">
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => onRate(s)} className={`${s <= rating ? 'text-yellow-400' : 'text-zinc-700'}`} title={`Rate ${s} Stars`}><svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></button>
          ))}
        </div>
      </div>

      <div className={`w-full max-w-4xl py-32 space-y-4 px-4`}>
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="w-16 h-16 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="font-cinzel text-xs tracking-[0.3em] text-zinc-500 uppercase">Manifesting Narrative...</p>
          </div>
        ) : renderMode === 'iframe' ? (
          <div className="w-full h-[80vh] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <iframe 
              src={driveInfo.previewUrl} 
              title="PDF Preview" 
              className="w-full h-full bg-white" 
              allow="autoplay; encrypted-media" 
            />
          </div>
        ) : (
          <div>
            <div className="mb-24 text-center">
              <h1 className={`text-4xl md:text-7xl font-cinzel mb-6 tracking-tight ${theme === 'parchment' ? 'text-zinc-900' : 'text-white'}`}>{story.title}</h1>
              <div className={`h-0.5 w-32 mx-auto opacity-30 ${theme === 'parchment' ? 'bg-zinc-800' : 'bg-zinc-600'}`}></div>
            </div>
            {Array.from({ length: numPages }, (_, i) => (
              <PageCanvas 
                key={i + 1} 
                pageNum={i + 1} 
                renderPage={renderPage} 
                theme={theme} 
                isBookmarked={bookmarks.includes(i + 1)}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
