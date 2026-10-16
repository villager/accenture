import { Session } from '@supabase/supabase-js';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import AuthScreen from '../components/AuthScreen';
import StockDetailModal from '../components/StockDetailModal';
import StockSearchModal from '../components/StockSearchModal';
import { fetchStockQuote } from '../services/finnhub';
import { supabase } from '../services/supabase';
import { addStockToCloud, fetchUserWatchlist, removeStockFromCloud } from '../services/watchlistService';
import { MarketStock, SearchStockResult, WatchlistItem } from '../types/stock';
import styles from './styles';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B0E14', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {!session ? <AuthScreen /> : <MainScreen session={session} />}
    </SafeAreaProvider>
  );
}

function MainScreen({ session }: { session: Session }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [marketData, setMarketData] = useState<MarketStock[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState<boolean>(false);

  // Modals
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState<MarketStock | null>(null);

  // 1. Cargar la Watchlist desde la nube al iniciar sesión
  const loadCloudWatchlist = useCallback(async () => {
    try {
      setLoadingWatchlist(true);
      const cloudItems = await fetchUserWatchlist();
      setWatchlist(cloudItems);
    } catch (err: any) {
      Alert.alert('Error', 'Could not load your saved stocks from cloud.');
    } finally {
      setLoadingWatchlist(false);
    }
  }, []);

  useEffect(() => {
    loadCloudWatchlist();
  }, [loadCloudWatchlist]);

  // 2. Fetch precios de mercado
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
    } finally {
      setLoadingWatchlist(false);
    }
  }, [watchlist]);

  useEffect(() => {
    fetchWatchlistPrices();
  }, [fetchWatchlistPrices]);

  // 3. Agregar acción a la nube y al estado
  const addToWatchlist = async (stock: SearchStockResult) => {
    if (watchlist.some((item) => item.ticker === stock.symbol)) {
      Alert.alert('Notice', `${stock.symbol} is already in your watchlist.`);
      return;
    }

    const newItem: WatchlistItem = {
      ticker: stock.symbol,
      name: stock.description || stock.symbol,
      shares: 1,
    };

    try {
      await addStockToCloud(newItem);
      setWatchlist((prev) => [newItem, ...prev]);
      setSearchModalVisible(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to save stock to your account.');
    }
  };

  // 4. Eliminar acción de la nube y del estado
  const removeFromWatchlist = async (ticker: string) => {
    try {
      await removeStockFromCloud(ticker);
      setWatchlist((prev) => prev.filter((item) => item.ticker !== ticker));
    } catch (err) {
      Alert.alert('Error', 'Failed to remove stock from your account.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false, title: '' }} />

      {/* Header con botón de búsqueda y Logout */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.appName}>TRACK & PREDICT</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={styles.searchIconButton}
              onPress={() => setSearchModalVisible(true)}
            >
              <Text style={styles.searchIconText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.searchIconButton, { backgroundColor: '#334155' }]}
              onPress={handleLogout}
            >
              <Text style={[styles.searchIconText, { color: '#CBD5E1' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
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
            <Text style={styles.emptySubText}>Tap "Search" to add stocks to your account.</Text>
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
                  onPress={() => {
                    setSelectedStock(item);
                    setDetailModalVisible(true);
                  }}
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