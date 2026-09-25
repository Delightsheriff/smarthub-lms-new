"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, Lock, ShieldCheck, ArrowRight, AlertCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card } from "@/components/ui/card";
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
import { AuthColumn, AuthCardBody } from "./AuthCard";

const labelForRole = (code: string | undefined): string => {
  if (!code) return "member";
  return code.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const acceptSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z
      .string()
      .min(8, "Enter a valid phone number (at least 8 digits)")
      .max(20, "Phone number is too long"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Pre-fill name fields from verification data once loaded
  useEffect(() => {
    if (verification) {
      if (verification.firstName) form.setValue("firstName", verification.firstName);
      if (verification.lastName) form.setValue("lastName", verification.lastName);
    }
  }, [verification, form]);

  const onSubmit = async (values: AcceptValues) => {
    try {
      await acceptMutation.mutateAsync({
        token,
        firstName: values.firstName.trim() || undefined,
        lastName: values.lastName.trim() || undefined,
        phone: values.phone.trim() || undefined,
        password: values.password,
      });
      toast.success("Account ready — sign in with your new password.");
      router.replace("/login");
    } catch {
      // Error handled by form or interceptor
    }
  };

  if (!token) {
    return (
      <AuthColumn>
        <Card className="rounded-2xl border border-destructive/50 bg-destructive/10 p-6 text-center space-y-3">
          <div className="flex justify-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </span>
          </div>
          <h3 className="text-base font-bold text-destructive">No Invitation Token</h3>
          <p className="text-xs text-muted-foreground">
            This page needs an invitation token in the URL. Open the link from your invitation email instead.
          </p>
          <div className="pt-2">
            <Button
              nativeButton={false}
              render={<Link href="/login" />}
              variant="outline"
              size="sm"
              className="rounded-xl"
            >
              Back to Sign In
            </Button>
          </div>
        </Card>
      </AuthColumn>
    );
  }

  if (isLoading) {
    return (
      <AuthColumn>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </AuthColumn>
    );
  }

  const isInvalid =
    !!error ||
    (verification &&
      (verification.status === "expired" ||
        verification.status === "cancelled" ||
        verification.status === "rejected"));

  if (isInvalid) {
    return (
      <AuthColumn>
        <Card className="rounded-2xl border border-destructive/50 bg-destructive/10 p-6 text-center space-y-3">
          <div className="flex justify-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </span>
          </div>
          <h3 className="text-base font-bold text-destructive">Invitation No Longer Valid</h3>
          <p className="text-xs text-muted-foreground">
            The link has expired, been cancelled, or was already used. Ask whoever invited you to send a fresh one.
          </p>
          <div className="pt-2">
            <Button
              nativeButton={false}
              render={<Link href="/login" />}
              variant="outline"
              size="sm"
              className="rounded-xl"
            >
              Return to Sign In
            </Button>
          </div>
        </Card>
      </AuthColumn>
    );
  }

  if (verification?.status === "accepted") {
    return (
      <AuthColumn>
        <Card className="rounded-2xl border border-border bg-card p-6 text-center space-y-3">
          <div className="flex justify-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-6 w-6" />
            </span>
          </div>
          <h3 className="text-base font-bold text-foreground">Already Accepted</h3>
          <p className="text-xs text-muted-foreground">
            This invitation has already been used. Sign in with your usual credentials.
          </p>
          <div className="pt-2">
            <Button
              nativeButton={false}
              render={<Link href="/login" />}
              size="sm"
              className="rounded-xl"
            >
              Sign In
            </Button>
          </div>
        </Card>
      </AuthColumn>
    );
  }

  // Existing user branch: no password needed. Accepting grants the role.
  if (verification?.userExists) {
    return (
      <AuthColumn>
        <AuthCardBody
          title={`Welcome back, ${verification.firstName || verification.email}`}
          description={
            <>
              You&apos;ve been granted the{" "}
              <span className="font-semibold text-foreground">
                {labelForRole(verification.role)}
              </span>{" "}
              role. Sign in with your existing account to use it.
            </>
          }
        >
          <div className="space-y-4 pt-2">
            <div className="flex justify-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </span>
            </div>
            <Button
              type="button"
              className="w-full rounded-xl font-semibold"
              disabled={acceptMutation.isPending}
              onClick={async () => {
                try {
                  await acceptMutation.mutateAsync({ token, password: "" });
                } catch {
                  // Role may already be applied — route on either way.
                }
                router.replace("/login");
              }}
            >
              {acceptMutation.isPending ? "Accepting..." : "Sign In with Existing Account"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </AuthCardBody>
      </AuthColumn>
    );
  }

  return (
    <AuthColumn>
      {verification && (
        <AuthCardBody
          title="Accept Your Invitation"
          description={
            <>
              You&apos;re joining as a{" "}
              <span className="font-semibold text-foreground">
                {labelForRole(verification.role)}
              </span>
              . Set a password to finish creating your account for{" "}
              <strong>{verification.email}</strong>.
            </>
          }
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ade"
                          className="rounded-xl"
                          disabled={acceptMutation.isPending}
                          {...field}
                        />
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
                      <FormLabel className="text-sm font-medium text-foreground">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Balogun"
                          className="rounded-xl"
                          disabled={acceptMutation.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary" /> Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="08093883899 or +2348093883899"
                        className="rounded-xl"
                        disabled={acceptMutation.isPending}
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
                    <FormLabel className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-primary" /> Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="At least 8 characters"
                        className="rounded-xl"
                        disabled={acceptMutation.isPending}
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
                      <Lock className="h-3.5 w-3.5 text-primary" /> Confirm Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Repeat the password"
                        className="rounded-xl"
                        disabled={acceptMutation.isPending}
                        {...field}
                      />
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
                {acceptMutation.isPending ? "Accepting..." : "Accept Invitation"}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Already have an account? Sign In
                </Link>
              </div>
            </form>
          </Form>
        </AuthCardBody>
      )}
    </AuthColumn>
  );
}
