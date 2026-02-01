export interface OHLC {
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface PivotLevelSet {
  pivot: number;
  r1: number;
  r2: number;
  r3: number;
  r4?: number;
  s1: number;
  s2: number;
  s3: number;
  s4?: number;
}

export interface PivotPoints {
  classic: PivotLevelSet;
  woodie: PivotLevelSet;
  camarilla: PivotLevelSet;
  fibonacci: PivotLevelSet;
}

export interface IchimokuCloud {
  tenkan: number;
  kijun: number;
  spanA: number;
  spanB: number;
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface ParabolicSAR {
  value: number;
  trend: 'UP' | 'DOWN';
}

export interface FibonacciLevels {
  level236: number;
  level382: number;
  level500: number;
  level618: number;
  trend: 'UP' | 'DOWN';
}

export interface OrderBlock {
  type: 'BULLISH' | 'BEARISH';
  top: number;
  bottom: number;
  significance: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface FairValueGap {
  type: 'BULLISH' | 'BEARISH';
  top: number;
  bottom: number;
  isFilled: boolean;
}

export interface HarmonicPattern {
  name: string; // Gartley, Bat, Butterfly...
  type: 'BULLISH' | 'BEARISH';
  completionPrice: number;
  stopLoss: number;
  takeProfit: number;
}

export interface SmartMoneyConcepts {
  orderBlocks: OrderBlock[];
  fairValueGaps: FairValueGap[];
}

export interface PricePattern {
  name: string;
  type: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  reliability: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
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
  stochastic: number; // Stochastic %K
  adx: number;        // Trend Strength
  cci: number;        // Commodity Channel Index
  trend: string;
  support: number;
  resistance: number;
  macd: string;
  bollinger: string;
  ma50: 'ABOVE' | 'BELOW';  // Price vs SMA50
  ma200: 'ABOVE' | 'BELOW'; // Price vs SMA200
  pivotPoints?: PivotPoints; // Expanded Pivot Points
  fibonacciLevels?: FibonacciLevels;
  ichimoku?: IchimokuCloud; // New
  sar?: ParabolicSAR; // New
  smartMoney?: SmartMoneyConcepts; // New: SMC Analysis
  harmonicPatterns?: HarmonicPattern[]; // New: Harmonics
  pricePatterns?: PricePattern[];
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
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}
