import React from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, PlusCircle } from 'lucide-react';
import type { StockRead } from '@/types/stockTypes';
import { Link } from 'react-router-dom';

interface StockSearchResultsDropdownProps {
	results: StockRead[];
	isLoading: boolean;
	error: Error | null;
	isVisible: boolean;
	onFilterChange: (filter: string | null) => void;
	currentFilter: string | null;
	onAddToWatchlist: (exchange: string, symbol: string) => void;
	addingStockId?: string | null;
	className?: string;
}

/**
 * Organism component to display stock search results with quick add button.
 */
const StockSearchResultsDropdown: React.FC<StockSearchResultsDropdownProps> = ({
	results,
	isLoading,
	error,
	isVisible,
	onFilterChange,
	currentFilter,
	onAddToWatchlist,
	addingStockId,
	className,
}) => {
	if (!isVisible) {
		return null;
	}

	const getButtonVariant = (filterValue: string): "secondary" | "ghost" => {
		return currentFilter === filterValue ? "secondary" : "ghost";
	};

	const renderContent = () => {
		if (isLoading) {
			return <p className="p-4 text-sm text-muted-foreground">Loading results...</p>;
		}

		if (error) {
			return (
				<div className="p-4 flex items-center text-sm text-destructive">
					<AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
					<span>Error loading results.</span>
				</div>
			);
		}

		if (results.length === 0 && !isLoading) {
			return (
				<div className="p-4 flex items-center text-sm text-muted-foreground">
					<Info className="h-4 w-4 mr-2 flex-shrink-0" />
					<span>No stocks found matching your query.</span>
				</div>
			);
		}

		// Display Results
		return (
			<ul className="max-h-60 overflow-y-auto px-1 pb-1">
				{results.map((stock) => {
					const stockId = `${stock.exchange}-${stock.symbol}`;
					const isAdding = addingStockId === stockId;
					
					return (
						<li key={stockId} className="flex items-center justify-between hover:bg-muted rounded-sm">
							<Link 
								to={`/stocks/${stock.exchange}/${stock.symbol}`} 
								className="flex-grow px-3 py-2 text-sm block truncate"
							>
								<span className="font-medium">{stock.symbol}</span>
								<span className="text-muted-foreground ml-2">({stock.exchange.toUpperCase()})</span>
								<p className="text-xs text-muted-foreground truncate">{stock.name}</p>
							</Link>
							<Button 
								variant="ghost" 
								size="icon" 
								className="h-7 w-7 mr-2 flex-shrink-0" 
								onClick={() => onAddToWatchlist(stock.exchange, stock.symbol)}
								disabled={isAdding}
								title="Add to watchlist"
							>
								{isAdding ? (
									<span className="h-4 w-4 animate-spin">⏳</span>
								) : (
									<PlusCircle className="h-4 w-4" />
								)}
								<span className="sr-only">Add to watchlist</span>
							</Button>
						</li>
					);
				})}
			</ul>
		);
	};

	return (
		<Card 
			className={`absolute z-50 mt-1 w-full bg-popover text-popover-foreground shadow-md rounded-md border ${className ?? ''}`} 
		>
			<CardHeader className="p-2 border-b">
				<div className="flex items-center justify-start space-x-1">
					<Button 
						variant={getButtonVariant('nse')} 
						size="sm"
						className="h-7 px-2 text-xs"
						onClick={() => onFilterChange('nse')}
					>
						NSE
					</Button>
					<Button 
						variant={getButtonVariant('bse')} 
						size="sm"
						className="h-7 px-2 text-xs"
						onClick={() => onFilterChange('bse')}
					>
						BSE
					</Button>
				</div>
			</CardHeader>
			{renderContent()}
		</Card>
	);
};

export default StockSearchResultsDropdown; 