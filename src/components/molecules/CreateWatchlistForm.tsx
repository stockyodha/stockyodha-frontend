import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// Define the form schema using Zod
const watchlistFormSchema = z.object({
  name: z.string().min(1, "Watchlist name cannot be empty").max(100, "Name cannot exceed 100 characters"),
});

type WatchlistFormValues = z.infer<typeof watchlistFormSchema>;

interface CreateWatchlistFormProps {
  onSubmit: (values: WatchlistFormValues) => void; // Callback on successful submission
  isSubmitting: boolean; // To show loading state on the button
}

const CreateWatchlistForm: React.FC<CreateWatchlistFormProps> = ({ onSubmit, isSubmitting }) => {
  const form = useForm<WatchlistFormValues>({
    resolver: zodResolver(watchlistFormSchema),
    defaultValues: {
      name: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Watchlist Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Tech Stocks, Long Term" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Create Watchlist
        </Button>
      </form>
    </Form>
  );
};

export default CreateWatchlistForm; 