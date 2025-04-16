import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// Define the form schema using Zod
const portfolioFormSchema = z.object({
  name: z.string().min(1, { message: "Portfolio name is required." }).max(100, { message: "Name cannot exceed 100 characters." }),
  description: z.string().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
});

// Define the type for the form values based on the schema
type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

interface CreatePortfolioFormProps {
  onSubmit: (values: PortfolioFormValues) => void; // Callback on successful submission
  isSubmitting: boolean; // To show loading state on the button
  onCancel?: () => void; // Optional cancel handler
}

const CreatePortfolioForm: React.FC<CreatePortfolioFormProps> = ({ onSubmit, isSubmitting, onCancel }) => {
  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleFormSubmit = (values: PortfolioFormValues) => {
    onSubmit(values);
    // Optionally reset form after submission if needed
    // form.reset(); 
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Long Term Investments" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="A brief description of this portfolio's goal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
            Create Portfolio
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreatePortfolioForm; 