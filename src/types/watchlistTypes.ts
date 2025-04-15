import { StockRead } from './stockTypes'; // Import the full StockRead type

// Based on openapi.json definitions

export interface WatchlistRead {
  name: string;
  user_id: string; // UUID
  id: string; // UUID
  created_at: string; // ISO DateTime string
  updated_at: string | null; // ISO DateTime string or null
  is_default: boolean;
}

export interface WatchlistCreate {
  name: string;
  user_id: string; // Added user_id as required by API
}

export interface WatchlistUpdate {
  name?: string | null;
}

export interface StockIdentifier {
  exchange: string;
  symbol: string;
}

export interface WatchlistStockRead {
  stock_symbol: string;
  stock_exchange: string;
  added_at: string; // ISO DateTime string
  stock?: StockRead | null; // Use the imported StockRead type here
} 