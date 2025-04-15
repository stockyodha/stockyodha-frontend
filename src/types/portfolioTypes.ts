
// Based on #/components/schemas/PortfolioRead
export interface PortfolioRead {
  name: string;
  description?: string | null;
  id: string; // uuid
  user_id: string; // uuid
  created_at: string; // date-time
  updated_at?: string | null; // date-time
  // Frontend might augment this with holdings or performance data later
}

// Based on #/components/schemas/PortfolioUpdate
export interface PortfolioUpdate {
  name?: string | null;
  description?: string | null;
}

// Based on #/components/schemas/PortfolioCreate
export interface PortfolioCreate {
  name: string;
  description?: string | null;
}

// Based on #/components/schemas/PortfolioPerformance
export interface PortfolioPerformance {
  portfolio_id: string; // uuid
  total_cost_basis: string; // decimal string
  current_market_value: string; // decimal string
  total_unrealized_pl: string; // decimal string
  total_unrealized_pl_percentage?: string | null; // decimal string
  calculation_timestamp: string; // date-time
  missing_price_data: string[];
} 