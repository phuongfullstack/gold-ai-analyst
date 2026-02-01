import { TechnicalSignals } from '../types';
import { ANALYSIS_CONSTANTS, UI_LABELS } from './constants';

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
export const calculateFibonacciLevels = (high: number, low: number, open: number, close: number) => {
    const trend = close >= open ? 'UP' : 'DOWN';
    const levels = calculateFibonacciRetracement(high, low, trend);
    return {
        ...Object.fromEntries(
            Object.entries(levels).map(([k, v]) => [k, Number(v.toFixed(2))])
        ),
        trend
    };
};

/**
 * Calculates a "Confidence Score" (0-100) for the current trend.
 * High score means indicators align.
 */
export const calculateTrendConfidence = (signals: TechnicalSignals): { score: number; label: string } => {
    let score = ANALYSIS_CONSTANTS.CONFIDENCE.NEUTRAL;
    const { WEIGHTS } = ANALYSIS_CONSTANTS;

    // RSI Analysis (Trend Confirmation)
    if (signals.rsi > ANALYSIS_CONSTANTS.RSI.NEUTRAL && signals.rsi < ANALYSIS_CONSTANTS.RSI.OVERBOUGHT) score += WEIGHTS.RSI;
    else if (signals.rsi < ANALYSIS_CONSTANTS.RSI.NEUTRAL && signals.rsi > ANALYSIS_CONSTANTS.RSI.OVERSOLD) score -= WEIGHTS.RSI;
    else if (signals.rsi >= ANALYSIS_CONSTANTS.RSI.OVERBOUGHT) score -= WEIGHTS.BB; // Overbought (Risk)
    else if (signals.rsi <= ANALYSIS_CONSTANTS.RSI.OVERSOLD) score += WEIGHTS.BB; // Oversold (Opportunity)

    // Stochastic (Momentum)
    if (signals.stochastic > ANALYSIS_CONSTANTS.STOCHASTIC.OVERBOUGHT) score -= WEIGHTS.STOCHASTIC;
    else if (signals.stochastic < ANALYSIS_CONSTANTS.STOCHASTIC.OVERSOLD) score += WEIGHTS.STOCHASTIC;

    // CCI (Commodity Channel Index)
    if (signals.cci > ANALYSIS_CONSTANTS.CCI.OVERBOUGHT) score += WEIGHTS.CCI;
    else if (signals.cci < ANALYSIS_CONSTANTS.CCI.OVERSOLD) score -= WEIGHTS.CCI;

    // Moving Averages
    if (signals.ma50 === 'ABOVE') score += WEIGHTS.MA50;
    else score -= WEIGHTS.MA50;

    if (signals.ma200 === 'ABOVE') score += WEIGHTS.MA200;
    else score -= WEIGHTS.MA200;

    // ADX (Trend Strength)
    if (signals.adx > ANALYSIS_CONSTANTS.ADX.STRONG_TREND) {
        if (score > ANALYSIS_CONSTANTS.CONFIDENCE.NEUTRAL) score += WEIGHTS.ADX;
        else if (score < ANALYSIS_CONSTANTS.CONFIDENCE.NEUTRAL) score -= WEIGHTS.ADX;
    } else {
        if (score > ANALYSIS_CONSTANTS.CONFIDENCE.NEUTRAL) score -= WEIGHTS.STOCHASTIC;
        else if (score < ANALYSIS_CONSTANTS.CONFIDENCE.NEUTRAL) score += WEIGHTS.STOCHASTIC;
    }

    // MACD alignment
    const macdUpper = signals.macd ? signals.macd.toUpperCase() : "";
    if (macdUpper.includes("BUY") || macdUpper.includes("BULLISH") || macdUpper.includes("POSITIVE") || macdUpper.includes("CROSSOVER") || macdUpper.includes("TÍCH CỰC") || macdUpper.includes("MUA")) {
        score += WEIGHTS.MACD;
    } else if (macdUpper.includes("SELL") || macdUpper.includes("BEARISH") || macdUpper.includes("NEGATIVE") || macdUpper.includes("TIÊU CỰC") || macdUpper.includes("BÁN")) {
        score -= WEIGHTS.MACD;
    }

    // Bollinger Bands
    const bbUpper = signals.bollinger ? signals.bollinger.toUpperCase() : "";
    if (bbUpper.includes("UPPER") || bbUpper.includes("OVERBOUGHT") || bbUpper.includes("QUÁ MUA")) score -= WEIGHTS.BB;
    else if (bbUpper.includes("LOWER") || bbUpper.includes("OVERSOLD") || bbUpper.includes("QUÁ BÁN")) score += WEIGHTS.BB;

    // Clamp score 0-100
    score = Math.max(0, Math.min(100, score));

    let label = UI_LABELS.TREND.NEUTRAL;
    if (score >= ANALYSIS_CONSTANTS.CONFIDENCE.VERY_BULLISH) label = UI_LABELS.TREND.VERY_BULLISH;
    else if (score >= ANALYSIS_CONSTANTS.CONFIDENCE.BULLISH) label = UI_LABELS.TREND.BULLISH;
    else if (score <= ANALYSIS_CONSTANTS.CONFIDENCE.VERY_BEARISH) label = UI_LABELS.TREND.VERY_BEARISH;
    else if (score <= ANALYSIS_CONSTANTS.CONFIDENCE.BEARISH) label = UI_LABELS.TREND.BEARISH;

    return { score, label };
};

/**
 * Determines the trading action based on algorithmic confidence.
 */
export const calculateTechnicalAction = (signals: TechnicalSignals): string => {
    const { score } = calculateTrendConfidence(signals);

    // Extreme conditions
    if (signals.rsi >= ANALYSIS_CONSTANTS.RSI.EXTREME_HIGH || signals.rsi <= ANALYSIS_CONSTANTS.RSI.EXTREME_LOW) {
        return UI_LABELS.ACTION.WARNING;
    }

    if (score >= ANALYSIS_CONSTANTS.ACTION_THRESHOLDS.BUY) return UI_LABELS.ACTION.BUY;
    if (score <= ANALYSIS_CONSTANTS.ACTION_THRESHOLDS.SELL) return UI_LABELS.ACTION.SELL;

    return UI_LABELS.ACTION.OBSERVE;
};

/**
 * Generates a textual insight based on technical confluence.
 */
export const generateMarketInsight = (signals: TechnicalSignals): string => {
    const { label, score } = calculateTrendConfidence(signals);
    let insight = `Hệ thống thuật toán xác định trạng thái ${label} (${score}/100). `;

    if (signals.ma50 === 'ABOVE' && signals.ma200 === 'ABOVE') {
        insight += "Xu hướng tăng trưởng dài hạn được củng cố. ";
    } else if (signals.ma50 === 'BELOW' && signals.ma200 === 'BELOW') {
        insight += "Áp lực bán duy trì mạnh trên các khung thời gian lớn. ";
    }

    if (signals.rsi > 70) insight += "Chỉ số RSI cho thấy trạng thái quá mua, tiềm ẩn rủi ro điều chỉnh. ";
    else if (signals.rsi < 30) insight += "RSI đi vào vùng quá bán, có khả năng xuất hiện nhịp hồi kỹ thuật. ";

    if (signals.adx > 25) insight += "Động lượng xu hướng hiện tại đang ở mức cao.";
    else insight += "Thị trường đang trong giai đoạn tích lũy hoặc thiếu xu hướng rõ ràng.";

    return insight;
};

/**
 * Provides a more granular trend analysis based on multiple indicators.
 */
export const analyzeTrendStrength = (signals: TechnicalSignals) => {
    const { score, label } = calculateTrendConfidence(signals);

    const indicators = [
        { name: 'RSI', value: signals.rsi, status: signals.rsi > 70 ? 'Overbought' : signals.rsi < 30 ? 'Oversold' : 'Neutral' },
        { name: 'MA50', status: signals.ma50 === 'ABOVE' ? 'Bullish' : 'Bearish' },
        { name: 'MA200', status: signals.ma200 === 'ABOVE' ? 'Bullish' : 'Bearish' },
        { name: 'ADX', value: signals.adx, status: signals.adx > 25 ? 'Strong Trend' : 'Weak Trend' }
    ];

    return {
        score,
        label,
        indicators
    };
};

/**
 * Analyzes the local SJC spread vs world gold price.
 */
export const analyzeLocalPremium = (spread: number): string => {
    if (spread === 0) return "Dữ liệu chênh lệch không khả dụng.";

    if (spread > ANALYSIS_CONSTANTS.SPREAD.HIGH) {
        return `Chênh lệch đang ở mức rất cao (+${spread} tr). Cảnh báo rủi ro lớn khi mua đuổi Vàng SJC lúc này.`;
    } else if (spread > ANALYSIS_CONSTANTS.SPREAD.MID) {
        return `Chênh lệch ở mức trung bình (+${spread} tr). Thị trường đang có sự ổn định tương đối.`;
    } else if (spread > 0) {
        return `Chênh lệch thấp (+${spread} tr). Đây là vùng giá mua khá an toàn cho nhà đầu tư nội địa.`;
    } else {
        return `Giá nội địa đang thấp hơn thế giới (nghịch lý). Cơ hội gom hàng cực tốt.`;
    }
};
