export interface MarketData {
  xauPrice: number;
  dxyValue: number;
  sjcBuy: number;
  sjcSell: number;
  usdVnd: number;
  spread: number;
  lastUpdated: string;
}

export interface TechnicalSignals {
  rsi: number;
  stochastic: number; // New: Stochastic %K
  adx: number;        // New: Trend Strength
  cci: number;        // New: Commodity Channel Index
  trend: string;
  support: number;
  resistance: number;
  macd: string;
  bollinger: string;
  ma50: 'ABOVE' | 'BELOW';  // New: Price vs SMA50
  ma200: 'ABOVE' | 'BELOW'; // New: Price vs SMA200
}

export interface AnalysisReport {
  technicalSummary: string;
  macroSummary: string;
  localSpreadAnalysis: string;
  tradingAction: 'MUA' | 'BÁN' | 'QUAN SÁT' | 'CẢNH BÁO';
  prediction: string;
  shortTermTrend: string;
  longTermTrend: string;
  suggestedBuyZone: string;
  entryPointBuy: number;
  entryPointSell: number;
  technicalSignals: TechnicalSignals;
  fullReport: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ChartDataPoint {
  time: string;
  xau: number;
  dxy: number;
}