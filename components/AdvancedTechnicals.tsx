import React, { useState } from 'react';
import { TechnicalSignals, PivotLevelSet } from '../types';

interface AdvancedTechnicalsProps {
  signals: TechnicalSignals;
}

type PivotType = 'classic' | 'woodie' | 'camarilla' | 'fibonacci';

const AdvancedTechnicals: React.FC<AdvancedTechnicalsProps> = ({ signals }) => {
  const [activePivot, setActivePivot] = useState<PivotType>('classic');

  const getOscillatorColor = (value: number, type: 'rsi' | 'stoch') => {
    if (value > (type === 'rsi' ? 70 : 80)) return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]';
    if (value < (type === 'rsi' ? 30 : 20)) return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
    return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]';
  };

  const getOscillatorText = (value: number, type: 'rsi' | 'stoch') => {
    const upper = type === 'rsi' ? 70 : 80;
    const lower = type === 'rsi' ? 30 : 20;
    if (value > upper) return 'Quá Mua';
    if (value < lower) return 'Quá Bán';
    return 'Trung tính';
  };

  const getAdxColor = (value: number) => {
    if (value > 50) return 'text-rose-400';
    if (value > 25) return 'text-emerald-400';
    return 'text-slate-400';
  };

  const renderPivotTable = (pivots: PivotLevelSet) => (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono">
      <div className="flex justify-between items-center text-rose-300">
        <span>R3</span>
        <span className="font-bold">{pivots.r3}</span>
      </div>
      <div className="flex justify-between items-center text-emerald-300">
        <span>S3</span>
        <span className="font-bold">{pivots.s3}</span>
      </div>
      <div className="flex justify-between items-center text-rose-400">
        <span>R2</span>
        <span className="font-bold">{pivots.r2}</span>
      </div>
      <div className="flex justify-between items-center text-emerald-400">
        <span>S2</span>
        <span className="font-bold">{pivots.s2}</span>
      </div>
      <div className="flex justify-between items-center text-rose-500">
        <span>R1</span>
        <span className="font-bold">{pivots.r1}</span>
      </div>
      <div className="flex justify-between items-center text-emerald-500">
        <span>S1</span>
        <span className="font-bold">{pivots.s1}</span>
      </div>
      <div className="col-span-2 mt-2 pt-2 border-t border-slate-700/50 flex justify-between items-center text-yellow-500">
        <span className="uppercase font-black text-[10px] tracking-widest">Pivot Point</span>
        <span className="font-black text-sm">{pivots.pivot}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-800/40 p-5 md:p-6 rounded-2xl border border-slate-700/50 backdrop-blur-md shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-bold text-sm md:text-base uppercase tracking-widest flex items-center gap-3">
          <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
          Chỉ số Kỹ thuật Nâng cao
        </h3>
        {signals.confidenceScore && (
          <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700">
             <div className="text-right">
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Độ tin cậy</div>
                <div className={`text-xs font-black ${signals.confidenceScore.score >= 70 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                   {signals.confidenceScore.label}
                </div>
             </div>
             <div className={`text-xl font-black ${signals.confidenceScore.score >= 70 ? 'text-emerald-500' : 'text-yellow-500'}`}>
                {signals.confidenceScore.score}%
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Column 1: Oscillators */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-[10px] uppercase text-slate-400 mb-2 font-bold tracking-wider">
              <span>RSI (14)</span>
              <span className="text-white">{signals.rsi}</span>
            </div>
            <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden p-0.5">
              <div className={`h-full ${getOscillatorColor(signals.rsi, 'rsi')} rounded-full transition-all duration-1000`} style={{ width: `${signals.rsi}%` }}></div>
            </div>
            <div className="text-[10px] text-right mt-1 font-bold text-slate-500 uppercase">{getOscillatorText(signals.rsi, 'rsi')}</div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] uppercase text-slate-400 mb-2 font-bold tracking-wider">
              <span>Stochastic %K</span>
              <span className="text-white">{signals.stochastic}</span>
            </div>
            <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden p-0.5">
              <div className={`h-full ${getOscillatorColor(signals.stochastic, 'stoch')} rounded-full transition-all duration-1000`} style={{ width: `${signals.stochastic}%` }}></div>
            </div>
            <div className="text-[10px] text-right mt-1 font-bold text-slate-500 uppercase">{getOscillatorText(signals.stochastic, 'stoch')}</div>
          </div>

           <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/30 flex flex-col justify-between">
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-tighter">CCI / MACD</span>
            <div className="flex justify-between items-end mt-2">
                <div className={`text-lg font-black ${signals.cci > 100 ? 'text-rose-400' : signals.cci < -100 ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {signals.cci} <span className="text-[9px] text-slate-500 font-normal">CCI</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 truncate max-w-[80px]" title={signals.macd}>
                    {signals.macd}
                </div>
            </div>
          </div>
        </div>

        {/* Column 2: Trend & Advanced Indicators */}
        <div className="space-y-3">
             <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/30">
                    <span className="text-slate-500 text-[9px] font-black uppercase tracking-tighter">ADX</span>
                    <div className={`text-xl font-black mt-1 ${getAdxColor(signals.adx)}`}>{signals.adx}</div>
                </div>
                <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/30">
                    <span className="text-slate-500 text-[9px] font-black uppercase tracking-tighter">Parabolic SAR</span>
                    <div className={`text-xl font-black mt-1 flex items-center gap-1 ${signals.sar?.trend === 'UP' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {signals.sar?.trend === 'UP' ? '▲' : '▼'}
                        <span className="text-sm">{signals.sar?.value || 'N/A'}</span>
                    </div>
                </div>
             </div>

             {/* Ichimoku Block */}
             <div className="p-3 rounded-xl border bg-slate-900/40 border-slate-700/30">
                 <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Ichimoku Cloud</div>
                 {signals.ichimoku ? (
                     <div className="space-y-2">
                         <div className="flex justify-between items-center text-xs">
                             <span className="text-slate-400">Tenkan/Kijun</span>
                             <span className={`font-bold ${signals.ichimoku.tenkan > signals.ichimoku.kijun ? 'text-emerald-400' : 'text-rose-400'}`}>
                                 {signals.ichimoku.tenkan > signals.ichimoku.kijun ? 'BULLISH' : 'BEARISH'}
                             </span>
                         </div>
                         <div className="flex justify-between items-center text-xs">
                             <span className="text-slate-400">Cloud Status</span>
                             <span className={`font-bold ${signals.ichimoku.signal === 'BULLISH' ? 'text-emerald-400' : signals.ichimoku.signal === 'BEARISH' ? 'text-rose-400' : 'text-yellow-400'}`}>
                                 {signals.ichimoku.signal}
                             </span>
                         </div>
                     </div>
                 ) : (
                     <div className="text-xs text-slate-500 italic">Cần thêm dữ liệu lịch sử...</div>
                 )}
             </div>

             {/* MA Status */}
             <div className="flex gap-2">
                 <div className={`flex-1 p-2 rounded-lg border text-center ${signals.ma50 === 'ABOVE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                     <div className="text-[8px] font-black uppercase">MA50</div>
                     <div className="text-xs font-bold">{signals.ma50 === 'ABOVE' ? '▲' : '▼'}</div>
                 </div>
                 <div className={`flex-1 p-2 rounded-lg border text-center ${signals.ma200 === 'ABOVE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                     <div className="text-[8px] font-black uppercase">MA200</div>
                     <div className="text-xs font-bold">{signals.ma200 === 'ABOVE' ? '▲' : '▼'}</div>
                 </div>
             </div>
        </div>

        {/* Columns 3 & 4: Pivots & Levels (Spanning 2 cols on LG) */}
        <div className="lg:col-span-2 space-y-4">
             {/* Support/Resistance Summary */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/30">
                    <div className="text-emerald-500 text-[9px] font-black uppercase mb-1">Hỗ trợ Gần</div>
                    <div className="text-lg font-black text-emerald-400 font-mono">${signals.support}</div>
                </div>
                <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/30">
                    <div className="text-rose-500 text-[9px] font-black uppercase mb-1">Kháng cự Gần</div>
                    <div className="text-lg font-black text-rose-400 font-mono">${signals.resistance}</div>
                </div>
            </div>

            {/* Tabbed Pivot Table */}
            {signals.pivotPoints ? (
                <div className="bg-slate-900/40 rounded-xl border border-slate-700/30 overflow-hidden">
                    <div className="flex border-b border-slate-700/50">
                        {(['classic', 'woodie', 'camarilla', 'fibonacci'] as PivotType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setActivePivot(type)}
                                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider transition-colors ${
                                    activePivot === type
                                    ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <div className="p-4">
                        {renderPivotTable(signals.pivotPoints[activePivot])}
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-700/30 text-center text-slate-500 text-xs">
                    Đang tính toán Pivot Points...
                </div>
            )}
        </div>
      </div>

      {/* Price Patterns Section (Preserved) */}
      {signals.pricePatterns && signals.pricePatterns.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <h4 className="text-white text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-yellow-500">🔍</span> Mô hình Giá được nhận diện
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {signals.pricePatterns.map((pattern, idx) => (
              <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/30 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-white">{pattern.name}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                    pattern.type === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    pattern.type === 'BEARISH' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {pattern.type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{pattern.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Độ tin cậy:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`w-3 h-1 rounded-full ${
                        i <= (pattern.reliability === 'HIGH' ? 3 : pattern.reliability === 'MEDIUM' ? 2 : 1)
                        ? (pattern.type === 'BULLISH' ? 'bg-emerald-500' : pattern.type === 'BEARISH' ? 'bg-rose-500' : 'bg-blue-500')
                        : 'bg-slate-700'
                      }`}></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedTechnicals;
