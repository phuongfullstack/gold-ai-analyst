import React from 'react';
import { MarketData } from '../types';
import LoadingIcon from './LoadingIcon';

interface LocalGoldTableProps {
  data: MarketData;
  isLoading?: boolean;
}

const LocalGoldTable: React.FC<LocalGoldTableProps> = ({ data, isLoading }) => {
  const brands = [
    { name: 'SJC Toàn Quốc', buy: data.sjcBuy, sell: data.sjcSell },
    { name: 'PNJ (Vàng 24K)', buy: data.pnjBuy, sell: data.pnjSell },
    { name: 'DOJI (Hà Nội/HCM)', buy: data.dojiBuy, sell: data.dojiSell },
    { name: 'Bảo Tín Minh Châu', buy: data.btmcBuy, sell: data.btmcSell },
    { name: 'Vàng Nhẫn 9999', buy: data.ringGoldBuy, sell: data.ringGoldSell },
    { name: 'Bạc Trong nước', buy: data.silverBuy, sell: data.silverSell },
  ];

  const formatPrice = (price: number) => {
    if (isLoading && price === 0) return <LoadingIcon size={14} className="inline opacity-50" />;
    return price > 0 ? `${price.toFixed(2)} tr` : 'N/A';
  };

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
        <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <span className="text-yellow-500">🇻🇳</span> So sánh Giá Vàng Nội địa
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50">
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Thương hiệu</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Giá Mua vào</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Giá Bán ra</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Chênh lệch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {brands.map((brand, index) => (
              <tr key={index} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-200">{brand.name}</td>
                <td className="px-6 py-4 text-sm font-mono text-emerald-400 font-bold">{formatPrice(brand.buy)}</td>
                <td className="px-6 py-4 text-sm font-mono text-rose-400 font-bold">{formatPrice(brand.sell)}</td>
                <td className="px-6 py-4 text-sm font-mono text-slate-400">
                  {brand.sell > 0 && brand.buy > 0 ? `${(brand.sell - brand.buy).toFixed(2)} tr` : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 bg-slate-950/30 text-[10px] text-slate-500 font-medium italic">
        * Đơn vị: Triệu đồng/lượng. Dữ liệu được cập nhật từ các nguồn uy tín nhất tại Việt Nam.
      </div>
    </div>
  );
};

export default LocalGoldTable;
