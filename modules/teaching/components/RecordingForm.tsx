"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { LinkRowsInput, cleanLinkRows } from "@/components/ui/link-rows-input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  useAttachRecordingToSchedule,
  useCreateTeachingRecording,
  useTeachingCohortDetail,
  useTeachingRecording,
  useUpdateTeachingRecording,
} from "../api/teaching.queries";
import { refId } from "../types";
import {
  AuthoringLoadError,
  AuthoringShell,
  AuthoringSkeleton,
  Field,
  FormActions,
  FormError,
  FormSection,
  OptionSelect,
  ToggleRow,
  isRichTextEmpty,
  moduleOptions,
} from "./authoring/authoring-kit";

const schema = z.object({
  module: z.string().min(1, "Pick a module"),
  title: z.string().trim().min(3, "Title is required").max(200),
  /** A session recorded in parts gets several rows; the first plays by default. */
  links: z
    .array(z.object({ name: z.string().max(80), url: z.string() }))
    .refine((rows) => rows.some((r) => r.url.trim()), "Add at least one video link")
    .refine(
      (rows) => rows.every((r) => !r.url.trim() || /^https?:\/\/\S+$/.test(r.url.trim())),
      "Every link must be a full https:// URL",
    ),
  description: z.string().max(20000, "Cannot exceed 20,000 characters"),
  /** Minutes in the form; the API stores seconds. */
  durationMinutes: z
    .string()
    .refine((v) => v === "" || /^\d+$/.test(v), "Whole minutes only"),
  thumbnailUrl: z
    .string()
    .refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), "Use a full https:// URL"),
  /** Create only — attach to this cohort straight away. */
  attachToCohort: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

/**
 * Create / edit a module recording. Create posts the recording
 * (published — students only see published ones) and, by default,
 * attaches it to this cohort. Edit updates the canonical recording;
 * cohort attachments are managed from the module page.
 */
export function RecordingForm({
  scheduleId,
  recordingId,
}: {
  scheduleId: string;
  recordingId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!recordingId;
  const cohortHref = `/teach/cohorts/${scheduleId}?tab=modules`;

  const cohort = useTeachingCohortDetail(scheduleId);
  const existing = useTeachingRecording(recordingId);
  const create = useCreateTeachingRecording();
  const update = useUpdateTeachingRecording(recordingId || "");
  const attach = useAttachRecordingToSchedule(scheduleId);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      module: searchParams.get("module") ?? "",
      title: "",
      links: [{ name: "", url: "" }],
      description: "",
      durationMinutes: "",
      thumbnailUrl: "",
      attachToCohort: true,
    },
  });

  useEffect(() => {
    const r = existing.data;
    if (!r) return;
    reset({
      module: refId(r.module) ?? "",
      title: r.title ?? "",
      links: r.links?.length
        ? r.links
        : r.videoUrl
          ? [{ name: "Link 1", url: r.videoUrl }]
          : [{ name: "", url: "" }],
      description: r.description ?? "",
      durationMinutes: r.duration ? String(Math.round(r.duration / 60)) : "",
      thumbnailUrl: r.thumbnailUrl ?? "",
      attachToCohort: false,
    });
  }, [existing.data, reset]);

  const onSubmit = async (v: FormValues) => {
    setServerError(null);
    const common = {
      title: v.title.trim(),
      links: cleanLinkRows(v.links),
      module: v.module,
      description: isRichTextEmpty(v.description) ? undefined : v.description,
      duration: v.durationMinutes ? Number(v.durationMinutes) * 60 : undefined,
      thumbnailUrl: v.thumbnailUrl || undefined,
    };
    try {
      if (isEdit) {
        await update.mutateAsync(common);
        toast.success("Recording updated");
      } else {
        const created = await create.mutateAsync({
          ...common,
          recordingType: "module",
          publish: true,
        });
        if (created?._id && v.attachToCohort) {
          await attach.mutateAsync(created._id);
        }
        toast.success(
          v.attachToCohort ? "Recording added to this cohort" : "Recording added to the module",
        );
      }
      router.replace(cohortHref);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Could not save the recording. Please try again.",
      );
    }
  };

  const onInvalid = (errs: FieldErrors<FormValues>) => {
    const first = Object.values(errs).find((e) => e?.message)?.message;
    toast.error(typeof first === "string" ? first : "Please fix the highlighted fields.");
  };

  if (cohort.isLoading || (isEdit && existing.isLoading)) return <AuthoringSkeleton />;
  if (cohort.isError || !cohort.data) {
    return (
      <AuthoringLoadError
        message="Couldn't load this cohort."
        backHref="/teach"
        onRetry={() => cohort.refetch()}
      />
    );
  }
  if (isEdit && (existing.isError || !existing.data)) {
    return (
      <AuthoringLoadError
        message="Couldn't load this recording."
        backHref={cohortHref}
        onRetry={() => existing.refetch()}
      />
    );
  }

  const submitting = create.isPending || update.isPending || attach.isPending;

  return (
    <AuthoringShell
      backHref={cohortHref}
      backLabel={`Back to ${cohort.data.course.name}`}
      title={isEdit ? "Edit recording" : "Add recording"}
      description={
        isEdit
          ? "Changes apply to the recording everywhere it's attached."
          : "Paste a hosted video link (YouTube, Vimeo, Google Drive or a direct file) and pick its module."
      }
    >
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-8">
        <FormSection title="Basics">
          <Field id="recording-module" label="Module" error={errors.module?.message}>
            <Controller
              control={control}
              name="module"
              render={({ field }) => (
                <OptionSelect
                  id="recording-module"
                  value={field.value}
                  onChange={field.onChange}
                  options={moduleOptions(cohort.data.modules)}
                  placeholder="Choose a module"
                  invalid={!!errors.module}
                />
              )}
            />
          </Field>
          <Field id="recording-title" label="Title" error={errors.title?.message}>
            <Input
              id="recording-title"
              placeholder="e.g. Pandas: chained methods deep dive"
              aria-invalid={!!errors.title || undefined}
              {...register("title")}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Video"
          description="One link is the usual case. Add more when a session was recorded in parts — students start with the first."
        >
          <Field label="Video links" error={errors.links?.message ?? errors.links?.root?.message}>
            <Controller
              control={control}
              name="links"
              render={({ field }) => (
                <LinkRowsInput value={field.value} onChange={field.onChange} addLabel="Add part" />
              )}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="recording-duration"
              label="Length in minutes (optional)"
              error={errors.durationMinutes?.message}
            >
              <Input
                id="recording-duration"
                inputMode="numeric"
                placeholder="90"
                aria-invalid={!!errors.durationMinutes || undefined}
                {...register("durationMinutes")}
              />
            </Field>
            <Field
              id="recording-thumb"
              label="Thumbnail URL (optional)"
              error={errors.thumbnailUrl?.message}
            >
              <Input
                id="recording-thumb"
                type="url"
                placeholder="https://…"
                aria-invalid={!!errors.thumbnailUrl || undefined}
                {...register("thumbnailUrl")}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Description (optional)">
          <Field label="Description" error={errors.description?.message}>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={20000}
                  placeholder="What the session covered, timestamps, follow-ups…"
                />
              )}
            />
          </Field>
          {!isEdit && (
            <Controller
              control={control}
              name="attachToCohort"
              render={({ field }) => (
                <ToggleRow
                  id="recording-attach"
                  label="Share with this cohort now"
                  description="Turn off to add it to the module only and attach it later."
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          )}
        </FormSection>

        <FormError message={serverError} />
        <FormActions
          cancelHref={cohortHref}
          submitting={submitting}
          submitLabel={isEdit ? "Save changes" : "Add recording"}
        />
      </form>
    </AuthoringShell>
  );
}
