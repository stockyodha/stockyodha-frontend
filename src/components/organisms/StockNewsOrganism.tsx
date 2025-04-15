import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStockNews } from '@/services/stockService';
import { NewsRead, NewsReadWithAgo } from '@/types/newsTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import NewsItemAtom from '@/components/atoms/NewsItemAtom';
import { AlertTriangle } from 'lucide-react';

interface StockNewsOrganismProps {
  exchange: string;
  symbol: string;
  limit?: number;
}

const StockNewsOrganism: React.FC<StockNewsOrganismProps> = ({ 
  exchange, 
  symbol,
  limit = 5 // Match default in service
}) => {

  const { 
    data: newsData, 
    isLoading,
    isError,
    error 
  } = useQuery<NewsRead[], Error>({
    queryKey: ['stockNews', exchange, symbol, limit],
    queryFn: () => getStockNews(exchange, symbol, limit),
    enabled: !!exchange && !!symbol,
    staleTime: 1000 * 60 * 15, // Cache news for 15 minutes
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex space-x-3">
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4 mt-1" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (isError) {
       console.error(`Stock News fetch error for ${exchange}:${symbol}:`, error);
       return (
         <div className="flex items-center text-sm text-destructive">
           <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
           <span>Failed to load news.</span>
         </div>
       );
    }

    if (!newsData || newsData.length === 0) {
      return <p className="text-sm text-muted-foreground">No recent news found for this stock.</p>;
    }

    return (
      <div className="space-y-4">
        {newsData.map((item) => (
          <NewsItemAtom key={item.id} newsItem={item as NewsReadWithAgo} />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Related News</CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default StockNewsOrganism; 