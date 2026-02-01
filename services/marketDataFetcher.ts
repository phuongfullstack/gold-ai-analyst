import { MarketData } from '../types';

const WORLD_GOLD_API = 'https://data-asg.goldprice.org/dbXRates/USD';
const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/USD';
const DOJI_API = 'https://giavang.doji.vn/api/giavang';
const SCRAPE_URL = 'https://www.24h.com.vn/gia-vang-hom-nay-c425.html';

// CORS Proxy for browser-side scraping/XML fetching
const proxyUrl = (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

export const fetchAllMarketData = async (): Promise<MarketData> => {
  const vnAppMobToken = localStorage.getItem("VNAPPMOB_API_KEY");

  // Initializing with defaults
  let marketData: MarketData = {
    xauPrice: 0,
    xagPrice: 0,
    dxyValue: 104,
    sjcBuy: 0,
    sjcSell: 0,
    pnjBuy: 0,
    pnjSell: 0,
    btmcBuy: 0,
    btmcSell: 0,
    dojiBuy: 0,
    dojiSell: 0,
    ringGoldBuy: 0,
    ringGoldSell: 0,
    silverBuy: 0,
    silverSell: 0,
    usdVnd: 25450,
    spread: 0,
    lastUpdated: new Date().toLocaleTimeString('vi-VN'),
  };

  try {
    const [worldRes, rateRes] = await Promise.all([
      fetch(WORLD_GOLD_API).catch(() => null),
      fetch(EXCHANGE_RATE_API).catch(() => null)
    ]);

    if (worldRes && worldRes.ok) {
      const worldData = await worldRes.json();
      if (worldData.items && worldData.items[0]) {
        marketData.xauPrice = worldData.items[0].xauPrice;
        marketData.xagPrice = worldData.items[0].xagPrice;
      }
    }

    if (rateRes && rateRes.ok) {
      const rateData = await rateRes.json();
      if (rateData.rates && rateData.rates.VND) {
        marketData.usdVnd = rateData.rates.VND;
      }
    }
  } catch (e) {
    console.warn("External base APIs failed", e);
  }

  // 1. Try VNAppMob if token exists
  if (vnAppMobToken) {
    try {
      const vnAppRes = await fetch(`https://vapi.vnappmob.com/api/v2/gold/sjc`, {
        headers: {
          'Authorization': `Bearer ${vnAppMobToken}`
        }
      });
      const vnAppData = await vnAppRes.json();
      if (vnAppData && vnAppData.results) {
        const sjc = vnAppData.results.find((i: any) => i.buy_price > 0);
        if (sjc) {
          marketData.sjcBuy = sjc.buy_price / 1000000;
          marketData.sjcSell = sjc.sell_price / 1000000;
        }
      }
    } catch (e) {
      console.warn("VNAppMob fetch failed", e);
    }
  }

  // 2. Try DOJI API (XML) via Proxy
  try {
    const dojiRes = await fetch(proxyUrl(DOJI_API));
    if (dojiRes.ok) {
        const dojiXmlText = await dojiRes.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(dojiXmlText, "text/xml");

        const rows = xmlDoc.getElementsByTagName("Row");
        for (let i = 0; i < rows.length; i++) {
          const name = rows[i].getAttribute("Name") || "";
          const sellStr = rows[i].getAttribute("Sell")?.replace(/,/g, '') || "0";
          const buyStr = rows[i].getAttribute("Buy")?.replace(/,/g, '') || "0";
          const sell = parseFloat(sellStr);
          const buy = parseFloat(buyStr);

          // Heuristic for units: gold prices are usually 60M-200M VND/tael
          const normalize = (val: number) => {
              if (val > 1000000) return val / 1000000;
              if (val > 10000) return val / 1000;
              if (val > 1000) return val / 100; // per chi
              return val;
          };

          if (name.includes("DOJI HN") || name.includes("DOJI HCM") || name.includes("DOJI lẻ")) {
              if (marketData.dojiSell === 0 && sell > 0) {
                marketData.dojiBuy = normalize(buy);
                marketData.dojiSell = normalize(sell);
              }
          }
          if (name.includes("Nhẫn Tròn 9999") || name.includes("Hưng Thịnh Vượng")) {
            if (marketData.ringGoldSell === 0 && sell > 0) {
                marketData.ringGoldBuy = normalize(buy);
                marketData.ringGoldSell = normalize(sell);
            }
          }
        }
    }
  } catch (error) {
    console.warn("Failed to fetch DOJI data:", error);
  }

  // 3. Scrape 24h.com.vn via Proxy
  try {
    const scrapeRes = await fetch(proxyUrl(SCRAPE_URL));
    if (scrapeRes.ok) {
        const html = await scrapeRes.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const rows = Array.from(doc.querySelectorAll('tr'));
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            const cells = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim().replace(/,/g, ''));

            if (cells.length >= 3) {
                let buy = parseFloat(cells[1]);
                let sell = parseFloat(cells[2]);

                if (buy > 0) {
                  const normalize = (val: number) => {
                    if (val > 1000) return val / 1000;
                    return val;
                  };

                  buy = normalize(buy);
                  sell = normalize(sell);

                  if (text.includes("sjc toàn quốc") || (text.includes("sjc") && marketData.sjcSell === 0)) {
                      marketData.sjcBuy = buy;
                      marketData.sjcSell = sell;
                  } else if (text.includes("pnj") && marketData.pnjSell === 0) {
                      marketData.pnjBuy = buy;
                      marketData.pnjSell = sell;
                  } else if ((text.includes("bảo tín") || text.includes("btmc")) && marketData.btmcSell === 0) {
                      marketData.btmcBuy = buy;
                      marketData.btmcSell = sell;
                  } else if (text.includes("doji") && marketData.dojiSell === 0) {
                      marketData.dojiBuy = buy;
                      marketData.dojiSell = sell;
                  } else if ((text.includes("nhẫn") || text.includes("9999")) && marketData.ringGoldSell === 0) {
                      marketData.ringGoldBuy = buy;
                      marketData.ringGoldSell = sell;
                  }
                }
            }
        });
    }
  } catch (error) {
    console.warn("Failed to scrape 24h.com.vn data:", error);
  }

  // Final fallback for silver (converted from world price)
  if (marketData.silverSell === 0 && marketData.xagPrice > 0) {
    const basePrice = (marketData.xagPrice * marketData.usdVnd * 1.2057) / 1000000;
    marketData.silverBuy = Number((basePrice * 0.95).toFixed(2));
    marketData.silverSell = Number((basePrice * 1.10).toFixed(2));
  }

  // Ensure SJC is set if others are found
  if (marketData.sjcSell === 0) {
      marketData.sjcBuy = marketData.dojiBuy || marketData.pnjBuy || marketData.btmcBuy || 0;
      marketData.sjcSell = marketData.dojiSell || marketData.pnjSell || marketData.btmcSell || 0;
  }

  return marketData;
};
