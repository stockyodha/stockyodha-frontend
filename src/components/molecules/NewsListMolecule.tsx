import React from 'react';
import type { NewsReadWithAgo } from '@/types/newsTypes'; // Use alias path
import NewsItemAtom from '../atoms/NewsItemAtom';

interface NewsListMoleculeProps {
	newsItems: NewsReadWithAgo[];
}

/**
 * Molecule component to display a list of news items.
 */
const NewsListMolecule: React.FC<NewsListMoleculeProps> = ({ newsItems }) => {
	if (!newsItems || newsItems.length === 0) {
		return <p className="text-sm text-muted-foreground">No recent news available.</p>;
	}

	return (
		<div>
			{newsItems.map((item) => (
				<NewsItemAtom key={item.id} newsItem={item} />
			))}
		</div>
	);
};

export default NewsListMolecule; 