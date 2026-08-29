"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateMyProfessionalProfile } from "../api/profile.queries";
import type { ProfessionalProfilePatch } from "../types";

interface ProfessionalTabProps {
  current: {
    jobTitle?: string;
    department?: string;
    bio?: string;
    altPhone?: string;
    timeZone?: string;
  };
}

/**
 * Instructor / dual-role professional details. Empty inputs clear the
 * field server-side. Only the trimmed dirty-diff is sent.
 *
 * State initialises from `current` once; the caller remounts this tab when
 * the underlying profile changes (via `key`), so no effect is needed to
 * resync props → state.
 */
export function ProfessionalTab({ current }: ProfessionalTabProps) {
  const update = useUpdateMyProfessionalProfile();
  const [jobTitle, setJobTitle] = useState(current.jobTitle ?? "");
  const [department, setDepartment] = useState(current.department ?? "");
  const [bio, setBio] = useState(current.bio ?? "");
  const [altPhone, setAltPhone] = useState(current.altPhone ?? "");
  const [timeZone, setTimeZone] = useState(current.timeZone ?? "");

  const dirty: ProfessionalProfilePatch = {
    ...(jobTitle.trim() !== (current.jobTitle ?? "") && { jobTitle: jobTitle.trim() }),
    ...(department.trim() !== (current.department ?? "") && { department: department.trim() }),
    ...(bio.trim() !== (current.bio ?? "") && { bio: bio.trim() }),
    ...(altPhone.trim() !== (current.altPhone ?? "") && { altPhone: altPhone.trim() }),
    ...(timeZone.trim() !== (current.timeZone ?? "") && { timeZone: timeZone.trim() }),
  };
  const hasChanges = Object.keys(dirty).length > 0;

  const submit = async () => {
    try {
      await update.mutateAsync(dirty);
      toast.success("Professional profile saved.");
    } catch {
      /* interceptor toasts */
    }
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="job-title">Job title</Label>
        <Input
          id="job-title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Frontend Engineer"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="dept">Department</Label>
        <Input
          id="dept"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="e.g. Engineering"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="bio">Short bio</Label>
        <Textarea
          id="bio"
          rows={4}
          maxLength={500}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A sentence or two about you."
        />
        <p className="text-right text-xs text-muted-foreground">{bio.length} / 500</p>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="alt-phone">Alternative phone</Label>
        <Input
          id="alt-phone"
          value={altPhone}
          onChange={(e) => setAltPhone(e.target.value)}
          placeholder="+234…"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="timezone">Time zone</Label>
        <Input
          id="timezone"
          value={timeZone}
          onChange={(e) => setTimeZone(e.target.value)}
          placeholder="e.g. Africa/Lagos"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={!hasChanges || update.isPending}>
          {update.isPending ? "Saving…" : "Save professional profile"}
        </Button>
      </div>
    </form>
  );
}
