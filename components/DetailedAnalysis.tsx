import React from 'react';
import { AnalysisReport } from '../types';

interface DetailedAnalysisProps {
  report: AnalysisReport;
}

const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ report }) => {
  return (
    <div className="space-y-10">
      {/* Trend Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        {/* Short Term */}
        <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-md relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700"></div>
          <h3 className="text-white font-black mb-6 text-sm md:text-base uppercase tracking-[0.2em] flex items-center gap-4">
             <div className="w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_12px_rgba(96,165,250,0.6)]"></div>
             Dự báo Ngắn hạn (1-3 Ngày)
          </h3>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap opacity-90 text-justify">
            {report.shortTermTrend}
          </p>
        </div>

        {/* Long Term */}
        <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-md relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700"></div>
          <h3 className="text-white font-black mb-6 text-sm md:text-base uppercase tracking-[0.2em] flex items-center gap-4">
             <div className="w-3 h-3 bg-purple-400 rounded-full shadow-[0_0_12px_rgba(192,132,252,0.6)]"></div>
             Dự báo Dài hạn (Tuần/Tháng)
          </h3>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap opacity-90 text-justify">
            {report.longTermTrend}
          </p>
        </div>
      </div>

      {/* Deep Dive Section */}
      <div className="bg-slate-800/40 p-10 md:p-14 rounded-3xl border border-slate-700/50 backdrop-blur-md relative shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-48 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
        <h3 className="text-white font-black mb-10 text-lg md:text-xl uppercase tracking-[0.3em] flex items-center justify-center gap-6">
           <span className="h-px w-12 bg-slate-700"></span>
           Phân tích Chuyên sâu Tổng hợp
           <span className="h-px w-12 bg-slate-700"></span>
        </h3>
        <div className="max-w-5xl mx-auto">
          <p className="text-slate-200 text-base md:text-lg leading-relaxed whitespace-pre-wrap text-justify opacity-95">
            {report.fullReport}
          </p>
        </div>
        
        {/* Decorative corner */}
        <div className="absolute bottom-6 right-8 text-slate-700 font-mono text-[10px] tracking-widest select-none font-black opacity-50 uppercase">
           GIA TERMINAL PROTOCOL // NGUỒN DỮ LIỆU: OANDA & GOOGLE FINANCE
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalysis;