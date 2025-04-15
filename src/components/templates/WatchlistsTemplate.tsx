import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, AlertTriangle } from "lucide-react";
import CreateWatchlistDialog from "@/components/organisms/CreateWatchlistDialog";
import { getWatchlists, setDefaultWatchlist, deleteWatchlist } from "@/services/watchlistService";
import { WatchlistRead } from "@/types/watchlistTypes";
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
import WatchlistItem from "@/components/molecules/WatchlistItem";
import WatchlistStocksDetail from "@/components/organisms/WatchlistStocksDetail";

const WatchlistsTemplate: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [watchlistIdToDelete, setWatchlistIdToDelete] = useState<string | null>(null);

  const { data: watchlists, isLoading, isError: isFetchError, refetch } = useQuery<WatchlistRead[], Error>({
    queryKey: ["watchlists"],
    queryFn: () => getWatchlists(),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (watchlists && !selectedWatchlistId) {
      const defaultWatchlist = watchlists.find(w => w.is_default);
      if (defaultWatchlist) {
        setSelectedWatchlistId(defaultWatchlist.id);
      } else if (watchlists.length > 0) {
        setSelectedWatchlistId(watchlists[0].id);
      }
    }
  }, [watchlists, selectedWatchlistId]);

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultWatchlist,
    onSuccess: (updatedWatchlist) => {
      toast.success(`Watchlist "${updatedWatchlist.name}" set as default.`);
      
      queryClient.setQueryData<WatchlistRead[]>(["watchlists"], (oldData) => {
        if (!oldData) return [];
        return oldData.map(watchlist => ({
          ...watchlist,
          is_default: watchlist.id === updatedWatchlist.id
        }));
      });
      
      setSelectedWatchlistId(updatedWatchlist.id);
    },
    onError: (error) => {
      console.error("Failed to set default watchlist:", error);
      toast.error("Failed to set watchlist as default. Please try again.");
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteWatchlist,
    onSuccess: () => {
      toast.success("Watchlist deleted successfully!");
      if (watchlistIdToDelete === selectedWatchlistId) {
        const currentWatchlists = queryClient.getQueryData<WatchlistRead[]>(['watchlists']);
        const defaultWatchlist = currentWatchlists?.find(w => w.is_default && w.id !== watchlistIdToDelete);
        const firstWatchlist = currentWatchlists?.filter(w => w.id !== watchlistIdToDelete)[0];
        setSelectedWatchlistId(defaultWatchlist?.id || firstWatchlist?.id || null);
      }
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      setIsDeleteDialogOpen(false);
      setWatchlistIdToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete watchlist:", error);
      if (error instanceof AxiosError && error.response?.status === 400) {
        toast.error("Cannot delete the default watchlist. Set another as default first.");
      } else {
        toast.error("Failed to delete watchlist. Please try again.");
      }
      setIsDeleteDialogOpen(false);
      setWatchlistIdToDelete(null);
    },
  });

  const handleSelectWatchlist = (id: string) => {
    setSelectedWatchlistId(id);
  };

  const handleDeleteClick = (id: string) => {
    setWatchlistIdToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (watchlistIdToDelete) {
      deleteMutation.mutate(watchlistIdToDelete);
    }
  };

  const handleSetDefaultClick = (id: string) => {
    setDefaultMutation.mutate(id);
  };

  const watchlistNameToDelete = watchlists?.find(w => w.id === watchlistIdToDelete)?.name;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-theme(space.14))] ">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (isFetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-theme(space.14))] text-destructive">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="text-xl mb-2">Could not load watchlists.</p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Watchlists</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Watchlist
        </Button>
      </div>

      {watchlists && watchlists.length > 0 ? (
        <div>
          <Carousel 
            opts={{ 
              align: "start", 
              loop: watchlists.length > 4,
              slidesToScroll: "auto" 
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {watchlists.map((watchlist) => (
                <CarouselItem 
                  key={watchlist.id} 
                  className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <WatchlistItem
                    watchlist={watchlist}
                    isSelected={selectedWatchlistId === watchlist.id}
                    onClick={handleSelectWatchlist}
                    onDelete={handleDeleteClick}
                    onSetDefault={handleSetDefaultClick}
                    isSettingDefault={setDefaultMutation.isPending && setDefaultMutation.variables === watchlist.id}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-[-15px] top-1/2 -translate-y-1/2 hidden sm:flex" />
            <CarouselNext className="absolute right-[-15px] top-1/2 -translate-y-1/2 hidden sm:flex" />
          </Carousel>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg">
            <p className="text-muted-foreground mb-4">You haven't created any watchlists yet.</p>
             <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Watchlist
            </Button>
        </div>
      )}

       <div className="mt-6">
          {selectedWatchlistId ? (
            <WatchlistStocksDetail watchlistId={selectedWatchlistId} />
          ) : (
             !isLoading && <p className="text-center text-muted-foreground">Select a watchlist above to see details.</p>
          )}
        </div>

      <CreateWatchlistDialog 
        isOpen={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              watchlist "<span className="font-semibold">{watchlistNameToDelete || 'this watchlist'}</span>".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWatchlistIdToDelete(null)}>Cancel</AlertDialogCancel>
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

export default WatchlistsTemplate; 