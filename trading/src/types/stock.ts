export interface WatchlistItem {
    ticker: string;
    name: string;
    shares: number;
}

export interface MarketStock extends WatchlistItem {
    price: number;
    change: number;
    totalValue: number;
}

export interface SearchStockResult {
    symbol: string;
    description: string;
    type?: string;
}

export interface HistoricalCandleResponse {
    c?: number[];
    s?: string;
    t?: number[];
}

export interface PredictionResult {
    history: number[];
    forecast: number[];
    projectedChangePercent: number;
}