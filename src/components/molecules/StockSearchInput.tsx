import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce'; // Use alias path
import { searchStocks } from '@/services/stockService'; // Use alias path
import type { StockRead } from '@/types/stockTypes'; // Use alias path

interface StockSearchInputProps {
	// Callback to pass results (or loading/error info) to parent/dropdown
	onResultsChange: (results: StockRead[], isLoading: boolean, error: Error | null) => void;
	// Currently selected exchange filter (e.g., 'nse', 'bse', or null)
	exchangeFilter: string | null;
	// Optional: ClassName for styling the input container
	className?: string;
}

const SEARCH_DEBOUNCE_DELAY = 3000; // 3 seconds delay (Requirement #3)
const MIN_QUERY_LENGTH = 3; // Requirement #1

/**
 * Molecule component for stock search input.
 * Handles debouncing, minimum query length, fetching search results, and exchange filter.
 */
const StockSearchInput: React.FC<StockSearchInputProps> = ({ 
	onResultsChange, 
	exchangeFilter, // Destructure the new prop
	className 
}) => {
	const [searchTerm, setSearchTerm] = useState('');
	const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_DELAY);

	// react-query hook to fetch search results
	const { 
		data: searchResults, 
		isLoading, 
		error, 
		isFetching, 
	} = useQuery<StockRead[], Error>({
		// Query key now includes the exchange filter
		queryKey: ['stockSearch', debouncedSearchTerm, exchangeFilter], 
		// Pass debounced term and exchange filter to the service function
		queryFn: () => searchStocks(debouncedSearchTerm, exchangeFilter), 
		// Enable only if term is long enough
		enabled: debouncedSearchTerm.trim().length >= MIN_QUERY_LENGTH, 
		staleTime: 1000 * 60 * 5, 
	});

	// Effect to call the callback when results or state change
	useEffect(() => {
		if (debouncedSearchTerm.trim().length >= MIN_QUERY_LENGTH) {
			onResultsChange(searchResults ?? [], isLoading || isFetching, error ?? null);
		} else {
			onResultsChange([], false, null);
		}
		// Add exchangeFilter to dependency array
	}, [searchResults, isLoading, isFetching, error, debouncedSearchTerm, exchangeFilter, onResultsChange]);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	return (
		<div className={`relative ${className ?? ''}`}>
			<Input
				type="search"
				placeholder="Search stocks (e.g., RELIANCE)..."
				value={searchTerm}
				onChange={handleInputChange}
				className="pr-8" // Add padding for the loader icon
			/>
			{/* Show loader inside input during fetch/debounce */}
			{(isLoading || isFetching) && searchTerm.trim().length >= MIN_QUERY_LENGTH && (
				<Loader2 className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
			)}
		</div>
	);
};

export default StockSearchInput; 