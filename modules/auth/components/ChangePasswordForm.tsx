"use client";

import React from "react";
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
import { useChangePassword } from "../api/auth.queries";

const changeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

type ChangeValues = z.infer<typeof changeSchema>;

export function ChangePasswordForm() {
  const changeMutation = useChangePassword();

  const form = useForm<ChangeValues>({
    resolver: zodResolver(changeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ChangeValues) => {
    try {
      await changeMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      form.reset();
    } catch {
      // Handled by toast
    }
  };

  return (
    <Card className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
      <CardHeader className="p-0 border-b pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" /> Change Account Password
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Update your account password to maintain security.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 pt-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">Current Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" className="rounded-xl text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">New Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" className="rounded-xl text-xs" {...field} />
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
                  <FormLabel className="text-xs font-semibold text-foreground">Confirm New Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" className="rounded-xl text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={changeMutation.isPending}
              className="rounded-xl font-semibold"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {changeMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}