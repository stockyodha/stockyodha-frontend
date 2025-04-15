// Based on #/components/schemas/TransactionType
export type TransactionType = "BUY" | "SELL";

// Based on #/components/schemas/OrderType
export type OrderType = "MARKET" | "LIMIT";

// Based on #/components/schemas/OrderStatus
export type OrderStatus = "PENDING" | "EXECUTED" | "CANCELLED" | "FAILED";

// ... Add other order-related types (OrderRead, OrderCreate) as needed 