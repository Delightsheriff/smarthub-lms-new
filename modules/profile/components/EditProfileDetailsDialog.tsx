"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useUpdateMyDetails } from "../api/profile.queries";
import type { ProfileDetailsPatch } from "../types";

const profileDetailsSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  middleName: z.string().trim().max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  gender: z.enum(["", "Male", "Female"]),
  phone: z.string().trim().refine((value) => value.length === 0 || (value.length >= 7 && value.length <= 20), "Phone must be 7–20 characters"),
});

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
] as const;

interface EditProfileDetailsProps {
  current: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    gender?: "Male" | "Female";
    phone?: string;
  };
}

/**
 * Self-edit of name / gender / phone. Phone sits behind an unlock
 * confirmation (a deliberate extra step before touching a verified line).
 * Only actually-changed, trimmed fields are sent — the fold keeps the
 * stored AuthUser current.
 *
 * The form lives in its own component remounted (via `key`) every time
 * the dialog opens, so its local state is freshly seeded from `current`
 * without any setState-in-effect.
 */
export function EditProfileDetailsDialog({
  open,
  onOpenChange,
  current,
}: EditProfileDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold">Edit personal details</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update your name, gender or phone. Email stays managed by an admin.
          </DialogDescription>
        </DialogHeader>
        <ProfileDetailsForm
          key={String(open)}
          current={current}
          onSaved={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

interface EditProfileDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: EditProfileDetailsProps["current"];
}

function ProfileDetailsForm({
  current,
  onSaved,
  onCancel,
}: {
  current: EditProfileDetailsProps["current"];
  onSaved: () => void;
  onCancel: () => void;
}) {
  type Values = z.infer<typeof profileDetailsSchema>;
  const form = useForm<Values>({
    resolver: zodResolver(profileDetailsSchema),
    defaultValues: { firstName: current.firstName ?? "", middleName: current.middleName ?? "", lastName: current.lastName ?? "", gender: current.gender ?? "", phone: current.phone ?? "" },
  });
  const [phoneUnlocked, setPhoneUnlocked] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const update = useUpdateMyDetails();

  const submit = async (values: Values) => {
    const dirty: ProfileDetailsPatch = {
      ...(values.firstName !== (current.firstName ?? "") && { firstName: values.firstName }),
      ...(values.middleName !== (current.middleName ?? "") && { middleName: values.middleName }),
      ...(values.lastName !== (current.lastName ?? "") && { lastName: values.lastName }),
      ...(values.gender && values.gender !== (current.gender ?? "") && { gender: values.gender }),
      ...(phoneUnlocked && values.phone !== (current.phone ?? "") && { phone: values.phone }),
    };
    if (!Object.keys(dirty).length) return;
    try {
      await update.mutateAsync(dirty);
      toast.success("Profile updated");
      form.reset(values);
      onSaved();
    } catch {
      /* interceptor toasts */
    }
  };

  return (
    <Form {...form}><form className="grid gap-4 py-2" onSubmit={form.handleSubmit(submit)}>
      {(["firstName", "middleName", "lastName"] as const).map((name) => (
        <FormField key={name} control={form.control} name={name} render={({ field }) => (
          <FormItem><FormLabel>{name === "firstName" ? "First name" : name === "lastName" ? "Last name" : "Middle name"}</FormLabel><FormControl><Input placeholder={name} disabled={form.formState.isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      ))}
      <FormField control={form.control} name="gender" render={({ field }) => (
        <FormItem>
          <FormLabel>Gender</FormLabel>
          <Select
            value={field.value || undefined}
            onValueChange={(value) => field.onChange(value ?? "")}
            disabled={form.formState.isSubmitting}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select gender">
                  {(v: string | null) => GENDER_OPTIONS.find((g) => g.value === v)?.label ?? (v || "Select gender")}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {GENDER_OPTIONS.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="phone">Phone</Label>
          {!phoneUnlocked ? (
            <Button
              type="button"
              variant="link"
              onClick={() => setUnlockOpen(true)}
              className="h-auto p-0 text-xs font-medium text-primary hover:underline"
            >
              Unlock to edit
            </Button>
          ) : null}
        </div>
        <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormControl><Input id="phone" placeholder="+234…" disabled={!phoneUnlocked || form.formState.isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>} />
      </div>
      <DialogFooter className="pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={form.formState.isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </DialogFooter>

      <AlertDialog open={unlockOpen} onOpenChange={setUnlockOpen}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg font-semibold">Unlock phone edit?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Your phone number is used for session alerts and attendance
              verification. Confirm you want to change it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl"
              onClick={() => {
                setPhoneUnlocked(true);
                setUnlockOpen(false);
              }}
            >
              Unlock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form></Form>
  );
}
