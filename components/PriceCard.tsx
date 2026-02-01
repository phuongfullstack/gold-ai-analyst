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
  const getColorClass = () => {
    switch (color) {
      case 'gold': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'green': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'red': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      default: return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    }
  };

  return (
    <div className={`p-4 md:p-5 rounded-xl border backdrop-blur-sm ${getColorClass()} transition-all duration-300 hover:shadow-lg hover:shadow-black/20 flex flex-col justify-between h-full min-w-0`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-[10px] md:text-xs font-bold opacity-80 uppercase tracking-widest truncate pr-2" title={title}>
          {title}
        </h3>
        {icon && <div className="p-1.5 rounded-lg bg-white/5 flex-shrink-0 hidden sm:block">{icon}</div>}
      </div>
      
      <div className="flex flex-col">
        <div className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-none break-words flex items-center gap-2">
          {isLoading || value === '...' ? (
            <LoadingIcon className="opacity-50" size={24} />
          ) : (
            value
          )}
        </div>
        {subValue && (
          <div className="mt-1.5 text-[10px] md:text-xs opacity-70 font-medium uppercase tracking-tighter">
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceCard;