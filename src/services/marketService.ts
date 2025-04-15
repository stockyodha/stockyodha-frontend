import apiClient from "../config/api";
import { TrendItem, TrendType, MarketIndex } from "../types/market";

const API_BASE_URL = "/market";

export const marketService = {
  /**
   * Fetches the top market trends (gainers or losers) for a given index.
   * @param type - The type of trend to fetch ('TOP_GAINERS' or 'TOP_LOSERS').
   * @param limit - The maximum number of items to return.
   * @param index - The market index to fetch trends for.
   * @returns A promise that resolves to an array of TrendItem objects.
   */
  getMarketTrends: async (
    type: TrendType = "TOP_GAINERS",
    limit: number = 10,
    index: MarketIndex = "SYNIFTY100"
  ): Promise<TrendItem[]> => {
    try {
      const response = await apiClient.get<TrendItem[]>(`${API_BASE_URL}/trends`, {
        params: {
          type,
          limit,
          index,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching market trends (${type}, index: ${index}):`, error);
      // TODO: Improve error handling (e.g., return a specific error object)
      throw error;
    }
  },

  // TODO: Add getMarketStatus if needed later
}; 