import React from 'react';
import type { NewsReadWithAgo } from '@/types/newsTypes'; // Use alias path

interface NewsItemAtomProps {
	newsItem: NewsReadWithAgo;
}

/**
 * Atom component to display a single news item summary with image and description.
 */
const NewsItemAtom: React.FC<NewsItemAtomProps> = ({ newsItem }) => {
	return (
		<div className="flex items-start space-x-3 py-3 border-b last:border-b-0">
			{/* Optional Image */}
			{newsItem.image_url && (
				<img
					src={newsItem.image_url}
					alt={newsItem.title}
					// Added basic styling for the image
					className="h-16 w-24 object-cover rounded-sm flex-shrink-0"
					// Handle image loading errors gracefully (optional but recommended)
					onError={(e) => (e.currentTarget.style.display = 'none')} 
				/>
			)}
			{/* Text Content */}
			<div className="flex-grow min-w-0"> {/* Ensure text content can shrink */}
				<h4 className="text-sm font-medium leading-tight mb-1">
					{newsItem.url ? (
						<a
							href={newsItem.url}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:underline"
						>
							{newsItem.title}
						</a>
					) : (
						newsItem.title
					)}
				</h4>
				{/* Optional Description */}
				{newsItem.description && (
					<p className="text-xs text-muted-foreground leading-snug mb-1 line-clamp-2"> {/* Limit description lines */}
						{newsItem.description}
					</p>
				)}
				{/* Source and Time */}
				<p className="text-xs text-muted-foreground/80">
					{newsItem.source && <span>{newsItem.source} &bull; </span>}
					{newsItem.ago ?? 'Recently'}
				</p>
			</div>
		</div>
	);
};

export default NewsItemAtom; 