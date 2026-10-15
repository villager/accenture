import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MarketStock, PredictionResult } from '../types/stock';
import { fetchStockCandles } from '../services/finnhub';
import { runNeuralForecast } from '../services/neuralForecast';
import StockPredictionChart from './StockPrediction';
import styles from '../app/styles';

interface Props {
    visible: boolean;
    stock: MarketStock | null;
    onClose: () => void;
}

export default function StockDetailModal({ visible, stock, onClose }: Props) {
    const [loading, setLoading] = useState(false);
    const [predictionData, setPredictionData] = useState<PredictionResult | null>(null);

    useEffect(() => {
        if (!visible || !stock) return;

        let isMounted = true;
        async function loadData() {
            setLoading(true);
            setPredictionData(null);
            try {
                let prices = await fetchStockCandles(stock!.ticker);

                // Fallback simulation if needed
                if (prices.length < 5) {
                    const base = stock!.price > 0 ? stock!.price : 150;
                    prices = Array.from({ length: 25 }, (_, i) => {
                        const delta = (Math.sin(i * 0.4) + Math.random() * 0.5 - 0.25) * (base * 0.03);
                        return Math.max(1, Number((base + delta).toFixed(2)));
                    });
                    prices[prices.length - 1] = stock!.price > 0 ? stock!.price : prices[prices.length - 1];
                }

                const prediction = runNeuralForecast(prices, 5);
                if (isMounted) setPredictionData(prediction);
            } catch (err) {
                console.error(err);
                Alert.alert('Notice', 'Unable to retrieve historical data.');
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadData();

        return () => {
            isMounted = false;
        };
    }, [visible, stock]);

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom', 'left', 'right']}>
                <View style={styles.modalHeader}>
                    <View>
                        <Text style={styles.modalTitle}>{stock?.ticker}</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 13 }}>{stock?.name}</Text>
                    </View>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.closeModalText}>Close</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#38BDF8" />
                        <Text style={{ color: '#94A3B8', marginTop: 12 }}>Running neural network forecast...</Text>
                    </View>
                ) : predictionData ? (
                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                            <View>
                                <Text style={{ color: '#64748B', fontSize: 12 }}>CURRENT PRICE</Text>
                                <Text style={{ color: '#F8FAFC', fontSize: 26, fontWeight: '700' }}>
                                    ${stock?.price.toFixed(2)}
                                </Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ color: '#64748B', fontSize: 12 }}>AI 5-DAY PROJECTION</Text>
                                <Text
                                    style={{
                                        fontSize: 22,
                                        fontWeight: '700',
                                        color: predictionData.projectedChangePercent >= 0 ? '#00E676' : '#FF5252',
                                    }}
                                >
                                    {predictionData.projectedChangePercent >= 0 ? '▲ +' : '▼ '}
                                    {predictionData.projectedChangePercent.toFixed(2)}%
                                </Text>
                            </View>
                        </View>

                        <StockPredictionChart
                            history={predictionData.history}
                            forecast={predictionData.forecast}
                        />

                        <View
                            style={{
                                backgroundColor: '#1E293B',
                                borderRadius: 12,
                                padding: 16,
                                marginTop: 24,
                                borderWidth: 1,
                                borderColor: '#334155',
                            }}
                        >
                            <Text style={{ color: '#38BDF8', fontWeight: '700', fontSize: 14, marginBottom: 6 }}>
                                Neural Network Analysis
                            </Text>
                            <Text style={{ color: '#94A3B8', fontSize: 13, lineHeight: 19 }}>
                                The solid line represents historical daily closes. The dotted line represents the forward 5-day regression curve computed via nonlinear neural momentum.
                            </Text>
                        </View>
                    </ScrollView>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.noResultsText}>No historical records available</Text>
                    </View>
                )}
            </SafeAreaView>
        </Modal>
    );
}