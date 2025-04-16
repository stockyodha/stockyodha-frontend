import React from "react";
import { WatchlistRead } from "@/types/watchlistTypes";
import ActionCardItem from "@/components/atoms/ActionCardItem";

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
  isSettingDefault,
}) => {
  return (
    <ActionCardItem
      id={watchlist.id}
      title={watchlist.name}
      isSelected={isSelected}
      isDefault={watchlist.is_default}
      onClick={onClick}
      onDelete={onDelete}
      onSetDefault={onSetDefault}
      isDeleting={false}
      isSettingDefault={isSettingDefault}
      defaultIndicatorTitle="Default Watchlist"
      deleteActionTitle="Delete watchlist"
      setDefaultActionTitle="Set as Default"
    />
  );
};

export default WatchlistItem; 