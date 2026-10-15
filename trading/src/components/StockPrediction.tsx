import { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line as SvgLine, Text as SvgText } from 'react-native-svg';

interface Props {
    history: number[];
    forecast: number[];
}

export default function StockPredictionChart({ history, forecast }: Props) {
    const chartWidth = Dimensions.get('window').width - 32;
    const chartHeight = 220;
    const padding = 20;

    const { histPoints, predPoints, minP, maxP } = useMemo(() => {
        const combined = [...history, ...forecast];
        const minP = Math.min(...combined);
        const maxP = Math.max(...combined);
        const range = maxP - minP === 0 ? 1 : maxP - minP;

        const totalCount = history.length + forecast.length - 1;
        const stepX = (chartWidth - padding * 2) / totalCount;

        const histPoints = history.map((val, idx) => {
            const x = padding + idx * stepX;
            const y = chartHeight - padding - ((val - minP) / range) * (chartHeight - padding * 2);
            return { x, y };
        });

        const lastHistPoint = histPoints[histPoints.length - 1];
        const predPoints = [
            lastHistPoint,
            ...forecast.map((val, idx) => {
                const x = padding + (history.length + idx) * stepX;
                const y = chartHeight - padding - ((val - minP) / range) * (chartHeight - padding * 2);
                return { x, y };
            }),
        ];

        return { histPoints, predPoints, minP, maxP };
    }, [history, forecast, chartWidth]);

    const historyPath = useMemo(() => {
        if (!histPoints.length) return '';
        return histPoints.reduce(
            (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`,
            ''
        );
    }, [histPoints]);

    const forecastPath = useMemo(() => {
        if (!predPoints.length) return '';
        return predPoints.reduce(
            (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`,
            ''
        );
    }, [predPoints]);

    const isPredictUp = (forecast[forecast.length - 1] || 0) >= (history[history.length - 1] || 0);

    return (
        <View
            style={{
                backgroundColor: '#0F172A',
                borderRadius: 16,
                paddingVertical: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#1E293B',
            }}
        >
            <Svg width={chartWidth} height={chartHeight}>
                <SvgLine
                    x1={padding}
                    y1={padding}
                    x2={chartWidth - padding}
                    y2={padding}
                    stroke="#334155"
                    strokeDasharray="4 4"
                />
                <SvgText x={padding} y={padding - 4} fill="#64748B" fontSize="10">
                    ${maxP.toFixed(2)}
                </SvgText>

                <SvgLine
                    x1={padding}
                    y1={chartHeight - padding}
                    x2={chartWidth - padding}
                    y2={chartHeight - padding}
                    stroke="#334155"
                    strokeDasharray="4 4"
                />
                <SvgText x={padding} y={chartHeight - 4} fill="#64748B" fontSize="10">
                    ${minP.toFixed(2)}
                </SvgText>

                <Path d={historyPath} fill="none" stroke="#38BDF8" strokeWidth={2.5} />
                <Path
                    d={forecastPath}
                    fill="none"
                    stroke={isPredictUp ? '#00E676' : '#FF5252'}
                    strokeWidth={2.5}
                    strokeDasharray="5 4"
                />

                {predPoints.length > 0 && (
                    <Circle
                        cx={predPoints[predPoints.length - 1].x}
                        cy={predPoints[predPoints.length - 1].y}
                        r={4}
                        fill={isPredictUp ? '#00E676' : '#FF5252'}
                    />
                )}
            </Svg>

            <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 14, height: 3, backgroundColor: '#38BDF8', borderRadius: 2 }} />
                    <Text style={{ color: '#94A3B8', fontSize: 11 }}>Historical</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View
                        style={{
                            width: 14,
                            height: 3,
                            backgroundColor: isPredictUp ? '#00E676' : '#FF5252',
                            borderRadius: 2,
                        }}
                    />
                    <Text style={{ color: '#94A3B8', fontSize: 11 }}>Predicted (5D)</Text>
                </View>
            </View>
        </View>
    );
}