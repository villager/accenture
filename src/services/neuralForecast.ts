import { PredictionResult } from '../types/stock';

// Caché en memoria para garantizar resultados idénticos ante consultas repetidas
const forecastCache = new Map<string, PredictionResult>();

export function runNeuralForecast(rawSeries: number[], stepsAhead = 5): PredictionResult {
    // 1. Limpieza y redondeo a 2 decimales para filtrar micro-ruido de la API
    const cleanSeries = rawSeries
        .filter((v) => typeof v === 'number' && Number.isFinite(v) && v > 0)
        .map((v) => Math.round(v * 100) / 100);

    const n = cleanSeries.length;

    if (n === 0) {
        return { history: [], forecast: [], projectedChangePercent: 0 };
    }
    if (n < 4) {
        const last = cleanSeries[n - 1];
        return {
            history: cleanSeries,
            forecast: Array(stepsAhead).fill(last),
            projectedChangePercent: 0,
        };
    }

    // 2. Verificación de caché determinista (basada en los datos redondeados)
    const cacheKey = `${stepsAhead}:${cleanSeries.join(',')}`;
    const cached = forecastCache.get(cacheKey);
    if (cached) {
        return cached;
    }

    // 3. Retornos logarítmicos sobre la serie limpia
    const logReturns: number[] = [];
    for (let i = 1; i < n; i++) {
        logReturns.push(Math.log(cleanSeries[i] / cleanSeries[i - 1]));
    }

    const m = logReturns.length;
    const windowSize = Math.min(5, m);

    // 4. Calibrar estadísticas usando velas cerradas (evita que el último tick distorsione la base)
    const closedReturns = m > 5 ? logReturns.slice(0, -1) : logReturns;
    const meanReturn = closedReturns.reduce((acc, val) => acc + val, 0) / closedReturns.length;

    let ewmaVariance = 0;
    const lambda = 0.94;
    for (let i = 0; i < closedReturns.length; i++) {
        const diff = closedReturns[i] - meanReturn;
        ewmaVariance = i === 0 ? diff * diff : lambda * ewmaVariance + (1 - lambda) * (diff * diff);
    }
    const volatility = Math.max(Math.sqrt(ewmaVariance), 1e-6);

    const normalizedReturns = logReturns.map((r) => (r - meanReturn) / volatility);

    // 5. Pesos deterministas con ajuste analítico amortiguado sobre velas cerradas
    const baseWeights = [0.08, 0.12, 0.20, 0.28, 0.32].slice(-windowSize);
    const weightSum = baseWeights.reduce((a, b) => a + b, 0);
    const weights = baseWeights.map((w) => w / weightSum);
    let bias = 0;

    // Entrenamos hasta m - 1 para que los pesos sean constantes durante toda la sesión/vela actual
    const trainLimit = m > windowSize + 1 ? m - 1 : m;
    if (trainLimit > windowSize) {
        const learningRate = 0.01;
        const l2Penalty = 0.08;
        const epochs = 30;

        for (let epoch = 0; epoch < epochs; epoch++) {
            for (let t = windowSize; t < trainLimit; t++) {
                let z = bias;
                for (let i = 0; i < windowSize; i++) {
                    z += normalizedReturns[t - windowSize + i] * weights[i];
                }
                const pred = 2.5 * Math.tanh(z / 2.5);
                const error = normalizedReturns[t] - pred;
                const grad = error * (1 - Math.pow(pred / 2.5, 2));

                for (let i = 0; i < windowSize; i++) {
                    const input = normalizedReturns[t - windowSize + i];
                    weights[i] += learningRate * (grad * input - l2Penalty * weights[i]);
                }
                bias += learningRate * (grad - l2Penalty * bias);
            }
        }
    }

    // 6. Tendencia suavizada
    const alpha = 0.35;
    let smoothTrend = normalizedReturns[0];
    for (let i = 1; i < m; i++) {
        smoothTrend = alpha * normalizedReturns[i] + (1 - alpha) * smoothTrend;
    }

    // 7. Proyección hacia adelante
    const window = [...normalizedReturns];
    const forecast: number[] = [];
    let currentPrice = cleanSeries[n - 1];
    const dampingFactor = 0.82;

    for (let step = 0; step < stepsAhead; step++) {
        const recent = window.slice(-windowSize);
        let activation = bias;
        for (let i = 0; i < windowSize; i++) {
            activation += recent[i] * weights[i];
        }

        const shortMomentum = recent[recent.length - 1] - recent[0];
        const damping = Math.pow(dampingFactor, step + 1);

        const rawSignal = (activation + 0.25 * smoothTrend + 0.15 * shortMomentum) * damping;
        const nextNormReturn = 2.0 * Math.tanh(rawSignal / 2.0);
        window.push(nextNormReturn);

        const predictedLogReturn = nextNormReturn * volatility + meanReturn * damping;
        currentPrice = Math.max(0.01, currentPrice * Math.exp(predictedLogReturn));
        forecast.push(Number(currentPrice.toFixed(2)));
    }

    const lastPrice = cleanSeries[n - 1];
    const finalPredicted = forecast[forecast.length - 1];
    const projectedChangePercent =
        lastPrice > 0 ? Number((((finalPredicted - lastPrice) / lastPrice) * 100).toFixed(2)) : 0;

    const result: PredictionResult = {
        history: cleanSeries,
        forecast,
        projectedChangePercent,
    };

    // Limitar tamaño de caché para evitar fugas de memoria
    if (forecastCache.size > 200) {
        const firstKey = forecastCache.keys().next().value;
        if (firstKey) forecastCache.delete(firstKey);
    }
    forecastCache.set(cacheKey, result);

    return result;
}