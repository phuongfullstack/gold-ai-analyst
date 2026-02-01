import { MarketData, AnalysisReport, ChartDataPoint, TechnicalSignals } from "../../types";
import { ANALYSIS_CONSTANTS, UI_LABELS } from "../../utils/constants";
import {
  calculatePivotPointsExtended,
  calculateRSI,
  calculateStochastic,
  calculateIchimoku,
  calculateParabolicSAR,
  calculateFibonacciLevels,
  detectOrderBlocks,
  detectFairValueGaps,
  detectHarmonicPatterns
} from "../../utils/technicalAlgorithms";
import {
  calculateTrendConfidence,
  calculateTechnicalAction,
  generateMarketInsight,
  analyzeLocalPremium
} from "../../utils/algorithms";

export const enrichMarketAnalysis = (
  marketData: MarketData,
  report: AnalysisReport
): { marketData: MarketData; report: AnalysisReport } => {
  const result = { marketData: { ...marketData }, report: { ...report } };

  // --- POST-PROCESSING: Calculate Spread & Validate Data ---
  // 0. Ensure we have numbers for critical fields
  const xau = Number(result.marketData.xauPrice) || 0;
  const usdVnd = Number(result.marketData.usdVnd) || 0;
  const sjcSell = Number(result.marketData.sjcSell) || 0;

  // Silver Price Fallback / Calculation
  if ((!result.marketData.silverSell || result.marketData.silverSell === 0) && result.marketData.xagPrice > 0) {
    const convertedSilver = (result.marketData.xagPrice * result.marketData.usdVnd * 1.205) / 1000000;
    result.marketData.silverBuy = Number((convertedSilver * 0.92).toFixed(2));
    result.marketData.silverSell = Number(convertedSilver.toFixed(2));
  }

  // Spread Calculation
  if (xau > 0 && usdVnd > 0 && sjcSell > 0) {
    // Formula: (XAU * USDVND * 1.205) / 1,000,000 = Converted Price (Million VND/Tael)
    const convertedPrice = (xau * usdVnd * ANALYSIS_CONSTANTS.GOLD_CONVERSION_FACTOR) / 1000000;
    const spread = sjcSell - convertedPrice;
    result.marketData.spread = Number(spread.toFixed(2));
  }

  // --- ALGORITHMIC VERIFICATION & ENRICHMENT ---
  // 1. Calculate Pivot Points & Fibo if OHLC is available
  if (result.marketData.ohlc) {
      const { high, low, close, open } = result.marketData.ohlc;

      if (high && low && close) {
          const pivots = calculatePivotPointsExtended(high, low, close, open || close);
          result.report.technicalSignals.pivotPoints = pivots;
      }

      if (high && low && open && close) {
           const fibs = calculateFibonacciLevels(high, low, open, close);
           result.report.technicalSignals.fibonacciLevels = fibs;
      }
  }

  // 2. Advanced Indicators Calculation using retrieved Chart Data
  if (result.report.chartData && result.report.chartData.length > 0) {
      // Sort by time ascending
      const sortedData = [...result.report.chartData].sort((a, b) => parseInt(a.time) - parseInt(b.time));

      const opens = sortedData.map(d => d.open || d.xau);
      const highs = sortedData.map(d => d.high || d.xau);
      const lows = sortedData.map(d => d.low || d.xau);
      const closes = sortedData.map(d => d.close || d.xau);

      // Calculate and Overwrite AI guesses with Math (if sufficient data)
      if (closes.length >= 14) {
          result.report.technicalSignals.rsi = calculateRSI(closes);
          result.report.technicalSignals.stochastic = calculateStochastic(highs, lows, closes);
      }

      if (closes.length >= 26) {
           const ichimoku = calculateIchimoku(highs, lows, closes);
           if (ichimoku) result.report.technicalSignals.ichimoku = ichimoku;
      }

      const sar = calculateParabolicSAR(highs, lows, closes);
      result.report.technicalSignals.sar = sar;

      // Calculate Advanced Signals (SMC & Harmonics)
      result.report.technicalSignals.smartMoney = {
        orderBlocks: detectOrderBlocks(opens, highs, lows, closes),
        fairValueGaps: detectFairValueGaps(highs, lows)
      };
      result.report.technicalSignals.harmonicPatterns = detectHarmonicPatterns(highs, lows);
  }

  // 3. Calculate Trend Confidence Score
  const confidence = calculateTrendConfidence(result.report.technicalSignals);
  result.report.technicalSignals.confidenceScore = confidence;

  // 4. Generate Algorithmic Insight & Action
  const algoAction = calculateTechnicalAction(result.report.technicalSignals);
  const algoInsight = generateMarketInsight(result.report.technicalSignals);

  // Cross-verify Action: If AI is 'QUAN SÁT' (Neutral) but Math is decisive, use Math
  if (result.report.tradingAction === UI_LABELS.ACTION.OBSERVE && algoAction !== UI_LABELS.ACTION.OBSERVE) {
      result.report.tradingAction = algoAction as any;
  }

  // Append algorithmic insight to technical summary
  // Avoid duplicating if already present
  if (!result.report.technicalSummary.includes("[Hệ thống]:")) {
      result.report.technicalSummary = `${result.report.technicalSummary}\n\n[Hệ thống]: ${algoInsight}`;
  }

  // 5. Local Premium Analysis
  if (result.marketData.spread !== undefined) {
      const premiumAdvice = analyzeLocalPremium(result.marketData.spread);
      // Avoid duplicating
      if (!result.report.localSpreadAnalysis.includes(premiumAdvice.substring(0, 20))) {
         result.report.localSpreadAnalysis = `${result.report.localSpreadAnalysis}\n\n${premiumAdvice}`;
      }
  }

  return result;
};
