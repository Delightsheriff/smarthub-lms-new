"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LogIn, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useLogin } from "../api/auth.queries";
import { getNextPath } from "../lib/next-path";
import { Logo } from "@/components/layout/logo";

const loginSchema = z.object({
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getNextPath(searchParams);

  const loginMutation = useLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      await loginMutation.mutateAsync(values);
      router.push(nextPath);
    } catch {
      // Handled by apiClient toast
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>

        <Card className="rounded-2xl border bg-card p-6 shadow-md space-y-4">
          <CardHeader className="p-0 text-center space-y-1">
            <CardTitle className="text-xl font-bold text-foreground">
              Sign In to SmartHub
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your account credentials to access your learning workspace.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 pt-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          className="rounded-xl text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-primary" /> Password
                        </FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <PasswordInput
                          placeholder="••••••••"
                          className="rounded-xl text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0 pt-1">
                      <FormControl>
                        <input
                          type="checkbox"
                          id="rememberMe"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                        />
                      </FormControl>
                      <FormLabel htmlFor="rememberMe" className="text-xs text-muted-foreground cursor-pointer font-normal">
                        Remember me on this device
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full rounded-xl font-semibold mt-2"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
