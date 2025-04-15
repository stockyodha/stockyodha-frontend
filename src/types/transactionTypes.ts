import { TransactionType } from './orderTypes'; // Assuming orderTypes exists/will exist

// Based on #/components/schemas/TransactionRead
export interface TransactionRead {
    id: string; // uuid
    order_id: string; // uuid
    user_id: string; // uuid
    portfolio_id: string; // uuid
    stock_symbol: string;
    stock_exchange: string;
    transaction_type: TransactionType;
    quantity: number;
    price_per_share: string; // decimal string
    total_amount: string; // decimal string
    transaction_time: string; // date-time
  } 