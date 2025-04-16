import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionCardItemProps {
  id: string;
  title: string;
  description?: string | null;
  isSelected: boolean;
  isDefault: boolean;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  isDeleting: boolean;
  isSettingDefault: boolean;
  defaultIndicatorTitle: string;
  deleteActionTitle: string;
  setDefaultActionTitle: string;
}

const ActionCardItem: React.FC<ActionCardItemProps> = ({
  id,
  title,
  description,
  isSelected,
  isDefault,
  onClick,
  onDelete,
  onSetDefault,
  isDeleting,
  isSettingDefault,
  defaultIndicatorTitle,
  deleteActionTitle,
  setDefaultActionTitle,
}) => {

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
      onClick={() => onClick(id)}
    >
      {/* Set Default Button (Top Right - only if not default) */}
      {!isDefault && (
        <Button 
          variant="ghost"
          size="icon"
          onClick={(e) => { handleActionClick(e); onSetDefault(id); }}
          disabled={isSettingDefault}
          title={setDefaultActionTitle}
          className="h-7 w-7 absolute top-1 right-1 z-10 hover:bg-primary/10"
        >
          {isSettingDefault ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
        </Button>
      )}

      {/* Delete Button (Top Left - only if not default) */}
      {!isDefault && (
        <Button 
          variant="ghost"
          size="icon"
          onClick={(e) => { handleActionClick(e); onDelete(id); }}
          title={deleteActionTitle}
          disabled={isDeleting}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 absolute top-1 left-1 z-10"
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      )}

      {/* Default Indicator (Top Right - only if default) */}
      {isDefault && (
        <div className="absolute top-1.5 right-1.5 z-10" title={defaultIndicatorTitle}>
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-400" />
        </div>
      )}
      
      {/* Content: Title Only */}
      <CardHeader className="flex flex-row items-start justify-between p-3 pt-8 flex-grow overflow-hidden">
        <div className="flex-grow overflow-hidden mr-2">
          <div className="flex items-center gap-1" title={title}>
            <CardTitle className="text-base font-medium leading-tight [
              overflow:hidden;
              display:-webkit-box;
              -webkit-box-orient:vertical;
              -webkit-line-clamp:3;
            ]">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default ActionCardItem; 