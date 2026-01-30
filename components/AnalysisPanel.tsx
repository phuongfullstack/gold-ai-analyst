import React from 'react';
import { AnalysisReport } from '../types';

interface AnalysisPanelProps {
  report: AnalysisReport;
  isLoading: boolean;
  onRefresh: () => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ report, isLoading, onRefresh }) => {
  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col h-full shadow-2xl">
      <div className="p-4 md:p-6 border-b border-slate-700/50 flex flex-wrap justify-between items-center bg-slate-800/80 gap-3">
        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-3">
          <span className="text-2xl">🤖</span> AI Analyst
        </h2>
        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className={`px-3 py-2 md:px-5 md:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs md:text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <span>Refresh</span>
            </>
          )}
        </button>
      </div>
      
      <div className="p-4 md:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
        {/* Signal Status */}
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/30 flex items-center justify-between">
             <div className="text-[10px] md:text-xs text-slate-400 font-black uppercase tracking-widest">Tín hiệu Giao dịch</div>
             <div className={`px-4 py-1.5 rounded-lg font-black text-xs md:text-sm shadow-inner ${
                report.tradingAction === 'MUA' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                report.tradingAction === 'BÁN' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' :
                report.tradingAction === 'CẢNH BÁO' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
                'bg-slate-500/20 text-slate-400 border border-slate-500/50'
             }`}>
                {report.tradingAction}
             </div>
        </div>

        {/* High-level Highlights */}
        <div className="space-y-4">
            <div className="bg-gradient-to-r from-violet-600/10 to-transparent p-4 rounded-xl border-l-4 border-violet-500">
                <h4 className="text-violet-400 font-black mb-1 text-[10px] uppercase tracking-widest">Dự báo 24h</h4>
                <p className="text-white font-bold text-sm leading-tight">{report.prediction}</p>
            </div>
            <div className="bg-gradient-to-r from-teal-600/10 to-transparent p-4 rounded-xl border-l-4 border-teal-500">
                <h4 className="text-teal-400 font-black mb-1 text-[10px] uppercase tracking-widest">Vùng Gom Hàng</h4>
                <p className="text-white font-bold text-sm leading-tight">{report.suggestedBuyZone}</p>
            </div>
        </div>

        {/* 3 Pillar Summary */}
        <div className="space-y-4">
          <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/20">
            <h4 className="text-sky-400 font-black mb-2 text-[9px] uppercase tracking-widest">Phân tích Kỹ thuật</h4>
            <p className="text-slate-300 text-xs leading-relaxed">{report.technicalSummary}</p>
          </div>
          <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/20">
            <h4 className="text-indigo-400 font-black mb-2 text-[9px] uppercase tracking-widest">Vĩ mô & DXY</h4>
            <p className="text-slate-300 text-xs leading-relaxed">{report.macroSummary}</p>
          </div>
          <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/20">
            <h4 className="text-yellow-500 font-black mb-2 text-[9px] uppercase tracking-widest">Thị trường Nội địa</h4>
            <p className="text-slate-300 text-xs leading-relaxed">{report.localSpreadAnalysis}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;