import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Moon, Sun, LogOut, Settings } from "lucide-react"
import { useTheme } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore";
import StockSearchInput from '@/components/molecules/StockSearchInput';
import StockSearchResultsDropdown from '@/components/organisms/StockSearchResultsDropdown';
import type { StockRead } from '@/types/stockTypes';
import { useMutation } from '@tanstack/react-query';
import { addStockToDefaultWatchlist } from '@/services/watchlistService';
import { toast } from 'sonner';

interface TopbarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Topbar({ className }: TopbarProps) {
  const { theme, setTheme } = useTheme()
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<StockRead[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<Error | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [exchangeFilter, setExchangeFilter] = useState<string | null>('nse');

  const { mutate: addToDefaultWatchlistMutation, isPending: isAddingToWatchlist, variables: addingVariables } = useMutation({
    mutationFn: addStockToDefaultWatchlist,
    onSuccess: (data) => {
      toast.success(`Added ${data.stock_symbol} to default watchlist!`);
    },
    onError: (error) => {
      toast.error("Error adding stock", {
        description: error.message || "Could not add stock to default watchlist.",
      });
    },
  });

  const handleAddToWatchlist = (exchange: string, symbol: string) => {
    if(isAddingToWatchlist) return;

    addToDefaultWatchlistMutation({ exchange, symbol });
  };

  const addingStockId = isAddingToWatchlist 
    ? `${addingVariables?.exchange}-${addingVariables?.symbol}` 
    : null;

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const handleLogout = () => {
    logout();
  };

  const handleResultsChange = useCallback(
    (results: StockRead[], loading: boolean, error: Error | null) => {
      setSearchResults(results);
      setIsLoadingSearch(loading);
      setSearchError(error);
      if (loading || error || results.length > 0) {
        setIsDropdownVisible(true);
      }
      const currentSearchTerm = (searchContainerRef.current?.querySelector('input[type="search"]') as HTMLInputElement)?.value || '';
      if (currentSearchTerm.trim().length < 3 && !loading && !error) {
         setIsDropdownVisible(false);
      }
    },
    []
  );

  const handleFocus = () => {
      const currentSearchTerm = (searchContainerRef.current?.querySelector('input[type="search"]') as HTMLInputElement)?.value || '';
      if (currentSearchTerm.trim().length >= 3 && (isLoadingSearch || searchError || searchResults.length > 0)) {
        setIsDropdownVisible(true);
      }
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
       setTimeout(() => setIsDropdownVisible(false), 150);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterChange = useCallback((filter: string | null) => {
    setExchangeFilter(filter);
  }, []);

  const handleNotifications = () => {
    console.log("Show notifications");
  }

  const handleSettings = () => {
    navigate('/settings');
  }

  const formatCurrency = (value: string | number | undefined | null) => {
    if (value === null || value === undefined) return 'N/A';
    const num = Number(value);
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  const userInitials = user?.first_name?.[0] || user?.username?.[0] || 'U';

  return (
    <header className={cn("sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6", className)}>
      <div 
        ref={searchContainerRef}
        className="relative flex-1 md:grow-0 md:flex-initial"
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <StockSearchInput 
          onResultsChange={handleResultsChange} 
          exchangeFilter={exchangeFilter}
          className="w-full md:w-[200px] lg:w-[320px]"
        />
        <StockSearchResultsDropdown
          results={searchResults}
          isLoading={isLoadingSearch}
          error={searchError}
          isVisible={isDropdownVisible}
          onFilterChange={handleFilterChange}
          currentFilter={exchangeFilter}
          onAddToWatchlist={handleAddToWatchlist}
          addingStockId={addingStockId}
          className="w-full top-full mt-1"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={handleNotifications}>
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{userInitials.toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
               <span className="text-xs text-muted-foreground mr-1">Balance:</span> {formatCurrency(user?.virtual_balance)}
            </DropdownMenuItem>
             <DropdownMenuItem disabled>
               <span className="text-xs text-muted-foreground mr-1">Held:</span> {formatCurrency(user?.funds_on_hold)}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSettings}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 