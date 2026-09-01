"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useResetPassword } from "../api/auth.queries";
import { Logo } from "@/components/layout/logo";

const resetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetValues = z.infer<typeof resetSchema>;

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();

  const resetMutation = useResetPassword();

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetValues) => {
    try {
      await resetMutation.mutateAsync({
        token,
        newPassword: values.password,
      });
      router.push("/login");
    } catch {
      // Handled by toast
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
              Create New Password
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your new secure password below.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 pt-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-primary" /> New Password
                      </FormLabel>
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
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-primary" /> Confirm New Password
                      </FormLabel>
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

                <Button
                  type="submit"
                  disabled={resetMutation.isPending}
                  className="w-full rounded-xl font-semibold mt-2"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {resetMutation.isPending ? "Updating..." : "Set New Password"}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel and Return to Sign In
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
