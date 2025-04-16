import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWatchlistStocks, removeStockFromWatchlist } from '@/services/watchlistService';
import { WatchlistStockRead } from '@/types/watchlistTypes';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

interface WatchlistStocksDetailProps {
  watchlistId: string | null;
}

interface StockToRemove {
  exchange: string;
  symbol: string;
}

const WatchlistStocksDetail: React.FC<WatchlistStocksDetailProps> = ({ watchlistId }) => {
  const queryClient = useQueryClient();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [stockToRemove, setStockToRemove] = useState<StockToRemove | null>(null);

  const { data: stocks, isLoading, error, isError, refetch } = useQuery<
    WatchlistStockRead[],
    Error
  >({
    queryKey: ['watchlistStocks', watchlistId],
    queryFn: () => watchlistId ? getWatchlistStocks(watchlistId, 100) : Promise.resolve([]),
    enabled: !!watchlistId,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (watchlistId) {
      refetch();
    }
  }, [watchlistId, refetch]);

  const removeMutation = useMutation<void, Error, StockToRemove>({
    mutationFn: (stockToRemove) => {
      if (!watchlistId) throw new Error("Watchlist ID is missing");
      return removeStockFromWatchlist(watchlistId, stockToRemove.exchange, stockToRemove.symbol);
    },
    onSuccess: () => {
      toast.success(`Stock ${stockToRemove?.symbol} removed successfully!`);
      queryClient.invalidateQueries({ queryKey: ['watchlistStocks', watchlistId] });
      setIsRemoveDialogOpen(false);
      setStockToRemove(null);
    },
    onError: (error) => {
      console.error("Failed to remove stock:", error);
      toast.error("Failed to remove stock. Please try again.");
      setIsRemoveDialogOpen(false);
      setStockToRemove(null);
    }
  });

  const handleRemoveClick = (exchange: string, symbol: string) => {
    setStockToRemove({ exchange, symbol });
    setIsRemoveDialogOpen(true);
  };

  const confirmRemove = () => {
    if (stockToRemove) {
      removeMutation.mutate(stockToRemove);
    }
  };

  if (!watchlistId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60 border rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    console.error(`Error loading stocks for watchlist ${watchlistId}:`, error);
    return (
      <div className="flex flex-col items-center justify-center h-60 border rounded-lg text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>Could not load stocks for this watchlist.</p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  if (!stocks || stocks.length === 0) {
    return (
      <div className="text-center text-muted-foreground h-60 flex items-center justify-center border rounded-lg">
        <p>This watchlist is empty. Add stocks using the search bar.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Exchange</TableHead>
            <TableHead className="hidden sm:table-cell">Name</TableHead>
            <TableHead className="hidden sm:table-cell">Added</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.map((item) => (
            <TableRow key={`${item.stock_exchange}-${item.stock_symbol}`}>
              <TableCell className="font-medium">{item.stock_symbol}</TableCell>
              <TableCell>{item.stock_exchange.toUpperCase()}</TableCell>
              <TableCell className="hidden sm:table-cell">{item.stock?.name || 'N/A'}</TableCell>
              <TableCell className="hidden sm:table-cell">{new Date(item.added_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8" 
                  title="Remove stock"
                  onClick={() => handleRemoveClick(item.stock_exchange, item.stock_symbol)}
                  disabled={removeMutation.isPending && 
                            removeMutation.variables?.exchange === item.stock_exchange &&
                            removeMutation.variables?.symbol === item.stock_symbol}
                >
                   {removeMutation.isPending && 
                    removeMutation.variables?.exchange === item.stock_exchange &&
                    removeMutation.variables?.symbol === item.stock_symbol ? (
                     <Loader2 className="h-4 w-4 animate-spin" />
                   ) : (
                     <Trash2 className="h-4 w-4" />
                   )} 
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <span className="font-semibold">{stockToRemove?.symbol} ({stockToRemove?.exchange.toUpperCase()})</span> from this watchlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStockToRemove(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemove} 
              disabled={removeMutation.isPending} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WatchlistStocksDetail; 