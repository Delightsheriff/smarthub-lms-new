"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForgotPassword } from "../api/auth.queries";
import { Logo } from "@/components/layout/logo";

const forgotSchema = z.object({
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const forgotMutation = useForgotPassword();

  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotValues) => {
    try {
      await forgotMutation.mutateAsync(values);
      setSentEmail(values.email);
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
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your account email to receive a password reset link.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 pt-2">
            {sentEmail ? (
              <div className="rounded-xl border bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 p-4 text-center space-y-2 text-xs">
                <p className="font-semibold">Reset instructions sent!</p>
                <p className="text-[11px] text-muted-foreground">
                  Check your inbox for <strong>{sentEmail}</strong> for password reset instructions.
                </p>
                <div className="pt-2">
                  <Button
                    render={<Link href="/login" />}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs"
                  >
                    Return to Sign In
                  </Button>
                </div>
              </div>
            ) : (
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

                  <Button
                    type="submit"
                    disabled={forgotMutation.isPending}
                    className="w-full rounded-xl font-semibold mt-2"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {forgotMutation.isPending ? "Sending..." : "Send Reset Link"}
                  </Button>

                  <div className="text-center pt-2">
                    <Link
                      href="/login"
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                    </Link>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
