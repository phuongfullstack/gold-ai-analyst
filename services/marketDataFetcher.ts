import { MarketData } from '../types';

const WORLD_GOLD_API = 'https://api.gold-api.com/price/XAU';
const WORLD_SILVER_API = 'https://api.gold-api.com/price/XAG';
const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/USD';
const SJC_XML = 'https://sjc.com.vn/xml/tygiavang.xml';
const DOJI_API = 'https://giavang.doji.vn/api/giavang';
const SCRAPE_URL = 'https://www.24h.com.vn/gia-vang-hom-nay-c425.html';

// CORS Proxy for browser-side scraping/XML fetching
const proxyUrl = (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

export const fetchWorldAndRates = async (): Promise<Partial<MarketData>> => {
  try {
    const [goldRes, silverRes, rateRes] = await Promise.all([
      fetch(WORLD_GOLD_API).catch(() => null),
      fetch(WORLD_SILVER_API).catch(() => null),
      fetch(EXCHANGE_RATE_API).catch(() => null)
    ]);

    const result: Partial<MarketData> = {};

    if (goldRes && goldRes.ok) {
      const goldData = await goldRes.json();
      result.xauPrice = goldData.price || goldData.value || 0;
    }
    if (silverRes && silverRes.ok) {
      const silverData = await silverRes.json();
      result.xagPrice = silverData.price || silverData.value || 0;
    }

    if (rateRes && rateRes.ok) {
      const rateData = await rateRes.json();
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

export const fetchVnAppMobData = async (token: string): Promise<Partial<MarketData>> => {
  try {
    const vnAppRes = await fetch(`https://vapi.vnappmob.com/api/v2/gold/sjc`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
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

const normalizePrice = (val: number) => {
  if (val > 1000000) return val / 1000000;
  if (val > 10000) return val / 1000;
  if (val > 1000) return val / 100; // per chi
  return val;
};

export const fetchSjcXmlData = async (): Promise<Partial<MarketData>> => {
  try {
    const sjcRes = await fetch(proxyUrl(SJC_XML));
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
    console.warn("SJC XML fetch failed", e);
  }
  return {};
};

export const fetchDojiData = async (): Promise<Partial<MarketData>> => {
  try {
    const dojiRes = await fetch(proxyUrl(DOJI_API));
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
    console.warn("fetchDojiData failed:", error);
  }
  return {};
};

export const fetchScrapedData = async (): Promise<Partial<MarketData>> => {
  try {
    const scrapeRes = await fetch(proxyUrl(SCRAPE_URL));
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

export const fetchAllMarketData = async (): Promise<MarketData> => {
  const vnAppMobToken = localStorage.getItem("VNAPPMOB_API_KEY");

  const [world, sjcXml, doji, scrape] = await Promise.all([
    fetchWorldAndRates(),
    fetchSjcXmlData(),
    fetchDojiData(),
    fetchScrapedData()
  ]);

  let vnApp: Partial<MarketData> = {};
  if (vnAppMobToken) {
    vnApp = await fetchVnAppMobData(vnAppMobToken);
  }

  const marketData: MarketData = {
    xauPrice: world.xauPrice || 0,
    xagPrice: world.xagPrice || 0,
    dxyValue: 104,
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
  };

  // Silver Calculation Fallback
  if (marketData.xagPrice > 0) {
    const basePrice = (marketData.xagPrice * marketData.usdVnd * 1.2057) / 1000000;
    marketData.silverBuy = Number((basePrice * 0.95).toFixed(2));
    marketData.silverSell = Number((basePrice * 1.10).toFixed(2));
  }

  return marketData;
};
