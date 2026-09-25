"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, FormProvider, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, pluralize } from "@/lib/utils";
import {
  TEACHING_QUERY_KEYS,
  useAttachAssignmentToSchedule,
  useCreateTeachingAssignment,
  useInstructorModules,
} from "../api/teaching.queries";
import { teachingService } from "../api/teaching.service";
import { AssignmentBodyFields } from "./AssignmentForm";
import {
  AuthoringLoadError,
  AuthoringShell,
  AuthoringSkeleton,
  Field,
  FormActions,
  FormError,
  FormSection,
  OptionSelect,
} from "./authoring/authoring-kit";
import { assignmentBodySchema, toAssignmentPayload } from "./authoring/assignment-body";
import { isFutureLocalInput } from "./authoring/datetime-local";

const BACK_HREF = "/assignments";

const schema = assignmentBodySchema.extend({
  moduleId: z.string().min(1, "Pick a module"),
  cohortIds: z.array(z.string()).min(1, "Pick at least one cohort"),
  dueDate: z.string().refine((v) => isFutureLocalInput(v), "Set a due date in the future"),
});

type FormValues = z.infer<typeof schema>;

/**
 * Create one assignment and attach it to several cohorts at once (the
 * instructor Tasks entry point). Module gates which cohorts appear.
 * Attaches run in parallel with allSettled, so one failed cohort is
 * reported without hiding the ones that succeeded.
 */
export function CreateAssignmentMultiCohort() {
  const router = useRouter();
  const qc = useQueryClient();
  const modulesQ = useInstructorModules();
  const create = useCreateTeachingAssignment();
  const attach = useAttachAssignmentToSchedule();
  const [serverError, setServerError] = useState<string | null>(null);
  const [slackFor, setSlackFor] = useState<Set<string>>(new Set());

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      moduleId: "",
      cohortIds: [],
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
    },
  });
  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;
  const [moduleId, cohortIds] = useWatch({ control, name: ["moduleId", "cohortIds"] });

  const modules = useMemo(() => modulesQ.data ?? [], [modulesQ.data]);
  const activeModule = modules.find((m) => m.id === moduleId) ?? null;

  // Probe Slack for every cohort on the module so each row's toggle is
  // right from first render. Slack config rarely changes mid-form.
  const moduleCohortIds = useMemo(
    () => activeModule?.cohorts.map((c) => c.scheduleId) ?? [],
    [activeModule],
  );
  const slackQueries = useQueries({
    queries: moduleCohortIds.map((id) => ({
      queryKey: TEACHING_QUERY_KEYS.cohortSlackStatus(id),
      queryFn: () => teachingService.getCohortSlackStatus(id),
      staleTime: 5 * 60 * 1000,
    })),
  });
  const slackById = new Map(moduleCohortIds.map((id, i) => [id, slackQueries[i]?.data]));

  const groups = useMemo(() => {
    if (!activeModule) return [];
    const byCourse = new Map<string, { name: string; cohorts: typeof activeModule.cohorts }>();
    for (const c of activeModule.cohorts) {
      const g = byCourse.get(c.courseId) ?? { name: c.courseName || "Course", cohorts: [] };
      g.cohorts.push(c);
      byCourse.set(c.courseId, g);
    }
    return [...byCourse.entries()].map(([courseId, g]) => ({ courseId, ...g }));
  }, [activeModule]);

  const setCohorts = (ids: string[]) =>
    setValue("cohortIds", ids, { shouldValidate: form.formState.isSubmitted });

  const toggleCohort = (id: string) =>
    setCohorts(cohortIds.includes(id) ? cohortIds.filter((x) => x !== id) : [...cohortIds, id]);

  const toggleCourse = (ids: string[]) => {
    const allOn = ids.every((id) => cohortIds.includes(id));
    setCohorts(
      allOn
        ? cohortIds.filter((id) => !ids.includes(id))
        : [...new Set([...cohortIds, ...ids])],
    );
  };

  const toggleSlack = (id: string) =>
    setSlackFor((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onSubmit = async (v: FormValues) => {
    setServerError(null);
    try {
      const created = await create.mutateAsync({
        ...toAssignmentPayload(v),
        module: v.moduleId,
      });
      const dueDate = new Date(v.dueDate).toISOString();
      const results = await Promise.allSettled(
        v.cohortIds.map((scheduleId) =>
          attach.mutateAsync({
            assignmentId: created._id,
            scheduleId,
            payload: {
              dueDate,
              allowLateSubmission: v.allowLateSubmission,
              notifySlack: slackFor.has(scheduleId) && !!slackById.get(scheduleId)?.connected,
            },
          }),
        ),
      );
      const ok = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.length - ok;
      qc.invalidateQueries({ queryKey: TEACHING_QUERY_KEYS.myAssignments });

      if (ok === 0) {
        setServerError(
          "The assignment was created, but attaching it to the cohorts failed. Attach it from each cohort's page.",
        );
        return;
      }
      if (failed === 0) {
        toast.success(`Assignment shared with ${pluralize(ok, "cohort")}`);
      } else {
        toast.warning(
          `Shared with ${ok} of ${results.length} cohorts. Attach the rest from their cohort pages.`,
        );
      }
      router.replace(BACK_HREF);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Could not create the assignment. Please try again.",
      );
    }
  };

  const onInvalid = (errs: FieldErrors<FormValues>) => {
    const first = Object.values(errs).find((e) => e?.message)?.message;
    toast.error(typeof first === "string" ? first : "Please fix the highlighted fields.");
  };

  if (modulesQ.isLoading) return <AuthoringSkeleton />;
  if (modulesQ.isError) {
    return (
      <AuthoringLoadError
        message="Couldn't load your modules."
        backHref={BACK_HREF}
        onRetry={() => modulesQ.refetch()}
      />
    );
  }
  if (!modules.length) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <EmptyState
          icon={ClipboardList}
          title="No modules to add to yet"
          description="The create form appears once you're assigned to a cohort that has at least one module."
        />
      </div>
    );
  }

  const submitting = create.isPending || attach.isPending;

  return (
    <AuthoringShell
      backHref={BACK_HREF}
      backLabel="Back to tasks"
      title="New assignment"
      description="Pick a module, choose which of your cohorts get it, and fill in the details. One save creates it everywhere."
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-8">
          <FormSection title="Where it goes">
            <Field id="multi-module" label="Module" error={errors.moduleId?.message}>
              <Controller
                control={control}
                name="moduleId"
                render={({ field }) => (
                  <OptionSelect
                    id="multi-module"
                    value={field.value}
                    onChange={(v) => {
                      field.onChange(v);
                      setCohorts([]);
                      setSlackFor(new Set());
                    }}
                    options={modules.map((m) => ({
                      value: m.id,
                      label: `${m.title} (${pluralize(m.cohorts.length, "cohort")})`,
                    }))}
                    placeholder="Pick a module"
                    invalid={!!errors.moduleId}
                  />
                )}
              />
            </Field>

            {activeModule && (
              <fieldset className="space-y-4">
                <legend className="text-sm font-medium">Cohorts</legend>
                {groups.map((g) => {
                  const ids = g.cohorts.map((c) => c.scheduleId);
                  const allOn = ids.every((id) => cohortIds.includes(id));
                  return (
                    <div key={g.courseId} className="space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {g.name}
                        </p>
                        {ids.length > 1 && (
                          <button
                            type="button"
                            className="text-xs font-medium text-primary hover:underline"
                            onClick={() => toggleCourse(ids)}
                          >
                            {allOn ? "Clear all" : "Select all"}
                          </button>
                        )}
                      </div>
                      <ul className="divide-y divide-border border-y border-border">
                        {g.cohorts.map((c) => {
                          const checked = cohortIds.includes(c.scheduleId);
                          const slack = slackById.get(c.scheduleId);
                          const cbId = `cohort-${c.scheduleId}`;
                          return (
                            <li key={c.scheduleId} className="flex flex-wrap items-center gap-3 py-2.5">
                              <Checkbox
                                id={cbId}
                                checked={checked}
                                onCheckedChange={() => toggleCohort(c.scheduleId)}
                              />
                              <Label htmlFor={cbId} className="min-w-0 flex-1 cursor-pointer font-normal">
                                {c.scheduleName ||
                                  (c.startDate ? `Starts ${formatDate(c.startDate)}` : "Cohort")}
                              </Label>
                              {checked && slack?.connected && (
                                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Checkbox
                                    checked={slackFor.has(c.scheduleId)}
                                    onCheckedChange={() => toggleSlack(c.scheduleId)}
                                    aria-label={`Post to Slack #${slack.channelName ?? "channel"}`}
                                  />
                                  Post to #{slack.channelName ?? "Slack"}
                                </label>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
                {errors.cohortIds?.message && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.cohortIds.message}
                  </p>
                )}
              </fieldset>
            )}

            <Field
              id="multi-due"
              label="Due date and time"
              hint="The same due date for every cohort. Adjust per cohort afterwards if needed."
              error={errors.dueDate?.message}
            >
              <Input
                id="multi-due"
                type="datetime-local"
                aria-invalid={!!errors.dueDate || undefined}
                {...register("dueDate")}
              />
            </Field>
          </FormSection>

          <FormSection title="The assignment">
            <AssignmentBodyFields />
          </FormSection>

          <FormError message={serverError} />
          <FormActions
            cancelHref={BACK_HREF}
            submitting={submitting}
            submitLabel={
              cohortIds.length > 1
                ? `Create for ${pluralize(cohortIds.length, "cohort")}`
                : "Create assignment"
            }
          />
        </form>
      </FormProvider>
    </AuthoringShell>
  );
}
