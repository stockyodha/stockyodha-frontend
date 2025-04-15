import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DollarSign, TrendingUp, Newspaper, Eye, Loader2, AlertTriangle } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { getPortfolios, getPortfolioPerformance } from "@/services/portfolioService"
import { getWatchlists, getWatchlistStocks } from "@/services/watchlistService"
import { Link } from "react-router-dom"
import { formatCurrency, getChangeColor } from "@/lib/utils"
import NewsCardOrganism from "@/components/organisms/NewsCardOrganism"
import MarketTrendsOrganism from "@/components/organisms/MarketTrendsOrganism";
import type { StockRead } from "@/types/stockTypes"; // Ensure StockRead is imported if not already
import { WatchlistStockRead } from "@/types/watchlistTypes"; // Import the corrected type

export default function DashboardPage() {
  // Select user state directly
  const user = useAuthStore((state) => state.user);

  // --- Data Fetching --- 

  // Fetch first portfolio
  const { data: portfolios, isLoading: isLoadingPortfolios, error: portfolioError } = useQuery({
    queryKey: ['portfolios', { limit: 1 }],
    queryFn: () => getPortfolios(1),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
  const firstPortfolio = portfolios?.[0];

  // Fetch performance for the first portfolio (enabled only if portfolio exists)
  const { data: performance, isLoading: isLoadingPerformance, error: performanceError } = useQuery({
    queryKey: ['portfolioPerformance', firstPortfolio?.id],
    queryFn: () => getPortfolioPerformance(firstPortfolio!.id),
    enabled: !!firstPortfolio, // Only run if firstPortfolio is available
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  // Fetch first watchlist
  const { data: watchlists, isLoading: isLoadingWatchlists, error: watchlistError } = useQuery({
    queryKey: ['watchlists', { limit: 1 }],
    queryFn: () => getWatchlists(1),
    staleTime: 1000 * 60 * 5,
  });
  const firstWatchlist = watchlists?.[0];

  // Fetch stocks for the first watchlist
  // Use the corrected WatchlistStockRead[] type annotation
  const { data: watchlistStocks, isLoading: isLoadingWatchlistStocks, error: watchlistStocksError } = useQuery<
    WatchlistStockRead[], 
    Error
  >({
    queryKey: ['watchlistStocks', firstWatchlist?.id, { limit: 3 }],
    queryFn: () => getWatchlistStocks(firstWatchlist!.id, 3),
    enabled: !!firstWatchlist,
    staleTime: 1000 * 30, // Cache for 30 seconds
  });
  
  // --- Loading and Error States --- 
  const isLoading = isLoadingPortfolios || isLoadingPerformance || isLoadingWatchlists || isLoadingWatchlistStocks;
  const queryError = portfolioError || performanceError || watchlistError || watchlistStocksError;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
      {/* Balance/Earnings Card - Uses authStore data */}
      <Card className="lg:col-span-1 xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" /> Balance
          </CardDescription>
          {/* Use user data from store - Add Loading State */}
          {user ? (
            <CardTitle className="text-3xl">{formatCurrency(user.virtual_balance)}</CardTitle>
          ) : (
            <CardTitle className="text-3xl"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></CardTitle>
          )}
        </CardHeader>
        <CardContent>
          {/* P/L might need performance data or separate calculation */}
          {/* Add Loading State for Funds Held */}
          {user ? (
            <p className="text-xs text-muted-foreground mt-1">
              Available balance shown. Funds on hold: {formatCurrency(user.funds_on_hold)}
            </p>
           ) : (
             <p className="text-xs text-muted-foreground mt-1">Loading details...</p>
          )}
        </CardContent>
        {/* <CardFooter>
          <Button size="sm" asChild><Link to="/account">View Details</Link></Button> 
        </CardFooter> */}
      </Card>

      {/* Portfolio Card */}
      <Card className="lg:col-span-1 xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" /> Portfolio
          </CardDescription>
          <CardTitle className="text-lg truncate">{firstPortfolio?.name ?? 'No Portfolio Found'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingPerformance ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
          ) : performanceError ? (
            <p className="text-sm text-destructive">Error loading performance</p>
          ) : performance ? (
            <>
              <div className="text-2xl font-bold">{formatCurrency(performance.current_market_value)}</div>
              <p className={`text-xs font-semibold ${getChangeColor(Number(performance.total_unrealized_pl))}`}>
                 {formatCurrency(performance.total_unrealized_pl)} ({performance.total_unrealized_pl_percentage ?? '0.00'}%)
              </p>
            </>
          ) : firstPortfolio ? (
             <p className="text-sm text-muted-foreground">Performance data unavailable.</p>
          ) : (
           <p className="text-sm text-muted-foreground text-center pt-4">Create a portfolio to get started.</p>
          )}
        </CardContent>
        {/* Conditionally render Footer for CTA or Manage button */}
        {isLoadingPortfolios ? null : ( // Don't show footer while loading portfolio list
          <CardFooter className="flex justify-end"> {/* Align button right */}
            {firstPortfolio ? (
              <Button size="sm" asChild><Link to={`/portfolios/${firstPortfolio.id}`}>Manage Portfolio</Link></Button>
            ) : (
              // CTA Button with responsive width
              <Button size="sm" asChild className="w-full md:w-auto">
                <Link to="/portfolios">Create Portfolio</Link>
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      {/* Watchlist Card */}
      <Card className="lg:col-span-2 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-1">
            <Eye className="h-5 w-5"/> {firstWatchlist?.name ?? 'Watchlist'}
          </CardTitle>
          <CardDescription>Your tracked stocks.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {isLoadingWatchlistStocks || isLoadingWatchlists ? ( // Check both loaders
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
          ) : watchlistStocksError ? (
            <p className="text-sm text-destructive">Error loading watchlist stocks</p>
          ) : watchlistStocks && watchlistStocks.length > 0 ? (
            watchlistStocks.map((item) => (
              <div key={`${item.stock_exchange}-${item.stock_symbol}`} className="flex items-center justify-between">
                <div>
                   <p className="font-semibold">{item.stock?.name ?? item.stock_symbol} <Badge variant="outline" className="text-xs">{item.stock_exchange.toUpperCase()}</Badge></p>
                   <p className="text-sm text-muted-foreground">{formatCurrency(item.stock?.stock_info?.current_price)}</p>
                </div>
                <p className={`text-sm font-semibold ${getChangeColor(Number(item.stock?.stock_info?.price_change ?? 0))}`}>
                   {item.stock?.stock_info?.price_change ?? 'N/A'} ({item.stock?.stock_info?.price_percent_change ?? '0.00'}%)
                </p>
              </div>
            ))
          ) : firstWatchlist ? (
            <p className="text-sm text-muted-foreground text-center pt-4">Add stocks to start tracking.</p>
          ) : (
            <p className="text-sm text-muted-foreground text-center pt-4">Create a watchlist to track stocks.</p>
          )}
        </CardContent>
        {/* Conditionally render Footer for CTA or View button */}
        {isLoadingWatchlists ? null : ( // Don't show footer while loading watchlist list
          <CardFooter className="flex justify-end"> {/* Align button right */}
            {firstWatchlist ? (
              watchlistStocks && watchlistStocks.length > 0 ? (
                <Button size="sm" asChild><Link to={`/watchlists`}>View Watchlists</Link></Button>
              ) : (
                <Button size="sm" asChild className="w-full md:w-auto">
                  <Link to="/stocks">Add Stocks</Link>
                </Button>
              )
            ) : (
              <Button size="sm" asChild className="w-full md:w-auto">
                <Link to="/watchlists">Create Watchlist</Link>
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      {/* Market Trends Card - Spanning 2 columns on lg/xl */}
      <div className="lg:col-span-2 xl:col-span-2">
        <MarketTrendsOrganism />
      </div>

      {/* News Card - Spanning 2 columns on lg/xl */}
      <div className="lg:col-span-2 xl:col-span-2">
      <NewsCardOrganism />
      </div>

      {/* Optional: Display general loading/error state */}
      {/* {isLoading && <p>Loading dashboard data...</p>} */}
      {/* {queryError && <p className="text-destructive">Error loading dashboard data.</p>} */}
    </div>
  );
} 