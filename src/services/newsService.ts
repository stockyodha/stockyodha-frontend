import apiClient from '../config/api';
// Assuming types are manually created in src/types/newsTypes.ts
import type { NewsReadWithAgo } from '../types/newsTypes';

const THREE_HOURS_IN_SECONDS = 3 * 60 * 60;

/**
 * Fetches recent news articles published globally within the last specified duration.
 * Defaults to the last 3 hours.
 * Corresponds to FR_News.1 in PRD.md
 *
 * @param lastSeconds The number of seconds to look back for news articles.
 * @param limit Maximum number of news items to return.
 * @returns A promise that resolves to an array of recent news articles with 'ago' timestamps.
 */
export const getRecentNews = async (
	lastSeconds: number = THREE_HOURS_IN_SECONDS,
	limit: number = 5, // Fetch a small number for the dashboard card
): Promise<NewsReadWithAgo[]> => {
	try {
		// Use apiClient.get (assuming Axios-like client)
		const response = await apiClient.get<NewsReadWithAgo[]>(
			'/news/recent',
			{
				// Pass parameters in 'params' field for GET requests with Axios
				params: {
					last_seconds: lastSeconds,
					limit: limit,
				},
			},
		);

		// Handle response based on Axios structure
		return response.data || [];
	} catch (error) {
		console.error('Network or unexpected error fetching recent news:', error);
		// Re-throw the error so the calling component (e.g., react-query) can handle it
		throw error;
	}
}; 