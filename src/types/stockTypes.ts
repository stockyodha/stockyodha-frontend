// Based on #/components/schemas/StockInfoRead
export interface StockInfoRead {
    mcid: string;
    industry?: string | null;
    sector?: string | null;
    face_value?: string | null; // Should be Decimal(10, 2)
    current_price?: string | null; // Decimal(18, 4)
    bid_price?: string | null; // Decimal(18, 4)
    offer_price?: string | null; // Decimal(18, 4)
    price_prev_close?: string | null; // Decimal(18, 4)
    price_change?: string | null; // Decimal(18, 4)
    price_percent_change?: string | null; // Decimal(10, 4)
    day_high?: string | null; // Decimal(18, 4)
    day_low?: string | null; // Decimal(18, 4)
    volume?: number | null; // bigint
    last_price_update_at?: string | null; // date-time string
    stock_symbol: string;
    stock_exchange: string;
    updated_at?: string | null; // date-time string
  }
  
// Based on #/components/schemas/StockRead
export interface StockRead {
    symbol: string;
    exchange: string;
    name: string;
    isinid?: string | null;
    description?: string | null;
    industry?: string | null;
    sentiment?: number | null;
    ids?: string | null;
    sector?: string | null;
    management?: string | null; // JSON string
    addresses?: string | null; // JSON string
    stock_info?: StockInfoRead | null;
    created_at: string; // date-time string
    updated_at?: string | null; // date-time string
}

// Based on updated API spec (string names)
export type HistoryResolution = 
  | "ONE_DAY"
  | "ONE_MONTH"
  | "THREE_MONTHS"
  | "SIX_MONTHS" // Needs mapping confirmation
  | "ONE_YEAR"
  | "FIVE_YEARS";

// Based on #/components/schemas/StockHistoryDataPoint
export interface StockHistoryDataPoint {
  t: number; // Unix timestamp (seconds)
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

// Add other stock-related types if needed (e.g., StockIdentifier) 