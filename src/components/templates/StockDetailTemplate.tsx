import React from 'react';
import { StockRead } from '@/types/stockTypes';
import StockHeaderMolecule from '@/components/molecules/StockHeaderMolecule';
import StockKeyStatsMolecule from '@/components/molecules/StockKeyStatsMolecule';
import StockDescriptionAtom from '@/components/atoms/StockDescriptionAtom';
import StockManagementMolecule from '@/components/molecules/StockManagementMolecule';
import StockAddressesMolecule from '@/components/molecules/StockAddressesMolecule';
import StockNewsOrganism from '@/components/organisms/StockNewsOrganism';
import StockChartOrganism from '@/components/organisms/StockChartOrganism';
import { Skeleton } from '@/components/ui/skeleton';
import OrderBox from '@/components/organisms/OrderBox';
// import OrderBox from '@/components/organisms/OrderBox/OrderBox'; // Removed import
// Import other potential organisms like Chart, News etc. when created

interface StockDetailTemplateProps {
  stockData: StockRead | null | undefined;
  isLoading: boolean;
}

const StockDetailTemplate: React.FC<StockDetailTemplateProps> = ({ stockData, isLoading }) => {
  // Determine if there's any management or address data to display (or if loading)
  const showExtraInfoRow = isLoading || !!stockData?.management || !!stockData?.addresses;
  const exchange = stockData?.exchange;
  const symbol = stockData?.symbol;

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      {/* Header Section */}
      <StockHeaderMolecule stock={stockData} isLoading={isLoading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column (Chart/Main Info) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Chart - Render only if exchange and symbol are available */}
          {exchange && symbol ? (
            <StockChartOrganism exchange={exchange} symbol={symbol} />
          ) : isLoading ? (
            // Show a skeleton matching chart height while main data is loading
            <Skeleton className="h-64 lg:h-96 w-full" />
          ) : null}

          {/* Description Section */}
          <div>
            <h2 className="text-xl font-semibold mb-3">About {stockData?.name ?? 'Stock'}</h2>
            <StockDescriptionAtom description={stockData?.description} isLoading={isLoading} />
          </div>
          
          {/* Grid for Management and Addresses */}
          {showExtraInfoRow && ( // Only render the grid row if there might be content
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Management Section - Conditionally render within the grid */}
              {(isLoading || stockData?.management) && (
                <StockManagementMolecule managementJson={stockData?.management} isLoading={isLoading} />
              )}
              {/* Addresses Section - Conditionally render within the grid */}
              {(isLoading || stockData?.addresses) && (
                <StockAddressesMolecule addressesJson={stockData?.addresses} isLoading={isLoading} />
              )}
            </div>
          )}

        </div>

        {/* Right Column (Stats, Order Box, News) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Key Stats */}
          <StockKeyStatsMolecule stockInfo={stockData?.stock_info} isLoading={isLoading} />

          {/* --- Order Box --- */}
           {/* Render OrderBox only if we have symbol and exchange and not loading */}
           {/* Pass required props */} 
           {symbol && exchange && !isLoading ? (
             <OrderBox stockSymbol={symbol} stockExchange={exchange} />
           ) : isLoading ? (
             // Show a skeleton while loading
             <Skeleton className="h-96 w-full" /> // Adjust height as needed
           ) : null }

           {/* Related News Section */}
           {/* Render only if exchange and symbol are available */}
           {exchange && symbol && (
             <StockNewsOrganism exchange={exchange} symbol={symbol} />
           )}
        </div>
      </div>
    </div>
  );
};

export default StockDetailTemplate; 