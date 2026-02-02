import { MarketData, AnalysisReport } from "../../types";

export interface AIAnalysisResult {
  marketData: MarketData;
  report: AnalysisReport;
}

export interface AIProvider {
  id: string;
  name: string;

  /**
   * Generates a full market analysis report based on provided market data.
   */
  generateAnalysis(marketData: MarketData): Promise<AIAnalysisResult>;

  /**
   * Sends a message to the chat interface.
   * Note: The history format might need to be standardized, but for now we'll match existing usage.
   */
  chat(history: { role: string; parts: { text: string }[] }[], message: string): Promise<any>;

  /**
   * Returns a list of available models for this provider (if applicable).
   */
  getModels(): Promise<string[]>;
}

export interface AIProviderConfig {
  providerId: 'gemini' | 'openrouter';
  apiKey: string;
  modelId?: string; // For OpenRouter or specific Gemini models
}
