import React, { useState, useEffect } from 'react';
import { marketService } from '@/services/marketService';
import { TrendItem, TrendType, MarketIndex } from '@/types/market';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TrendItemAtom from '@/components/atoms/TrendItemAtom';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Map internal index enum values to user-friendly names
const indexDisplayNames: Record<MarketIndex, string> = {
  SYNIFTY100: "NIFTY 100",
  SYNIFTY500: "NIFTY 500",
  SYNIFSMCP100: "NIFTY Smallcap 100",
  SYNIFMDCP100: "NIFTY Midcap 100",
};

interface MarketTrendsOrganismProps {
  initialTrendType?: TrendType;
  initialIndex?: MarketIndex;
  itemLimit?: number;
}

const MarketTrendsOrganism: React.FC<MarketTrendsOrganismProps> = ({ 
  initialTrendType = "TOP_GAINERS", 
  initialIndex = "SYNIFTY100",
  itemLimit = 6
}) => {
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<TrendType>(initialTrendType);
  const [selectedIndex, setSelectedIndex] = useState<MarketIndex>(initialIndex);

  useEffect(() => {
    const fetchTrends = async (type: TrendType, index: MarketIndex) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await marketService.getMarketTrends(type, itemLimit, index);
        setTrends(data);
      } catch (err) {
        console.error(`Error fetching ${type} for ${index}:`, err);
        setError(`Failed to load ${type === 'TOP_GAINERS' ? 'top gainers' : 'top losers'} for ${indexDisplayNames[index]}. Please try again later.`);
        setTrends([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends(selectedTab, selectedIndex);
  }, [selectedTab, selectedIndex, itemLimit]);

  const renderTrendList = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 mt-4">
          {[...Array(itemLimit)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <p className="text-red-600 text-sm mt-4">{error}</p>;
    }

    if (trends.length === 0 && !isLoading) {
      return <p className="text-muted-foreground text-sm mt-4">No {selectedTab === 'TOP_GAINERS' ? 'gainers' : 'losers'} data available for {indexDisplayNames[selectedIndex]} currently.</p>;
    }

    return (
      <div className="space-y-1 mt-2 -mx-1">
        {isLoading ? (
          [...Array(itemLimit)].map((_, index) => (
             <div key={index} className="flex items-center space-x-4 py-2 px-1">
               <Skeleton className="h-8 w-8 rounded-full" />
               <div className="space-y-2 flex-1">
                 <Skeleton className="h-4 w-3/4" />
                 <Skeleton className="h-3 w-1/2" />
               </div>
               <div className="space-y-2 text-right">
                 <Skeleton className="h-4 w-16" />
                 <Skeleton className="h-3 w-12" />
               </div>
             </div>
           ))
        ) : (
           trends.map((item, index) => (
             <TrendItemAtom key={`${item.company.nse_script_code || item.company.bse_script_code || index}-${selectedTab}-${selectedIndex}`} item={item} />
           ))
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
             <CardTitle className="text-lg">Market Trends</CardTitle>
             <CardDescription>Top movers in the {indexDisplayNames[selectedIndex]} index.</CardDescription>
          </div>
           <div className="w-full sm:w-auto min-w-[180px]">
             <Select value={selectedIndex} onValueChange={(value) => setSelectedIndex(value as MarketIndex)}>
               <SelectTrigger id="market-index" aria-label="Select Market Index">
                 <SelectValue placeholder="Select index" />
               </SelectTrigger>
               <SelectContent>
                 {(Object.keys(indexDisplayNames) as MarketIndex[]).map((indexKey) => (
                   <SelectItem key={indexKey} value={indexKey}>
                     {indexDisplayNames[indexKey]}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <Tabs value={selectedTab} onValueChange={(value: string) => setSelectedTab(value as TrendType)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="TOP_GAINERS">Top Gainers</TabsTrigger>
            <TabsTrigger value="TOP_LOSERS">Top Losers</TabsTrigger>
          </TabsList>
          <TabsContent value="TOP_GAINERS" key={`gainers-${selectedIndex}`}>
            {renderTrendList()}
          </TabsContent>
          <TabsContent value="TOP_LOSERS" key={`losers-${selectedIndex}`}>
            {renderTrendList()} 
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MarketTrendsOrganism; 