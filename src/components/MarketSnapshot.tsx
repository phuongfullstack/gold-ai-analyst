import React from 'react';
import { AnalysisReport, MarketData } from '../types';

interface MarketSnapshotProps {
  report: AnalysisReport;
  marketData: MarketData;
}

const MarketSnapshot: React.FC<MarketSnapshotProps> = ({ report, marketData }) => {
  const { technicalSignals } = report;
  
  // Logic to determine market sentiment
  const getSentiment = () => {
    let score = 0;
    if (technicalSignals.rsi > 60) score += 1;
    if (technicalSignals.rsi < 40) score -= 1;
    if (technicalSignals.ma50 === 'ABOVE') score += 1;
    if (technicalSignals.ma200 === 'ABOVE') score += 1;
    if (technicalSignals.adx > 25) score *= 1.2; // Trend is strong

    if (score > 1.5) return { label: 'BULLISH', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: '🚀' };
    if (score < -1) return { label: 'BEARISH', color: 'text-rose-400', bg: 'bg-rose-500/10', icon: '📉' };
    return { label: 'NEUTRAL', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: '⚖️' };
  };

  const sentiment = getSentiment();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
      {/* Sentiment Box */}
      <div className={`p-6 rounded-3xl border border-slate-700/50 ${sentiment.bg} flex items-center gap-6 shadow-xl`}>
        <div className="text-4xl">{sentiment.icon}</div>
        <div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tâm lý Thị trường</div>
          <div className={`text-2xl font-black ${sentiment.color} tracking-tighter`}>{sentiment.label}</div>
          <div className="text-xs text-slate-400 font-medium">Dựa trên hội tụ kỹ thuật đa khung</div>
        </div>
      </div>

      {/* Market Pulse Quick Info */}
      <div className="lg:col-span-2 bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-6 shadow-xl">
        <div className="flex-1 min-w-[200px]">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Quan sát Chiến thuật</div>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-xs md:text-sm text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              {technicalSignals.adx > 25 ? 'Xu hướng đang mạnh dần' : 'Thị trường đang tích lũy đi ngang'}
            </li>
            <li className="flex items-center gap-2 text-xs md:text-sm text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Vàng đang cách hỗ trợ mạnh nhất: <span className="text-emerald-400 font-bold">${(marketData.xauPrice - technicalSignals.support).toFixed(1)}</span>
            </li>
          </ul>
        </div>
        
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Biến động (ATR)</div>
            <div className="text-lg font-black text-white">MEDIUM</div>
          </div>
          <div className="w-px h-10 bg-slate-700"></div>
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Rủi ro (Spread)</div>
            <div className={`text-lg font-black ${marketData.spread > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {marketData.spread > 5 ? 'CAO' : 'THẤP'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketSnapshot;