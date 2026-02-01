import { GoogleGenAI, Type } from "@google/genai";
import { MarketData, AnalysisReport } from "../types";
import { ANALYSIS_CONSTANTS, UI_LABELS } from "../utils/constants";
import { fetchAllMarketData } from "./marketDataFetcher";
import {
  calculatePivotPoints,
  calculateTrendConfidence,
  calculateTechnicalAction,
  generateMarketInsight,
  calculateFibonacciLevels,
  analyzeLocalPremium
} from "../utils/algorithms";

// Helper to get Gemini Client dynamically
const getGenAiClient = () => {
  const apiKey = localStorage.getItem("GEMINI_API_KEY") || process.env.API_KEY || "TEST_KEY_FOR_VERIFICATION";
  return new GoogleGenAI({ apiKey });
};

// System instruction for the analyst persona
const ANALYST_SYSTEM_INSTRUCTION = `
Bạn là Chuyên gia Phân tích Tài chính cấp cao (Senior Gold Trader).
Nhiệm vụ: Phân tích thị trường Vàng (XAU/USD) và Vàng SJC dựa trên dữ liệu thực tế từ Google Finance và TradingView.
Nguyên tắc:
1. Dữ liệu giá (XAU, USD/VND, SJC) phải CHÍNH XÁC TUYỆT ĐỐI từ nguồn uy tín.
2. Không tự ý bịa đặt số liệu. Nếu không tìm thấy, hãy dùng dữ liệu gần nhất.
3. Phân tích kỹ thuật phải tương đồng với các chỉ báo trên TradingView.
4. Phong cách báo cáo: Sắc bén, chuyên nghiệp, tập trung vào hành động (Actionable).
`;

// Define model constant for consistency
const MODEL_NAME = "gemini-2.0-flash";

const fetchFallbackData = async (): Promise<{ marketData: MarketData; report: AnalysisReport }> => {
  try {
    const marketData = await fetchAllMarketData();

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
        rsi: ANALYSIS_CONSTANTS.RSI.NEUTRAL,
        stochastic: 50,
        adx: 20,
        cci: 0,
        trend: UI_LABELS.TREND.NEUTRAL,
        support: Math.floor(marketData.xauPrice - 20),
        resistance: Math.ceil(marketData.xauPrice + 20),
        macd: "NEUTRAL",
        bollinger: "NEUTRAL",
        ma50: "ABOVE",
        ma200: "ABOVE"
      },
      fullReport: "Hệ thống đang chạy ở chế độ Phân tích Toán học do thiếu API Key. Các chỉ báo kỹ thuật được đặt ở mức trung tính. Giá vàng và tỷ giá vẫn được cập nhật realtime từ các nguồn public uy tín.",
      news: []
    };

    // Apply Algorithmic Engine to Fallback Data
    // Mock chart data for fallback
    const mockChartData: ChartDataPoint[] = [];
    const baseTime = Math.floor(Date.now() / 1000);
    let lastPrice = marketData.xauPrice || 2600;

    for (let i = 24; i >= 0; i--) {
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
    report.chartData = mockChartData;

    const confidence = calculateTrendConfidence(report.technicalSignals);
    report.technicalSignals.confidenceScore = confidence;

    const algoInsight = generateMarketInsight(report.technicalSignals);
    report.technicalSummary = `${report.technicalSummary}\n\n[Hệ thống]: ${algoInsight}`;

    if (marketData.spread !== undefined) {
        report.localSpreadAnalysis = analyzeLocalPremium(marketData.spread);
    }

    return { marketData, report };

  } catch (error) {
    console.error("Fallback fetch failed:", error);
    throw new Error("Không thể tải dữ liệu thị trường (Cả hai chế độ đều thất bại).");
  }
};

export const fetchMarketAnalysis = async (): Promise<{ marketData: MarketData; report: AnalysisReport }> => {
  const apiKey = localStorage.getItem("GEMINI_API_KEY");

  if (!apiKey) {
    console.warn("No API Key found. Switching to Fallback Mode.");
    return fetchFallbackData();
  }

  try {
    const ai = getGenAiClient();
    const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    // FETCH REAL-TIME DATA FIRST AS GROUND TRUTH
    const realData = await fetchAllMarketData();

    const prompt = `
      Thời gian phân tích: ${now}.
      DỮ LIỆU THỰC TẾ (GROUND TRUTH) - ƯU TIÊN SỬ DỤNG:
      - Vàng thế giới: $${realData.xauPrice}/oz
      - Bạc thế giới: $${realData.xagPrice}/oz
      - Tỷ giá USD/VND: ${realData.usdVnd}
      - SJC: ${realData.sjcBuy} - ${realData.sjcSell} (triệu/lượng)
      - Vàng Nhẫn: ${realData.ringGoldBuy} - ${realData.ringGoldSell} (triệu/lượng)
      - DOJI: ${realData.dojiBuy} - ${realData.dojiSell} (triệu/lượng)
      - PNJ: ${realData.pnjBuy} - ${realData.pnjSell} (triệu/lượng)
      - Bảo Tín Minh Châu: ${realData.btmcBuy} - ${realData.btmcSell} (triệu/lượng)
      - Bạc Trong nước: ${realData.silverBuy} - ${realData.silverSell} (triệu/lượng)

      HÃY SỬ DỤNG CÔNG CỤ TÌM KIẾM (GOOGLE SEARCH) ĐỂ BỔ SUNG VÀ KIỂM CHỨNG:

      BƯỚC 1: LẤY DỮ LIỆU TÀI CHÍNH BỔ SUNG
      - Tìm kiếm "XAU USD previous day high low close" để lấy dữ liệu OHLC ngày hôm qua (Open, High, Low, Close).
      - Tìm kiếm "Dollar Index DXY Google Finance" để lấy chỉ số DXY hiện tại.
      - Cập nhật thêm tin tức về "Giá vàng hôm nay" để xem có biến động cực nhanh nào chưa được phản ánh không.

      BƯỚC 2: LẤY CHỈ SỐ KỸ THUẬT TỪ TRADINGVIEW (CONTEXT)
      - Tìm kiếm "XAUUSD TradingView technical analysis summary indicators" để biết chi tiết:
        + RSI (14), Stochastic Oscillator (14, 3, 3), CCI (20), ADX (14).
        + Giá so với MA50 và MA200.
        + Bollinger Bands, MACD Level & Signal.
      - Nhận diện các mẫu hình giá (Price Patterns) hiện tại: ví dụ Double Top, Double Bottom, Head and Shoulders, Triangle, Flag, Pennant, v.v.

      BƯỚC 3: LẤY TIN TỨC KINH TẾ XÃ HỘI (MACRO) & CHÍNH TRỊ
      - Tìm kiếm "Gold market news today geopolitical news impact on gold" hoặc "Financial news breaking today".
      - Tìm kiếm "Economic Calendar today" (FED interest rate, CPI, Non-farm news impact).
      - Tìm kiếm "World news geopolitical events today" có ảnh hưởng đến tâm lý nhà đầu tư.

      BƯỚC 4: LẤY DỮ LIỆU LỊCH SỬ (CHART)
      - Tìm kiếm "XAUUSD price history last 24 hours hourly OHLC" để lấy chuỗi giá vàng trong 24 giờ qua.
      - Lấy khoảng 12-24 điểm dữ liệu (mỗi 1-2 giờ một điểm).
      - Mỗi điểm dữ liệu CẦN có: Open, High, Low, Close (OHLC).

      BƯỚC 5: TỔNG HỢP BÁO CÁO
      - Tổng hợp các dữ liệu thô tìm được vào JSON.
      - KHÔNG CẦN TÍNH TOÁN "Spread" hay "Giá quy đổi", hệ thống sẽ tự tính.

      YÊU CẦU ĐẦU RA (JSON):
      Trong phần 'shortTermTrend', hãy phân tích cực kỳ chi tiết các mốc giá trong 1-3 ngày tới dựa trên nến 1H/4H.
      Trong phần 'longTermTrend', hãy phân tích xu hướng tuần/tháng dựa trên nến Daily/Weekly và chu kỳ kinh tế của FED.
      Trong phần 'fullReport', hãy viết một bài phân tích chuyên sâu tổng hợp mọi yếu tố.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marketData: {
              type: Type.OBJECT,
              properties: {
                xauPrice: { type: Type.NUMBER, description: "Giá vàng thế giới (USD)" },
                dxyValue: { type: Type.NUMBER },
                sjcBuy: { type: Type.NUMBER, description: "Giá mua SJC (Triệu đồng)" },
                sjcSell: { type: Type.NUMBER, description: "Giá bán SJC (Triệu đồng)" },
                pnjBuy: { type: Type.NUMBER, description: "Giá mua PNJ (Triệu đồng)" },
                pnjSell: { type: Type.NUMBER, description: "Giá bán PNJ (Triệu đồng)" },
                btmcBuy: { type: Type.NUMBER, description: "Giá mua Bảo Tín Minh Châu (Triệu đồng)" },
                btmcSell: { type: Type.NUMBER, description: "Giá bán Bảo Tín Minh Châu (Triệu đồng)" },
                dojiBuy: { type: Type.NUMBER, description: "Giá mua DOJI (Triệu đồng)" },
                dojiSell: { type: Type.NUMBER, description: "Giá bán DOJI (Triệu đồng)" },
                ringGoldBuy: { type: Type.NUMBER, description: "Giá mua Vàng Nhẫn 9999 (Triệu đồng)" },
                ringGoldSell: { type: Type.NUMBER, description: "Giá bán Vàng Nhẫn 9999 (Triệu đồng)" },
                xagPrice: { type: Type.NUMBER, description: "Giá bạc thế giới (USD)" },
                silverBuy: { type: Type.NUMBER, description: "Giá bạc trong nước mua (Triệu đồng)" },
                silverSell: { type: Type.NUMBER, description: "Giá bạc trong nước bán (Triệu đồng)" },
                usdVnd: { type: Type.NUMBER, description: "Tỷ giá USD/VND" },
                spread: { type: Type.NUMBER, description: "Để 0, hệ thống sẽ tự tính" },
                lastUpdated: { type: Type.STRING },
                ohlc: {
                  type: Type.OBJECT,
                  properties: {
                    open: { type: Type.NUMBER },
                    high: { type: Type.NUMBER },
                    low: { type: Type.NUMBER },
                    close: { type: Type.NUMBER }
                  },
                  description: "Previous day OHLC data for XAU/USD"
                }
              },
              required: ["xauPrice", "dxyValue", "sjcBuy", "sjcSell", "ringGoldBuy", "ringGoldSell", "usdVnd", "spread", "lastUpdated"]
            },
            report: {
              type: Type.OBJECT,
              properties: {
                technicalSummary: { type: Type.STRING },
                macroSummary: { type: Type.STRING },
                localSpreadAnalysis: { type: Type.STRING },
                tradingAction: { type: Type.STRING, enum: ["MUA", "BÁN", "QUAN SÁT", "CẢNH BÁO"] },
                prediction: { type: Type.STRING },
                shortTermTrend: { type: Type.STRING, description: "Phân tích chi tiết xu hướng 1-3 ngày tới" },
                longTermTrend: { type: Type.STRING, description: "Phân tích chi tiết xu hướng tuần/tháng" },
                suggestedBuyZone: { type: Type.STRING },
                entryPointBuy: { type: Type.NUMBER },
                entryPointSell: { type: Type.NUMBER },
                technicalSignals: {
                  type: Type.OBJECT,
                  properties: {
                    rsi: { type: Type.NUMBER },
                    stochastic: { type: Type.NUMBER },
                    adx: { type: Type.NUMBER },
                    cci: { type: Type.NUMBER },
                    trend: { type: Type.STRING },
                    support: { type: Type.NUMBER },
                    resistance: { type: Type.NUMBER },
                    macd: { type: Type.STRING },
                    bollinger: { type: Type.STRING },
                    ma50: { type: Type.STRING, enum: ["ABOVE", "BELOW"] },
                    ma200: { type: Type.STRING, enum: ["ABOVE", "BELOW"] },
                    pricePatterns: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          type: { type: Type.STRING, enum: ["BULLISH", "BEARISH", "NEUTRAL"] },
                          reliability: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
                          description: { type: Type.STRING }
                        },
                        required: ["name", "type", "reliability", "description"]
                      }
                    }
                  },
                  required: ["rsi", "stochastic", "adx", "cci", "trend", "support", "resistance", "macd", "bollinger", "ma50", "ma200"]
                },
                fullReport: { type: Type.STRING, description: "Báo cáo chuyên sâu tổng hợp" },
                news: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      source: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      category: { type: Type.STRING, enum: ["MARKET", "GEOPOLITICAL", "MACRO"] },
                      timestamp: { type: Type.STRING }
                    },
                    required: ["title", "source", "summary", "category", "timestamp"]
                  }
                },
                chartData: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING, description: "Unix timestamp (chuỗi)" },
                      xau: { type: Type.NUMBER, description: "Giá vàng tại thời điểm đó (Close)" },
                      dxy: { type: Type.NUMBER, description: "Chỉ số DXY tại thời điểm đó" },
                      open: { type: Type.NUMBER },
                      high: { type: Type.NUMBER },
                      low: { type: Type.NUMBER },
                      close: { type: Type.NUMBER }
                    },
                    required: ["time", "xau", "dxy", "open", "high", "low", "close"]
                  }
                }
              },
              required: ["technicalSummary", "macroSummary", "localSpreadAnalysis", "tradingAction", "prediction", "shortTermTrend", "longTermTrend", "suggestedBuyZone", "entryPointBuy", "entryPointSell", "technicalSignals", "fullReport", "news", "chartData"]
            }
          },
          required: ["marketData", "report"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("Không thể tạo báo cáo phân tích");
    }

    const result = JSON.parse(jsonText);

    // --- POST-PROCESSING: Calculate Spread & Validate Data ---
    // 0. Ground Truth Patching (If AI failed to extract but we have it)
    const patchField = (field: keyof MarketData) => {
        if (!result.marketData[field] || result.marketData[field] === 0) {
            (result.marketData as any)[field] = (realData as any)[field];
        }
    };

    ["xauPrice", "xagPrice", "usdVnd", "sjcBuy", "sjcSell", "pnjBuy", "pnjSell", "btmcBuy", "btmcSell", "dojiBuy", "dojiSell", "ringGoldBuy", "ringGoldSell", "silverBuy", "silverSell"].forEach(f => patchField(f as keyof MarketData));

    // Silver Price Fallback
    if ((!result.marketData.silverSell || result.marketData.silverSell === 0) && result.marketData.xagPrice > 0) {
      const convertedSilver = (result.marketData.xagPrice * result.marketData.usdVnd * 1.205) / 1000000;
      result.marketData.silverBuy = Number((convertedSilver * 0.92).toFixed(2));
      result.marketData.silverSell = Number(convertedSilver.toFixed(2));
    }

    // Ensure we have numbers
    const xau = Number(result.marketData.xauPrice) || 0;
    const usdVnd = Number(result.marketData.usdVnd) || 0;
    const sjcSell = Number(result.marketData.sjcSell) || 0;

    if (xau > 0 && usdVnd > 0 && sjcSell > 0) {
      // Formula: (XAU * USDVND * 1.205) / 1,000,000 = Converted Price (Million VND/Tael)
      const convertedPrice = (xau * usdVnd * ANALYSIS_CONSTANTS.GOLD_CONVERSION_FACTOR) / 1000000;

      // Spread = SJC Sell - Converted Price
      const spread = sjcSell - convertedPrice;

      // Overwrite the AI's spread with the calculated math
      result.marketData.spread = Number(spread.toFixed(2));
    } else {
      // Fallback if data is missing, though we should probably warn
      console.warn("Missing data for spread calculation", { xau, usdVnd, sjcSell });
    }

    // --- ALGORITHMIC VERIFICATION & ENRICHMENT ---
    // 1. Calculate Pivot Points & Fibonacci if OHLC is available
    if (result.marketData.ohlc) {
        const { high, low, close, open } = result.marketData.ohlc;

        if (high && low && close) {
            const pivots = calculatePivotPoints(high, low, close);
            result.report.technicalSignals.pivotPoints = pivots;
        }

        if (high && low && open && close) {
             const fibs = calculateFibonacciLevels(high, low, open, close);
             result.report.technicalSignals.fibonacciLevels = fibs;
        }
    }

    // 2. Calculate Trend Confidence Score
    const confidence = calculateTrendConfidence(result.report.technicalSignals);
    result.report.technicalSignals.confidenceScore = confidence;

    // 3. Generate Algorithmic Insight & Action
    const algoAction = calculateTechnicalAction(result.report.technicalSignals);
    const algoInsight = generateMarketInsight(result.report.technicalSignals);

    // Cross-verify Action: If AI is 'QUAN SÁT' (Neutral) but Math is decisive, use Math
    if (result.report.tradingAction === UI_LABELS.ACTION.OBSERVE && algoAction !== UI_LABELS.ACTION.OBSERVE) {
        result.report.tradingAction = algoAction as any;
    }

    // Append algorithmic insight to technical summary
    result.report.technicalSummary = `${result.report.technicalSummary}\n\n[Hệ thống]: ${algoInsight}`;

    // 4. Local Premium Analysis
    if (result.marketData.spread !== undefined) {
        const premiumAdvice = analyzeLocalPremium(result.marketData.spread);
        result.report.localSpreadAnalysis = `${result.report.localSpreadAnalysis}\n\n${premiumAdvice}`;
    }

    return result;

  } catch (error) {
    console.error("AI Analysis failed, switching to fallback:", error);
    // If AI fails, fallback to basic data
    return fetchFallbackData();
  }
};

export const chatWithAnalyst = async (history: { role: string; parts: { text: string }[] }[], message: string) => {
  const ai = getGenAiClient();
  const chat = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: ANALYST_SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }] 
    },
    history: history
  });

  const result = await chat.sendMessageStream({ message });
  return result;
};
