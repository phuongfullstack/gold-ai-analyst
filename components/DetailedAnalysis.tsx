import React from 'react';
import { AnalysisReport } from '../types';

interface DetailedAnalysisProps {
  report: AnalysisReport;
}

const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ report }) => {
  return (
    <div className="space-y-8">
      {/* Trend Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Short Term */}
        <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800/50 backdrop-blur-md relative overflow-hidden group shadow-lg hover:shadow-xl transition-all hover:border-slate-700/50">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-blue-500/10 transition-colors duration-700"></div>
          <h3 className="text-slate-200 font-bold mb-6 text-xs uppercase tracking-[0.2em] flex items-center gap-3">
             <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
             Dự báo Ngắn hạn (1-3 Ngày)
          </h3>
          <p className="text-slate-300 text-sm md:text-base leading-loose whitespace-pre-wrap text-justify font-light">
            {report.shortTermTrend}
          </p>
        </div>

        {/* Long Term */}
        <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800/50 backdrop-blur-md relative overflow-hidden group shadow-lg hover:shadow-xl transition-all hover:border-slate-700/50">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-purple-500/10 transition-colors duration-700"></div>
          <h3 className="text-slate-200 font-bold mb-6 text-xs uppercase tracking-[0.2em] flex items-center gap-3">
             <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
             Dự báo Dài hạn (Tuần/Tháng)
          </h3>
          <p className="text-slate-300 text-sm md:text-base leading-loose whitespace-pre-wrap text-justify font-light">
            {report.longTermTrend}
          </p>
        </div>
      </div>

      {/* Deep Dive Section */}
      <div className="bg-slate-900/40 p-10 md:p-14 rounded-3xl border border-slate-800/50 backdrop-blur-md relative shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-30"></div>

        <div className="flex flex-col items-center mb-10">
           <h3 className="text-white font-black text-xl uppercase tracking-[0.3em] mb-2 text-center">
             Phân tích Chuyên sâu
           </h3>
           <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-loose text-justify font-light">
            {report.fullReport.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
            ))}
          </div>
        </div>
        
        {/* Decorative footer in card */}
        <div className="mt-12 pt-6 border-t border-slate-800/50 flex justify-between items-center opacity-50">
           <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">GMA Intelligence Protocol</span>
           <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">End of Report</span>
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalysis;
