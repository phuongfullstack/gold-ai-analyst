import { GoogleGenAI, Type } from "@google/genai";
import { AIProvider, AIAnalysisResult } from "../types";
import { MarketData, AnalysisReport } from "../../../types";

const MODEL_NAME = "gemini-2.0-flash";

const ANALYST_SYSTEM_INSTRUCTION = `
Bạn là Chuyên gia Phân tích Tài chính cấp cao (Senior Gold Trader).
Nhiệm vụ: Phân tích thị trường Vàng (XAU/USD) và Vàng SJC dựa trên dữ liệu thực tế từ Google Finance và TradingView.
Nguyên tắc:
1. Dữ liệu giá (XAU, USD/VND, SJC) phải CHÍNH XÁC TUYỆT ĐỐI từ nguồn uy tín.
2. Không tự ý bịa đặt số liệu. Nếu không tìm thấy, hãy dùng dữ liệu gần nhất.
3. Phân tích kỹ thuật chuyên sâu:
   - Sử dụng Fibonacci, Ichimoku, Bollinger Bands.
   - Đặc biệt chú ý: Smart Money Concepts (SMC) như Order Blocks (Khối lệnh), Fair Value Gaps (Khoảng trống giá - FVG), Liquidity Sweeps (Quét thanh khoản).
   - Mô hình giá Harmonic (Gartley, Bat, Butterfly) nếu có.
4. Phong cách báo cáo: Sắc bén, chuyên nghiệp, tập trung vào hành động (Actionable).
5. Luôn xây dựng kịch bản phản ứng (Scenario Planning) thay vì chỉ dự đoán một chiều.
6. Cấu trúc báo cáo bắt buộc (trong phần fullReport):
   - PHẦN 1: TẠI SAO [MỨC GIÁ QUAN TRỌNG] LẠI QUAN TRỌNG? (THE "KEY LEVEL")
   - PHẦN 2: KỊCH BẢN CHI TIẾT (SCENARIO PLANNING) - Chia ra các Pha (Pha 1, Pha 2, Pha 3).
   - PHẦN 3: CHIẾN LƯỢC GIAO DỊCH (ACTIONABLE STRATEGY) - Tách biệt Trader Thế giới và Người giữ vàng SJC/Nhẫn.
   - PHẦN 4: RỦI RO CẦN LƯU Ý (RISK MANAGEMENT)
   - LỜI KHUYÊN CUỐI CÙNG (BOTTOM LINE)
`;

export class GeminiProvider implements AIProvider {
  id = 'gemini';
  name = 'Google Gemini';
  private apiKey: string;
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new GoogleGenAI({ apiKey });
  }

  async getModels(): Promise<string[]> {
    // Gemini has a fixed set of models we usually use, but we could list them.
    // For now, return the default one we use.
    return [MODEL_NAME, "gemini-1.5-pro", "gemini-1.5-flash"];
  }

  async generateAnalysis(realData: MarketData): Promise<AIAnalysisResult> {
    const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

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
      - Nhận diện các mẫu hình giá (Price Patterns) và SMC (Order Blocks, FVG): ví dụ Double Top, Head and Shoulders, Bearish Order Block tại kháng cự.

      BƯỚC 3: LẤY TIN TỨC KINH TẾ XÃ HỘI (MACRO) & CHÍNH TRỊ
      - Tìm kiếm "Gold market news today geopolitical news impact on gold" hoặc "Financial news breaking today".
      - Tìm kiếm "Economic Calendar today" (FED interest rate, CPI, Non-farm news impact).
      - Tìm kiếm "World news geopolitical events today" có ảnh hưởng đến tâm lý nhà đầu tư.

      BƯỚC 4: LẤY DỮ LIỆU LỊCH SỬ (CHART)
      - Tìm kiếm "XAUUSD price history last 50 hours hourly OHLC" để lấy chuỗi giá vàng trong 50 giờ qua.
      - Cố gắng lấy ít nhất 30-50 điểm dữ liệu để phục vụ tính toán chỉ báo.
      - Mỗi điểm dữ liệu CẦN có: Open, High, Low, Close (OHLC).

      BƯỚC 5: TỔNG HỢP BÁO CÁO
      - Tổng hợp các dữ liệu thô tìm được vào JSON.
      - KHÔNG CẦN TÍNH TOÁN "Spread" hay "Giá quy đổi", hệ thống sẽ tự tính.

      YÊU CẦU ĐẦU RA (JSON):
      Trong phần 'shortTermTrend', hãy phân tích cực kỳ chi tiết các mốc giá trong 1-3 ngày tới dựa trên nến 1H/4H, chú ý Order Blocks và FVG.
      Trong phần 'longTermTrend', hãy phân tích xu hướng tuần/tháng dựa trên nến Daily/Weekly và chu kỳ kinh tế của FED.
      Trong phần 'fullReport', hãy viết một bài phân tích chuyên sâu tổng hợp mọi yếu tố theo ĐÚNG CẤU TRÚC 4 PHẦN và BOTTOM LINE đã nêu trong hướng dẫn hệ thống. Sử dụng ngôn ngữ chuyên nghiệp của một Senior Trader.
    `;

    const response = await this.client.models.generateContent({
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
                xauPrice: { type: Type.NUMBER },
                dxyValue: { type: Type.NUMBER },
                sjcBuy: { type: Type.NUMBER },
                sjcSell: { type: Type.NUMBER },
                pnjBuy: { type: Type.NUMBER },
                pnjSell: { type: Type.NUMBER },
                btmcBuy: { type: Type.NUMBER },
                btmcSell: { type: Type.NUMBER },
                dojiBuy: { type: Type.NUMBER },
                dojiSell: { type: Type.NUMBER },
                ringGoldBuy: { type: Type.NUMBER },
                ringGoldSell: { type: Type.NUMBER },
                xagPrice: { type: Type.NUMBER },
                silverBuy: { type: Type.NUMBER },
                silverSell: { type: Type.NUMBER },
                usdVnd: { type: Type.NUMBER },
                spread: { type: Type.NUMBER },
                lastUpdated: { type: Type.STRING },
                ohlc: {
                  type: Type.OBJECT,
                  properties: {
                    open: { type: Type.NUMBER },
                    high: { type: Type.NUMBER },
                    low: { type: Type.NUMBER },
                    close: { type: Type.NUMBER }
                  }
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
                shortTermTrend: { type: Type.STRING },
                longTermTrend: { type: Type.STRING },
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
                fullReport: { type: Type.STRING },
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
                      time: { type: Type.STRING },
                      xau: { type: Type.NUMBER },
                      dxy: { type: Type.NUMBER },
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

    // Patch Missing Data from Real Data (Ground Truth)
    // If AI failed to find something, use what we already have
    const patchField = (field: keyof MarketData) => {
        if (!result.marketData[field] || result.marketData[field] === 0) {
            (result.marketData as any)[field] = (realData as any)[field];
        }
    };

    ["xauPrice", "xagPrice", "usdVnd", "sjcBuy", "sjcSell", "pnjBuy", "pnjSell", "btmcBuy", "btmcSell", "dojiBuy", "dojiSell", "ringGoldBuy", "ringGoldSell", "silverBuy", "silverSell"].forEach(f => patchField(f as keyof MarketData));

    return result as AIAnalysisResult;
  }

  async chat(history: { role: string; parts: { text: string }[] }[], message: string) {
    const chat = this.client.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: ANALYST_SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }]
      },
      history: history
    });
    return chat.sendMessageStream({ message });
  }
}
