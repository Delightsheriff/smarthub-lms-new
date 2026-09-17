"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Briefcase } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateMyProfessionalProfile } from "../api/profile.queries"
import type { ProfessionalProfilePatch } from "../types"

interface ProfessionalTabProps {
  current: {
    jobTitle?: string
    department?: string
    bio?: string
    altPhone?: string
    timeZone?: string
  }
}

const professionalSchema = z.object({
  jobTitle: z
    .string()
    .trim()
    .max(100, "Job title must be 100 characters or fewer"),
  department: z
    .string()
    .trim()
    .max(100, "Department must be 100 characters or fewer"),
  bio: z.string().trim().max(500, "Bio must be 500 characters or fewer"),
  altPhone: z
    .string()
    .trim()
    .max(30, "Alternative phone must be 30 characters or fewer"),
  timeZone: z
    .string()
    .trim()
    .max(100, "Time zone must be 100 characters or fewer"),
})

/**
 * Instructor / dual-role professional details. Empty inputs clear the
 * field server-side. Only the trimmed dirty-diff is sent.
 *
 * State initialises from `current` once; the caller remounts this tab when
 * the underlying profile changes (via `key`), so no effect is needed to
 * resync props → state.
 */
export function ProfessionalTab({ current }: ProfessionalTabProps) {
  const update = useUpdateMyProfessionalProfile()
  type Values = z.infer<typeof professionalSchema>
  const form = useForm<Values>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      jobTitle: current.jobTitle ?? "",
      department: current.department ?? "",
      bio: current.bio ?? "",
      altPhone: current.altPhone ?? "",
      timeZone: current.timeZone ?? "",
    },
  })
  const watched = useWatch({ control: form.control })
  const values: Values = {
    jobTitle: watched.jobTitle ?? "",
    department: watched.department ?? "",
    bio: watched.bio ?? "",
    altPhone: watched.altPhone ?? "",
    timeZone: watched.timeZone ?? "",
  }

  const dirty: ProfessionalProfilePatch = {
    ...(values.jobTitle.trim() !== (current.jobTitle ?? "") && {
      jobTitle: values.jobTitle.trim(),
    }),
    ...(values.department.trim() !== (current.department ?? "") && {
      department: values.department.trim(),
    }),
    ...(values.bio.trim() !== (current.bio ?? "") && {
      bio: values.bio.trim(),
    }),
    ...(values.altPhone.trim() !== (current.altPhone ?? "") && {
      altPhone: values.altPhone.trim(),
    }),
    ...(values.timeZone.trim() !== (current.timeZone ?? "") && {
      timeZone: values.timeZone.trim(),
    }),
  }
  const hasChanges = Object.keys(dirty).length > 0

  const submit = async (submitted: Values) => {
    const patch: ProfessionalProfilePatch = {
      ...(submitted.jobTitle !== (current.jobTitle ?? "") && {
        jobTitle: submitted.jobTitle,
      }),
      ...(submitted.department !== (current.department ?? "") && {
        department: submitted.department,
      }),
      ...(submitted.bio !== (current.bio ?? "") && { bio: submitted.bio }),
      ...(submitted.altPhone !== (current.altPhone ?? "") && {
        altPhone: submitted.altPhone,
      }),
      ...(submitted.timeZone !== (current.timeZone ?? "") && {
        timeZone: submitted.timeZone,
      }),
    }
    if (!Object.keys(patch).length) return
    try {
      await update.mutateAsync(patch)
      toast.success("Professional profile saved.")
      form.reset(submitted)
    } catch {
      /* interceptor toasts */
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Briefcase className="h-4 w-4" /> Professional details
        </CardTitle>
        <CardDescription>
          Shown to students on your instructor profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
          <div className="grid gap-1.5">
            <Label htmlFor="job-title">Job title</Label>
            <Input
              id="job-title"
              disabled={form.formState.isSubmitting}
              {...form.register("jobTitle")}
              placeholder="e.g. Frontend Engineer"
            />
            {form.formState.errors.jobTitle ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.jobTitle.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="dept">Department</Label>
            <Input
              id="dept"
              disabled={form.formState.isSubmitting}
              {...form.register("department")}
              placeholder="e.g. Engineering"
            />
            {form.formState.errors.department ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.department.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="bio">Short bio</Label>
            <Textarea
              id="bio"
              rows={4}
              maxLength={500}
              disabled={form.formState.isSubmitting}
              {...form.register("bio")}
              placeholder="A sentence or two about you."
            />
            {form.formState.errors.bio ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.bio.message}
              </p>
            ) : null}
            <p className="text-right text-xs text-muted-foreground">
              {values.bio.length} / 500
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="alt-phone">Alternative phone</Label>
            <Input
              id="alt-phone"
              disabled={form.formState.isSubmitting}
              {...form.register("altPhone")}
              placeholder="+234…"
            />
            {form.formState.errors.altPhone ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.altPhone.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="timezone">Time zone</Label>
            <Input
              id="timezone"
              disabled={form.formState.isSubmitting}
              {...form.register("timeZone")}
              placeholder="e.g. Africa/Lagos"
            />
            {form.formState.errors.timeZone ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.timeZone.message}
              </p>
            ) : null}
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!hasChanges || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Saving…"
                : "Save professional profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
