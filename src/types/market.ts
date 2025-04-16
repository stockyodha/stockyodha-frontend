// src/types/market.ts

export interface CompanyData {
  isin: string | null;
  company_name: string;
  search_id: string | null;
  bse_script_code: string | null;
  nse_script_code: string | null;
  company_short_name: string | null;
  logo_url: string | null;
  market_cap: number | null;
  equity_type: string | null;
  groww_contract_id: string | null;
}

export interface StatsData {
  ltp: number;
  close: number | null;
  day_change: number | null;
  day_change_perc: number | null;
  high: number | null;
  low: number | null;
  year_high_price: number | null;
  year_low_price: number | null;
  lpr: number | null;
  upr: number | null;
}

export interface TrendItem {
  gsin: string | null;
  company: CompanyData;
  stats: StatsData;
}

export type TrendType = "TOP_GAINERS" | "TOP_LOSERS";

// Add the MarketIndex type based on openapi.json
export type MarketIndex = 
  | "SYNIFTY100"
  | "SYNIFSMCP100"
  | "SYNIFMDCP100"
  | "SYNIFTY500";

// Based on openapi.json /components/schemas/MarketStatusResponse
export interface MarketStatusResponse {
  status: 'OPEN' | 'CLOSED' | 'UNKNOWN';
  open_time_ist?: string | null; // HH:MM:SS format
  close_time_ist?: string | null; // HH:MM:SS format
  current_time_ist?: string | null; // HH:MM:SS format
  error?: string | null;
} 