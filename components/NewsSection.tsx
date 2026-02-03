import React from 'react';
import { MarketNews } from '../types';
import { UI_LABELS } from '../utils/constants';
import LoadingIcon from './LoadingIcon';

interface NewsSectionProps {
  news: MarketNews[];
  isLoading?: boolean;
}

const NewsSection: React.FC<NewsSectionProps> = ({ news, isLoading }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GEOPOLITICAL': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'MACRO': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'GEOPOLITICAL': return UI_LABELS.CATEGORIES.GEOPOLITICAL;
      case 'MACRO': return UI_LABELS.CATEGORIES.MACRO;
      default: return UI_LABELS.CATEGORIES.MARKET;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800/50 pb-4">
        <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></div>
          Tin tức & Sự kiện Tâm điểm
        </h3>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-3 py-1 bg-slate-900/50 rounded-full border border-slate-800">
          Live Feed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.length > 0 ? (
          news.map((item, index) => (
            <div key={index} className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50 backdrop-blur-sm flex flex-col justify-between hover:border-slate-600/50 hover:bg-slate-800/40 transition-all group duration-300">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase border ${getCategoryColor(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">{item.timestamp}</span>
                </div>
                <h4 className="text-slate-200 font-bold text-base mb-3 group-hover:text-yellow-400 transition-colors leading-snug">
                  {item.title}
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 font-light">
                  {item.summary}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800/50 flex justify-between items-center">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{item.source}</span>
                <button className="text-[10px] text-blue-400 font-black uppercase tracking-widest hover:text-blue-300 transition-colors flex items-center gap-1 group/btn">
                  Chi tiết <span className="transform group-hover/btn:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600">
             {isLoading ? (
                <LoadingIcon size={40} className="mb-4 text-blue-500 opacity-50" />
             ) : (
                <svg className="w-12 h-12 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2v4a2 2 0 002 2h4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 13H8M16 17H8M10 9H8" />
                </svg>
             )}
             <p className="font-bold uppercase tracking-widest text-xs opacity-50">
                {isLoading ? 'Đang phân tích tin tức từ hệ thống...' : 'Không có dữ liệu tin tức.'}
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsSection;
