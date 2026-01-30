import { TechnicalSignals } from '../types';

export interface PivotPoints {
    pivot: number;
    r1: number;
    r2: number;
    s1: number;
    s2: number;
}

/**
 * Calculates Standard Pivot Points.
 * @param high Previous High
 * @param low Previous Low
 * @param close Previous Close
 */
export const calculatePivotPoints = (high: number, low: number, close: number): PivotPoints => {
    const pivot = (high + low + close) / 3;
    const r1 = (2 * pivot) - low;
    const s1 = (2 * pivot) - high;
    const r2 = pivot + (high - low);
    const s2 = pivot - (high - low);

    return {
        pivot: Number(pivot.toFixed(2)),
        r1: Number(r1.toFixed(2)),
        r2: Number(r2.toFixed(2)),
        s1: Number(s1.toFixed(2)),
        s2: Number(s2.toFixed(2))
    };
};

/**
 * Calculates Fibonacci Retracement Levels for a generic trend.
 * Used to identify potential support (if uptrend) or resistance (if downtrend).
 */
export const calculateFibonacciRetracement = (high: number, low: number, trend: 'UP' | 'DOWN') => {
    const diff = high - low;
    if (trend === 'UP') {
        // Trend is UP, we measure Pullbacks. High is peak, Low is trough.
        // Support levels are below the High.
        return {
            level236: high - (diff * 0.236),
            level382: high - (diff * 0.382),
            level500: high - (diff * 0.5),
            level618: high - (diff * 0.618)
        };
    } else {
        // Trend is DOWN. We measure bounces. Low is bottom, High is start.
        // Resistance levels are above the Low.
        return {
            level236: low + (diff * 0.236),
            level382: low + (diff * 0.382),
            level500: low + (diff * 0.5),
            level618: low + (diff * 0.618)
        };
    }
};

/**
 * Calculates a "Confidence Score" (0-100) for the current trend.
 * High score means indicators align.
 */
export const calculateTrendConfidence = (signals: TechnicalSignals): { score: number; label: string } => {
    let score = 50; // Neutral start

    // RSI Analysis (Trend Confirmation)
    if (signals.rsi > 50 && signals.rsi < 70) score += 10; // Healthy Uptrend
    else if (signals.rsi < 50 && signals.rsi > 30) score -= 10; // Healthy Downtrend
    else if (signals.rsi >= 70 || signals.rsi <= 30) score -= 5; // Overbought/Oversold (Warning)

    // Moving Averages
    if (signals.ma50 === 'ABOVE') score += 15; // Price above MA50 (Bullish)
    else score -= 15;

    if (signals.ma200 === 'ABOVE') score += 10; // Long term Bullish
    else score -= 10;

    // ADX (Trend Strength)
    if (signals.adx > 25) {
        // If ADX is strong, amplify the current score direction
        if (score > 50) score += 10;
        else if (score < 50) score -= 10;
    } else {
        // Weak trend, pull score towards neutral
        if (score > 50) score -= 5;
        else if (score < 50) score += 5;
    }

    // MACD alignment (Simple text check)
    // Assuming string contains generic signals from AI
    const macdUpper = signals.macd ? signals.macd.toUpperCase() : "";
    if (macdUpper.includes("BUY") || macdUpper.includes("BULLISH") || macdUpper.includes("POSITIVE")) {
        score += 10;
    } else if (macdUpper.includes("SELL") || macdUpper.includes("BEARISH") || macdUpper.includes("NEGATIVE")) {
        score -= 10;
    }

    // Clamp score 0-100
    score = Math.max(0, Math.min(100, score));

    let label = 'NEUTRAL';
    if (score >= 75) label = 'VERY BULLISH';
    else if (score >= 60) label = 'BULLISH';
    else if (score <= 25) label = 'VERY BEARISH';
    else if (score <= 40) label = 'BEARISH';

    return { score, label };
};
