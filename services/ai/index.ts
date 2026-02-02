import { MarketData, AnalysisReport } from "../../types";
import { fetchAllMarketData } from "../marketDataFetcher";
import { enrichMarketAnalysis } from "./utils";
import { fetchFallbackData } from "./fallback";
import { AIProvider, AIAnalysisResult } from "./types";
import { GeminiProvider } from "./providers/geminiProvider";
import { OpenRouterProvider } from "./providers/openRouterProvider";

const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4o";

const getProvider = (): AIProvider | null => {
  const geminiKey = localStorage.getItem("GEMINI_API_KEY");
  const openRouterKey = localStorage.getItem("OPENROUTER_API_KEY");
  const selectedProvider = localStorage.getItem("SELECTED_AI_PROVIDER"); // 'gemini' | 'openrouter'

  // Default to Gemini if no selection but key exists
  if ((selectedProvider === 'gemini' || !selectedProvider) && geminiKey) {
    return new GeminiProvider(geminiKey);
  }

  if (selectedProvider === 'openrouter' && openRouterKey) {
    const model = localStorage.getItem("OPENROUTER_MODEL") || DEFAULT_OPENROUTER_MODEL;
    return new OpenRouterProvider(openRouterKey, model);
  }

  // Fallback priorities if explicit selection is missing or invalid
  if (geminiKey) return new GeminiProvider(geminiKey);
  if (openRouterKey) {
    const model = localStorage.getItem("OPENROUTER_MODEL") || DEFAULT_OPENROUTER_MODEL;
    return new OpenRouterProvider(openRouterKey, model);
  }

  return null;
};

export const getAvailableAIModels = async (): Promise<string[]> => {
    const provider = getProvider();
    if (provider) {
        return provider.getModels();
    }
    return [];
};

export const fetchMarketAnalysis = async (): Promise<{ marketData: MarketData; report: AnalysisReport }> => {
  const provider = getProvider();

  // If no provider (no keys), go straight to fallback
  if (!provider) {
    console.warn("No AI Provider configured. Using Fallback.");
    const fallback = await fetchFallbackData();
    return enrichMarketAnalysis(fallback.marketData, fallback.report);
  }

  try {
    // 1. Fetch Real-time Data (Manager Layer)
    // We use a timeout race to ensure we don't hang if APIs are down
    const realData = await Promise.race([
        fetchAllMarketData(),
        new Promise<MarketData>((_, reject) => setTimeout(() => reject(new Error("Global Data Timeout")), 15000))
    ]);

    // 2. Delegate to Provider
    let result: AIAnalysisResult;
    try {
        result = await provider.generateAnalysis(realData);
    } catch (aiError) {
        console.error(`AI Provider (${provider.name}) failed:`, aiError);
        // If AI fails, we might still have realData.
        // We can fall back to "Math Mode" using realData instead of full mock.
        // But for simplicity, we use the robust fallback system which handles everything.
        throw aiError;
    }

    // 3. Enrich & Verify (Math Layer)
    return enrichMarketAnalysis(result.marketData, result.report);

  } catch (error) {
    console.error("Analysis failed, switching to fallback:", error);
    const fallback = await fetchFallbackData();
    return enrichMarketAnalysis(fallback.marketData, fallback.report);
  }
};

export const chatWithAnalyst = async (history: { role: string; parts: { text: string }[] }[], message: string) => {
  const provider = getProvider();
  if (!provider) {
      throw new Error("Vui lòng cài đặt API Key trong phần Cài đặt để chat với chuyên gia.");
  }
  return provider.chat(history, message);
};
