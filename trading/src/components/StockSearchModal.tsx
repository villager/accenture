import React, { useState, useEffect, useCallback } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchStockResult, WatchlistItem } from '../types/stock';
import { searchStocksApi } from '../services/finnhub';
import styles from '../app/styles';

interface Props {
    visible: boolean;
    watchlist: WatchlistItem[];
    onClose: () => void;
    onAddStock: (stock: SearchStockResult) => void;
}

export default function StockSearchModal({ visible, watchlist, onClose, onAddStock }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchStockResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) {
            setResults([]);
            setHasSearched(false);
            setSearching(false);
            return;
        }

        setSearching(true);
        setHasSearched(true);
        try {
            const data = await searchStocksApi(trimmed);
            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        if (!visible) return;
        if (!query.trim()) {
            setResults([]);
            setHasSearched(false);
            setSearching(false);
            return;
        }

        const timer = setTimeout(() => handleSearch(query), 450);
        return () => clearTimeout(timer);
    }, [query, visible, handleSearch]);

    const handleClose = () => {
        setQuery('');
        setResults([]);
        setHasSearched(false);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom', 'left', 'right']}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Search stocks</Text>
                    <TouchableOpacity onPress={handleClose}>
                        <Text style={styles.closeModalText}>Close</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="e.g. TSLA, NVDA, Apple..."
                        placeholderTextColor="#64748B"
                        value={query}
                        onChangeText={setQuery}
                        autoCapitalize="characters"
                        onSubmitEditing={() => handleSearch(query)}
                        returnKeyType="search"
                        autoFocus
                    />
                    {searching && <ActivityIndicator size="small" color="#38BDF8" style={{ marginLeft: 10 }} />}
                </View>

                {searching && results.length === 0 ? (
                    <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 30 }} />
                ) : hasSearched && results.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.noResultsText}>No results found</Text>
                        <Text style={styles.emptySubText}>Try another term or the exact ticker.</Text>
                    </View>
                ) : (
                    <FlatList<SearchStockResult>
                        data={results}
                        keyExtractor={(item) => item.symbol}
                        keyboardShouldPersistTaps="handled"
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
                                        onPress={() => onAddStock(item)}
                                        disabled={isAdded}
                                    >
                                        <Text style={styles.addButtonText}>{isAdded ? 'Added' : '+ Add'}</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        }}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
}