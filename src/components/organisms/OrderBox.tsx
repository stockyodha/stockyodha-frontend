import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner'; // Assuming sonner is used for toasts

// UI Components (adjust paths as needed)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react'; // For loading states

// Services
import { getPortfolios } from '@/services/portfolioService';
import { marketService } from '@/services/marketService';
import { placeOrder } from '@/services/orderService';

// Types
import { PortfolioRead } from '@/types/portfolioTypes';
import { OrderCreate, OrderRead } from '@/types/orderTypes';

// Store
import { useAuthStore } from '@/store/authStore';

// Utils (assuming formatCurrency exists)
import { formatCurrency } from '@/lib/utils';

interface OrderBoxProps {
  stockSymbol: string;
  stockExchange: string;
}

const OrderBox: React.FC<OrderBoxProps> = ({ stockSymbol, stockExchange }) => {
  const queryClient = useQueryClient();

  // State
  const [transactionType, setTransactionType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [limitPrice, setLimitPrice] = useState<string>('');

  // Store data
  const user = useAuthStore((state) => state.user);
  const availableFunds = user?.virtual_balance ?? '0'; // Handle potential null user

  // --- Data Fetching ---
  const { data: portfolios, isLoading: isLoadingPortfolios, error: portfoliosError } = useQuery<PortfolioRead[], Error>({
    queryKey: ['portfolios'],
    queryFn: () => getPortfolios(0, 100), // Fetch up to 100 portfolios
    staleTime: 1000 * 60 * 15, // Cache portfolios for 15 mins
    refetchOnWindowFocus: false,
  });

  const { data: marketStatus, isLoading: isLoadingMarketStatus, error: marketStatusError } = useQuery({
    queryKey: ['marketStatus'],
    queryFn: marketService.getMarketStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Consider data stale slightly before refetching
    refetchOnWindowFocus: true, // Refetch status more eagerly
  });

  // Set default portfolio if available and none selected
   useEffect(() => {
    if (portfolios && portfolios.length > 0 && !selectedPortfolioId) {
      const defaultPortfolio = portfolios.find(p => p.is_default);
      if (defaultPortfolio) {
        setSelectedPortfolioId(defaultPortfolio.id);
      } else {
         setSelectedPortfolioId(portfolios[0].id); // Select the first one if no default
      }
    }
  }, [portfolios, selectedPortfolioId]);


  // --- Mutation ---
  const placeOrderMutation = useMutation<OrderRead, Error, OrderCreate>({
    mutationFn: placeOrder,
    onSuccess: (data) => {
      toast.success(`Order ${data.status}! (ID: ${data.id.substring(0, 8)}...)`);
      // Reset form fields after successful submission
      setQuantity('');
      setLimitPrice('');
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] }); // Refetch user profile/balance
      queryClient.invalidateQueries({ queryKey: ['orders'] }); // Refetch orders list if displayed elsewhere
      queryClient.invalidateQueries({ queryKey: ['portfolioHoldings', selectedPortfolioId] }); // Refetch holdings for the portfolio
      queryClient.invalidateQueries({ queryKey: ['portfolioPerformance', selectedPortfolioId] }); // Refetch portfolio performance
    },
    onError: (error) => {
      // Extract specific error message if available from API response (assuming error handling in apiClient)
      let errorMsg = 'Failed to place order.';
      if (error && typeof error === 'object' && 'response' in error) {
          const responseError = error.response as any; // Type assertion might be needed based on apiClient setup
          if (responseError?.data?.detail) {
            errorMsg = responseError.data.detail;
          } else if (responseError?.data?.message) {
             errorMsg = responseError.data.message;
          }
      } else if (error instanceof Error) {
          errorMsg = error.message;
      }
      toast.error(`Order failed: ${errorMsg}`);
    },
  });

  // --- Derived State & Variables ---
  const isMarketOpen = marketStatus?.status === 'OPEN';
  const isSubmitting = placeOrderMutation.isPending;
  const submitButtonText = isSubmitting ? 'Placing Order...' : `Place ${transactionType} Order`;
  const isDataLoading = isLoadingPortfolios || isLoadingMarketStatus;

  // --- Handlers ---
  const handlePortfolioChange = (value: string) => {
    setSelectedPortfolioId(value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Validation
    if (!selectedPortfolioId) {
        toast.error("Please select a portfolio.");
        return;
    }
     const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        toast.error("Quantity must be a positive whole number.");
        return;
    }
    let parsedLimitPrice: number | undefined = undefined;
    if (orderType === 'LIMIT') {
        parsedLimitPrice = parseFloat(limitPrice);
        if (isNaN(parsedLimitPrice) || parsedLimitPrice <= 0) {
            toast.error("Limit price must be a positive number for limit orders.");
            return;
        }
    }
    // Check market status again just before submitting
    if (!isMarketOpen) {
        toast.error("Market is closed. Cannot place orders.");
        // Optionally refetch market status here if stale time is long
        queryClient.invalidateQueries({ queryKey: ['marketStatus'] });
        return;
    }


    const orderData: OrderCreate = {
        portfolio_id: selectedPortfolioId,
        stock_symbol: stockSymbol,
        stock_exchange: stockExchange,
        transaction_type: transactionType,
        order_type: orderType,
        quantity: parsedQuantity,
        limit_price: parsedLimitPrice,
    };

    placeOrderMutation.mutate(orderData);
  };

  // --- Render Logic ---
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Place Order</CardTitle>
        <CardDescription className={`font-semibold ${
            isMarketOpen ? 'text-green-600' :
            marketStatus?.status === 'CLOSED' ? 'text-red-600' :
            'text-yellow-600' // UNKNOWN or loading
          }`}>
          {isLoadingMarketStatus ? <Loader2 className="h-4 w-4 mr-1 animate-spin inline-block" /> : ''}
          Market Status: {marketStatus?.status ?? 'Loading...'}
          {marketStatus?.status !== 'UNKNOWN' && marketStatus?.open_time_ist && marketStatus?.close_time_ist &&
            ` (${marketStatus.open_time_ist} - ${marketStatus.close_time_ist} IST)`
          }
           {marketStatusError && <span className="text-destructive"> (Error fetching status)</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {portfoliosError ? (
            <div className='text-destructive text-center p-4'>Error loading portfolios. Cannot place orders.</div>
        ): (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Portfolio Select */}
          <div className="space-y-1">
            <Label htmlFor="portfolio">Portfolio</Label>
            <Select
                onValueChange={handlePortfolioChange}
                value={selectedPortfolioId}
                disabled={isLoadingPortfolios || isSubmitting}
            >
               <SelectTrigger id="portfolio" className="w-full">
                 <SelectValue placeholder="Select Portfolio..." />
               </SelectTrigger>
               <SelectContent>
                 {isLoadingPortfolios ? (
                   <div className="flex items-center justify-center p-2">
                     <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                   </div>
                 ) : portfolios && portfolios.length > 0 ? (
                   portfolios.map((p) => (
                     <SelectItem key={p.id} value={p.id}>
                       {p.name} {p.is_default ? '(Default)' : ''}
                     </SelectItem>
                   ))
                 ) : (
                   <SelectItem value="no-portfolio" disabled>No portfolios found</SelectItem>
                 )}
               </SelectContent>
            </Select>
          </div>

          {/* Buy/Sell Toggle */}
          <div className="grid grid-cols-2 gap-2">
             <Button
               type="button"
               variant={transactionType === 'BUY' ? 'default' : 'outline'}
               onClick={() => setTransactionType('BUY')}
               disabled={isSubmitting}
               className="w-full"
             >
               Buy
             </Button>
             <Button
                type="button"
                variant={transactionType === 'SELL' ? 'destructive' : 'outline'}
                onClick={() => setTransactionType('SELL')}
                disabled={isSubmitting}
                className="w-full"
             >
               Sell
             </Button>
          </div>


          {/* Market/Limit Toggle */}
           <div className="grid grid-cols-2 gap-2">
             <Button
               type="button"
               variant={orderType === 'MARKET' ? 'secondary' : 'outline'}
               onClick={() => {setOrderType('MARKET'); setLimitPrice('');}} // Clear limit price when switching to market
               disabled={isSubmitting}
               className="w-full"
             >
               Market
             </Button>
             <Button
                type="button"
                variant={orderType === 'LIMIT' ? 'secondary' : 'outline'}
                onClick={() => setOrderType('LIMIT')}
                disabled={isSubmitting}
                className="w-full"
             >
               Limit
             </Button>
          </div>


          {/* Quantity Input */}
          <div className="space-y-1">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Number of shares"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ''))} // Allow only positive integers
              min="1"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Limit Price Input (Conditional) */}
          {orderType === 'LIMIT' && (
            <div className="space-y-1">
              <Label htmlFor="limitPrice">Limit Price (₹)</Label>
              <Input
                id="limitPrice"
                type="number"
                placeholder="Price per share"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                step="0.01"
                min="0.01"
                required={orderType === 'LIMIT'}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Available Funds Display */}
           <div className="text-sm text-muted-foreground pt-2">
             Available Funds: {isLoadingPortfolios ? '...' : formatCurrency(availableFunds)}
             {/* TODO: Potentially show holdings of this stock if selling */}
           </div>

          {/* Submit Button */}
           <Button
             type="submit"
             className="w-full mt-4"
             disabled={!isMarketOpen || isSubmitting || isDataLoading || !selectedPortfolioId || portfoliosError != null || marketStatusError != null}
           >
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             {submitButtonText}
             {!isMarketOpen && !isLoadingMarketStatus && ' (Market Closed)'}
           </Button>
           {/* Display mutation error below button if needed */}
            {placeOrderMutation.isError && (
                 <p className="text-sm text-destructive text-center mt-2">
                     {placeOrderMutation.error instanceof Error ? placeOrderMutation.error.message : 'An unknown error occurred.'}
                 </p>
             )}
        </form>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderBox; 