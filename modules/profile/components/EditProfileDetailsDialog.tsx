"use client";
import { useState } from "react";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useUpdateMyDetails } from "../api/profile.queries";
import type { ProfileDetailsPatch } from "../types";

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit personal details</DialogTitle>
          <DialogDescription>
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
  const [firstName, setFirstName] = useState(current.firstName ?? "");
  const [middleName, setMiddleName] = useState(current.middleName ?? "");
  const [lastName, setLastName] = useState(current.lastName ?? "");
  const [gender, setGender] = useState<"" | "Male" | "Female">(
    current.gender ?? "",
  );
  const [phone, setPhone] = useState(current.phone ?? "");
  const [phoneUnlocked, setPhoneUnlocked] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const update = useUpdateMyDetails();

  const dirty: ProfileDetailsPatch = {
    ...(firstName.trim() !== (current.firstName ?? "") && { firstName: firstName.trim() }),
    ...(middleName.trim() !== (current.middleName ?? "") && { middleName: middleName.trim() }),
    ...(lastName.trim() !== (current.lastName ?? "") && { lastName: lastName.trim() }),
    ...(gender && gender !== (current.gender ?? "") && { gender }),
    ...(phoneUnlocked && phone.trim() !== (current.phone ?? "") && { phone: phone.trim() }),
  };
  const hasChanges = Object.keys(dirty).length > 0;

  const submit = async () => {
    if (!hasChanges) return;
    try {
      await update.mutateAsync(dirty);
      toast.success("Profile updated");
      onSaved();
    } catch {
      /* interceptor toasts */
    }
  };

  return (
    <form
      className="grid gap-4 py-2"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="first-name">First name</Label>
        <Input
          id="first-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="middle-name">Middle name</Label>
        <Input
          id="middle-name"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          placeholder="Middle name"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="last-name">Last name</Label>
        <Input
          id="last-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last name"
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Gender</Label>
        <Select
          value={gender || undefined}
          onValueChange={(v) => setGender(v ?? "")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="phone">Phone</Label>
          {!phoneUnlocked ? (
            <button
              type="button"
              onClick={() => setUnlockOpen(true)}
              className="text-xs font-medium text-primary hover:underline"
            >
              Unlock to edit
            </button>
          ) : null}
        </div>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+234…"
          disabled={!phoneUnlocked}
        />
      </div>
      <DialogFooter className="gap-2 pt-2 sm:gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!hasChanges || update.isPending}>
          {update.isPending ? "Saving…" : "Save changes"}
        </Button>
      </DialogFooter>

      <AlertDialog open={unlockOpen} onOpenChange={setUnlockOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock phone edit?</AlertDialogTitle>
            <AlertDialogDescription>
              Your phone number is used for session alerts and attendance
              verification. Confirm you want to change it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
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
    </form>
  );
}
