"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useResetPassword, useVerifyResetToken } from "../api/auth.queries";
import { AuthCard, AuthColumn } from "./AuthCard";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
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
  const verifyQuery = useVerifyResetToken(token);
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
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      toast.success("Password reset — please sign in with your new password.");
      router.push("/login");
    } catch {
      // Handled by toast or form
    }
  };

  if (verifyQuery.isLoading) {
    return (
      <AuthColumn>
        <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Checking your reset link…</p>
        </div>
      </AuthColumn>
    );
  }

  if (verifyQuery.isError || verifyQuery.data?.valid === false) {
    return (
      <AuthCard
        title="This link has expired"
        description="Reset links are valid for one hour. Request a new one to continue."
      >
        <div className="space-y-4 pt-2 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto">
            <AlertCircle className="h-6 w-6" />
          </span>
          <Button
            nativeButton={false}
            render={<Link href="/forgot-password" />}
            className="w-full rounded-xl font-semibold"
          >
            Request a new link
          </Button>
          <div>
            <Link
              href="/login"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create New Password"
      description="Enter your new secure password below."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary" /> New Password
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    className="rounded-xl"
                    disabled={resetMutation.isPending}
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
                <FormLabel className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary" /> Confirm New Password
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    className="rounded-xl"
                    disabled={resetMutation.isPending}
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
    </AuthCard>
  );
}
