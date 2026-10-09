import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import styles from "./styles"

const FINNHUB_API_KEY = process.env.EXPO_PUBLIC_API_KEY;

// Activos iniciales en tu watchlist (puedes iniciar con lista vacía si prefieres)
const INITIAL_WATCHLIST = [
  { ticker: 'NVDA', name: 'Nvidia Corp.', shares: 5 },
  { ticker: 'AAPL', name: 'Apple Inc.', shares: 10 },
];

export default function App() {
  // Estado de la Watchlist principal
  const [watchlist, setWatchlist] = useState(INITIAL_WATCHLIST);
  const [marketData, setMarketData] = useState([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);

  // Estados del Buscador / Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 1. Fetch de precios para los activos en el Watchlist
  const fetchWatchlistPrices = async (currentList = watchlist) => {
    if (currentList.length === 0) {
      setMarketData([]);
      setTotalBalance(0);
      return;
    }

    setLoadingWatchlist(true);
    try {
      const results = await Promise.all(
        currentList.map(async (item) => {
          const res = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${item.ticker}&token=${FINNHUB_API_KEY}`
          );
          const data = await res.json();
          const price = data.c || 0;
          const change = data.dp || 0;
          return {
            ...item,
            price,
            change,
            totalValue: price * item.shares,
          };
        })
      );

      const balance = results.reduce((acc, curr) => acc + curr.totalValue, 0);
      setMarketData(results);
      setTotalBalance(balance);
    } catch (error) {
      console.error('Error al actualizar watchlist:', error);
    } finally {
      setLoadingWatchlist(false);
    }
  };

  useEffect(() => {
    fetchWatchlistPrices(watchlist);
  }, [watchlist]);

  // 2. Fetch para buscar símbolos en Finnhub
  const searchStocks = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    setSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
      );
      const data = await res.json();

      // Filtrar símbolos comunes (acciones ordinarias / Common Stock)
      const cleanResults = (data.result || [])
        .filter((item) => !item.symbol.includes('.')) // Omitir clases complejas o warrants
        .slice(0, 10);

      setSearchResults(cleanResults);
    } catch (error) {
      console.error('Error buscando acciones:', error);
      Alert.alert('Error', 'No se pudo conectar al servicio de búsqueda.');
    } finally {
      setSearching(false);
    }
  };

  // 3. Agregar acción al Watchlist
  const addToWatchlist = (stock) => {
    const exists = watchlist.some((item) => item.ticker === stock.symbol);
    if (exists) {
      Alert.alert('Aviso', `${stock.symbol} ya está en tu lista.`);
      return;
    }

    const newItem = {
      ticker: stock.symbol,
      name: stock.description || stock.symbol,
      shares: 1, // Cantidad por defecto
    };

    const updated = [...watchlist, newItem];
    setWatchlist(updated);
    setModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  // 4. Eliminar acción del Watchlist
  const removeFromWatchlist = (ticker) => {
    const updated = watchlist.filter((item) => item.ticker !== ticker);
    setWatchlist(updated);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header y Tarjeta de Balance */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.appName}>GBM TRACK & PREDICT</Text>
          <TouchableOpacity
            style={styles.searchIconButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.searchIconText}>Buscar Acción</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sección Watchlist Principal */}
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mi Watchlist ({watchlist.length})</Text>
          <TouchableOpacity onPress={() => fetchWatchlistPrices(watchlist)} disabled={loadingWatchlist}>
            <Text style={styles.refreshButton}>
              {loadingWatchlist ? 'Actualizando...' : '↻ Refrescar'}
            </Text>
          </TouchableOpacity>
        </View>

        {loadingWatchlist && marketData.length === 0 ? (
          <ActivityIndicator size="large" color="#00E676" style={{ marginTop: 40 }} />
        ) : marketData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tu watchlist está vacía.</Text>
            <Text style={styles.emptySubText}>Toca "Buscar Acción" para agregar títulos.</Text>
          </View>
        ) : (
          <FlatList
            data={marketData}
            keyExtractor={(item) => item.ticker}
            renderItem={({ item }) => {
              const isPositive = item.change >= 0;
              return (
                <View style={styles.stockCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tickerText}>{item.ticker}</Text>
                    <Text style={styles.sharesText}>
                      {item.shares} acc. • ${item.price.toFixed(2)}
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
                    onPress={() => removeFromWatchlist(item.ticker)}
                  >
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* MODAL DE BÚSQUEDA (FETCH) */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Buscar Acciones</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setSearchQuery('');
                setSearchResults([]);
                setHasSearched(false);
              }}
            >
              <Text style={styles.closeModalText}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          {/* Input de Búsqueda */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ej. TSLA, Microsoft, VOO..."
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="characters"
              onSubmitEditing={searchStocks}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.fetchButton} onPress={searchStocks} disabled={searching}>
              <Text style={styles.fetchButtonText}>{searching ? '...' : 'Buscar'}</Text>
            </TouchableOpacity>
          </View>

          {/* Resultados de Búsqueda */}
          {searching ? (
            <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 30 }} />
          ) : hasSearched && searchResults.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.noResultsText}>No se encontraron resultados</Text>
              <Text style={styles.emptySubText}>Intenta buscar por el ticker exacto (ej. AMZN, MSFT).</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.symbol}
              renderItem={({ item }) => {
                const isAdded = watchlist.some((w) => w.ticker === item.symbol);
                return (
                  <View style={styles.searchResultCard}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={styles.searchTicker}>{item.symbol}</Text>
                      <Text style={styles.searchDesc} numberOfLines={1}>
                        {item.description}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.addButton, isAdded && styles.addedButton]}
                      onPress={() => addToWatchlist(item)}
                      disabled={isAdded}
                    >
                      <Text style={styles.addButtonText}>{isAdded ? 'Agregada' : '+ Agregar'}</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}