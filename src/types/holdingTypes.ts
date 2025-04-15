// Based on #/components/schemas/HoldingRead
export interface HoldingRead {
    portfolio_id: string; // uuid
    stock_symbol: string;
    stock_exchange: string;
    quantity: number;
    average_buy_price: string; // decimal string
  } 