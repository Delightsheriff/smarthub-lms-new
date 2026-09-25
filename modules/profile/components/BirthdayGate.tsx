"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Cake } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/slices/authStore";
import { useUpdateMyDetails } from "../api/profile.queries";
import { BirthdayFields } from "./BirthdayFields";
import { isValidBirthday } from "../lib/birthday";

/**
 * Compulsory birthday for teaching staff. Students get the same field on
 * their profile, but optional — never this modal.
 *
 * The split is about who pays the cost. Instructors are a small group
 * the team can chase anyway, so a blocking prompt is cheap and gets
 * answered. The same gate across every student would be paid by
 * thousands of people on every visit, and blocking gates get gamed —
 * you collect a lot of 01/01 from people who only wanted to reach an
 * assignment. Someone who both teaches and studies still gets it.
 *
 * Gated on `lmsRole`, the server's own answer to "what is this person
 * here as", so an instructor whose legacy role cache was never stamped
 * still resolves correctly. Mirrors ProfilePhotoGate: controlled `open`
 * with no `onOpenChange` and no close button, so Escape / click-away /
 * an X can't dismiss it.
 */
export function BirthdayGate() {
  const user = useAuthStore((s) => s.user);
  const updateDetails = useUpdateMyDetails();

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");

  const teaches = user?.lmsRole === "instructor" || user?.lmsRole === "both";
  const hasBirthday = !!user?.birthDay && !!user?.birthMonth;
  const open = !!user && teaches && !hasBirthday;

  if (!open) return null;

  const valid = isValidBirthday(Number(day), Number(month));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    try {
      // useUpdateMyDetails folds the patch into the stored user, which
      // closes the gate without waiting for a refetch.
      await updateDetails.mutateAsync({
        birthDay: Number(day),
        birthMonth: Number(month),
      });
      toast.success("Thanks — saved");
    } catch {
      // Interceptor toasts; keep the modal open so it can be retried
      // without losing the selection.
    }
  };

  return (
    <Dialog open>
      <DialogContent className="max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cake className="h-5 w-5 text-primary" aria-hidden />
            When&apos;s your birthday?
          </DialogTitle>
          <DialogDescription>Day and month only.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <BirthdayFields
            day={day}
            month={month}
            onDayChange={setDay}
            onMonthChange={setMonth}
            disabled={updateDetails.isPending}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={!valid || updateDetails.isPending}
          >
            {updateDetails.isPending ? "Saving…" : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
