import { MarketData, ChartDataPoint } from '../types';
import { ANALYSIS_CONSTANTS } from '../utils/constants';
import { withCache } from '../utils/cache';

const WORLD_GOLD_API = 'https://api.gold-api.com/price/XAU';
const WORLD_SILVER_API = 'https://api.gold-api.com/price/XAG';
const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/USD';
const SJC_XML = 'https://sjc.com.vn/xml/tygiavang.xml';
const DOJI_API = 'https://giavang.doji.vn/api/giavang';
const SCRAPE_URL = 'https://www.24h.com.vn/gia-vang-hom-nay-c425.html';
const BINANCE_API = 'https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=1h&limit=50';

// CORS Proxy for browser-side scraping/XML fetching
const proxyUrl = (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

// Timeout helper to prevent hanging requests
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const _fetchWorldAndRates = async (): Promise<Partial<MarketData>> => {
  try {
    // World API is usually fast, but we protect it too
    const [goldRes, silverRes, rateRes] = await Promise.allSettled([
      fetchWithTimeout(WORLD_GOLD_API),
      fetchWithTimeout(WORLD_SILVER_API),
      fetchWithTimeout(EXCHANGE_RATE_API)
    ]);

    const result: Partial<MarketData> = {};

    if (goldRes.status === 'fulfilled' && goldRes.value.ok) {
      const goldData = await goldRes.value.json();
      result.xauPrice = goldData.price || goldData.value || 0;
    }
    if (silverRes.status === 'fulfilled' && silverRes.value.ok) {
      const silverData = await silverRes.value.json();
      result.xagPrice = silverData.price || silverData.value || 0;
    }

    if (rateRes.status === 'fulfilled' && rateRes.value.ok) {
      const rateData = await rateRes.value.json();
      if (rateData.rates && rateData.rates.VND) {
        result.usdVnd = rateData.rates.VND;
      }
    }
    return result;
  } catch (e) {
    console.warn("fetchWorldAndRates failed", e);
    return {};
  }
};

export const fetchWorldAndRates = () => withCache(
  'world_rates',
  _fetchWorldAndRates,
  ANALYSIS_CONSTANTS.CACHE_TTL_SECONDS
);

const _fetchVnAppMobData = async (token: string): Promise<Partial<MarketData>> => {
  try {
    const vnAppRes = await fetchWithTimeout(`https://vapi.vnappmob.com/api/v2/gold/sjc`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, 5000);
    const vnAppData = await vnAppRes.json();
    if (vnAppData && vnAppData.results) {
      const sjc = vnAppData.results.find((i: any) => i.buy_price > 0);
      if (sjc) {
        return {
          sjcBuy: sjc.buy_price / 1000000,
          sjcSell: sjc.sell_price / 1000000
        };
      }
    }
  } catch (e) {
    console.warn("VNAppMob fetch failed", e);
  }
  return {};
};

export const fetchVnAppMobData = (token: string) => withCache(
  `vnappmob_${token}`,
  () => _fetchVnAppMobData(token),
  ANALYSIS_CONSTANTS.CACHE_TTL_SECONDS
);

const normalizePrice = (val: number) => {
  if (val > 1000000) return val / 1000000;
  if (val > 10000) return val / 1000;
  if (val > 1000) return val / 100; // per chi
  return val;
};

const _fetchSjcXmlData = async (): Promise<Partial<MarketData>> => {
  try {
    // SJC via Proxy is notoriously slow/unreliable, use short timeout
    const sjcRes = await fetchWithTimeout(proxyUrl(SJC_XML), {}, 4000);
    if (sjcRes.ok) {
      const xmlText = await sjcRes.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const items = xmlDoc.getElementsByTagName("item");
      const result: Partial<MarketData> = {};

      for (let i = 0; i < items.length; i++) {
        const type = items[i].getElementsByTagName("type")[0]?.textContent || "";
        const buy = parseFloat(items[i].getElementsByTagName("buy")[0]?.textContent?.replace(/,/g, '') || "0");
        const sell = parseFloat(items[i].getElementsByTagName("sell")[0]?.textContent?.replace(/,/g, '') || "0");

        if (type.includes("SJC") && !result.sjcSell) {
          result.sjcBuy = normalizePrice(buy);
          result.sjcSell = normalizePrice(sell);
        }
      }
      return result;
    }
  } catch (e) {
    // console.warn("SJC XML fetch failed or timed out", e);
    // Silent fail is okay, scraping will pick it up
  }
  return {};
};

export const fetchSjcXmlData = () => withCache(
  'sjc_xml',
  _fetchSjcXmlData,
  ANALYSIS_CONSTANTS.CACHE_TTL_SECONDS
);

const _fetchDojiData = async (): Promise<Partial<MarketData>> => {
  try {
    const dojiRes = await fetchWithTimeout(proxyUrl(DOJI_API), {}, 4000);
    if (dojiRes.ok) {
      const dojiXmlText = await dojiRes.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(dojiXmlText, "text/xml");

      const rows = xmlDoc.getElementsByTagName("Row");
      const result: Partial<MarketData> = {};

      for (let i = 0; i < rows.length; i++) {
        const name = rows[i].getAttribute("Name") || "";
        const sellStr = rows[i].getAttribute("Sell")?.replace(/,/g, '') || "0";
        const buyStr = rows[i].getAttribute("Buy")?.replace(/,/g, '') || "0";
        const sell = parseFloat(sellStr);
        const buy = parseFloat(buyStr);

        if (sell <= 0) continue;

        if (name.includes("DOJI HN") || name.includes("DOJI HCM") || name.includes("DOJI lẻ")) {
          if (!result.dojiSell) {
            result.dojiBuy = normalizePrice(buy);
            result.dojiSell = normalizePrice(sell);
          }
        }
        if (name.includes("Nhẫn Tròn 9999") || name.includes("Hưng Thịnh Vượng")) {
          if (!result.ringGoldSell) {
            result.ringGoldBuy = normalizePrice(buy);
            result.ringGoldSell = normalizePrice(sell);
          }
        }
      }
      return result;
    }
  } catch (error) {
    // console.warn("fetchDojiData failed:", error);
  }
  return {};
};

export const fetchDojiData = () => withCache(
  'doji_data',
  _fetchDojiData,
  ANALYSIS_CONSTANTS.CACHE_TTL_SECONDS
);

const _fetchScrapedData = async (): Promise<Partial<MarketData>> => {
  try {
    // Scrape is the most reliable backup for local prices
    const scrapeRes = await fetchWithTimeout(proxyUrl(SCRAPE_URL), {}, 6000);
    if (scrapeRes.ok) {
      const html = await scrapeRes.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const rows = Array.from(doc.querySelectorAll('tr'));
      const result: Partial<MarketData> = {};

      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        const cells = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim().replace(/,/g, ''));

        if (cells.length >= 3) {
          let buy = parseFloat(cells[1]);
          let sell = parseFloat(cells[2]);

          if (buy > 0) {
            const norm = (v: number) => v > 1000 ? v / 1000 : v;
            buy = norm(buy);
            sell = norm(sell);

            if (text.includes("sjc toàn quốc") || (text.includes("sjc") && !result.sjcSell)) {
              result.sjcBuy = buy;
              result.sjcSell = sell;
            } else if (text.includes("pnj") && !result.pnjSell) {
              result.pnjBuy = buy;
              result.pnjSell = sell;
            } else if ((text.includes("bảo tín") || text.includes("btmc")) && !result.btmcSell) {
              result.btmcBuy = buy;
              result.btmcSell = sell;
            } else if (text.includes("doji") && !result.dojiSell) {
              result.dojiBuy = buy;
              result.dojiSell = sell;
            } else if ((text.includes("nhẫn") || text.includes("9999")) && !result.ringGoldSell) {
              result.ringGoldBuy = buy;
              result.ringGoldSell = sell;
            }
          }
        }
      });
      return result;
    }
  } catch (error) {
    console.warn("fetchScrapedData failed:", error);
  }
  return {};
};

export const fetchScrapedData = () => withCache(
  'scraped_data',
  _fetchScrapedData,
  ANALYSIS_CONSTANTS.CACHE_TTL_SECONDS
);

const _fetchGoldChartData = async (): Promise<ChartDataPoint[]> => {
  try {
    const res = await fetchWithTimeout(BINANCE_API, {}, 5000);
    if (!res.ok) return [];

    const rawData = await res.json();
    // Binance format: [open_time, open, high, low, close, volume, ...]
    // PAXG/USDT is a good proxy for XAU/USD

    return rawData.map((d: any) => ({
      time: Math.floor(d[0] / 1000).toString(),
      xau: parseFloat(d[4]), // Close price
      dxy: 104.5, // Placeholder as we don't have hourly DXY
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4])
    }));
  } catch (e) {
    console.warn("Fetch Chart Data failed", e);
    return [];
  }
};

export const fetchGoldChartData = () => withCache(
  'gold_chart_data',
  _fetchGoldChartData,
  ANALYSIS_CONSTANTS.CACHE_TTL_SECONDS,
  (data) => data && data.length > 0 // Only cache if we got data
);

export const fetchAllMarketData = async (): Promise<MarketData> => {
  const vnAppMobToken = localStorage.getItem("VNAPPMOB_API_KEY");

  // We use Promise.allSettled implicitly by catching errors in sub-functions,
  // but to be double sure, we wait for all.
  // Importantly, because of fetchWithTimeout, these won't hang forever.
  const [world, sjcXml, doji, scrape, chartData] = await Promise.all([
    fetchWorldAndRates(),
    fetchSjcXmlData(),
    fetchDojiData(),
    fetchScrapedData(),
    fetchGoldChartData()
  ]);

  let vnApp: Partial<MarketData> = {};
  if (vnAppMobToken) {
    vnApp = await fetchVnAppMobData(vnAppMobToken);
  }

  // Extract previous day OHLC if available
  let ohlc = undefined;
  if (chartData && chartData.length >= 25) {
     // Approx 24h ago: use the 25th candle from the end (1h candles, up to 50 total)
     const prev = chartData[chartData.length - 25]; // reference point ~24 hours before last candle
     const curr = chartData[chartData.length - 1];
     // Simple daily candle estimation
     ohlc = {
        open: prev.open || 0,
        high: Math.max(...chartData.slice(-24).map(c => c.high || 0)),
        low: Math.min(...chartData.slice(-24).map(c => c.low || 0)),
        close: curr.close || 0
     };
  }

  const marketData: MarketData = {
    xauPrice: world.xauPrice || 0,
    xagPrice: world.xagPrice || 0,
    dxyValue: 104, // Default DXY if not fetched (rare)
    sjcBuy: vnApp.sjcBuy || sjcXml.sjcBuy || scrape.sjcBuy || doji.dojiBuy || 0,
    sjcSell: vnApp.sjcSell || sjcXml.sjcSell || scrape.sjcSell || doji.dojiSell || 0,
    pnjBuy: scrape.pnjBuy || 0,
    pnjSell: scrape.pnjSell || 0,
    btmcBuy: scrape.btmcBuy || 0,
    btmcSell: scrape.btmcSell || 0,
    dojiBuy: doji.dojiBuy || scrape.dojiBuy || 0,
    dojiSell: doji.dojiSell || scrape.dojiSell || 0,
    ringGoldBuy: doji.ringGoldBuy || scrape.ringGoldBuy || 0,
    ringGoldSell: doji.ringGoldSell || scrape.ringGoldSell || 0,
    silverBuy: 0,
    silverSell: 0,
    usdVnd: world.usdVnd || 25450,
    spread: 0,
    lastUpdated: new Date().toLocaleTimeString('vi-VN'),
    ohlc: ohlc,
    chartData: chartData || []
  };

  // Silver Calculation Fallback
  if (marketData.xagPrice > 0) {
    const basePrice = (marketData.xagPrice * marketData.usdVnd * 1.2057) / 1000000;
    marketData.silverBuy = Number((basePrice * 0.95).toFixed(2));
    marketData.silverSell = Number((basePrice * 1.10).toFixed(2));
  }

  // Calculate Premium/Spread
  if (marketData.xauPrice > 0 && marketData.usdVnd > 0 && marketData.sjcSell > 0) {
    const convertedPrice = (marketData.xauPrice * marketData.usdVnd * ANALYSIS_CONSTANTS.GOLD_CONVERSION_FACTOR) / 1000000;
    marketData.spread = Number((marketData.sjcSell - convertedPrice).toFixed(2));
  }

  return marketData;
};
