import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { registerUser } from '@/services/authService'; // Assuming service exists

// Schema for form validation
const formSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).max(50),
  email: z.string().email({ message: "Please enter a valid email." }).max(255),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  // Add optional first/last names if your UserCreate needs them
  // firstName: z.string().max(100).optional(),
  // lastName: z.string().max(100).optional(),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Path of error
});

// Infer the type for the form values from the schema
type RegisterFormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize the form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      // firstName: "", // Initialize if added to schema
      // lastName: "", // Initialize if added to schema
    },
  })

  // Handle form submission
  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    setError(null);
    try {
      // Exclude confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = values;
      
      // If you added optional fields like firstName/lastName, handle them:
      // Ensure empty strings become null if the API expects null for optional fields
      // const apiData = {
      //   ...registrationData,
      //   first_name: registrationData.firstName || null,
      //   last_name: registrationData.lastName || null,
      // };
      // delete apiData.firstName; // Remove field if name differs in API
      // delete apiData.lastName;

      // Send only the required fields based on UserCreate schema
      await registerUser(registrationData);
      
      toast.success("Registration successful!", {
        description: "Please login with your new account.",
      });
      navigate('/login'); // Redirect to login page
    } catch (err: any) {
      // Extract error message (handle potential validation errors from API)
      let errorMessage = "Registration failed. Please try again.";
      if (err.response?.data?.detail) {
          if (Array.isArray(err.response.data.detail)) {
               // Handle Pydantic validation errors (FastAPI)
              errorMessage = err.response.data.detail
                  .map((e: { loc: string[], msg: string }) => `${e.loc.slice(-1)[0]}: ${e.msg}`)
                  .join('\n');
          } else if (typeof err.response.data.detail === 'string') {
              // Handle simple string error messages
              errorMessage = err.response.data.detail;
          }
      } else if (err.message) {
          errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error("Registration Failed", { description: errorMessage });
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Enter your details below to register.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Choose a username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Add fields for firstName/lastName here if needed */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a password (min. 8 chars)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                // Display multi-line errors if needed
                <p className="text-sm font-medium text-destructive whitespace-pre-line">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary underline underline-offset-4 hover:text-primary/90">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 