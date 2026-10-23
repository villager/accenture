import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { fetchStockQuote } from '../services/finnhub';
import {
    addStockToCloud,
    fetchUserWatchlist,
    removeStockFromCloud,
} from '../services/watchlistService';
import { MarketStock, SearchStockResult, WatchlistItem } from '../types/stock';

export function useWatchlist() {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [marketData, setMarketData] = useState<MarketStock[]>([]);
    const [loading, setLoading] = useState(false);

    const loadCloudWatchlist = useCallback(async () => {
        try {
            setLoading(true);
            const items = await fetchUserWatchlist();
            setWatchlist(items);
        } catch {
            Alert.alert('Error', 'Unable to sync your watchlist from the cloud.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCloudWatchlist();
    }, [loadCloudWatchlist]);

    const fetchPrices = useCallback(async () => {
        if (watchlist.length === 0) {
            setMarketData([]);
            return;
        }

        setLoading(true);
        try {
            const results: MarketStock[] = await Promise.all(
                watchlist.map(async (item) => {
                    try {
                        const { price, change } = await fetchStockQuote(item.ticker);
                        return {
                            ...item,
                            price,
                            change,
                            totalValue: price * item.shares,
                        };
                    } catch {
                        return { ...item, price: 0, change: 0, totalValue: 0 };
                    }
                })
            );
            setMarketData(results);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [watchlist]);

    useEffect(() => {
        fetchPrices();
    }, [fetchPrices]);

    const addStock = async (stock: SearchStockResult) => {
        if (watchlist.some((item) => item.ticker === stock.symbol)) {
            Alert.alert('Notice', `${stock.symbol} is already in your watchlist.`);
            return false;
        }

        const newItem: WatchlistItem = {
            ticker: stock.symbol,
            name: stock.description || stock.symbol,
            shares: 1,
        };

        try {
            await addStockToCloud(newItem);
            setWatchlist((prev) => [newItem, ...prev]);
            return true;
        } catch {
            Alert.alert('Error', 'Failed to save asset to your watchlist.');
            return false;
        }
    };

    const removeStock = async (ticker: string) => {
        try {
            await removeStockFromCloud(ticker);
            setWatchlist((prev) => prev.filter((item) => item.ticker !== ticker));
        } catch {
            Alert.alert('Error', 'Failed to remove asset from your account.');
        }
    };

    const totalPortfolioValue = marketData.reduce((acc, curr) => acc + curr.totalValue, 0);

    return {
        watchlist,
        marketData,
        loading,
        totalPortfolioValue,
        refreshPrices: fetchPrices,
        addStock,
        removeStock,
    };
}