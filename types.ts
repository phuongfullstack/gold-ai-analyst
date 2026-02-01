export interface OHLC {
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface PivotPoints {
  pivot: number;
  r1: number;
  r2: number;
  s1: number;
  s2: number;
}

export interface FibonacciLevels {
  level236: number;
  level382: number;
  level500: number;
  level618: number;
  trend: 'UP' | 'DOWN';
}

export interface MarketNews {
  title: string;
  source: string;
  summary: string;
  category: 'MARKET' | 'GEOPOLITICAL' | 'MACRO';
  timestamp: string;
}

export interface MarketData {
  xauPrice: number;
  dxyValue: number;
  sjcBuy: number;
  sjcSell: number;
  pnjBuy: number;
  pnjSell: number;
  btmcBuy: number;
  btmcSell: number;
  dojiBuy: number;
  dojiSell: number;
  ringGoldBuy: number;
  ringGoldSell: number;
  xagPrice: number;
  silverBuy: number;
  silverSell: number;
  usdVnd: number;
  spread: number;
  lastUpdated: string;
  ohlc?: OHLC; // Optional as it might fail to fetch
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
  pivotPoints?: PivotPoints; // Calculated Algorithmic Support
  fibonacciLevels?: FibonacciLevels;
  confidenceScore?: {
    score: number;
    label: string;
  };
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
  news: MarketNews[];
  chartData?: ChartDataPoint[];
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