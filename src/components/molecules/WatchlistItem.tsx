import React from "react";
import { WatchlistRead } from "@/types/watchlistTypes";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WatchlistItemProps {
  watchlist: WatchlistRead;
  isSelected: boolean;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  isSettingDefault: boolean;
}

const WatchlistItem: React.FC<WatchlistItemProps> = ({ 
  watchlist, 
  isSelected, 
  onClick, 
  onDelete, 
  onSetDefault,
  isSettingDefault
}) => {
  const isDefault = watchlist.is_default;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg flex flex-col h-32 relative overflow-hidden",
        isSelected 
          ? "border-2 border-primary"
          : "border border-border"
      )}
      onClick={() => onClick(watchlist.id)}
    >
      {!isDefault && (
        <Button 
          variant="ghost"
          size="icon"
          onClick={(e) => { handleActionClick(e); onSetDefault(watchlist.id); }}
          disabled={isSettingDefault}
          title="Set as Default"
          className="h-7 w-7 absolute top-1 right-1 z-10"
        >
          {isSettingDefault ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
        </Button>
      )}
      {!isDefault && (
        <Button 
          variant="ghost"
          size="icon"
          onClick={(e) => { handleActionClick(e); onDelete(watchlist.id); }}
          title="Delete watchlist"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 absolute top-1 left-1 z-10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      {isDefault && (
        <div className="absolute top-1.5 left-1.5 z-10" title="Default Watchlist">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-400" />
        </div>
      )}
      <CardHeader className="flex flex-row items-start justify-between p-3 pt-8 flex-grow overflow-hidden">
        <div className="flex-grow overflow-hidden mr-2">
          <div className="flex items-center gap-1" title={watchlist.name}>
            <CardTitle className="text-base font-medium leading-tight [
              overflow:hidden;
              display:-webkit-box;
              -webkit-box-orient:vertical;
              -webkit-line-clamp:3; /* Allow up to 3 lines */
            ]">
              {watchlist.name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default WatchlistItem; 