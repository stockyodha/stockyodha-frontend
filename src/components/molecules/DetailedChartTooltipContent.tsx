import { formatCurrency } from '@/lib/utils';
import { ChartTooltipContent } from "@/components/ui/chart"; // Use Shadcn's wrapper for consistent styling

// Helper to format volume (copied from StockChartOrganism for standalone use if needed, or import)
const formatVolume = (vol: number | null | undefined): string => {
  if (vol === null || vol === undefined) return 'N/A';
  if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(2)}B`;
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(2)}K`;
  return vol.toString();
};

/**
 * Custom Tooltip Content component to be used with Shadcn's ChartTooltip.
 * Renders OHLV + Volume data in a structured grid.
 */
const DetailedChartTooltipContent = (props: any) => { // Use any for props initially, can refine later if needed
  const { active, payload, label } = props;

  if (active && payload && payload.length) {
    // Access the full data point from the payload
    const data = payload[0]?.payload;

    // Ensure data exists before trying to render
    if (!data) {
      return null;
    }

    return (
      // Use ChartTooltipContent as a base for styling consistency
      <ChartTooltipContent className="w-[180px] text-xs p-2" hideIndicator>
        <div className="grid gap-1">
          {/* Header: Display the label (time/date) */}
          <div className="mb-1 border-b pb-1">
            <span className="font-semibold text-foreground">{label}</span>
          </div>

          {/* OHLV Grid */}
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
      </ChartTooltipContent>
    );
  }

  return null;
};

export default DetailedChartTooltipContent; 