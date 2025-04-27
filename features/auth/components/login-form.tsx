// src/features/auth/components/LoginForm.tsx (Example Path)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

// Redux Imports
import { useAppDispatch, useAppSelector } from "@/store/hooks";
// Assume loginThunk is defined and exported correctly
import { loginThunk } from "@/features/auth/store/auth-thunks"; // Adjust path as needed

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast"; // Assuming you have this hook

// DyraneUI Imports
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";

// --- Zod Schema ---
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  // Match backend validation if stricter (e.g., min length if applicable)
  password: z.string().min(1, "Password is required"), // Basic check for non-empty
});

type LoginFormValues = z.infer<typeof loginSchema>;

// --- Component ---
export function LoginForm() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const router = useRouter();
  const { toast } = useToast();

  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // --- React Hook Form Setup ---
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // --- Submit Handler ---
  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null); // Clear previous errors
    try {
      // Dispatch the login thunk
      await dispatch(loginThunk(data)).unwrap(); // unwrap handles throwing on rejection

      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting...",
        variant: "success",
      });

      // Redirect on success - could also be handled by checking auth state elsewhere
      router.push("/dashboard"); // Or appropriate destination
      setServerError(null); // Clear any previous errors

    } catch (error: any) {
      const errorMessage = error?.message || "Login failed. Please check your credentials.";
      console.error("Login Failed:", error);
      setServerError(errorMessage); // Show error message in the Alert
      // Toast is optional here since the Alert shows the error
      // toast({
      //   title: "Login Failed",
      //   description: errorMessage,
      //   variant: "destructive",
      // });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-transparent backdrop-blur-xs border-none"> {/* Card structure */}
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>Sign in to your 1Tech Academy dashboard</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Shadcn Form Component */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Server Error Alert */}
            {serverError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Error</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage /> {/* Handles Zod errors */}
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pr-10"
                        {...field}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-0 right-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        disabled={isLoading}
                        tabIndex={-1} // Improve accessibility
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage /> {/* Handles Zod errors */}
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <DyraneButton type="submit" size="lg" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Logging In...
                </>
              ) : (
                "Login"
              )}
            </DyraneButton>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col items-center space-y-2 text-sm pt-4">
        <p className="text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline underline-offset-2">
            Sign up
          </Link>
        </p>
        <Link href="/forgot-password" className="text-xs text-muted-foreground hover:underline underline-offset-2">
          Forgot your password?
        </Link>
      </CardFooter>
    </Card>
  );
}