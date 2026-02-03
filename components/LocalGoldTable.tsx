import React from 'react';
import { MarketData } from '../types';
import LoadingIcon from './LoadingIcon';

interface LocalGoldTableProps {
  data: MarketData;
  isLoading?: boolean;
}

const LocalGoldTable: React.FC<LocalGoldTableProps> = ({ data, isLoading }) => {
  const brands = [
    { name: 'SJC Toàn Quốc', buy: data.sjcBuy, sell: data.sjcSell, color: 'text-yellow-400' },
    { name: 'PNJ (Vàng 24K)', buy: data.pnjBuy, sell: data.pnjSell },
    { name: 'DOJI (Hà Nội/HCM)', buy: data.dojiBuy, sell: data.dojiSell },
    { name: 'Bảo Tín Minh Châu', buy: data.btmcBuy, sell: data.btmcSell },
    { name: 'Vàng Nhẫn 9999', buy: data.ringGoldBuy, sell: data.ringGoldSell, color: 'text-yellow-400' },
    { name: 'Bạc Trong nước', buy: data.silverBuy, sell: data.silverSell, color: 'text-blue-400' },
  ];

  const formatPrice = (price: number) => {
    if (isLoading && price === 0) return <LoadingIcon size={14} className="inline opacity-50" />;
    return price > 0 ? `${price.toFixed(2)} M` : '-';
  };

  return (
    <div className="bg-slate-900/40 rounded-2xl border border-slate-800/50 backdrop-blur-sm overflow-hidden relative group">
      {/* Decorative gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent opacity-50"></div>

      <div className="px-6 py-5 border-b border-slate-800/50 flex items-center justify-between">
        <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg>
          </span>
          Bảng Giá Vàng Nội địa
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border border-slate-800 rounded px-2 py-1">
          Live Update
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Thương hiệu / Loại vàng</th>
              <th className="px-6 py-4 text-right">Mua vào</th>
              <th className="px-6 py-4 text-right">Bán ra</th>
              <th className="px-6 py-4 text-right">Spread</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {brands.map((brand, index) => (
              <tr key={index} className="group/row hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <span className={`text-sm font-bold ${brand.color || 'text-slate-300'} group-hover/row:text-white transition-colors`}>
                    {brand.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-mono text-emerald-400 font-medium bg-emerald-500/5 px-2 py-1 rounded">
                    {formatPrice(brand.buy)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-mono text-rose-400 font-bold bg-rose-500/5 px-2 py-1 rounded border border-rose-500/10">
                    {formatPrice(brand.sell)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xs font-mono text-slate-500">
                    {brand.sell > 0 && brand.buy > 0 ? `${(brand.sell - brand.buy).toFixed(2)}` : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LocalGoldTable;
