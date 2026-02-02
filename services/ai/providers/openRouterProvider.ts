import { AIProvider, AIAnalysisResult } from "../types";
import { MarketData } from "../../../types";
import { fetchGoldChartData } from "../../marketDataFetcher";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";

const ANALYST_SYSTEM_PROMPT = `
You are a Senior Gold Trader and Financial Analyst (Chuyên gia Phân tích Tài chính cấp cao).
Your task is to analyze the Gold Market (XAU/USD) and Vietnam SJC Gold based STRICTLY on the provided data.
You do NOT have internet access, so you must rely on the provided "Context Data".

Response Format: JSON strictly.

Structure of the report (in 'fullReport' field, use Vietnamese):
   - PHẦN 1: TẠI SAO [MỨC GIÁ QUAN TRỌNG] LẠI QUAN TRỌNG? (KEY LEVEL)
   - PHẦN 2: KỊCH BẢN CHI TIẾT (SCENARIO PLANNING) - 3 Phases.
   - PHẦN 3: CHIẾN LƯỢC GIAO DỊCH (ACTIONABLE STRATEGY).
   - PHẦN 4: QUẢN TRỊ RỦI RO.
   - BOTTOM LINE.

JSON Schema required:
{
  "marketData": { ... },
  "report": {
    "technicalSummary": "string",
    "macroSummary": "string",
    "localSpreadAnalysis": "string",
    "tradingAction": "MUA" | "BÁN" | "QUAN SÁT" | "CẢNH BÁO",
    "prediction": "string",
    "shortTermTrend": "string",
    "longTermTrend": "string",
    "suggestedBuyZone": "string",
    "entryPointBuy": number,
    "entryPointSell": number,
    "technicalSignals": {
       "trend": "BULLISH" | "BEARISH" | "NEUTRAL",
       "support": number,
       "resistance": number,
       "macd": "string",
       "bollinger": "string",
       "ma50": "ABOVE" | "BELOW",
       "ma200": "ABOVE" | "BELOW",
       "rsi": number (estimate),
       "stochastic": number (estimate),
       "adx": number,
       "cci": number
    },
    "fullReport": "string (Markdown formatted)",
    "news": [ { "title": "string", "source": "string", "summary": "string", "category": "MARKET", "timestamp": "string" } ],
    "chartData": [] (Leave empty, system will fill)
  }
}
`;

export class OpenRouterProvider implements AIProvider {
  id = 'openrouter';
  name = 'OpenRouter';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "openai/gpt-4o") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async getModels(): Promise<string[]> {
    try {
      const response = await fetch(`${OPENROUTER_API_URL}/models`, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        }
      });
      if (!response.ok) return ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "meta-llama/llama-3.1-70b-instruct"];

      const data = await response.json();
      // Filter for decent chat models, sort by pricing or popularity if possible
      // For now, just return ids
      if (!data || !Array.isArray(data.data)) {
        console.warn("Unexpected OpenRouter models response format", data);
        return ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "meta-llama/llama-3.1-70b-instruct"];
      }
      return data.data.map((m: any) => m.id);
    } catch (e) {
      console.warn("Failed to fetch OpenRouter models", e);
      return ["openai/gpt-4o", "anthropic/claude-3.5-sonnet"]; // Fallback
    }
  }

  async generateAnalysis(realData: MarketData): Promise<AIAnalysisResult> {
    // 1. Fetch Chart Data (History) to inject into prompt
    const chartData = await fetchGoldChartData();
    const last24h = chartData.slice(-24); // Last 24 candles (1H)

    // 2. Construct Context
    const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const context = `
      Time: ${now}

      MARKET DATA (REAL-TIME):
      - Gold (XAU/USD): ${realData.xauPrice}
      - Silver (XAG/USD): ${realData.xagPrice}
      - USD/VND: ${realData.usdVnd}
      - SJC Gold (VN): ${realData.sjcBuy} (Buy) - ${realData.sjcSell} (Sell)
      - Ring Gold (VN): ${realData.ringGoldBuy} (Buy) - ${realData.ringGoldSell} (Sell)

      RECENT PRICE HISTORY (Last 24 Hours - 1H Candles):
      ${last24h.map(c => `[${c.time}]: Open=${c.open}, High=${c.high}, Low=${c.low}, Close=${c.close}`).join('\n')}

      TASK:
      Analyze the trend based on the price history provided.
      Identify Support/Resistance levels from the Highs and Lows of the last 24h.
      Estimate RSI/Stochastic sentiment (Overbought/Oversold) based on the recent price action.
      Provide a detailed strategy for a Vietnamese gold investor (SJC/Ring Gold) and an International Trader (XAU).

      Since you cannot browse the internet, assume standard correlations:
      - If DXY (Dollar) is up, Gold is likely down.
      - If Geopolitical tension is high, Gold is Safe Haven.
      (Use your internal knowledge base for general correlations).
    `;

    // 3. Call OpenRouter
    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://gold-analyst.app", // Required by OpenRouter
        "X-Title": "Gold Market Analyst"
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: ANALYST_SYSTEM_PROMPT },
          { role: "user", content: context }
        ],
        response_format: { type: "json_object" } // supported by many top models
      })
    });

    if (!response.ok) {
       const err = await response.text();
       throw new Error(`OpenRouter API Error: ${response.status} - ${err}`);
    }

    const json = await response.json();
    const content = json.choices[0].message.content;

    // Parse JSON
    let result;
    try {
        result = JSON.parse(content);
    } catch (e) {
        // Try to clean markdown code blocks if present
        const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
        result = JSON.parse(cleaned);
    }

    // Inject the real chart data we fetched so the UI can render it
    if (result.report) {
        result.report.chartData = chartData;
    }

    // Patch missing market data from realData
    const patchField = (field: keyof MarketData) => {
        if (!result.marketData) result.marketData = {};
        if (!result.marketData[field] || result.marketData[field] === 0) {
            (result.marketData as any)[field] = (realData as any)[field];
        }
    };
    ["xauPrice", "xagPrice", "usdVnd", "sjcBuy", "sjcSell", "pnjBuy", "pnjSell", "btmcBuy", "btmcSell", "dojiBuy", "dojiSell", "ringGoldBuy", "ringGoldSell", "silverBuy", "silverSell"].forEach(f => patchField(f as keyof MarketData));

    return result as AIAnalysisResult;
  }

  async chat(history: { role: string; parts: { text: string }[] }[], message: string) {
    // Convert Gemini history format to OpenAI format
    const messages = history.map(h => ({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.parts[0].text
    }));
    messages.push({ role: 'user', content: message });

    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
         "HTTP-Referer": "https://gold-analyst.app",
         "X-Title": "Gold Market Analyst"
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
            { role: "system", content: ANALYST_SYSTEM_PROMPT },
            ...messages
        ],
        stream: true
      })
    });

    // Handle stream response
    // The existing UI expects a Gemini-like stream object.
    // We need to adapt the OpenAI stream to the interface expected by the UI.
    // The UI uses `result.stream` which is an async iterable.

    // Actually, checking `App.tsx` or `ChatWidget.tsx` to see how it consumes the stream.
    // `geminiService` returns `result` which has `stream`.
    // `for await (const chunk of result.stream) { const chunkText = chunk.text(); ... }`

    // We need to create an async generator that yields objects with a `text()` method.

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    async function* streamGenerator() {
      if (!reader) return;

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
           if (line.trim() === '') continue;
           if (line.trim() === 'data: [DONE]') continue;
           if (line.startsWith('data: ')) {
               try {
                   const data = JSON.parse(line.slice(6));
                   const text = data.choices[0]?.delta?.content || '';
                   if (text) {
                       yield { text: () => text };
                   }
               } catch (e) {
                   // ignore parse error
               }
           }
        }
      }
    }

    return { stream: streamGenerator() };
  }
}
