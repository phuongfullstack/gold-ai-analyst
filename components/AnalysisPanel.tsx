import React from 'react';
import { AnalysisReport } from '../types';

interface AnalysisPanelProps {
  report: AnalysisReport;
  isLoading: boolean;
  onRefresh: () => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ report, isLoading, onRefresh }) => {
  return (
    <div className="bg-slate-900/40 rounded-2xl border border-slate-800/50 backdrop-blur-sm overflow-hidden flex flex-col h-full shadow-2xl relative">
      {/* Header */}
      <div className="p-5 border-b border-slate-800/50 flex flex-wrap justify-between items-center bg-slate-900/40 gap-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </span>
          Hệ thống Phân tích
        </h2>
        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className={`px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-2 border border-slate-700 hover:border-slate-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          )}
          <span>Refresh</span>
        </button>
      </div>
      
      <div className="p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
        {/* Signal Status - Prominent */}
        <div className="relative group">
           <div className={`absolute inset-0 bg-gradient-to-r blur-xl opacity-20 transition-opacity duration-500 ${
              report.tradingAction === 'MUA' ? 'from-emerald-600 to-teal-600' :
              report.tradingAction === 'BÁN' ? 'from-rose-600 to-red-600' :
              'from-orange-600 to-amber-600'
           }`}></div>

           <div className="relative bg-slate-900/60 p-5 rounded-xl border border-white/5 flex flex-col items-center text-center backdrop-blur-md">
             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">Tín hiệu Tổng hợp</div>
             <div className={`text-3xl font-black tracking-tight mb-1 ${
                report.tradingAction === 'MUA' ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]' :
                report.tradingAction === 'BÁN' ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.5)]' :
                'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]'
             }`}>
                {report.tradingAction}
             </div>
             <div className="text-xs text-slate-500 font-medium">Độ tin cậy: Cao</div>
           </div>
        </div>

        {/* Forecasts */}
        <div className="grid grid-cols-1 gap-4">
            <div className="bg-slate-800/30 p-4 rounded-xl border border-violet-500/20 hover:bg-slate-800/50 transition-colors">
                <h4 className="text-violet-400 font-bold mb-2 text-[10px] uppercase tracking-widest flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span> Dự báo 24h
                </h4>
                <p className="text-slate-200 font-medium text-sm leading-relaxed">{report.prediction}</p>
            </div>
            <div className="bg-slate-800/30 p-4 rounded-xl border border-teal-500/20 hover:bg-slate-800/50 transition-colors">
                <h4 className="text-teal-400 font-bold mb-2 text-[10px] uppercase tracking-widest flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Vùng Gom Hàng
                </h4>
                <p className="text-slate-200 font-medium text-sm leading-relaxed">{report.suggestedBuyZone}</p>
            </div>
        </div>

        {/* Analysis Pillars */}
        <div className="space-y-4">
          <div className="bg-slate-900/20 p-4 rounded-xl border border-slate-800/50">
            <h4 className="text-sky-400 font-bold mb-2 text-[10px] uppercase tracking-widest">Phân tích Kỹ thuật</h4>
            <div className="text-slate-400 text-xs leading-relaxed space-y-2 whitespace-pre-wrap">
              {report.technicalSummary}
            </div>
          </div>
          <div className="bg-slate-900/20 p-4 rounded-xl border border-slate-800/50">
            <h4 className="text-indigo-400 font-bold mb-2 text-[10px] uppercase tracking-widest">Vĩ mô & DXY</h4>
            <div className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap">{report.macroSummary}</div>
          </div>
          <div className="bg-slate-900/20 p-4 rounded-xl border border-slate-800/50">
            <h4 className="text-yellow-500 font-bold mb-2 text-[10px] uppercase tracking-widest">Thị trường Nội địa</h4>
            <div className="text-slate-400 text-xs leading-relaxed space-y-2 whitespace-pre-wrap">
              {report.localSpreadAnalysis}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
