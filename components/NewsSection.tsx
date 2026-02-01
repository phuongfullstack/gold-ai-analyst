import React from 'react';
import { MarketNews } from '../types';
import { UI_LABELS } from '../utils/constants';

interface NewsSectionProps {
  news: MarketNews[];
}

const NewsSection: React.FC<NewsSectionProps> = ({ news }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GEOPOLITICAL': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'MACRO': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] flex items-center gap-3">
          <div className="w-1.5 h-6 bg-yellow-500 rounded-full"></div>
          Tin tức & Sự kiện Tâm điểm
        </h3>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
          Cập nhật Real-time
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.length > 0 ? (
          news.map((item, index) => (
            <div key={index} className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-md flex flex-col justify-between hover:border-slate-500 transition-all group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getCategoryColor(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">{item.timestamp}</span>
                </div>
                <h4 className="text-white font-bold text-base mb-3 group-hover:text-yellow-500 transition-colors leading-tight">
                  {item.title}
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold italic">Nguồn: {item.source}</span>
                <button className="text-[10px] text-blue-400 font-black uppercase tracking-widest hover:text-blue-300 transition-colors">
                  Chi tiết →
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600">
             <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2v4a2 2 0 002 2h4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 13H8M16 17H8M10 9H8" />
             </svg>
             <p className="font-bold uppercase tracking-widest text-xs">Đang tổng hợp tin tức thị trường...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsSection;
