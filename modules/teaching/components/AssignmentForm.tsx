"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { LinkRowsInput } from "@/components/ui/link-rows-input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  TEACHING_QUERY_KEYS,
  useAssignmentDetail,
  useAttachAssignmentToSchedule,
  useCreateTeachingAssignment,
  useTeachingCohortDetail,
  useUpdateTeachingAssignment,
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
  moduleOptions,
} from "./authoring/authoring-kit";
import {
  ASSIGNMENT_BRIEF_MAX,
  ASSIGNMENT_KINDS,
  ASSIGNMENT_PRIORITIES,
  assignmentBodySchema,
  toAssignmentPayload,
  type AssignmentBodyValues,
} from "./authoring/assignment-body";
import { isFutureLocalInput } from "./authoring/datetime-local";

const schema = assignmentBodySchema.extend({
  module: z.string().min(1, "Pick a module"),
  /** Create only — the due date lives on the per-cohort attachment. */
  dueDate: z.string(),
  /** Create only — email the cohort as well as the in-app notice. */
  notifyStudents: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

/**
 * Single-cohort assignment form. Create = POST the assignment, then
 * attach it to this cohort with its due date. Edit = PATCH the canonical
 * assignment; the cohort's due date / visibility are edited from the
 * assignment row menu instead.
 */
export function AssignmentForm({
  scheduleId,
  assignmentId,
}: {
  scheduleId: string;
  assignmentId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const isEdit = !!assignmentId;
  const backHref = isEdit
    ? `/teach/cohorts/${scheduleId}/assignments/${assignmentId}`
    : `/teach/cohorts/${scheduleId}?tab=assignments`;

  const cohort = useTeachingCohortDetail(scheduleId);
  const existing = useAssignmentDetail(assignmentId);
  const create = useCreateTeachingAssignment();
  const update = useUpdateTeachingAssignment(assignmentId || "");
  const attach = useAttachAssignmentToSchedule();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      module: searchParams.get("module") ?? "",
      title: "",
      type: "assignment",
      priority: "medium",
      totalPoints: "100",
      allowLateSubmission: false,
      isPublished: true,
      description: "",
      instructions: "",
      links: [],
      dueDate: "",
      notifyStudents: true,
    },
  });
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    const a = existing.data;
    if (!a) return;
    // reset() replaces every value — keep the create-only fields seeded
    // so validation can't fail on a field edit mode doesn't render.
    reset({
      module: refId(a.module) ?? "",
      title: a.title ?? "",
      type: a.type ?? "assignment",
      priority: a.priority ?? "medium",
      totalPoints: String(a.totalPoints ?? 100),
      allowLateSubmission: !!a.allowLateSubmission,
      isPublished: a.isPublished ?? true,
      description: a.description ?? "",
      instructions: a.instructions ?? "",
      links: a.links?.length
        ? a.links
        : a.assignmentLink
          ? [{ name: "Link 1", url: a.assignmentLink }]
          : [],
      dueDate: "",
      notifyStudents: true,
    });
  }, [existing.data, reset]);

  const onSubmit = async (v: FormValues) => {
    setServerError(null);
    if (!isEdit && !isFutureLocalInput(v.dueDate)) {
      setServerError("Set a due date in the future — students need to know when it's due.");
      return;
    }
    try {
      if (isEdit) {
        await update.mutateAsync({
          ...toAssignmentPayload(v, { clearEmptyInstructions: true }),
          module: v.module,
        });
        qc.invalidateQueries({
          queryKey: TEACHING_QUERY_KEYS.assignments(scheduleId),
        });
        toast.success("Assignment updated");
      } else {
        const created = await create.mutateAsync({
          ...toAssignmentPayload(v),
          module: v.module,
        });
        await attach.mutateAsync({
          assignmentId: created._id,
          scheduleId,
          payload: {
            dueDate: new Date(v.dueDate).toISOString(),
            allowLateSubmission: v.allowLateSubmission,
            notifyStudents: v.notifyStudents,
          },
        });
        toast.success("Assignment created and shared with this cohort");
      }
      router.replace(backHref);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Could not save the assignment. Please try again.",
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
        message="Couldn't load this assignment."
        backHref={backHref}
        onRetry={() => existing.refetch()}
      />
    );
  }

  const submitting = create.isPending || attach.isPending || update.isPending;

  return (
    <AuthoringShell
      backHref={backHref}
      backLabel={isEdit ? "Back to assignment" : `Back to ${cohort.data.course.name}`}
      title={isEdit ? "Edit assignment" : "New assignment"}
      description={
        isEdit
          ? "Changes apply to this assignment in every cohort it's attached to. Due dates are set per cohort from the assignment list."
          : `Created in the module you pick and shared with this ${cohort.data.course.name} cohort.`
      }
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-8">
          <FormSection title="Basics">
            <Field id="asg-module" label="Module" error={errors.module?.message}>
              <Controller
                control={control}
                name="module"
                render={({ field }) => (
                  <OptionSelect
                    id="asg-module"
                    value={field.value}
                    onChange={field.onChange}
                    options={moduleOptions(cohort.data.modules)}
                    placeholder="Choose a module"
                    invalid={!!errors.module}
                  />
                )}
              />
            </Field>
            <AssignmentBodyFields />
          </FormSection>

          {!isEdit && (
            <FormSection
              title="This cohort"
              description="Only this cohort's copy of the assignment."
            >
              <Field id="asg-due" label="Due date and time" hint="In your local time.">
                <Input id="asg-due" type="datetime-local" {...register("dueDate")} />
              </Field>
              <Controller
                control={control}
                name="notifyStudents"
                render={({ field }) => (
                  <ToggleRow
                    id="asg-notify"
                    label="Email the cohort"
                    description="Students always get an in-app notice; this adds an email."
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </FormSection>
          )}

          <FormError message={serverError} />
          <FormActions
            cancelHref={backHref}
            submitting={submitting}
            submitLabel={isEdit ? "Save changes" : "Create assignment"}
          />
        </form>
      </FormProvider>
    </AuthoringShell>
  );
}

/** The assignment's own fields — shared with the multi-cohort create.
 *  Reads the surrounding form via context (both forms extend the body). */
export function AssignmentBodyFields() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<AssignmentBodyValues>();
  return (
    <>
      <Field id="asg-title" label="Title" error={errors.title?.message}>
        <Input
          id="asg-title"
          placeholder="e.g. Bank marketing campaign analysis"
          aria-invalid={!!errors.title || undefined}
          {...register("title")}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="asg-type" label="Type">
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <OptionSelect
                id="asg-type"
                value={field.value}
                onChange={field.onChange}
                options={[...ASSIGNMENT_KINDS]}
                placeholder="Type"
              />
            )}
          />
        </Field>
        <Field id="asg-priority" label="Priority">
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <OptionSelect
                id="asg-priority"
                value={field.value}
                onChange={field.onChange}
                options={[...ASSIGNMENT_PRIORITIES]}
                placeholder="Priority"
              />
            )}
          />
        </Field>
        <Field id="asg-points" label="Total points" error={errors.totalPoints?.message}>
          <Input
            id="asg-points"
            inputMode="numeric"
            aria-invalid={!!errors.totalPoints || undefined}
            {...register("totalPoints")}
          />
        </Field>
      </div>
      <Field label="Brief (optional)" error={errors.description?.message}>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              maxLength={ASSIGNMENT_BRIEF_MAX}
              placeholder="A short summary shown next to the title."
            />
          )}
        />
      </Field>
      <Field label="Instructions (optional)" error={errors.instructions?.message}>
        <Controller
          control={control}
          name="instructions"
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              maxLength={ASSIGNMENT_BRIEF_MAX}
              placeholder="Steps, deliverables, rubric pointers."
            />
          )}
        />
      </Field>
      <Field
        label="Resource links (optional)"
        error={errors.links?.message ?? errors.links?.root?.message}
      >
        <Controller
          control={control}
          name="links"
          render={({ field }) => (
            <LinkRowsInput
              value={field.value}
              onChange={field.onChange}
              hint="Datasets, starter notebooks, reference docs."
            />
          )}
        />
      </Field>
      <div className="space-y-4">
        <Controller
          control={control}
          name="allowLateSubmission"
          render={({ field }) => (
            <ToggleRow
              id="asg-late"
              label="Accept late submissions"
              description="Late work is flagged for you instead of being blocked."
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="isPublished"
          render={({ field }) => (
            <ToggleRow
              id="asg-published"
              label="Published"
              description="Unpublished assignments stay hidden from students everywhere."
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>
    </>
  );
}
