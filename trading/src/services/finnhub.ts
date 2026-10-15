import { HistoricalCandleResponse, SearchStockResult } from '../types/stock';

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export async function fetchStockQuote(ticker: string): Promise<{ price: number; change: number }> {
    if (!API_KEY) throw new Error('Missing API key');

    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_KEY}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return {
        price: typeof data?.c === 'number' ? data.c : 0,
        change: typeof data?.dp === 'number' ? data.dp : 0,
    };
}

export async function searchStocksApi(query: string): Promise<SearchStockResult[]> {
    if (!API_KEY) throw new Error('Missing API key');

    const res = await fetch(
        `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${API_KEY}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const rawResults: SearchStockResult[] = data?.result || [];
    return rawResults
        .filter((item) => item?.symbol && !item.symbol.includes('.'))
        .slice(0, 10);
}

export async function fetchStockCandles(ticker: string): Promise<number[]> {
    if (!API_KEY) throw new Error('Missing API key');

    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 35 * 24 * 60 * 60;

    const res = await fetch(
        `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=D&from=${thirtyDaysAgo}&to=${now}&token=${API_KEY}`
    );

    if (res.ok) {
        const data: HistoricalCandleResponse = await res.json();
        if (data?.s === 'ok' && Array.isArray(data.c) && data.c.length > 5) {
            return data.c;
        }
    }

    return [];
}