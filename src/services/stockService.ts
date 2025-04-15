import apiClient from '../config/api';
// Assuming types will be manually created in src/types/stockTypes.ts
import type { StockRead, HistoryResolution, StockHistoryDataPoint } from '../types/stockTypes';
import type { NewsRead } from '../types/newsTypes'; // Import NewsRead

/**
 * Searches for stock listings by symbol or name.
 * Corresponds to GET /api/v1/stocks/search endpoint.
 *
 * @param query The search term (symbol or name).
 * @param exchange Optional exchange filter ('nse', 'bse', or null for all).
 * @param limit Maximum number of results to return.
 * @returns A promise that resolves to an array of matching stock listings.
 */
export const searchStocks = async (
	query: string,
	exchange: string | null = null, // Added optional exchange filter
	limit: number = 10, // Default limit for search results
): Promise<StockRead[]> => {
	if (!query || query.trim().length < 3) {
		// Don't call API if query is too short (Requirement #2)
		return Promise.resolve([]);
	}

	try {
		const response = await apiClient.get<StockRead[]>('/stocks/search', {
			// Corrected path (removed /api/v1 prefix)
			params: {
				query: query.trim(),
				limit: limit,
				// Conditionally add exchange if it's not null
				...(exchange && { exchange: exchange }),
			},
		});
		return response.data || [];
	} catch (error) {
		console.error('Error searching stocks:', error);
		// Re-throw or return empty array based on how calling code handles errors
		// Returning empty array might be simpler for UI state management
		// throw error;
		return [];
	}
};

/**
 * Fetches detailed information for a specific stock listing.
 * Corresponds to GET /api/v1/stocks/{exchange}/{symbol} endpoint.
 *
 * @param exchange The stock exchange (e.g., 'nse', 'bse').
 * @param symbol The stock symbol.
 * @returns A promise that resolves to the detailed stock information.
 */
export const getStockDetails = async (
	exchange: string,
	symbol: string
): Promise<StockRead> => {
	if (!exchange || !symbol) {
		return Promise.reject(new Error("Exchange and symbol are required."));
	}
	try {
		// Construct the path with encoded exchange and symbol
		const path = `/stocks/${encodeURIComponent(exchange)}/${encodeURIComponent(symbol)}`;
		const response = await apiClient.get<StockRead>(path);
		return response.data;
	} catch (error) {
		console.error(`Error fetching stock details for ${exchange}:${symbol}:`, error);
		// Rethrow the error so useQuery can handle it
		throw error;
	}
};

/**
 * Fetches related news articles for a specific stock listing.
 * Corresponds to GET /api/v1/stocks/{exchange}/{symbol}/news endpoint.
 *
 * @param exchange The stock exchange.
 * @param symbol The stock symbol.
 * @param limit The maximum number of news articles to return.
 * @returns A promise that resolves to an array of news articles.
 */
export const getStockNews = async (
	exchange: string,
	symbol: string,
	limit: number = 5 // Default limit for related news
): Promise<NewsRead[]> => {
	if (!exchange || !symbol) {
		return Promise.reject(new Error("Exchange and symbol are required."));
	}
	try {
		const path = `/stocks/${encodeURIComponent(exchange)}/${encodeURIComponent(symbol)}/news`;
		const response = await apiClient.get<NewsRead[]>(path, {
			params: { limit },
		});
		return response.data;
	} catch (error) {
		console.error(`Error fetching stock news for ${exchange}:${symbol}:`, error);
		// Return empty array on error for easier UI handling
		return [];
		// Or rethrow: throw error;
	}
};

/**
 * Fetches historical OHLCV data for a specific stock listing (NSE only).
 * Corresponds to GET /api/v1/stocks/{exchange}/{symbol}/history endpoint.
 *
 * @param exchange The stock exchange (must be 'nse').
 * @param symbol The stock symbol.
 * @param resolution Time resolution (e.g., 'ONE_MINUTE', 'ONE_DAY', 'ONE_YEAR').
 * @param from Start timestamp (Unix seconds).
 * @param to End timestamp (Unix seconds).
 * @returns A promise that resolves to an array of historical data points.
 */
export const getStockHistory = async (
	exchange: string,
	symbol: string,
	resolution: HistoryResolution,
	from: number,
	to: number
): Promise<StockHistoryDataPoint[]> => {
	if (exchange.toLowerCase() !== 'nse') {
		console.warn('Stock history API currently only supports NSE exchange.');
		return Promise.resolve([]);
	}
	if (!symbol || !resolution || !from || !to) {
		return Promise.reject(new Error("Symbol, resolution, from, and to are required for history."));
	}

	try {
		const path = `/stocks/${encodeURIComponent(exchange)}/${encodeURIComponent(symbol)}/history`;
		const response = await apiClient.get<StockHistoryDataPoint[]>(path, {
			params: {
				resolution,
				from,
				to,
			},
		});
		return response.data;
	} catch (error) {
		console.error(`Error fetching stock history for ${exchange}:${symbol} with resolution ${resolution}:`, error);
		return [];
	}
}; 