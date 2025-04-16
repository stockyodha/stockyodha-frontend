import { StockRead } from './stockTypes'; // Assuming stockTypes.ts exists

// Based on openapi.json /components/schemas/PortfolioRead
export interface PortfolioRead {
  name: string;
  description?: string | null;
  id: string; // UUID
  user_id: string; // UUID
  created_at: string; // ISO DateTime string
  updated_at: string; // ISO DateTime string
  is_default: boolean; // Added this field
}

// Based on openapi.json /components/schemas/PortfolioCreate
export interface PortfolioCreate {
  name: string;
  description?: string | null;
}

// Based on openapi.json /components/schemas/HoldingRead
export interface HoldingRead {
  portfolio_id: string; // UUID
  stock_symbol: string;
  stock_exchange: string;
  quantity: number;
  average_buy_price: string; // Using string as API returns string representation of Decimal
  stock?: StockRead | null; // Optional: Include stock details if API provides them later
  current_price?: string | null; // Added for potential future use in displaying value
  current_value?: string | null; // Added for potential future use in displaying value
}

// Based on openapi.json /components/schemas/PortfolioPerformance
export interface PortfolioPerformance {
    portfolio_id: string; // UUID
    total_cost_basis: string; 
    current_market_value: string;
    total_unrealized_pl: string;
    total_unrealized_pl_percentage: string | null;
    calculation_timestamp: string; // ISO DateTime string
    missing_price_data: string[]; // Array of stock symbols with missing prices
}

// If needed later
// export interface PortfolioUpdate {
//   name?: string | null;
//   description?: string | null;
// }