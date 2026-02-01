/**
 * Financial & Technical Analysis Constants
 */

export const ANALYSIS_CONSTANTS = {
  // Conversion factors
  GOLD_CONVERSION_FACTOR: 1.205, // 1 oz = 0.829 tael approx, but including 25% premium/taxes/etc logic often used in VN is different.
                                 // Standard math: (Price * 1.205 * USDVND) / 1,000,000

  // RSI Thresholds
  RSI: {
    OVERBOUGHT: 70,
    OVERSOLD: 30,
    NEUTRAL: 50,
    EXTREME_HIGH: 85,
    EXTREME_LOW: 15,
  },

  // Stochastic Thresholds
  STOCHASTIC: {
    OVERBOUGHT: 80,
    OVERSOLD: 20,
  },

  // CCI Thresholds
  CCI: {
    OVERBOUGHT: 100,
    OVERSOLD: -100,
  },

  // ADX (Trend Strength)
  ADX: {
    STRONG_TREND: 25,
  },

  // Trend Confidence Score thresholds
  CONFIDENCE: {
    VERY_BULLISH: 80,
    BULLISH: 60,
    BEARISH: 40,
    VERY_BEARISH: 20,
    NEUTRAL: 50,
  },

  // Technical Action triggers
  ACTION_THRESHOLDS: {
    BUY: 70,
    SELL: 30,
  },

  // Scoring Weights
  WEIGHTS: {
    RSI: 10,
    STOCHASTIC: 5,
    CCI: 5,
    MA50: 15,
    MA200: 10,
    ADX: 10,
    MACD: 10,
    BB: 5
  },

  // Local Gold SJC Spread thresholds (Million VND)
  SPREAD: {
    HIGH: 6,
    MID: 3,
  },

  // UI/App specific constants
  REFRESH_INTERVAL_MS: 30 * 60 * 1000, // 30 minutes
  EXPORT_WINDOW_WIDTH: 1600,
  APP_VERSION: 'v1.5.0',
};

export const UI_LABELS = {
  TREND: {
    VERY_BULLISH: 'RẤT TÍCH CỰC',
    BULLISH: 'TÍCH CỰC',
    NEUTRAL: 'TRUNG LẬP',
    BEARISH: 'TIÊU CỰC',
    VERY_BEARISH: 'RẤT TIÊU CỰC',
  },
  ACTION: {
    BUY: 'MUA',
    SELL: 'BÁN',
    OBSERVE: 'QUAN SÁT',
    WARNING: 'CẢNH BÁO',
  },
  CATEGORIES: {
    MARKET: 'Thị trường',
    GEOPOLITICAL: 'Địa chính trị',
    MACRO: 'Vĩ mô',
  }
};
