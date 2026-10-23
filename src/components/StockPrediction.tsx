import { useMemo } from 'react';
import { Dimensions, Text, View } from 'react-native';
import Svg, { Circle, Path, Line as SvgLine, Text as SvgText } from 'react-native-svg';
import { Theme } from '../styles/theme';

interface Props {
    history: readonly number[];
    forecast: readonly number[];
}

export default function StockPredictionChart({ history, forecast }: Props) {
    const chartWidth = Dimensions.get('window').width - 32;
    const chartHeight = 200;
    const paddingVertical = 24;
    const paddingHorizontal = 16;

    const { histPoints, predPoints, minP, maxP } = useMemo(() => {
        const combined = [...history, ...forecast];
        const minP = Math.min(...combined);
        const maxP = Math.max(...combined);
        const range = maxP - minP === 0 ? 1 : maxP - minP;

        const totalCount = history.length + forecast.length - 1;
        const stepX = (chartWidth - paddingHorizontal * 2) / Math.max(1, totalCount);

        const histPoints = history.map((val, idx) => ({
            x: paddingHorizontal + idx * stepX,
            y: chartHeight - paddingVertical - ((val - minP) / range) * (chartHeight - paddingVertical * 2),
        }));

        const lastHist = histPoints[histPoints.length - 1] || { x: paddingHorizontal, y: chartHeight / 2 };

        const predPoints = [
            lastHist,
            ...forecast.map((val, idx) => ({
                x: paddingHorizontal + (history.length + idx) * stepX,
                y: chartHeight - paddingVertical - ((val - minP) / range) * (chartHeight - paddingVertical * 2),
            })),
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

    const isPredictUp = (forecast[forecast.length - 1] ?? 0) >= (history[history.length - 1] ?? 0);
    const trendColor = isPredictUp ? Theme.colors.gain : Theme.colors.loss;

    return (
        <View
            style={{
                backgroundColor: Theme.colors.surface,
                borderRadius: Theme.radius.lg,
                paddingVertical: 16,
                borderWidth: 1,
                borderColor: Theme.colors.border,
            }}
        >
            <Svg width={chartWidth} height={chartHeight}>
                <SvgLine
                    x1={paddingHorizontal}
                    y1={paddingVertical}
                    x2={chartWidth - paddingHorizontal}
                    y2={paddingVertical}
                    stroke={Theme.colors.border}
                    strokeDasharray="3 3"
                />
                <SvgText x={paddingHorizontal} y={paddingVertical - 6} fill={Theme.colors.textMuted} fontSize="10" fontWeight="600">
                    HIGH ${maxP.toFixed(2)}
                </SvgText>

                <SvgLine
                    x1={paddingHorizontal}
                    y1={chartHeight - paddingVertical}
                    x2={chartWidth - paddingHorizontal}
                    y2={chartHeight - paddingVertical}
                    stroke={Theme.colors.border}
                    strokeDasharray="3 3"
                />
                <SvgText x={paddingHorizontal} y={chartHeight - 6} fill={Theme.colors.textMuted} fontSize="10" fontWeight="600">
                    LOW ${minP.toFixed(2)}
                </SvgText>

                <Path d={historyPath} fill="none" stroke={Theme.colors.accent} strokeWidth={2.2} strokeLinecap="round" />

                <Path
                    d={forecastPath}
                    fill="none"
                    stroke={trendColor}
                    strokeWidth={2.2}
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                />

                {predPoints.length > 0 && (
                    <Circle
                        cx={predPoints[predPoints.length - 1].x}
                        cy={predPoints[predPoints.length - 1].y}
                        r={4.5}
                        fill={trendColor}
                    />
                )}
            </Svg>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 12, height: 3, backgroundColor: Theme.colors.accent, borderRadius: 2 }} />
                    <Text style={{ color: Theme.colors.textSecondary, fontSize: 11, fontWeight: '500' }}>Historical Close</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 12, height: 3, backgroundColor: trendColor, borderRadius: 2 }} />
                    <Text style={{ color: Theme.colors.textSecondary, fontSize: 11, fontWeight: '500' }}>AI Forecast (5D)</Text>
                </View>
            </View>
        </View>
    );
}