import { PredictionResult } from '../types/stock';

export function runNeuralForecast(rawSeries: number[], stepsAhead = 5): PredictionResult {
    const n = rawSeries.length;
    const minVal = Math.min(...rawSeries);
    const maxVal = Math.max(...rawSeries);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    // Min-Max Normalization to [0, 1]
    const normalized = rawSeries.map((v) => (v - minVal) / range);

    // Temporal weights representing momentum
    const weights = [0.08, 0.12, 0.20, 0.28, 0.32];
    const forecastNorm: number[] = [];
    const window = [...normalized];

    for (let step = 0; step < stepsAhead; step++) {
        const last5 = window.slice(-5);
        let activation = 0;
        for (let i = 0; i < 5; i++) {
            activation += last5[i] * weights[i];
        }
        const trend = (last5[4] - last5[0]) * 0.25;
        const nextVal = Math.tanh(activation + trend);
        forecastNorm.push(nextVal);
        window.push(nextVal);
    }

    // Denormalization
    const forecast = forecastNorm.map((v) => Math.max(0.1, v * range + minVal));
    const lastPrice = rawSeries[n - 1];
    const finalPredicted = forecast[forecast.length - 1];
    const projectedChangePercent = ((finalPredicted - lastPrice) / lastPrice) * 100;

    return {
        history: rawSeries,
        forecast,
        projectedChangePercent,
    };
}