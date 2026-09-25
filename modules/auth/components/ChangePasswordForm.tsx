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
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
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
        confirmPassword: values.confirmPassword,
      });
      form.reset();
    } catch {
      // Handled by toast
    }
  };

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/20 p-5">
        <CardTitle className="flex items-center gap-2 text-base font-display">
          <Lock className="h-4 w-4 text-primary" /> Change password
        </CardTitle>
        <CardDescription>
          Update your account password to keep it secure.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" disabled={changeMutation.isPending} {...field} />
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
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" disabled={changeMutation.isPending} {...field} />
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
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" disabled={changeMutation.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={changeMutation.isPending} className="rounded-xl">
                <CheckCircle2 className="h-4 w-4" />
                {changeMutation.isPending ? "Updating…" : "Update password"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}