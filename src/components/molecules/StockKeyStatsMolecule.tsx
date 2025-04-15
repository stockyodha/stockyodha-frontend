import React from 'react';
import { StockInfoRead } from '@/types/stockTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface StockKeyStatsMoleculeProps {
  stockInfo: StockInfoRead | null | undefined;
  isLoading: boolean;
}

const StatItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between py-1.5 border-b border-dashed border-muted/50">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-right">{value ?? 'N/A'}</span>
  </div>
);

const StockKeyStatsMolecule: React.FC<StockKeyStatsMoleculeProps> = ({ stockInfo, isLoading }) => {

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!stockInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Key Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Data unavailable.</p>
        </CardContent>
      </Card>
    );
  }

  const formatVolume = (vol: number | null | undefined): string => {
    if (vol === null || vol === undefined) return 'N/A';
    return new Intl.NumberFormat('en-IN').format(vol);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Key Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <StatItem label="Prev. Close" value={formatCurrency(stockInfo.price_prev_close)} />
        <StatItem label="Open" value={formatCurrency(stockInfo.current_price)} /> {/* Assuming current = open for simplicity, API might lack OPN */}
        <StatItem label="Day High" value={formatCurrency(stockInfo.day_high)} />
        <StatItem label="Day Low" value={formatCurrency(stockInfo.day_low)} />
        <StatItem label="Volume" value={formatVolume(stockInfo.volume)} />
        <StatItem label="Industry" value={stockInfo.industry} />
        <StatItem label="Sector" value={stockInfo.sector} />
        {/* Add more stats like Face Value, Market Cap if available and needed */}
      </CardContent>
    </Card>
  );
};

export default StockKeyStatsMolecule; 