"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Card } from "@/components/ui/card";
import { useChangePassword } from "../api/auth.queries";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(6, "Use at least 6 characters"),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "New password must differ from your current one",
  });

type FormValues = z.infer<typeof schema>;

/**
 * Change-password surface for the profile Security tab. Sends
 * `{ currentPassword, newPassword, confirmPassword }`; the API
 * verifies `currentPassword` and a 401 means it was wrong, surfaced
 * inline. Renders as an in-place tab (no separate page) so the action
 * never takes the user out of the profile tab strip.
 */
export function ChangePasswordForm() {
  const change = useChangePassword();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await change.mutateAsync(values);
      toast.success("Password changed");
      reset();
    } catch (err) {
      // The api client wraps errors with `.message`. Surface 401
      // ("Current password is incorrect") inline; everything else
      // falls through to the generic copy.
      const msg =
        err instanceof Error
          ? err.message
          : "Could not change password. Please try again.";
      setServerError(msg);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight leading-tight">
            Change password
          </h2>
          <p className="text-sm text-muted-foreground">
            Confirm your current password, then pick a new one.
          </p>
        </div>
      </header>

      <div className="max-w-md">
        <Card className="p-5 md:p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <label
                htmlFor="currentPassword"
                className="text-sm font-medium"
              >
                Current password
              </label>
              <PasswordInput
                id="currentPassword"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <p className="text-xs text-destructive">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New password
              </label>
              <PasswordInput
                id="newPassword"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium"
              >
                Confirm new password
              </label>
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {serverError && (
              <p
                role="alert"
                className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2"
              >
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={change.isPending}
            >
              {change.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Change password"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}