import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchStocksApi } from '../services/finnhub';
import { Theme } from '../styles/theme';
import { SearchStockResult, WatchlistItem } from '../types/stock';

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

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    modalTitle: {
        color: Theme.colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
    },
    closeModalText: {
        color: Theme.colors.accent,
        fontSize: 14,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        borderRadius: Theme.radius.md,
        paddingHorizontal: 14,
        paddingVertical: 10,
        color: Theme.colors.textPrimary,
        fontSize: 15,
    },
    emptyContainer: {
        marginTop: 60,
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    noResultsText: {
        color: Theme.colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    emptySubText: {
        color: Theme.colors.textMuted,
        fontSize: 13,
        marginTop: 6,
        textAlign: 'center',
    },
    searchResultCard: {
        backgroundColor: Theme.colors.surface,
        padding: 14,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: Theme.radius.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    searchTicker: {
        color: Theme.colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    searchDesc: {
        color: Theme.colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    addButton: {
        backgroundColor: Theme.colors.accent,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: Theme.radius.sm,
    },
    addedButton: {
        backgroundColor: Theme.colors.surfaceSubtle,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    addButtonText: {
        color: Theme.colors.background,
        fontWeight: '700',
        fontSize: 12,
    },
});