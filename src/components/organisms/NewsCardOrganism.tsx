import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, AlertTriangle, Newspaper, ChevronLeft, ChevronRight } from 'lucide-react';
import { getRecentNews } from '@/services/newsService';
import NewsListMolecule from '../molecules/NewsListMolecule';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";

// Define constants for default values and pagination
const DEFAULT_TIMEFRAME_SECONDS = 3 * 60 * 60; // 3 hours
const API_FETCH_LIMIT = 500; // Fetch up to API limit for client-side pagination
const ITEMS_PER_PAGE = 12; // How many items to show per page

interface NewsCardOrganismProps {
	timeframeSeconds?: number;
	// Limit prop is removed as we handle pagination internally
	className?: string; 
}

/**
 * Organism component for displaying recent news in a card.
 * Fetches data using react-query and handles loading/error states.
 * Configurable timeframe and limit.
 */
const NewsCardOrganism: React.FC<NewsCardOrganismProps> = ({ 
	timeframeSeconds = DEFAULT_TIMEFRAME_SECONDS, 
	className 
}) => {
	const [currentPage, setCurrentPage] = useState(1);

	// Query key uses timeframe, fetch limit is fixed for client-side pagination
	const recentNewsQueryKey = ['recentNews', { timeframeSeconds, limit: API_FETCH_LIMIT }];

	const { data: newsItems = [], isLoading, error, isError } = useQuery({
		queryKey: recentNewsQueryKey,
		queryFn: () => getRecentNews(timeframeSeconds, API_FETCH_LIMIT), // Fetch larger batch
		staleTime: 1000 * 60 * 5, 
		refetchInterval: 1000 * 60 * 15,
	});

	// Pagination Calculations
	const totalItems = newsItems.length;
	const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const currentItems = newsItems.slice(startIndex, endIndex);

	const handlePreviousPage = () => {
		setCurrentPage((prev) => Math.max(prev - 1, 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prev) => Math.min(prev + 1, totalPages));
	};

	const renderContent = () => {
		if (isLoading) {
			return (
				// Grid for skeleton layout
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{[...Array(ITEMS_PER_PAGE)].map((_, i) => ( // Skeletons based on ITEMS_PER_PAGE
						<Card key={i}>
							<CardHeader className="pb-3">
								<Skeleton className="h-5 w-3/4" />
								<Skeleton className="h-4 w-1/4 mt-2" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-5/6 mt-2" />
								<Skeleton className="h-4 w-4/6 mt-2" />
							</CardContent>
						</Card>
					))}
				</div>
			);
		}

		if (isError) {
			console.error('Error loading recent news:', error);
			return (
				<div className="flex flex-col items-center justify-center h-20 text-destructive">
					<AlertTriangle className="h-6 w-6 mb-1" />
					<p className="text-sm">Could not load news.</p>
				</div>
			);
		}
		
		if (totalItems === 0) {
			return <p className="text-sm text-muted-foreground text-center py-4">No recent news found.</p>;
		}

		// Pass only the items for the current page to the molecule
		return <NewsListMolecule newsItems={currentItems} />;
	};

	return (
		<Card className={className}> 
			<CardHeader className="pb-4">
				<CardDescription className="flex items-center gap-1">
					<Newspaper className="h-4 w-4" /> Recent News
				</CardDescription>
				<CardTitle className="text-lg">Latest Headlines</CardTitle>
			</CardHeader>
			<CardContent className="min-h-[200px]">
				{renderContent()}
			</CardContent>
			{/* Pagination Footer - only show if not loading, no error, and more than one page */}            
			{!isLoading && !isError && totalPages > 1 && (
				<CardFooter className="flex items-center justify-between border-t pt-4">
					<Button 
						variant="outline" 
						size="sm" 
						onClick={handlePreviousPage} 
						disabled={currentPage === 1}
					>
						<ChevronLeft className="h-4 w-4 mr-1" />
						Previous
					</Button>
					<span className="text-sm text-muted-foreground">
						Page {currentPage} of {totalPages}
					</span>
					<Button 
						variant="outline" 
						size="sm" 
						onClick={handleNextPage} 
						disabled={currentPage === totalPages}
					>
						Next
						<ChevronRight className="h-4 w-4 ml-1" />
					</Button>
				</CardFooter>
			)}
		</Card>
	);
};

export default NewsCardOrganism; 