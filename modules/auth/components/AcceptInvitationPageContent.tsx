"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useVerifyInvitation, useAcceptInvitation } from "../api/auth.queries";
import { Logo } from "@/components/layout/logo";

const acceptSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AcceptValues = z.infer<typeof acceptSchema>;

export function AcceptInvitationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { data: verification, isLoading, error } = useVerifyInvitation(token);
  const acceptMutation = useAcceptInvitation();

  const form = useForm<AcceptValues>({
    resolver: zodResolver(acceptSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
    },
  });

  const onSubmit = async (values: AcceptValues) => {
    try {
      await acceptMutation.mutateAsync({
        token,
        ...values,
      });
      router.push("/dashboard");
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

        {isLoading && <Skeleton className="h-64 w-full rounded-2xl" />}

        {error && (
          <Card className="rounded-2xl border border-destructive/50 bg-destructive/10 p-6 text-center space-y-2">
            <h3 className="text-base font-bold text-destructive">Invalid or Expired Invitation</h3>
            <p className="text-xs text-muted-foreground">
              This invitation link is invalid or has expired. Please request a new invitation.
            </p>
            <div className="pt-2">
              <Button render={<Link href="/login" />} variant="outline" size="sm" className="rounded-xl">
                Return to Sign In
              </Button>
            </div>
          </Card>
        )}

        {!isLoading && verification && (
          <Card className="rounded-2xl border bg-card p-6 shadow-md space-y-4">
            <CardHeader className="p-0 text-center space-y-1">
              <CardTitle className="text-xl font-bold text-foreground">
                Accept SmartHub Invitation
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Complete your account registration for <strong>{verification.email}</strong>.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 pt-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-foreground">First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Ade" className="rounded-xl text-xs" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-foreground">Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Balogun" className="rounded-xl text-xs" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-primary" /> Create Password
                        </FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="••••••••" className="rounded-xl text-xs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={acceptMutation.isPending}
                    className="w-full rounded-xl font-semibold mt-2"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {acceptMutation.isPending ? "Accepting..." : "Accept & Enter SmartHub"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
