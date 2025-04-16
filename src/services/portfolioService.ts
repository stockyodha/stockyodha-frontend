import apiClient from '@/config/api';
import { 
    PortfolioRead, 
    PortfolioCreate, 
    HoldingRead, 
    PortfolioPerformance 
} from '@/types/portfolioTypes';

const API_BASE_URL = '/portfolios';

// GET /api/v1/portfolios
export const getPortfolios = async (skip: number = 0, limit: number = 50): Promise<PortfolioRead[]> => {
    const response = await apiClient.get<PortfolioRead[]>(`${API_BASE_URL}?skip=${skip}&limit=${limit}`);
    return response.data;
};

// POST /api/v1/portfolios
export const createPortfolio = async (portfolioData: PortfolioCreate): Promise<PortfolioRead> => {
    const response = await apiClient.post<PortfolioRead>(API_BASE_URL, portfolioData);
    return response.data;
};

// GET /api/v1/portfolios/{portfolio_id}
export const getPortfolioDetails = async (portfolioId: string): Promise<PortfolioRead> => {
    const response = await apiClient.get<PortfolioRead>(`${API_BASE_URL}/${portfolioId}`);
    return response.data;
};

// DELETE /api/v1/portfolios/{portfolio_id}
export const deletePortfolio = async (portfolioId: string): Promise<void> => {
    await apiClient.delete(`${API_BASE_URL}/${portfolioId}`);
};

// GET /api/v1/portfolios/{portfolio_id}/holdings
export const getPortfolioHoldings = async (portfolioId: string, skip: number = 0, limit: number = 100): Promise<HoldingRead[]> => {
    const response = await apiClient.get<HoldingRead[]>(`${API_BASE_URL}/${portfolioId}/holdings?skip=${skip}&limit=${limit}`);
    return response.data;
};

// GET /api/v1/portfolios/{portfolio_id}/performance
export const getPortfolioPerformance = async (portfolioId: string): Promise<PortfolioPerformance> => {
    const response = await apiClient.get<PortfolioPerformance>(`${API_BASE_URL}/${portfolioId}/performance`);
    return response.data;
};

// POST /api/v1/portfolios/{portfolio_id}/set-default
export const setDefaultPortfolio = async (portfolioId: string): Promise<PortfolioRead> => {
    const response = await apiClient.post<PortfolioRead>(`${API_BASE_URL}/${portfolioId}/set-default`);
    return response.data;
}; 