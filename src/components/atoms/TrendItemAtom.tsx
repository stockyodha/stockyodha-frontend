import React from 'react';
import { Link } from 'react-router-dom';
import { TrendItem } from '@/types/market';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency, formatPercentage, getChangeColor } from '@/lib/utils';

interface TrendItemAtomProps {
  item: TrendItem;
}

const TrendItemAtom: React.FC<TrendItemAtomProps> = ({ item }) => {
  const { company, stats } = item;
  const change = stats.day_change_perc ?? 0;
  const changeColor = getChangeColor(change);
  const isPositive = change >= 0;

  const exchange = company.nse_script_code ? 'nse' : company.bse_script_code ? 'bse' : null;
  const symbol = company.nse_script_code || company.bse_script_code;

  const linkUrl = exchange && symbol ? `/stocks/${exchange}/${symbol}` : undefined;

  const content = (
    <div className="flex items-center justify-between space-x-4 py-2 px-1 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors duration-150 ease-in-out cursor-pointer w-full">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <Avatar className="h-8 w-8">
          <AvatarImage src={company.logo_url || undefined} alt={company.company_name} />
          <AvatarFallback>{company.company_name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-none truncate" title={company.company_name}>
            {company.company_name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {symbol || company.company_short_name || 'N/A'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{formatCurrency(stats.ltp)}</p>
        <p className={`text-xs ${changeColor}`}>
          {isPositive ? '+' : ''}{formatPercentage(change / 100)}
        </p>
      </div>
    </div>
  );

  return linkUrl ? (
    <Link to={linkUrl} className="block">
      {content}
    </Link>
  ) : (
    content
  );
};

export default TrendItemAtom; 