import { useState, useEffect, useCallback } from 'react';
import { fetchMarketAnalysis } from '../services/geminiService';
import { MarketData, AnalysisReport } from '../types';

export const useMarketData = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMarketAnalysis();
      setMarketData(data.marketData);
      setReport(data.report);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu thị trường. Vui lòng kiểm tra API Key.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const intervalId = setInterval(() => {
      loadData();
    }, 30 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [loadData]);

  return { marketData, report, loading, error, refresh: loadData };
};
