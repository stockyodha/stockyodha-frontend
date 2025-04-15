import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, Newspaper } from 'lucide-react';
import { getRecentNews } from '@/services/newsService'; // Use alias path
import NewsListMolecule from '../molecules/NewsListMolecule';

// Define query key for react-query
const RECENT_NEWS_QUERY_KEY = ['recentNews', { lastHours: 3 }];

/**
 * Organism component for displaying recent news in a card.
 * Fetches data using react-query and handles loading/error states.
 */
const NewsCardOrganism: React.FC = () => {
	const { data: newsItems, isLoading, error, isError } = useQuery({
		queryKey: RECENT_NEWS_QUERY_KEY,
		queryFn: () => getRecentNews(), // Uses default 3 hours, 5 items from service
		staleTime: 1000 * 60 * 5, // Cache for 5 minutes
		refetchInterval: 1000 * 60 * 15, // Refetch every 15 minutes
	});

	const renderContent = () => {
		if (isLoading) {
			return (
				<div className="flex justify-center items-center h-20">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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

		// Pass fetched data to the molecule
		return <NewsListMolecule newsItems={newsItems || []} />;
	};

	return (
		<Card className="lg:col-span-1 xl:col-span-2"> {/* Adjust span as needed */}
			<CardHeader className="pb-4">
				<CardDescription className="flex items-center gap-1">
					<Newspaper className="h-4 w-4" /> Recent News
				</CardDescription>
				<CardTitle className="text-lg">Latest Headlines</CardTitle>
			</CardHeader>
			<CardContent>
				{renderContent()}
			</CardContent>
			{/* Optional: Add a footer link to a dedicated news page */}
			{/* <CardFooter>
				<Button size="sm" variant="ghost" asChild>
					<Link to="/news">View All News</Link>
				</Button>
			</CardFooter> */}
		</Card>
	);
};

export default NewsCardOrganism; 