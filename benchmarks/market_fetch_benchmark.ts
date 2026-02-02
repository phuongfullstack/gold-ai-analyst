
import { fetchAllMarketData } from '../services/marketDataFetcher.ts';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock DOMParser (used in fetchSjcXmlData, fetchDojiData, fetchScrapedData)
class DOMParserMock {
  parseFromString(str: string, type: string) {
    return {
      getElementsByTagName: (tagName: string) => [],
      querySelectorAll: (selector: string) => [],
      querySelector: (selector: string) => null,
    };
  }
}
Object.defineProperty(global, 'DOMParser', { value: DOMParserMock });


// Mock fetch
let fetchCallCount = 0;
const originalFetch = global.fetch;

global.fetch = async (url: any, options?: any) => {
    fetchCallCount++;
    // Return empty/dummy valid responses to avoid crashes
    return {
        ok: true,
        status: 200,
        json: async () => {
            if (url.includes('binance')) return [[1700000000000, 2000, 2005, 1995, 2002, 100]]; // Mock chart data with 1 candle
            return {};
        },
        text: async () => "",
    } as Response;
};

async function runBenchmark() {
    console.log("Starting Benchmark...");
    fetchCallCount = 0; // Reset

    console.log("1. Calling fetchAllMarketData (First Run)...");
    await fetchAllMarketData();
    console.log(`   -> Fetch calls made: ${fetchCallCount}`);

    const firstRunCount = fetchCallCount;
    fetchCallCount = 0; // Reset for second run

    console.log("2. Calling fetchAllMarketData (Second Run - Immediate)...");
    await fetchAllMarketData();
    console.log(`   -> Fetch calls made: ${fetchCallCount}`);

    const secondRunCount = fetchCallCount;

    console.log("--------------------------------------------------");
    console.log("RESULTS:");
    console.log(`Baseline Fetch Count: ${firstRunCount}`);
    console.log(`Re-fetch Fetch Count: ${secondRunCount}`);

    if (firstRunCount === secondRunCount && firstRunCount > 0) {
        console.log("CONCLUSION: No caching detected. Network requests are duplicated.");
    } else if (secondRunCount < firstRunCount) {
        console.log("CONCLUSION: Caching detected.");
    }
}

runBenchmark().catch(console.error);
