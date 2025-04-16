// Based on #/components/schemas/OrderType
export type OrderType = 'MARKET' | 'LIMIT';

// Based on #/components/schemas/TransactionType
export type TransactionType = 'BUY' | 'SELL';

// Based on #/components/schemas/OrderStatus
export type OrderStatus = 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'FAILED';

// Based on #/components/schemas/OrderCreate
export interface OrderCreate {
  portfolio_id: string; // UUID
  stock_symbol: string;
  stock_exchange: string;
  order_type: OrderType;
  transaction_type: TransactionType;
  quantity: number;
  limit_price?: number | string | null; // Allow number or string for input flexibility, backend handles parsing
}

// Based on #/components/schemas/OrderRead
export interface OrderRead {
  user_id: string; // UUID
  portfolio_id: string; // UUID
  stock_symbol: string;
  stock_exchange: string;
  order_type: OrderType;
  transaction_type: TransactionType;
  quantity: number;
  limit_price?: string | null; // API returns string
  status: OrderStatus;
  executed_price?: string | null; // API returns string
  executed_at?: string | null; // ISO DateTime string
  failure_reason?: string | null;
  funds_held?: string | null; // API returns string
  shares_held?: number | null;
  id: string; // UUID
  created_at: string; // ISO DateTime string
  updated_at?: string | null; // ISO DateTime string
}

// ... Add other order-related types (OrderRead, OrderCreate) as needed 