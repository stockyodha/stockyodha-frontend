import apiClient from '../config/api';
import type { WatchlistRead, WatchlistStockRead, StockIdentifier, WatchlistCreate } from '../types/watchlistTypes'; // Added WatchlistCreate
import { AxiosError } from 'axios'; // Import AxiosError for type checking

export const getWatchlists = async (limit: number = 10, skip: number = 0): Promise<WatchlistRead[]> => {
  try {
    const response = await apiClient.get<WatchlistRead[]>('/watchlists', {
      params: { limit, skip },
    });
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch watchlists:', error);
    throw error;
  }
};

export const getWatchlistStocks = async (watchlistId: string, limit: number = 50, skip: number = 0): Promise<WatchlistStockRead[]> => {
  try {
    const response = await apiClient.get<WatchlistStockRead[]>(`/watchlists/${watchlistId}/stocks`, {
      params: { limit, skip },
    });
    return response.data || [];
  } catch (error) {
    console.error(`Failed to fetch stocks for watchlist ${watchlistId}:`, error);
    throw error;
  }
};

/**
 * Adds a stock to a specific watchlist.
 * Corresponds to POST /api/v1/watchlists/{watchlist_id}/stocks
 *
 * @param watchlistId The ID of the watchlist to add to.
 * @param stockIdentifier Object containing stock exchange and symbol.
 * @returns A promise that resolves to the added watchlist stock details.
 */
export const addStockToWatchlist = async (
  watchlistId: string,
  stockIdentifier: StockIdentifier // Use the specific type defined in watchlistTypes
): Promise<WatchlistStockRead> => {
  try {
    const response = await apiClient.post<WatchlistStockRead>(
      `/watchlists/${watchlistId}/stocks`,
      stockIdentifier // Send identifier in the request body
    );
    return response.data; // Assuming API returns the added item
  } catch (error) {
    console.error(`Failed to add stock ${stockIdentifier.symbol} to watchlist ${watchlistId}:`, error);
    throw error; // Re-throw for react-query mutation to handle
  }
};

/**
 * Creates a new watchlist for the current user.
 * Corresponds to POST /api/v1/watchlists
 *
 * @param watchlistData Object containing the name for the new watchlist.
 * @returns A promise that resolves to the newly created watchlist details.
 */
export const createWatchlist = async (
  watchlistData: WatchlistCreate
): Promise<WatchlistRead> => {
  try {
    const response = await apiClient.post<WatchlistRead>(
      '/watchlists',
      watchlistData
    );
    return response.data;
  } catch (error) {
    console.error('Failed to create watchlist:', error);
    throw error; // Re-throw for react-query mutation to handle
  }
};

/**
 * Deletes a specific watchlist for the current user.
 * Corresponds to DELETE /api/v1/watchlists/{watchlist_id}
 *
 * @param watchlistId The ID of the watchlist to delete.
 * @returns A promise that resolves when the deletion is successful (API returns 204 No Content).
 */
export const deleteWatchlist = async (watchlistId: string): Promise<void> => {
  try {
    await apiClient.delete(`/watchlists/${watchlistId}`);
    // No content returned on successful DELETE (204)
  } catch (error) {
    const axiosError = error as AxiosError;
    // Log the specific error, but let the mutation handler decide the user message
    console.error(`Failed to delete watchlist ${watchlistId}:`, axiosError.response?.data || axiosError.message);
    throw error; // Re-throw for react-query mutation to handle
  }
};

/**
 * Sets a specific watchlist as the default for the current user.
 * Corresponds to POST /api/v1/watchlists/{watchlist_id}/set-default
 *
 * @param watchlistId The ID of the watchlist to set as default.
 * @returns A promise that resolves to the updated watchlist details.
 */
export const setDefaultWatchlist = async (watchlistId: string): Promise<WatchlistRead> => {
  try {
    const response = await apiClient.post<WatchlistRead>(`/watchlists/${watchlistId}/set-default`);
    return response.data;
  } catch (error) {
    console.error(`Failed to set watchlist ${watchlistId} as default:`, error);
    throw error;
  }
};

/**
 * Adds a stock to the user's default watchlist.
 * Corresponds to POST /api/v1/watchlists/default/stocks
 *
 * @param stockIdentifier Object containing stock exchange and symbol.
 * @returns A promise that resolves to the added watchlist stock details.
 */
export const addStockToDefaultWatchlist = async (
  stockIdentifier: StockIdentifier
): Promise<WatchlistStockRead> => {
  try {
    const response = await apiClient.post<WatchlistStockRead>(
      `/watchlists/default/stocks`,
      stockIdentifier
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to add stock ${stockIdentifier.symbol} to default watchlist:`, error);
    throw error;
  }
};

/**
 * Removes a stock from a specific watchlist.
 * Corresponds to DELETE /api/v1/watchlists/{watchlist_id}/stocks/{exchange}/{symbol}
 *
 * @param watchlistId The ID of the watchlist.
 * @param exchange The stock exchange.
 * @param symbol The stock symbol.
 * @returns A promise that resolves when the deletion is successful.
 */
export const removeStockFromWatchlist = async (
  watchlistId: string,
  exchange: string,
  symbol: string
): Promise<void> => {
  try {
    await apiClient.delete(`/watchlists/${watchlistId}/stocks/${exchange}/${symbol}`);
  } catch (error) {
    console.error(`Failed to remove stock ${exchange}:${symbol} from watchlist ${watchlistId}:`, error);
    throw error;
  }
}; 