import React from "react";
import { PortfolioRead } from "@/types/portfolioTypes";
import ActionCardItem from "@/components/atoms/ActionCardItem"; // Import the new atom

interface PortfolioItemProps {
  portfolio: PortfolioRead;
  isSelected: boolean;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean; // Track delete state for this specific item
  onSetDefault: (id: string) => void; // New prop
  isSettingDefault: boolean; // New prop
}

const PortfolioItem: React.FC<PortfolioItemProps> = ({ 
  portfolio,
  isSelected,
  onClick,
  onDelete,
  isDeleting,
  onSetDefault,       // Destructure new props
  isSettingDefault    // Destructure new props
}) => {
  return (
    <ActionCardItem
      // Map PortfolioItemProps to ActionCardItemProps
      id={portfolio.id}
      title={portfolio.name}
      description={portfolio.description}
      isSelected={isSelected}
      isDefault={portfolio.is_default}
      onClick={onClick}
      onDelete={onDelete}
      onSetDefault={onSetDefault}
      isDeleting={isDeleting} // Pass through the deleting state
      isSettingDefault={isSettingDefault}
      defaultIndicatorTitle="Default Portfolio"
      deleteActionTitle="Delete portfolio"
      setDefaultActionTitle="Set as Default"
      // Can add heightClass prop if needed, defaults to h-32
    />
  );
};

export default PortfolioItem; 