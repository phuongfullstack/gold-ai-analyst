import React from 'react';
import { AnalysisReport, MarketData } from '../types';
import { UI_LABELS } from '../utils/constants';

interface MarketSnapshotProps {
  report: AnalysisReport;
  marketData: MarketData;
}

const MarketSnapshot: React.FC<MarketSnapshotProps> = ({ report, marketData }) => {
  const { technicalSignals } = report;
  
  // Logic to determine market sentiment using unified algorithmic score
  const getSentiment = () => {
    const confidence = technicalSignals.confidenceScore;

    if (confidence) {
       const { label } = confidence;
       if (label.includes('TÍCH CỰC') || label.includes('BULLISH')) return { label, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: '🚀', bar: 'bg-emerald-500' };
       if (label.includes('TIÊU CỰC') || label.includes('BEARISH')) return { label, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: '📉', bar: 'bg-rose-500' };
    }

    return { label: UI_LABELS.TREND.NEUTRAL, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: '⚖️', bar: 'bg-yellow-500' };
  };

  const sentiment = getSentiment();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
      {/* Sentiment Box */}
      <div className={`p-6 rounded-3xl border ${sentiment.bg} flex items-center gap-6 shadow-xl backdrop-blur-sm relative overflow-hidden`}>
        <div className={`absolute inset-0 opacity-10 blur-xl ${sentiment.bg.replace('border', 'bg')}`}></div>
        <div className="text-4xl relative z-10 filter drop-shadow-lg">{sentiment.icon}</div>
        <div className="flex-1 relative z-10">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Market Sentiment</div>
          <div className={`text-2xl font-black ${sentiment.color} tracking-tight flex items-center gap-3`}>
            {sentiment.label}
            {technicalSignals.confidenceScore && (
              <span className="text-xs text-white bg-white/10 px-2 py-0.5 rounded border border-white/10 font-mono font-bold">{technicalSignals.confidenceScore.score}%</span>
            )}
          </div>
          {technicalSignals.confidenceScore && (
             <div className="mt-3 w-full h-2 bg-slate-900/50 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-1000 shadow-lg ${sentiment.bar}`}
                  style={{ width: `${technicalSignals.confidenceScore.score}%` }}
                ></div>
             </div>
          )}
          <div className="text-[9px] text-slate-500 font-medium mt-2 uppercase tracking-widest flex items-center gap-1">
             <span className="w-1 h-1 bg-slate-500 rounded-full"></span> Multi-frame Analysis
          </div>
        </div>
      </div>

      {/* Market Pulse Quick Info */}
      <div className="lg:col-span-2 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>

        <div className="flex-1 min-w-[200px] relative z-10">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
             <span className="text-blue-500">●</span> Tactical Observation
          </div>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-xs md:text-sm text-slate-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              {technicalSignals.adx > 25 ? 'Trend Strength: STRONG' : 'Trend Strength: RANGING / WEAK'}
            </li>
            <li className="flex items-center gap-3 text-xs md:text-sm text-slate-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              Distance to Support: <span className="text-emerald-400 font-bold font-mono">${(marketData.xauPrice - technicalSignals.support).toFixed(1)}</span>
            </li>
          </ul>
        </div>
        
        <div className="flex gap-8 relative z-10 border-l border-slate-800/50 pl-8">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Volatility (ATR)</div>
            <div className="text-lg font-black text-white tracking-tight">MEDIUM</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Risk (Spread)</div>
            <div className={`text-lg font-black tracking-tight ${marketData.spread > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {marketData.spread > 5 ? 'HIGH' : 'LOW'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketSnapshot;
