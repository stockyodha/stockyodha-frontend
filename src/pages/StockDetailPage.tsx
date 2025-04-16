import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStockDetails } from '@/services/stockService';
import { AlertTriangle } from 'lucide-react';
import StockDetailTemplate from '@/components/templates/StockDetailTemplate';

const StockDetailPage: React.FC = () => {
  // 1. Read exchange and symbol from URL
  const { exchange, symbol } = useParams<{ exchange: string; symbol: string }>();

  // 2. Query backend for stock information
  const { 
    data: stockData, 
    isLoading,
    isError  } = useQuery({
    // Ensure queryKey is unique and includes parameters
    queryKey: ['stockDetails', exchange, symbol],
    queryFn: () => {
      if (!exchange || !symbol) {
        // Should not happen if route matching works, but good practice
        return Promise.reject(new Error('Exchange or Symbol missing'));
      }
      return getStockDetails(exchange, symbol);
    },
    enabled: !!exchange && !!symbol, // Only run query if params exist
    staleTime: 1000 * 30, // Shorten staleTime for potentially volatile stock data
    refetchInterval: 1000 * 60, // Refetch every minute
    retry: 1, // Retry once on error
  });

  // --- Render Logic --- 

  if (isError) {
    // Optional: Log full error for debugging
    // console.error("Stock Detail Fetch Error:", error);
    return (
       <div className="container mx-auto px-4 py-10 flex flex-col items-center justify-center h-[calc(100vh-200px)] text-destructive">
         <AlertTriangle className="h-16 w-16 mb-4" />
         <h2 className="text-xl font-semibold mb-2">Error Loading Stock Data</h2>
         <p className="text-center max-w-md">
           Could not fetch details for {symbol?.toUpperCase()} on {exchange?.toUpperCase()}.
           Please check the symbol and exchange or try again later.
         </p>
       </div>
     );
  }

  if (!stockData) {
    // This case might occur if the query is disabled or returns no data without error
    return <p className="text-center text-muted-foreground mt-10">Stock data not available.</p>;
  }

  // Render the template, passing loading state and data
  // The template itself handles displaying skeletons or data unavailable messages
  return (
    <StockDetailTemplate stockData={stockData} isLoading={isLoading} />
  );
};

export default StockDetailPage; 