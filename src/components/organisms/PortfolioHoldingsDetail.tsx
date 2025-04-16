import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPortfolioHoldings } from '@/services/portfolioService';
import { HoldingRead } from '@/types/portfolioTypes';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PortfolioHoldingsDetailProps {
  portfolioId: string | null;
}

const PortfolioHoldingsDetail: React.FC<PortfolioHoldingsDetailProps> = ({ portfolioId }) => {

  const { data: holdings, isLoading, error, isError, refetch } = useQuery<
    HoldingRead[],
    Error
  >({
    queryKey: ['portfolioHoldings', portfolioId],
    // Only fetch if portfolioId is not null
    queryFn: () => portfolioId ? getPortfolioHoldings(portfolioId, 0, 100) : Promise.resolve([]),
    enabled: !!portfolioId,
    staleTime: 1000 * 60, // Cache for 1 minute
    refetchOnWindowFocus: true, // Refetch when window is focused
  });

  // Refetch when the selected portfolioId changes
  useEffect(() => {
    if (portfolioId) {
      refetch();
    }
  }, [portfolioId, refetch]);

  if (!portfolioId) {
    // Don't render anything if no portfolio is selected
    // The parent template will handle the message
    return null; 
  }

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
            <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    console.error(`Error loading holdings for portfolio ${portfolioId}:`, error);
    return (
      <Card className="mt-6 border-destructive">
        <CardHeader>
            <CardTitle className="text-destructive">Holdings Error</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-60 text-destructive">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p>Could not load holdings.</p>
          <Button onClick={() => refetch()} variant="destructive" size="sm" className="mt-2">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!holdings || holdings.length === 0) {
    return (
      <Card className="mt-6">
         <CardHeader>
            <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground h-60 flex items-center justify-center">
          <p>This portfolio has no holdings yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Helper function to format currency (replace with a more robust library if needed)
  const formatCurrency = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    return numberValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  };

  return (
    <Card className="mt-6">
       <CardHeader>
            <CardTitle>Holdings</CardTitle>
        </CardHeader>
      <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Exchange</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Avg. Buy Price</TableHead>
                {/* Add columns for current price/value later if needed */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding) => (
                <TableRow key={`${holding.stock_exchange}-${holding.stock_symbol}`}>
                  <TableCell className="font-medium">{holding.stock_symbol}</TableCell>
                  <TableCell>{holding.stock_exchange.toUpperCase()}</TableCell>
                  <TableCell className="text-right">{holding.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(holding.average_buy_price)}</TableCell>
                  {/* Add cells for current price/value later */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </CardContent>
    </Card>
  );
};

export default PortfolioHoldingsDetail; 