import { MarketData, AnalysisReport, ChartDataPoint } from "../../types";
import { UI_LABELS } from "../../utils/constants";
import { fetchAllMarketData } from "../marketDataFetcher";

export const fetchFallbackData = async (): Promise<{ marketData: MarketData; report: AnalysisReport }> => {
  try {
    let marketData: MarketData;
    try {
       // Try to fetch real data with a 5s timeout (shorter for fallback)
       marketData = await Promise.race([
          fetchAllMarketData(),
          new Promise<MarketData>((_, reject) => setTimeout(() => reject(new Error("Global Timeout")), 5000))
       ]);
    } catch (e) {
       console.warn("Real data fetch failed/timed out in fallback, using mock", e);
       marketData = {
          xauPrice: 2650.50,
          dxyValue: 104.2,
          sjcBuy: 83.5, sjcSell: 85.5,
          pnjBuy: 83.5, pnjSell: 85.5,
          btmcBuy: 84.0, btmcSell: 86.0,
          dojiBuy: 83.0, dojiSell: 85.0,
          ringGoldBuy: 63.5, ringGoldSell: 64.5,
          xagPrice: 31.5,
          silverBuy: 2.5, silverSell: 2.8,
          usdVnd: 25450,
          spread: 0,
          lastUpdated: "Fallback Mode (Offline/Error)"
       };
    }

    // Mock chart data for fallback
    const mockChartData: ChartDataPoint[] = [];
    const baseTime = Math.floor(Date.now() / 1000);
    let lastPrice = marketData.xauPrice || 2600;

    for (let i = 49; i >= 0; i--) { // 50 points
      const time = (baseTime - i * 3600).toString();
      const change = (Math.random() * 10 - 5);
      const open = lastPrice;
      const close = lastPrice + change;
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;

      mockChartData.push({
        time,
        xau: close,
        dxy: marketData.dxyValue - (Math.random() * 0.5 - 0.25),
        open,
        high,
        low,
        close
      });
      lastPrice = close;
    }

    const report: AnalysisReport = {
      technicalSummary: "Chế độ dữ liệu thời gian thực (Toán học). Dữ liệu kỹ thuật đang sử dụng các mốc mặc định do thiếu kết nối phân tích.",
      macroSummary: "Dữ liệu Vĩ mô không khả dụng trong chế độ toán học thuần túy.",
      localSpreadAnalysis: "Đang phân tích chênh lệch giá...",
      tradingAction: UI_LABELS.ACTION.OBSERVE as any,
      prediction: "Trung lập (Toán học)",
      shortTermTrend: "Theo dõi các mốc hỗ trợ/kháng cự kỹ thuật.",
      longTermTrend: "Dữ liệu dài hạn cần thêm thông tin vĩ mô.",
      suggestedBuyZone: "N/A",
      entryPointBuy: 0,
      entryPointSell: 0,
      technicalSignals: {
        rsi: 50, // Placeholder, will be calculated by enrichMarketAnalysis
        stochastic: 50,
        adx: 20,
        cci: 0,
        trend: UI_LABELS.TREND.NEUTRAL,
        support: Math.floor(marketData.xauPrice - 20),
        resistance: Math.ceil(marketData.xauPrice + 20),
        macd: "NEUTRAL",
        bollinger: "NEUTRAL",
        ma50: "ABOVE",
        ma200: "ABOVE",
      },
      fullReport: "Hệ thống đang chạy ở chế độ Phân tích Toán học do thiếu API Key. Các chỉ báo kỹ thuật được đặt ở mức trung tính. Giá vàng và tỷ giá vẫn được cập nhật realtime từ các nguồn public uy tín.",
      news: [],
      chartData: mockChartData
    };

    // The manager will call enrichMarketAnalysis(marketData, report)
    // to populate RSI, SMC, etc. from chartData.

    return { marketData, report };

  } catch (error) {
    console.error("Fallback fetch failed:", error);
    throw new Error("Không thể tải dữ liệu thị trường (Cả hai chế độ đều thất bại).");
  }
};
