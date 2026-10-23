/**
 * @file stock.ts
 * @description Definición de interfaces y tipos de dominio para el módulo de seguimiento
 * bursátil, sincronización en nube y proyecciones cuantitativas.
 * @version 1.0.0
 */

/**
 * Representa un activo bursátil registrado en la lista de seguimiento personalizada del usuario.
 */
export interface WatchlistItem {
    /** Símbolo bursátil oficial (ej. 'AAPL', 'NVDA', 'MSFT'). */
    readonly ticker: string;

    /** Razón social o denominación comercial de la empresa/activo. */
    readonly name: string;

    /** Cantidad de acciones o participaciones registradas por el usuario. */
    readonly shares: number;
}

/**
 * Representa el estado de cotización y valuación financiera en tiempo real de un activo.
 * Extiende los datos base de {@link WatchlistItem}.
 */
export interface MarketStock extends WatchlistItem {
    /** Precio actual unitario de mercado en divisa base (USD). */
    readonly price: number;

    /** Variación porcentual de la cotización durante la sesión bursátil actual. */
    readonly change: number;

    /** Valuación total de la posición patrimonial (`price * shares`). */
    readonly totalValue: number;
}

/**
 * Representa un resultado devuelto por el servicio de búsqueda de activos bursátiles.
 */
export interface SearchStockResult {
    /** Ticker o identificador de mercado del activo cotizado. */
    readonly symbol: string;

    /** Nombre completo, razón social o descripción provista por el proveedor de datos. */
    readonly description: string;

    /** Clasificación del activo (ej. 'Common Stock', 'ETF', 'ADR'). */
    readonly type?: string;
}

/**
 * Esquema de respuesta estandarizado para velas históricas del mercado financiero (OHLCV).
 * Basado en la especificación de API de Finnhub.
 */
export interface HistoricalCandleResponse {
    /** Lista de precios de cierre ordenados cronológicamente (`c` de Close prices). */
    readonly c?: readonly number[];

    /** Estado de respuesta de la solicitud ('ok' o 'no_data'). */
    readonly s?: 'ok' | 'no_data' | string;

    /** Marcas de tiempo UNIX en segundos de cada vela registrada (`t` de Timestamps). */
    readonly t?: readonly number[];
}

/**
 * Estructura de salida generada por el motor de inferencia y regresión neuronal.
 */
export interface PredictionResult {
    /** Serie histórica de precios de cierre utilizada como entrada/calibración. */
    readonly history: readonly number[];

    /** Serie proyectada generada para la ventana futura solicitada. */
    readonly forecast: readonly number[];

    /** Variación porcentual proyectada entre el último precio histórico y el horizonte estimado. */
    readonly projectedChangePercent: number;
}

/**
 * Parámetros opcionales de configuración para la ejecución de modelos de proyección.
 */
export interface ForecastOptions {
    /** Cantidad de pasos o periodos temporales a estimar hacia adelante (por defecto: 5). */
    readonly stepsAhead?: number;

    /** Tasa de regularización de pesos (L2). */
    readonly regularizationPenalty?: number;
}

/**
 * Interface que define las props para el componente de gráfico de predicción.
 */
export interface ChartProps {
    /** Serie histórica de precios de cierre utilizada como entrada/calibración. */
    readonly history: readonly number[];

    /** Serie proyectada generada para la ventana futura solicitada. */
    readonly forecast: readonly number[];
}
/**
 * Interface que define las props para el componente de modal de detalle de acción.
 */
export interface ModalProps {
    /** Indica si el modal está visible o no. */
    readonly visible: boolean;

    /** Acción que se está visualizando. */
    readonly stock: MarketStock | null;

    /** Función que se ejecuta cuando se cierra el modal. */
    readonly onClose: () => void;
}