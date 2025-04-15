import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStockHistory } from '@/services/stockService';
import { StockHistoryDataPoint, HistoryResolution } from '@/types/stockTypes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from "@/lib/utils";

interface StockChartOrganismProps {
  exchange: string;
  symbol: string;
}

// Map API resolution enum values to user-friendly labels and time ranges
const resolutionOptions: { value: HistoryResolution; label: string; days: number }[] = [
  // Map labels to the new string enum values
  { value: 'ONE_DAY', label: '1 Day', days: 1 },
  { value: 'ONE_MONTH', label: '1 Month', days: 30 },
  { value: 'THREE_MONTHS', label: '3 Months', days: 90 },
  { value: 'SIX_MONTHS', label: '6 Months', days: 180 },
  { value: 'ONE_YEAR', label: '1 Year', days: 365 }, 
  { value: 'FIVE_YEARS', label: '5 Years', days: 1825 },
  // Add more options like FIVE_YEARS if needed and confirmed by API
];
// Helper to get default resolution
const getDefaultResolution = (): HistoryResolution => 'ONE_DAY'; 

// Helper to format volume
const formatVolume = (vol: number | null | undefined): string => {
  if (vol === null || vol === undefined) return 'N/A';
  // Basic formatting, could use Intl.NumberFormat for better locale support
  if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(2)}B`;
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(2)}K`;
  return vol.toString();
};

// Define CustomTooltip component (same as before, doesn't use Shadcn context)
const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
        <p className="mb-1 font-medium">{label}</p> 
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <span className="text-muted-foreground">Open:</span>
          <span className="font-mono text-right font-medium">{data.o ? formatCurrency(data.o) : 'N/A'}</span>
          <span className="text-muted-foreground">High:</span>
          <span className="font-mono text-right font-medium">{data.h ? formatCurrency(data.h) : 'N/A'}</span>
          <span className="text-muted-foreground">Low:</span>
          <span className="font-mono text-right font-medium">{data.l ? formatCurrency(data.l) : 'N/A'}</span>
          <span className="text-muted-foreground">Close:</span>
          <span className="font-mono text-right font-medium">{data.price ? formatCurrency(data.price) : 'N/A'}</span> 
          <span className="text-muted-foreground">Volume:</span>
          <span className="font-mono text-right font-medium">{data.v ? formatVolume(data.v) : 'N/A'}</span>
        </div>
      </div>
    );
  }
  return null;
};

const StockChartOrganism: React.FC<StockChartOrganismProps> = ({ exchange, symbol }) => {
  // Use the new string enum type and default
  const [selectedResolution, setSelectedResolution] = useState<HistoryResolution>(getDefaultResolution());

  const timeRange = useMemo(() => {
    const selectedOption = resolutionOptions.find(opt => opt.value === selectedResolution);
    const days = selectedOption?.days || 365; // Default to 1 year if mapping fails
    const now = Math.floor(Date.now() / 1000);
    const from = now - (days * 24 * 60 * 60);
    return { from, to: now };
  }, [selectedResolution]);

  const { 
    data: historyData,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<StockHistoryDataPoint[], Error>({
    // Query key uses the new resolution value
    queryKey: ['stockHistory', exchange, symbol, selectedResolution, timeRange.from, timeRange.to],
    // Service function call is correct
    queryFn: () => getStockHistory(exchange, symbol, selectedResolution, timeRange.from, timeRange.to),
    enabled: !!exchange && !!symbol && exchange.toLowerCase() === 'nse',
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // Format data for Recharts - Include all needed fields
  const chartData = useMemo(() => {
    // Log the data just before mapping
    // console.log("Raw History Data:", historyData);
     const mappedData = historyData?.map(point => ({
       time: new Date(point.t * 1000).toLocaleString('en-IN', { 
         day: 'numeric', month: 'short', year: 'numeric', 
         hour: 'numeric', minute: '2-digit',
         hour12: true,
       }),
       o: point.o, h: point.h, l: point.l, price: point.c, v: point.v, 
       timestamp: point.t
     })) || [];
     // Log the mapped data
     console.log("Mapped Chart Data:", mappedData); 
     return mappedData;
  }, [historyData]);

  const renderChartContent = () => {
    if (exchange.toLowerCase() !== 'nse') {
      return <p className="text-sm text-muted-foreground p-4">Price history chart is currently only available for NSE stocks.</p>;
    }

    if (isLoading) {
      // Use Skeleton for initial loading
      return <Skeleton className="h-full w-full" />;
    }

    if (isError) {
      console.error(`Stock History fetch error for ${exchange}:${symbol}:`, error);
      return (
        <div className="flex flex-col items-center justify-center h-full text-destructive p-4">
           <AlertTriangle className="h-8 w-8 mb-2" />
           <p className="text-sm text-center">Could not load price history.</p>
        </div>
      );
    }

    if (!historyData || historyData.length === 0) {
      return <p className="text-sm text-muted-foreground p-4">No historical price data available for the selected range.</p>;
    }

    // DEBUG: Log chart data
    // console.log("Chart Data:", chartData);

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData} 
          margin={{ top: 5, right: 15, left: -10, bottom: 5 }}
        >
          <CartesianGrid vertical={false} className="stroke-border" strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tickMargin={8} 
            interval="preserveStartEnd" 
            className="stroke-muted-foreground" 
          />
          <YAxis 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tickMargin={8} 
            tickFormatter={(value) => `₹${value}`} 
            domain={['auto', 'auto']} 
            className="stroke-muted-foreground" 
          />
          
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: 'hsl(var(--foreground))', strokeDasharray: '3 3' }} 
            wrapperStyle={{ outline: 'none' }}
          />

          <Line
            dataKey="price"
            type="monotone"
            className="stroke-primary"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, className: "fill-primary stroke-primary" }}
            connectNulls={false}
          />
          <Line dataKey="o" strokeWidth={0} dot={false} activeDot={false} hide />
          <Line dataKey="h" strokeWidth={0} dot={false} activeDot={false} hide />
          <Line dataKey="l" strokeWidth={0} dot={false} activeDot={false} hide />
          <Line dataKey="v" strokeWidth={0} dot={false} activeDot={false} hide />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
            <CardTitle className="text-lg">Price History</CardTitle>
            <CardDescription>Closing price over time</CardDescription>
        </div>
        {/* Resolution Selector */}
        {exchange.toLowerCase() === 'nse' && (
          <div> 
            <Select value={selectedResolution} onValueChange={(value) => setSelectedResolution(value as HistoryResolution)}>
              <SelectTrigger id="resolution-select" aria-label="Select time range">
                  <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                  {/* Map over updated resolutionOptions */}
                  {resolutionOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent className="h-64 lg:h-96 p-0 relative"> {/* Set fixed height and remove padding */}
        {/* Add a subtle loading overlay */}
        {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )}
        {renderChartContent()}
      </CardContent>
    </Card>
  );
};

export default StockChartOrganism;