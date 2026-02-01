import React from 'react';
import { TechnicalSignals } from '../types';

interface AdvancedTechnicalsProps {
  signals: TechnicalSignals;
}

const AdvancedTechnicals: React.FC<AdvancedTechnicalsProps> = ({ signals }) => {
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
        {/* RSI & Stoch Column */}
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
        </div>

        {/* Strength Column */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/30 flex flex-col justify-between">
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-tighter">Sức mạnh ADX</span>
            <div className={`text-2xl font-black mt-2 ${getAdxColor(signals.adx)}`}>{signals.adx}</div>
            <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Cường độ xu hướng</span>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/30 flex flex-col justify-between">
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-tighter">Động lượng CCI</span>
            <div className={`text-2xl font-black mt-2 ${signals.cci > 100 ? 'text-rose-400' : signals.cci < -100 ? 'text-emerald-400' : 'text-slate-200'}`}>{signals.cci}</div>
            <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Xung lực giá</span>
          </div>
        </div>

        {/* MA Status Column */}
        <div className="space-y-3">
           <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${signals.ma50 === 'ABOVE' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
              <div className="flex flex-col">
                <span className="text-slate-400 text-[9px] font-bold uppercase">MA 50</span>
                <span className={`text-[10px] font-black ${signals.ma50 === 'ABOVE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {signals.ma50 === 'ABOVE' ? 'XU HƯỚNG TĂNG' : 'XU HƯỚNG GIẢM'}
                </span>
              </div>
              <div className={`p-1.5 rounded-lg ${signals.ma50 === 'ABOVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {signals.ma50 === 'ABOVE' ? '▲' : '▼'}
              </div>
           </div>
           <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${signals.ma200 === 'ABOVE' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
              <div className="flex flex-col">
                <span className="text-slate-400 text-[9px] font-bold uppercase">MA 200</span>
                <span className={`text-[10px] font-black ${signals.ma200 === 'ABOVE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {signals.ma200 === 'ABOVE' ? 'DÀI HẠN TĂNG' : 'DÀI HẠN GIẢM'}
                </span>
              </div>
              <div className={`p-1.5 rounded-lg ${signals.ma200 === 'ABOVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {signals.ma200 === 'ABOVE' ? '▲' : '▼'}
              </div>
           </div>
        </div>

        {/* Support/Resist Column */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/30">
            <div className="text-emerald-500 text-[9px] font-black uppercase mb-1">Hỗ trợ</div>
            <div className="text-lg font-black text-emerald-400 font-mono">${signals.support}</div>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/30">
            <div className="text-rose-500 text-[9px] font-black uppercase mb-1">Kháng cự</div>
            <div className="text-lg font-black text-rose-400 font-mono">${signals.resistance}</div>
          </div>

          {signals.pivotPoints && (
             <>
                <div className="p-3 bg-slate-900/40 rounded-xl border border-emerald-500/20 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-1 bg-emerald-500/20 rounded-bl-lg">
                      <span className="text-[8px] text-emerald-400 font-bold px-1">MATH</span>
                   </div>
                   <div className="text-slate-400 text-[9px] font-black uppercase mb-1">Pivot S1</div>
                   <div className="text-lg font-black text-emerald-200 font-mono">${signals.pivotPoints.s1}</div>
                </div>
                <div className="p-3 bg-slate-900/40 rounded-xl border border-rose-500/20 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-1 bg-rose-500/20 rounded-bl-lg">
                      <span className="text-[8px] text-rose-400 font-bold px-1">MATH</span>
                   </div>
                   <div className="text-slate-400 text-[9px] font-black uppercase mb-1">Pivot R1</div>
                   <div className="text-lg font-black text-rose-200 font-mono">${signals.pivotPoints.r1}</div>
                </div>
             </>
          )}

          {signals.fibonacciLevels && (
             <div className="p-3 bg-slate-900/40 rounded-xl border border-blue-500/20 col-span-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1 bg-blue-500/20 rounded-bl-lg">
                   <span className="text-[8px] text-blue-400 font-bold px-1">FIBONACCI</span>
                </div>
                <div className="text-slate-400 text-[9px] font-black uppercase mb-2">Hồi quy {signals.fibonacciLevels.trend === 'UP' ? 'Tăng' : 'Giảm'}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                   <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500">23.6%</span>
                      <span className="text-slate-300">${signals.fibonacciLevels.level236}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500">38.2%</span>
                      <span className="text-slate-300">${signals.fibonacciLevels.level382}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500">50.0%</span>
                      <span className="text-slate-300 font-bold text-blue-400">${signals.fibonacciLevels.level500}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500">61.8%</span>
                      <span className="text-slate-300 font-bold text-blue-400">${signals.fibonacciLevels.level618}</span>
                   </div>
                </div>
             </div>
          )}

          {!signals.pivotPoints && !signals.fibonacciLevels && (
            <div className="col-span-2 p-3 bg-slate-900/40 rounded-xl border border-slate-700/30">
               <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[9px] font-black uppercase">MACD</span>
                  <span className="text-xs font-bold text-slate-200 truncate ml-2">{signals.macd}</span>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Price Patterns Section */}
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