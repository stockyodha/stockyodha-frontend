import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, AlertTriangle } from "lucide-react";
import CreatePortfolioDialog from "@/components/organisms/CreatePortfolioDialog";
import { getPortfolios, deletePortfolio, setDefaultPortfolio } from "@/services/portfolioService";
import { PortfolioRead } from "@/types/portfolioTypes";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PortfolioItem from "@/components/molecules/PortfolioItem";
import PortfolioHoldingsDetail from "@/components/organisms/PortfolioHoldingsDetail";

const PortfoliosTemplate: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [portfolioIdToDelete, setPortfolioIdToDelete] = useState<string | null>(null);

  // Fetch portfolios
  const { data: portfolios, isLoading, isError: isFetchError, refetch } = useQuery<PortfolioRead[], Error>({
    queryKey: ["portfolios"],
    queryFn: () => getPortfolios(0, 50), // Fetch first 50 portfolios
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Select the default portfolio first, then the first one if no default
  useEffect(() => {
    if (portfolios && !selectedPortfolioId) {
      const defaultPortfolio = portfolios.find(p => p.is_default);
      if (defaultPortfolio) {
        setSelectedPortfolioId(defaultPortfolio.id);
      } else if (portfolios.length > 0) {
        setSelectedPortfolioId(portfolios[0].id);
      }
    }
    // If the selected portfolio is deleted/no longer exists, select the default/first one again
    if (portfolios && selectedPortfolioId && !portfolios.some(p => p.id === selectedPortfolioId)) {
       const defaultPortfolio = portfolios.find(p => p.is_default);
       setSelectedPortfolioId(defaultPortfolio?.id || (portfolios.length > 0 ? portfolios[0].id : null));
    }
  }, [portfolios, selectedPortfolioId]);

  // --- Set Default Mutation --- 
  const setDefaultMutation = useMutation<PortfolioRead, AxiosError<any>, string>({
    mutationFn: setDefaultPortfolio,
    onSuccess: (updatedPortfolio) => {
      toast.success(`Portfolio "${updatedPortfolio.name}" set as default.`);
      // Update query cache: set the new default and unset the old one
      queryClient.setQueryData<PortfolioRead[]>(["portfolios"], (oldData) => {
        if (!oldData) return [];
        return oldData.map(portfolio => ({
          ...portfolio,
          is_default: portfolio.id === updatedPortfolio.id
        }));
      });
      // Ensure the newly set default portfolio is selected
      setSelectedPortfolioId(updatedPortfolio.id);
    },
    onError: (error) => {
      console.error("Failed to set default portfolio:", error);
      toast.error("Failed to set portfolio as default. Please try again.");
    },
  });

  // Delete portfolio mutation
  const deleteMutation = useMutation<void, AxiosError<any>, string>({
    mutationFn: deletePortfolio,
    onSuccess: () => {
      toast.success("Portfolio deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["portfolios"] }); 
      setIsDeleteDialogOpen(false);
      setPortfolioIdToDelete(null);
      // Selection reset is handled by useEffect now
    },
    onError: (error) => {
      console.error("Failed to delete portfolio:", error);
      const errorMsg = error.response?.data?.detail || "Failed to delete portfolio. It might not be empty or it might be the default.";
      toast.error(errorMsg);
      setIsDeleteDialogOpen(false);
      setPortfolioIdToDelete(null);
    },
  });

  const handleSelectPortfolio = (id: string) => {
    setSelectedPortfolioId(id);
  };

  const handleDeleteClick = (id: string) => {
    const portfolio = portfolios?.find(p => p.id === id);
    // Optional: Add extra frontend check/warning before opening dialog
    if (portfolio?.is_default) {
        toast.warning("Cannot delete the default portfolio. Set another portfolio as default first.");
        return; // Prevent opening delete dialog for default
    }
    setPortfolioIdToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSetDefaultClick = (id: string) => {
    setDefaultMutation.mutate(id);
  };

  const confirmDelete = () => {
    if (portfolioIdToDelete) {
      // Refetch portfolio data before confirming deletion to double check is_default status? Or rely on backend.
      // Relying on backend for now.
      deleteMutation.mutate(portfolioIdToDelete);
    }
  };

  const portfolioToDelete = portfolios?.find(p => p.id === portfolioIdToDelete);
  const portfolioNameToDelete = portfolioToDelete?.name;

  // --- Loading State --- 
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-theme(space.14))] ">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // --- Error State --- 
  if (isFetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-theme(space.14))] text-destructive">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="text-xl mb-2">Could not load portfolios.</p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  // --- Main Content --- 
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Portfolios</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Portfolio
        </Button>
      </div>

      {/* Portfolio List Carousel */}
      {portfolios && portfolios.length > 0 ? (
        <div>
          <Carousel 
            opts={{ 
              align: "start", 
              loop: portfolios.length > 4, // Adjust looping based on count
              slidesToScroll: "auto" 
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {/* Sort portfolios to show default first? Optional, selection handles priority */}
              {portfolios.map((portfolio) => (
                <CarouselItem 
                  key={portfolio.id} 
                  className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <PortfolioItem
                    portfolio={portfolio}
                    isSelected={selectedPortfolioId === portfolio.id}
                    onClick={handleSelectPortfolio}
                    onDelete={handleDeleteClick}
                    isDeleting={deleteMutation.isPending && deleteMutation.variables === portfolio.id}
                    onSetDefault={handleSetDefaultClick}
                    isSettingDefault={setDefaultMutation.isPending && setDefaultMutation.variables === portfolio.id}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {portfolios.length > 4 && (
                <>
                    <CarouselPrevious className="absolute left-[-15px] top-1/2 -translate-y-1/2 hidden sm:flex" />
                    <CarouselNext className="absolute right-[-15px] top-1/2 -translate-y-1/2 hidden sm:flex" />
                </>
            )}
          </Carousel>
        </div>
      ) : (
         // --- Empty State for Portfolio List --- 
        <div className="text-center py-10 border rounded-lg">
            <p className="text-muted-foreground mb-4">You haven't created any portfolios yet.</p>
             <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Portfolio
            </Button>
        </div>
      )}

      {/* Portfolio Holdings Detail Section */}
       <div className="mt-6">
          {selectedPortfolioId ? (
            <PortfolioHoldingsDetail portfolioId={selectedPortfolioId} />
          ) : (
             !isLoading && portfolios && portfolios.length > 0 && 
             <p className="text-center text-muted-foreground pt-10">Select a portfolio above to see its holdings.</p>
          )}
        </div>

      {/* Create Portfolio Dialog */}
      <CreatePortfolioDialog 
        isOpen={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              portfolio "<span className="font-semibold">{portfolioNameToDelete || 'this portfolio'}</span>".
              <br/> 
              <span className="text-destructive font-medium">Note:</span> You can only delete empty portfolios, and you cannot delete your default portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPortfolioIdToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PortfoliosTemplate; 