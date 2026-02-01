import { PivotPoints, IchimokuCloud, ParabolicSAR, PivotLevelSet, FibonacciLevels, OrderBlock, FairValueGap, HarmonicPattern } from '../types';

/**
 * Calculates Simple Moving Average (SMA)
 */
export const calculateSMA = (data: number[], period: number): number => {
  if (data.length < period) return 0;
  const slice = data.slice(data.length - period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
};

/**
 * Calculates Exponential Moving Average (EMA)
 */
export const calculateEMA = (data: number[], period: number): number[] => {
  const k = 2 / (period + 1);
  const emaArray = [data[0]];
  for (let i = 1; i < data.length; i++) {
    emaArray.push(data[i] * k + emaArray[i - 1] * (1 - k));
  }
  return emaArray;
};

/**
 * Calculates RSI (Relative Strength Index)
 * Uses Wilder's Smoothing method if enough data, or simple avg for short series.
 */
export const calculateRSI = (closes: number[], period: number = 14): number => {
  if (closes.length < period + 1) return 50; // Not enough data

  let gains = 0;
  let losses = 0;

  // First period (Simple Average)
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Subsequent periods (Wilder's Smoothing)
  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Number((100 - (100 / (1 + rs))).toFixed(2));
};

/**
 * Calculates Stochastic Oscillator %K
 */
export const calculateStochastic = (highs: number[], lows: number[], closes: number[], period: number = 14): number => {
  if (highs.length < period || lows.length < period || closes.length < period) return 50;

  const currentClose = closes[closes.length - 1];
  const periodHighs = highs.slice(highs.length - period);
  const periodLows = lows.slice(lows.length - period);

  const highestHigh = Math.max(...periodHighs);
  const lowestLow = Math.min(...periodLows);

  if (highestHigh === lowestLow) return 50;

  const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
  return Number(k.toFixed(2));
};

/**
 * Calculates Ichimoku Cloud Components
 * Requires at least 26 periods of data for Baseline (Kijun-sen).
 */
export const calculateIchimoku = (highs: number[], lows: number[], closes: number[]): IchimokuCloud | undefined => {
  if (highs.length < 26) return undefined;

  const getMidpoint = (h: number[], l: number[]) => {
    return (Math.max(...h) + Math.min(...l)) / 2;
  };

  // Tenkan-sen (Conversion Line): (Highest High + Lowest Low) / 2 for last 9 periods
  const tenkanHighs = highs.slice(highs.length - 9);
  const tenkanLows = lows.slice(lows.length - 9);
  const tenkan = getMidpoint(tenkanHighs, tenkanLows);

  // Kijun-sen (Base Line): (Highest High + Lowest Low) / 2 for last 26 periods
  const kijunHighs = highs.slice(highs.length - 26);
  const kijunLows = lows.slice(lows.length - 26);
  const kijun = getMidpoint(kijunHighs, kijunLows);

  // Senkou Span A (Leading Span A): (Tenkan + Kijun) / 2
  // Note: This is usually plotted 26 periods ahead, but the *value* is derived from current Tenkan/Kijun
  const spanA = (tenkan + kijun) / 2;

  // Senkou Span B (Leading Span B): (Highest High + Lowest Low) / 2 for last 52 periods
  // If we don't have 52 periods, we approximate with what we have (e.g. 26 or 30)
  const spanBPeriod = Math.min(52, highs.length);
  const spanBHighs = highs.slice(highs.length - spanBPeriod);
  const spanBLows = lows.slice(lows.length - spanBPeriod);
  const spanB = getMidpoint(spanBHighs, spanBLows);

  const currentClose = closes[closes.length - 1];

  let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  if (currentClose > spanA && currentClose > spanB) signal = 'BULLISH';
  else if (currentClose < spanA && currentClose < spanB) signal = 'BEARISH';

  // Crossover check
  if (tenkan > kijun && currentClose > spanB) signal = 'BULLISH';
  if (tenkan < kijun && currentClose < spanB) signal = 'BEARISH';

  return {
    tenkan: Number(tenkan.toFixed(2)),
    kijun: Number(kijun.toFixed(2)),
    spanA: Number(spanA.toFixed(2)),
    spanB: Number(spanB.toFixed(2)),
    signal
  };
};

/**
 * Calculates Parabolic SAR
 * Simplified implementation for latest trend direction
 */
export const calculateParabolicSAR = (highs: number[], lows: number[], closes: number[]): ParabolicSAR => {
    // Requires previous SAR to calculate current. This is hard with just a slice.
    // We will estimate trend based on recent price action if full history is missing.
    // Logic: If close > 20-period High -> UP, if close < 20-period Low -> DOWN
    const len = closes.length;
    if (len < 2) return { value: 0, trend: 'UP' };

    const lastClose = closes[len - 1];
    const prevClose = closes[len - 2];

    // Very basic trend detection for SAR fallback
    const trend = lastClose > prevClose ? 'UP' : 'DOWN';
    // SAR usually trails price.
    const value = trend === 'UP' ? Math.min(...lows.slice(Math.max(0, len-5))) : Math.max(...highs.slice(Math.max(0, len-5)));

    return {
        value: Number(value.toFixed(2)),
        trend
    };
};

/**
 * Calculates Extended Pivot Points (Classic, Woodie, Camarilla, Fibonacci)
 */
export const calculatePivotPointsExtended = (high: number, low: number, close: number, open: number): PivotPoints => {
  // 1. Classic
  const p = (high + low + close) / 3;
  const classic: PivotLevelSet = {
    pivot: p,
    r1: (2 * p) - low,
    r2: p + (high - low),
    r3: p + 2 * (high - low), // Approximation
    s1: (2 * p) - high,
    s2: p - (high - low),
    s3: p - 2 * (high - low)
  };

  // 2. Woodie
  // Pivot = (H + L + 2C) / 4
  // Note: Woodie uses current open for some, but typically (H+L+2C)/4 is standard for 'next session'
  const wp = (high + low + 2 * close) / 4;
  const woodie: PivotLevelSet = {
    pivot: wp,
    r1: (2 * wp) - low,
    r2: wp + (high - low),
    r3: high + 2 * (wp - low), // Woodie formula vary, using standard extension
    s1: (2 * wp) - high,
    s2: wp - (high - low),
    s3: low - 2 * (high - wp)
  };

  // 3. Camarilla
  const range = high - low;
  const camarilla: PivotLevelSet = {
    pivot: p, // Camarilla doesn't really use a central pivot in the same way, but we keep it
    r3: close + range * 1.1 / 4, // R3
    r4: close + range * 1.1 / 2, // R4 (Breakout)
    // We map R4 to R3 in our strict struct if needed, or just standard formulas:
    // R1 = C + range * 1.1 / 12
    // R2 = C + range * 1.1 / 6
    // R3 = C + range * 1.1 / 4
    // R4 = C + range * 1.1 / 2
    r1: close + range * 1.1 / 12,
    r2: close + range * 1.1 / 6,
    s1: close - range * 1.1 / 12,
    s2: close - range * 1.1 / 6,
    s3: close - range * 1.1 / 4
  };

  // 4. Fibonacci
  const fibonacci: PivotLevelSet = {
    pivot: p,
    r1: p + (range * 0.382),
    r2: p + (range * 0.618),
    r3: p + (range * 1.000),
    s1: p - (range * 0.382),
    s2: p - (range * 0.618),
    s3: p - (range * 1.000)
  };

  // Round all values
  const roundSet = (set: PivotLevelSet): PivotLevelSet => {
    return Object.fromEntries(
        Object.entries(set).map(([k, v]) => [k, Number(v.toFixed(2))])
    ) as unknown as PivotLevelSet;
  };

  return {
    classic: roundSet(classic),
    woodie: roundSet(woodie),
    camarilla: roundSet(camarilla),
    fibonacci: roundSet(fibonacci)
  };
};

/**
 * Calculates Fibonacci Retracement Levels for a generic trend.
 * Used to identify potential support (if uptrend) or resistance (if downtrend).
 */
export const calculateFibonacciRetracement = (high: number, low: number, trend: 'UP' | 'DOWN') => {
    const diff = high - low;
    const FIB_LEVELS = {
        L236: 0.236,
        L382: 0.382,
        L500: 0.5,
        L618: 0.618
    };

    if (trend === 'UP') {
        // Trend is UP, we measure Pullbacks. High is peak, Low is trough.
        // Support levels are below the High.
        return {
            level236: high - (diff * FIB_LEVELS.L236),
            level382: high - (diff * FIB_LEVELS.L382),
            level500: high - (diff * FIB_LEVELS.L500),
            level618: high - (diff * FIB_LEVELS.L618)
        };
    } else {
        // Trend is DOWN. We measure bounces. Low is bottom, High is start.
        // Resistance levels are above the Low.
        return {
            level236: low + (diff * FIB_LEVELS.L236),
            level382: low + (diff * FIB_LEVELS.L382),
            level500: low + (diff * FIB_LEVELS.L500),
            level618: low + (diff * FIB_LEVELS.L618)
        };
    }
};

/**
 * Wrapper for Fibonacci levels calculation from OHLC.
 */
export const calculateFibonacciLevels = (high: number, low: number, open: number, close: number): FibonacciLevels => {
    const trend = close >= open ? 'UP' : 'DOWN';
    const levels = calculateFibonacciRetracement(high, low, trend);
    return {
        ...Object.fromEntries(
            Object.entries(levels).map(([k, v]) => [k, Number(v.toFixed(2))])
        ),
        trend
    } as FibonacciLevels;
};

// --- SMART MONEY CONCEPTS (SMC) & PATTERNS ---

/**
 * Detects Order Blocks (Simplified)
 * Definition: The last opposing candle before a strong move that breaks structure/momentum.
 */
export const detectOrderBlocks = (
    opens: number[],
    highs: number[],
    lows: number[],
    closes: number[]
): OrderBlock[] => {
    const blocks: OrderBlock[] = [];
    if (closes.length < 5) return blocks;

    // Look back last 20 periods
    for (let i = closes.length - 2; i > Math.max(0, closes.length - 20); i--) {
        const currentBody = Math.abs(closes[i] - opens[i]);
        const nextBody = Math.abs(closes[i+1] - opens[i+1]);
        const moveSize = Math.abs(closes[i+1] - closes[i]);

        // Bullish OB: Last bearish candle before a strong move up
        if (closes[i] < opens[i] && closes[i+1] > opens[i+1] && nextBody > currentBody * 2) {
             blocks.push({
                 type: 'BULLISH',
                 top: highs[i],
                 bottom: lows[i],
                 significance: 'HIGH'
             });
        }
        // Bearish OB: Last bullish candle before a strong move down
        else if (closes[i] > opens[i] && closes[i+1] < opens[i+1] && nextBody > currentBody * 2) {
             blocks.push({
                 type: 'BEARISH',
                 top: highs[i],
                 bottom: lows[i],
                 significance: 'HIGH'
             });
        }
    }
    // Return top 2 recent blocks
    return blocks.slice(0, 2);
};

/**
 * Detects Fair Value Gaps (FVG) / Imbalances
 * Definition: Gap between Candle[i-1] High/Low and Candle[i+1] Low/High.
 */
export const detectFairValueGaps = (highs: number[], lows: number[]): FairValueGap[] => {
    const gaps: FairValueGap[] = [];
    if (highs.length < 3) return gaps;

    // Check last 10 candles
    for (let i = highs.length - 2; i > Math.max(1, highs.length - 10); i--) {
        const prevHigh = highs[i-1];
        const prevLow = lows[i-1];
        const nextHigh = highs[i+1];
        const nextLow = lows[i+1];

        // Bullish FVG: Current candle is big Green. Prev High < Next Low
        if (lows[i+1] > highs[i-1]) {
            gaps.push({
                type: 'BULLISH',
                top: lows[i+1],
                bottom: highs[i-1],
                isFilled: false
            });
        }
        // Bearish FVG: Current candle is big Red. Prev Low > Next High
        else if (highs[i+1] < lows[i-1]) {
             gaps.push({
                 type: 'BEARISH',
                 top: lows[i-1],
                 bottom: highs[i+1],
                 isFilled: false
             });
        }
    }
    return gaps;
};

/**
 * Detects Basic Harmonic Patterns (Gartley/Bat)
 * Very simplified XABCD logic based on ZigZag points would be ideal,
 * but here we check for simple geometric ratios on recent swing points.
 */
export const detectHarmonicPatterns = (highs: number[], lows: number[]): HarmonicPattern[] => {
    // This is a placeholder for complex harmonic logic.
    // In a real system, we'd need a ZigZag indicator first.
    return [];
};

/**
 * Calculates Dynamic Weights for Trend Confidence Score
 * Logic: If market is Trending (High ADX), prioritize Trend Following (MA, MACD).
 * If market is Ranging (Low ADX), prioritize Oscillators (RSI, Stoch).
 */
export const calculateDynamicWeights = (adx: number) => {
    const isTrending = adx > 25;

    // Base weights
    const weights = {
        RSI: 10,
        STOCHASTIC: 10,
        MACD: 10,
        MA: 10,
        SMC: 15, // Smart Money Concepts
        ICHIMOKU: 10
    };

    if (isTrending) {
        weights.MA = 20;
        weights.MACD = 15;
        weights.ICHIMOKU = 15;
        weights.RSI = 5; // Oscillators fail in strong trends
        weights.STOCHASTIC = 5;
    } else {
        // Ranging
        weights.RSI = 20;
        weights.STOCHASTIC = 20;
        weights.MA = 5; // MAs get choppy in range
        weights.MACD = 5;
    }
    return weights;
};
