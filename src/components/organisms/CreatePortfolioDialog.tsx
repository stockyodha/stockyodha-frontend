import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPortfolio } from "@/services/portfolioService";
import { PortfolioCreate, PortfolioRead } from "@/types/portfolioTypes";
import CreatePortfolioForm from "@/components/molecules/CreatePortfolioForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { HTTPValidationError } from "@/types/api"; // Assuming this type exists for API errors

interface CreatePortfolioDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

// Type for form values, should match CreatePortfolioForm's schema
type PortfolioFormValues = {
    name: string;
    description?: string;
};

const CreatePortfolioDialog: React.FC<CreatePortfolioDialogProps> = ({ isOpen, onOpenChange }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<PortfolioRead, AxiosError<HTTPValidationError>, PortfolioCreate>({
    mutationFn: createPortfolio,
    onSuccess: (data) => {
      toast.success(`Portfolio "${data.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["portfolios"] }); // Invalidate portfolio list query
      onOpenChange(false); // Close dialog on success
    },
    onError: (error) => {
      console.error("Failed to create portfolio:", error);
      const errorMsg = error.response?.data?.detail 
                        ? JSON.stringify(error.response.data.detail)
                        : "Failed to create portfolio. Please try again.";
      toast.error(errorMsg);
    },
  });

  const handleFormSubmit = (formData: PortfolioFormValues) => {
    // Construct the data according to PortfolioCreate type
    const portfolioData: PortfolioCreate = {
      name: formData.name,
      description: formData.description || null, // Send null if description is empty
    };
    mutation.mutate(portfolioData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Portfolio</DialogTitle>
          <DialogDescription>
Enter a name and optional description for your new portfolio.
          </DialogDescription>
        </DialogHeader>
        <CreatePortfolioForm 
          onSubmit={handleFormSubmit} 
          isSubmitting={mutation.isPending} 
          onCancel={() => onOpenChange(false)} // Add cancel button functionality
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreatePortfolioDialog; 