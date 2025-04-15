import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWatchlist } from "@/services/watchlistService";
import CreateWatchlistForm from "@/components/molecules/CreateWatchlistForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { WatchlistCreate } from "@/types/watchlistTypes";
import { useAuthStore } from "@/store/authStore";

interface CreateWatchlistDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type WatchlistFormData = Omit<WatchlistCreate, 'user_id'>;

const CreateWatchlistDialog: React.FC<CreateWatchlistDialogProps> = ({ isOpen, onOpenChange }) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const mutation = useMutation({ 
    mutationFn: createWatchlist,
    onSuccess: (data) => {
      toast.success(`Watchlist "${data.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Failed to create watchlist:", error);
      toast.error("Failed to create watchlist. Please try again.");
    },
  });

  const handleFormSubmit = (formData: WatchlistFormData) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }
    mutation.mutate({ 
      name: formData.name,
      user_id: user.id 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Watchlist</DialogTitle>
          <DialogDescription>
Enter a name for your new watchlist.
          </DialogDescription>
        </DialogHeader>
        <CreateWatchlistForm 
          onSubmit={handleFormSubmit} 
          isSubmitting={mutation.isPending} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateWatchlistDialog; 