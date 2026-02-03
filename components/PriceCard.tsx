import React from 'react';
import LoadingIcon from './LoadingIcon';

interface PriceCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const PriceCard: React.FC<PriceCardProps> = ({ title, value, subValue, color = "blue", icon, isLoading }) => {
  const getAccentColors = () => {
    switch (color) {
      case 'gold': return {
        text: 'text-yellow-400',
        glow: 'shadow-yellow-500/20',
        border: 'border-yellow-500/20',
        iconBg: 'bg-yellow-500/10'
      };
      case 'green': return {
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/20',
        border: 'border-emerald-500/20',
        iconBg: 'bg-emerald-500/10'
      };
      case 'red': return {
        text: 'text-rose-400',
        glow: 'shadow-rose-500/20',
        border: 'border-rose-500/20',
        iconBg: 'bg-rose-500/10'
      };
      default: return {
        text: 'text-blue-400',
        glow: 'shadow-blue-500/20',
        border: 'border-blue-500/20',
        iconBg: 'bg-blue-500/10'
      };
    }
  };

  const colors = getAccentColors();

  return (
    <div className={`relative overflow-hidden p-5 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-white/5 ${colors.border} transition-all duration-300 hover:scale-[1.02] hover:bg-slate-800/60 hover:shadow-xl group`}>
      
      {/* Glow Effect */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity ${colors.text.replace('text', 'bg')}`}></div>

      <div className="relative z-10 flex flex-col justify-between h-full min-w-0">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate pr-2 flex items-center gap-2">
            {title}
          </h3>
          {icon && (
            <div className={`p-2 rounded-lg ${colors.iconBg} ${colors.text} bg-opacity-20 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity text-sm`}>
               {icon}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className={`text-2xl lg:text-3xl font-mono font-bold tracking-tight leading-none break-words flex items-center gap-2 ${colors.text}`}>
            {isLoading || value === '...' ? (
              <LoadingIcon className="opacity-50" size={24} />
            ) : (
              value
            )}
          </div>
          {subValue && (
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider flex items-center gap-1.5">
               <div className={`w-1 h-1 rounded-full ${colors.text.replace('text', 'bg')}`}></div>
               {subValue}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceCard;
