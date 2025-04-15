import React from 'react';
import { StockRead } from '@/types/stockTypes';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, getChangeColor } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface StockHeaderMoleculeProps {
  stock: StockRead | null | undefined;
  isLoading: boolean;
}

const StockHeaderMolecule: React.FC<StockHeaderMoleculeProps> = ({ stock, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mb-6 animate-pulse">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-3" />
        <div className="flex items-baseline space-x-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    );
  }

  if (!stock || !stock.stock_info) {
    return (
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Data Unavailable</h1>
        <p className="text-muted-foreground">Could not load header information.</p>
      </div>
    );
  }

  const { name, symbol, exchange, stock_info } = stock;
  const price = stock_info.current_price;
  const change = stock_info.price_change;
  const changePercent = stock_info.price_percent_change;
  const changeColor = getChangeColor(Number(change));
  const isPositive = Number(change) >= 0;

  return (
    <div className="mb-6 border-b pb-4">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl mb-1">
        {name} 
        <Badge variant="outline" className="ml-2 text-sm align-middle">
          {exchange.toUpperCase()}:{symbol.toUpperCase()}
        </Badge>
      </h1>
      {/* ISIN can be added if needed: <p className="text-xs text-muted-foreground">ISIN: {stock.isinid || 'N/A'}</p> */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-2">
        <span className="text-3xl font-semibold tracking-tight">{formatCurrency(price)}</span>
        <span className={`text-lg font-medium ${changeColor}`}>
          {isPositive && price !== null ? '+' : ''}{formatCurrency(change)}
        </span>
        <span className={`text-lg font-medium ${changeColor}`}>
          ({isPositive && price !== null ? '+' : ''}{changePercent ?? '0.00'}%)
        </span>
      </div>
       <p className="text-xs text-muted-foreground mt-1">
         Last updated: {stock_info.last_price_update_at ? new Date(stock_info.last_price_update_at).toLocaleString() : 'N/A'}
       </p>
    </div>
  );
};

export default StockHeaderMolecule; 