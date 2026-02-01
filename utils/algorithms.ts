import { TechnicalSignals } from '../types';
import { ANALYSIS_CONSTANTS, UI_LABELS } from './constants';
import { calculateDynamicWeights } from './technicalAlgorithms';

/**
 * Calculates a "Confidence Score" (0-100) for the current trend.
 * High score means indicators align.
 */
export const calculateTrendConfidence = (signals: TechnicalSignals): { score: number; label: string } => {
    let score = ANALYSIS_CONSTANTS.CONFIDENCE.NEUTRAL;

    // Get weights dynamically based on Market Regime (Trending vs Ranging)
    const WEIGHTS = calculateDynamicWeights(signals.adx);

    // RSI Analysis (Trend Confirmation)
    if (signals.rsi > ANALYSIS_CONSTANTS.RSI.NEUTRAL && signals.rsi < ANALYSIS_CONSTANTS.RSI.OVERBOUGHT) score += WEIGHTS.RSI;
    else if (signals.rsi < ANALYSIS_CONSTANTS.RSI.NEUTRAL && signals.rsi > ANALYSIS_CONSTANTS.RSI.OVERSOLD) score -= WEIGHTS.RSI;
    else if (signals.rsi >= ANALYSIS_CONSTANTS.RSI.OVERBOUGHT) score -= WEIGHTS.RSI / 2; // Overbought (Risk)
    else if (signals.rsi <= ANALYSIS_CONSTANTS.RSI.OVERSOLD) score += WEIGHTS.RSI / 2; // Oversold (Opportunity)

    // Stochastic (Momentum)
    if (signals.stochastic > ANALYSIS_CONSTANTS.STOCHASTIC.OVERBOUGHT) score -= WEIGHTS.STOCHASTIC;
    else if (signals.stochastic < ANALYSIS_CONSTANTS.STOCHASTIC.OVERSOLD) score += WEIGHTS.STOCHASTIC;

    // Moving Averages
    if (signals.ma50 === 'ABOVE') score += WEIGHTS.MA;
    else score -= WEIGHTS.MA;

    if (signals.ma200 === 'ABOVE') score += WEIGHTS.MA; // Simplified weight for MA
    else score -= WEIGHTS.MA;

    // Ichimoku Cloud
    if (signals.ichimoku) {
        if (signals.ichimoku.signal === 'BULLISH') score += WEIGHTS.ICHIMOKU;
        else if (signals.ichimoku.signal === 'BEARISH') score -= WEIGHTS.ICHIMOKU;
    }

    // Smart Money Concepts
    if (signals.smartMoney) {
        // Bullish Order Blocks act as support (Positive Score)
        const bullishBlocks = signals.smartMoney.orderBlocks.filter(b => b.type === 'BULLISH');
        if (bullishBlocks.length > 0) score += WEIGHTS.SMC;

        // Bearish Order Blocks act as resistance (Negative Score)
        const bearishBlocks = signals.smartMoney.orderBlocks.filter(b => b.type === 'BEARISH');
        if (bearishBlocks.length > 0) score -= WEIGHTS.SMC;
    }

    // MACD alignment
    const macdUpper = signals.macd ? signals.macd.toUpperCase() : "";
    if (macdUpper.includes("BUY") || macdUpper.includes("BULLISH") || macdUpper.includes("POSITIVE")) {
        score += WEIGHTS.MACD;
    } else if (macdUpper.includes("SELL") || macdUpper.includes("BEARISH") || macdUpper.includes("NEGATIVE")) {
        score -= WEIGHTS.MACD;
    }

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

    if (signals.smartMoney) {
        const bullishOB = signals.smartMoney.orderBlocks.filter(b => b.type === 'BULLISH');
        if (bullishOB.length > 0) {
            insight += `Dòng tiền thông minh (Smart Money) đang tích lũy tại vùng $${bullishOB[0].top.toFixed(0)}. `;
        }
        const bearishFVG = signals.smartMoney.fairValueGaps.filter(g => g.type === 'BEARISH' && !g.isFilled);
        if (bearishFVG.length > 0) {
            insight += `Chú ý vùng mất cân bằng giá (FVG) tại $${bearishFVG[0].bottom.toFixed(0)} - $${bearishFVG[0].top.toFixed(0)}. `;
        }
    }

    if (signals.ichimoku) {
        if (signals.ichimoku.signal === 'BULLISH') insight += "Ichimoku Cloud xác nhận xu hướng tăng. ";
        else if (signals.ichimoku.signal === 'BEARISH') insight += "Giá nằm dưới Ichimoku Cloud, xu hướng giảm chiếm ưu thế. ";
    }

    if (signals.adx > 25) insight += "Động lượng xu hướng mạnh (ADX cao).";
    else insight += "Thị trường đang đi ngang (Sideway), ưu tiên giao dịch biên độ.";

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

    if (signals.smartMoney) {
         if (signals.smartMoney.orderBlocks.length > 0) {
             indicators.push({ name: 'SMC', status: 'Order Block Active' });
         }
    }

    if (signals.ichimoku) {
        indicators.push({ name: 'Ichimoku', status: signals.ichimoku.signal });
    }
    if (signals.sar) {
        indicators.push({ name: 'SAR', status: signals.sar.trend });
    }

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
