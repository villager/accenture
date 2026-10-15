import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

import styles from './styles';
import { WatchlistItem, MarketStock, SearchStockResult } from '../types/stock';
import { fetchStockQuote } from '../services/finnhub';
import StockDetailModal from '../components/StockDetailModal';
import StockSearchModal from '../components/StockSearchModal';

const INITIAL_WATCHLIST: WatchlistItem[] = [
  { ticker: 'NVDA', name: 'Nvidia Corp.', shares: 5 },
  { ticker: 'AAPL', name: 'Apple Inc.', shares: 10 },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <MainScreen />
    </SafeAreaProvider>
  );
}

function MainScreen() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(INITIAL_WATCHLIST);
  const [marketData, setMarketData] = useState<MarketStock[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState<boolean>(false);

  // Modals
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState<MarketStock | null>(null);

  const fetchWatchlistPrices = useCallback(async () => {
    if (watchlist.length === 0) {
      setMarketData([]);
      return;
    }

    setLoadingWatchlist(true);
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
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not update market data.');
    } finally {
      setLoadingWatchlist(false);
    }
  }, [watchlist]);

  useEffect(() => {
    fetchWatchlistPrices();
  }, [fetchWatchlistPrices]);

  const addToWatchlist = (stock: SearchStockResult) => {
    if (watchlist.some((item) => item.ticker === stock.symbol)) {
      Alert.alert('Notice', `${stock.symbol} is already in your watchlist.`);
      return;
    }
    setWatchlist((prev) => [
      ...prev,
      { ticker: stock.symbol, name: stock.description || stock.symbol, shares: 1 },
    ]);
    setSearchModalVisible(false);
  };

  const removeFromWatchlist = (ticker: string) => {
    setWatchlist((prev) => prev.filter((item) => item.ticker !== ticker));
  };

  const handleSelectStock = (stock: MarketStock) => {
    setSelectedStock(stock);
    setDetailModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false, title: '' }} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.appName}>TRACK & PREDICT</Text>
          <TouchableOpacity
            style={styles.searchIconButton}
            onPress={() => setSearchModalVisible(true)}
          >
            <Text style={styles.searchIconText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Watchlist Section */}
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Watchlist ({watchlist.length})</Text>
          <TouchableOpacity onPress={fetchWatchlistPrices} disabled={loadingWatchlist}>
            <Text style={styles.refreshButton}>
              {loadingWatchlist ? 'Refreshing...' : '↻ Refresh'}
            </Text>
          </TouchableOpacity>
        </View>

        {loadingWatchlist && marketData.length === 0 ? (
          <ActivityIndicator size="large" color="#00E676" style={{ marginTop: 40 }} />
        ) : marketData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your watchlist is empty.</Text>
            <Text style={styles.emptySubText}>Tap "Search" to add stocks.</Text>
          </View>
        ) : (
          <FlatList<MarketStock>
            data={marketData}
            keyExtractor={(item) => item.ticker}
            renderItem={({ item }) => {
              const isPositive = item.change >= 0;
              return (
                <TouchableOpacity
                  style={styles.stockCard}
                  activeOpacity={0.7}
                  onPress={() => handleSelectStock(item)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tickerText}>{item.ticker}</Text>
                    <Text style={styles.sharesText}>
                      {item.shares} shares • ${item.price.toFixed(2)}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end', marginRight: 14 }}>
                    <Text style={styles.valueText}>${item.totalValue.toFixed(2)}</Text>
                    <Text style={[styles.changeText, { color: isPositive ? '#00E676' : '#FF5252' }]}>
                      {isPositive ? '▲ +' : '▼ '}{item.change.toFixed(2)}%
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(item.ticker);
                    }}
                  >
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {/* Modals */}
      <StockDetailModal
        visible={detailModalVisible}
        stock={selectedStock}
        onClose={() => setDetailModalVisible(false)}
      />

      <StockSearchModal
        visible={searchModalVisible}
        watchlist={watchlist}
        onClose={() => setSearchModalVisible(false)}
        onAddStock={addToWatchlist}
      />
    </SafeAreaView>
  );
}