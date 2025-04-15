import apiClient from '../config/api';
import { PortfolioRead, PortfolioPerformance } from '../types/portfolioTypes'; // Assuming these types exist

export const getPortfolios = async (limit: number = 1, skip: number = 0): Promise<PortfolioRead[]> => {
  try {
    const response = await apiClient.get<PortfolioRead[]>('/portfolios/', {
      params: { limit, skip },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch portfolios:', error);
    throw error; // Re-throw for react-query to handle
  }
};

export const getPortfolioPerformance = async (portfolioId: string): Promise<PortfolioPerformance> => {
  try {
    const response = await apiClient.get<PortfolioPerformance>(`/portfolios/${portfolioId}/performance`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch performance for portfolio ${portfolioId}:`, error);
    throw error;
  }
}; 