import { GoogleGenAI, Type } from "@google/genai";
import { MarketData, AnalysisReport } from "../types";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || "dummy_key";
const ai = new GoogleGenAI({ apiKey });

// System instruction for the analyst persona
const ANALYST_SYSTEM_INSTRUCTION = `
Bạn là Chuyên gia Phân tích Tài chính cấp cao (Senior Gold Trader).
Nhiệm vụ: Phân tích thị trường Vàng (XAU/USD) và Vàng SJC dựa trên dữ liệu thực tế từ Google Finance và TradingView.
Nguyên tắc:
1. Dữ liệu giá phải lấy từ Google Finance (Real-time).
2. Phân tích kỹ thuật phải tương đồng với các chỉ báo trên TradingView.
3. Phong cách báo cáo: Sắc bén, chuyên nghiệp, tập trung vào hành động (Actionable).
`;

export const fetchMarketAnalysis = async (): Promise<{ marketData: MarketData; report: AnalysisReport }> => {
  const model = "gemini-3-flash-preview";
  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const prompt = `
    Thời gian phân tích: ${now}.
    
    HÃY SỬ DỤNG CÔNG CỤ TÌM KIẾM (GOOGLE SEARCH) ĐỂ THỰC HIỆN CÁC BƯỚC SAU:

    BƯỚC 1: LẤY DỮ LIỆU TÀI CHÍNH TỪ GOOGLE FINANCE
    - Tìm kiếm "XAU USD Google Finance" để lấy giá vàng thế giới hiện tại.
    - Tìm kiếm "Dollar Index DXY Google Finance" để lấy chỉ số DXY hiện tại.
    - Tìm kiếm "USD VND exchange rate Google Finance" để lấy tỷ giá.
    - Tìm kiếm "SJC Gold Price Vietnam" (webgia, pnj, sjc) để lấy giá SJC Mua/Bán mới nhất.

    BƯỚC 2: LẤY CHỈ SỐ KỸ THUẬT TỪ TRADINGVIEW (CONTEXT)
    - Tìm kiếm "XAUUSD TradingView technical analysis summary indicators" để biết chi tiết:
      + RSI (14), Stochastic Oscillator (14, 3, 3), CCI (20), ADX (14).
      + Giá so với MA50 và MA200.
      + Bollinger Bands, MACD Level & Signal.

    BƯỚC 3: LẤY TIN TỨC KINH TẾ XÃ HỘI (MACRO)
    - Tìm kiếm "Gold market news today Google Finance" hoặc "Financial news breaking today".
    - Tìm kiếm "Economic Calendar today" (FED interest rate, CPI, Non-farm news impact).

    BƯỚC 4: TÍNH TOÁN & TỔNG HỢP
    - Giá quy đổi = (XAU * Tỷ giá * 1.205) / 1000000.
    - Spread = Giá Bán SJC - Giá quy đổi.
    
    YÊU CẦU ĐẦU RA (JSON):
    Trong phần 'shortTermTrend', hãy phân tích cực kỳ chi tiết các mốc giá trong 1-3 ngày tới dựa trên nến 1H/4H.
    Trong phần 'longTermTrend', hãy phân tích xu hướng tuần/tháng dựa trên nến Daily/Weekly và chu kỳ kinh tế của FED.
    Trong phần 'fullReport', hãy viết một bài phân tích chuyên sâu tổng hợp mọi yếu tố.
  `;

  const response = await ai.models.generateContent({
    model: model,
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
              usdVnd: { type: Type.NUMBER },
              spread: { type: Type.NUMBER },
              lastUpdated: { type: Type.STRING }
            },
            required: ["xauPrice", "dxyValue", "sjcBuy", "sjcSell", "usdVnd", "spread", "lastUpdated"]
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
                  ma200: { type: Type.STRING, enum: ["ABOVE", "BELOW"] }
                },
                required: ["rsi", "stochastic", "adx", "cci", "trend", "support", "resistance", "macd", "bollinger", "ma50", "ma200"]
              },
              fullReport: { type: Type.STRING, description: "Báo cáo chuyên sâu tổng hợp" }
            },
            required: ["technicalSummary", "macroSummary", "localSpreadAnalysis", "tradingAction", "prediction", "shortTermTrend", "longTermTrend", "suggestedBuyZone", "entryPointBuy", "entryPointSell", "technicalSignals", "fullReport"]
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

  return JSON.parse(jsonText);
};

export const chatWithAnalyst = async (history: { role: string; parts: { text: string }[] }[], message: string) => {
  const chat = ai.chats.create({
    model: "gemini-3-pro-preview",
    config: {
      systemInstruction: ANALYST_SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }] 
    },
    history: history
  });

  const result = await chat.sendMessageStream({ message });
  return result;
};