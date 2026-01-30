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
      <h3 className="text-white font-bold mb-6 text-sm md:text-base uppercase tracking-widest flex items-center gap-3">
        <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
        Chỉ số Kỹ thuật Nâng cao (TradingView)
      </h3>

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
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-tighter">ADX Strength</span>
            <div className={`text-2xl font-black mt-2 ${getAdxColor(signals.adx)}`}>{signals.adx}</div>
            <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Sức mạnh xu hướng</span>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/30 flex flex-col justify-between">
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-tighter">CCI Momentum</span>
            <div className={`text-2xl font-black mt-2 ${signals.cci > 100 ? 'text-rose-400' : signals.cci < -100 ? 'text-emerald-400' : 'text-slate-200'}`}>{signals.cci}</div>
            <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Động lượng</span>
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
            <div className="text-emerald-500 text-[9px] font-black uppercase mb-1">Support 1</div>
            <div className="text-lg font-black text-emerald-400 font-mono">${signals.support}</div>
          </div>
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/30">
            <div className="text-rose-500 text-[9px] font-black uppercase mb-1">Resist 1</div>
            <div className="text-lg font-black text-rose-400 font-mono">${signals.resistance}</div>
          </div>
          <div className="col-span-2 p-3 bg-slate-900/40 rounded-xl border border-slate-700/30">
             <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[9px] font-black uppercase">MACD</span>
                <span className="text-xs font-bold text-slate-200 truncate ml-2">{signals.macd}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTechnicals;