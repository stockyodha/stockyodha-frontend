import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface StockDescriptionAtomProps {
  description: string | null | undefined;
  isLoading: boolean;
}

const StockDescriptionAtom: React.FC<StockDescriptionAtomProps> = ({ description, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!description) {
    return <p className="text-sm text-muted-foreground">No description available.</p>;
  }

  return (
    // Add prose for better text formatting if needed
    <p className="text-sm text-muted-foreground leading-relaxed">
      {description}
    </p>
  );
};

export default StockDescriptionAtom; 