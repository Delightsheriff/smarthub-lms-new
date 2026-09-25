"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Eye, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkRowsInput, cleanLinkRows } from "@/components/ui/link-rows-input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { MaterialPreviewDialog } from "@/modules/learning/components/material-preview-dialog";
import { formatFileSize, uploadSizeError } from "@/lib/utils";
import {
  useCreateTeachingMaterial,
  useTeachingCohortDetail,
  useTeachingMaterial,
  useUpdateTeachingMaterial,
} from "../api/teaching.queries";
import { useUploadMaterialFile } from "../api/upload";
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
  errorText,
  isRichTextEmpty,
  moduleOptions,
} from "./authoring/authoring-kit";

const CATEGORIES = [
  { value: "guide", label: "Guide" },
  { value: "presentation", label: "Presentation" },
  { value: "exercise", label: "Exercise" },
  { value: "reference", label: "Reference" },
] as const;

const SOURCES = [
  { value: "link", label: "Link — a hosted file URL" },
  { value: "upload", label: "Upload — send a file to our storage" },
  { value: "instructions", label: "Instructions only — a written guide" },
] as const;

type SourceMode = (typeof SOURCES)[number]["value"];

const schema = z
  .object({
    module: z.string().min(1, "Pick a module"),
    title: z.string().trim().min(3, "Title is required").max(200),
    category: z.enum(["guide", "presentation", "exercise", "reference"]),
    sourceMode: z.enum(["link", "upload", "instructions"]),
    fileUrl: z.string(),
    links: z.array(z.object({ name: z.string().max(80), url: z.string() })),
    fileType: z.string(),
    fileSize: z.number().optional(),
    description: z.string().max(20000, "Cannot exceed 20,000 characters"),
    isPublic: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.sourceMode === "link") {
      const rows = v.links.filter((l) => l.url.trim());
      if (!rows.length) {
        ctx.addIssue({ code: "custom", path: ["links"], message: "Add at least one link" });
      } else if (rows.some((l) => !/^https?:\/\//.test(l.url.trim()))) {
        ctx.addIssue({
          code: "custom",
          path: ["links"],
          message: "Every link must start with https://",
        });
      }
    } else if (v.sourceMode === "upload" && !v.fileUrl) {
      ctx.addIssue({
        code: "custom",
        path: ["fileUrl"],
        message: "Upload a file, or switch to Link or Instructions",
      });
    } else if (v.sourceMode === "instructions" && isRichTextEmpty(v.description)) {
      ctx.addIssue({
        code: "custom",
        path: ["description"],
        message: "Write the guide, or switch to Link or Upload",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  module: "",
  title: "",
  category: "reference",
  sourceMode: "link",
  fileUrl: "",
  links: [{ name: "", url: "" }],
  fileType: "",
  fileSize: undefined,
  description: "",
  isPublic: true,
};

/**
 * Create / edit a cohort material. Three sources: a hosted link, an
 * uploaded file (Cloudinary via `/lms/uploads/material`), or a written
 * guide. The rich-text description rides along in every mode — as the
 * body in "instructions", as supplementary notes otherwise.
 */
export function MaterialForm({
  scheduleId,
  materialId,
}: {
  scheduleId: string;
  materialId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!materialId;
  const cohortHref = `/teach/cohorts/${scheduleId}?tab=modules`;

  const cohort = useTeachingCohortDetail(scheduleId);
  const existing = useTeachingMaterial(materialId);
  const create = useCreateTeachingMaterial();
  const update = useUpdateTeachingMaterial(materialId || "");
  const upload = useUploadMaterialFile();
  const [serverError, setServerError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...EMPTY, module: searchParams.get("module") ?? "" },
  });

  const [sourceMode, fileUrl, fileType, fileSize, title] = useWatch({
    control,
    name: ["sourceMode", "fileUrl", "fileType", "fileSize", "title"],
  });

  // Edit prefill — pick the source mode from what's stored.
  useEffect(() => {
    const m = existing.data;
    if (!m) return;
    const mode: SourceMode = m.fileUrl || m.links?.length
      ? "link"
      : m.description
        ? "instructions"
        : "link";
    reset({
      module: refId(m.module) ?? "",
      title: m.title ?? "",
      category: (CATEGORIES.some((c) => c.value === m.category)
        ? m.category
        : "reference") as FormValues["category"],
      sourceMode: mode,
      fileUrl: m.fileUrl ?? "",
      links: m.links?.length
        ? m.links
        : m.fileUrl
          ? [{ name: "Link 1", url: m.fileUrl }]
          : [{ name: "", url: "" }],
      fileType: m.fileType ?? "",
      fileSize: m.fileSize,
      description: m.description ?? "",
      isPublic: m.isPublic ?? true,
    });
  }, [existing.data, reset]);

  const onPickFile = async (file: File) => {
    setServerError(null);
    const tooBig = uploadSizeError(file);
    if (tooBig) {
      setServerError(`${tooBig} Host it externally and use Link instead.`);
      return;
    }
    try {
      const r = await upload.mutateAsync(file);
      setValue("fileUrl", r.url, { shouldValidate: true });
      setValue("fileType", r.mime || r.extension || file.type);
      setValue("fileSize", r.size ?? file.size);
      toast.success("File uploaded");
    } catch (err) {
      setServerError(
        errorText(err, "Upload failed. Check the file type and size, then try again."),
      );
    }
  };

  const clearUpload = () => {
    setValue("fileUrl", "", { shouldValidate: true });
    setValue("fileType", "");
    setValue("fileSize", undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (v: FormValues) => {
    setServerError(null);
    const usesSource = v.sourceMode !== "instructions";
    // Link mode owns the list; upload mode contributes its one file. The
    // API derives `fileUrl` from links[0].
    const links = !usesSource
      ? []
      : v.sourceMode === "upload"
        ? [{ name: "", url: v.fileUrl }]
        : cleanLinkRows(v.links);
    const payload = {
      title: v.title.trim(),
      category: v.category,
      module: v.module,
      links,
      fileType: usesSource && v.fileType ? v.fileType : undefined,
      fileSize: usesSource && v.fileSize ? v.fileSize : undefined,
      description: isRichTextEmpty(v.description) ? undefined : v.description,
      isPublic: v.isPublic,
    };
    try {
      if (isEdit) {
        await update.mutateAsync(payload);
        toast.success("Material updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Material added");
      }
      router.replace(cohortHref);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Could not save the material. Please try again.",
      );
    }
  };

  // Off-screen field errors on mobile would make Save look dead.
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
        message="Couldn't load this material."
        backHref={cohortHref}
        onRetry={() => existing.refetch()}
      />
    );
  }

  const submitting = create.isPending || update.isPending;
  const uploading = upload.isPending;

  return (
    <AuthoringShell
      backHref={cohortHref}
      backLabel={`Back to ${cohort.data.course.name}`}
      title={isEdit ? "Edit material" : "Add material"}
      description="Link a hosted file, upload one, or write a guide with links inline — any combination works."
    >
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-8">
        <FormSection title="Basics">
          <Field id="material-module" label="Module" error={errors.module?.message}>
            <Controller
              control={control}
              name="module"
              render={({ field }) => (
                <OptionSelect
                  id="material-module"
                  value={field.value}
                  onChange={field.onChange}
                  options={moduleOptions(cohort.data.modules)}
                  placeholder="Choose a module"
                  invalid={!!errors.module}
                />
              )}
            />
          </Field>
          <Field id="material-title" label="Title" error={errors.title?.message}>
            <Input
              id="material-title"
              placeholder="e.g. Environment setup: Python + Anaconda"
              aria-invalid={!!errors.title || undefined}
              {...register("title")}
            />
          </Field>
          <Field id="material-category" label="Category">
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <OptionSelect
                  id="material-category"
                  value={field.value}
                  onChange={field.onChange}
                  options={[...CATEGORIES]}
                  placeholder="Choose a category"
                />
              )}
            />
          </Field>
        </FormSection>

        <FormSection title="Source" description="Where students get the material from.">
          <Field id="material-source" label="Source">
            <Controller
              control={control}
              name="sourceMode"
              render={({ field }) => (
                <OptionSelect
                  id="material-source"
                  value={field.value}
                  onChange={field.onChange}
                  options={[...SOURCES]}
                  placeholder="Choose a source"
                />
              )}
            />
          </Field>

          {sourceMode === "link" && (
            <>
              <Field label="Links" error={errors.links?.message ?? errors.links?.root?.message}>
                <Controller
                  control={control}
                  name="links"
                  render={({ field }) => (
                    <LinkRowsInput
                      value={field.value}
                      onChange={field.onChange}
                      hint="Students see each link by its name."
                    />
                  )}
                />
              </Field>
              <Field
                id="material-filetype"
                label="File type (optional)"
                hint="Shown to students next to the link, e.g. pdf, ipynb, zip."
              >
                <Input id="material-filetype" placeholder="pdf" {...register("fileType")} />
              </Field>
            </>
          )}

          {sourceMode === "upload" && (
            <Field label="File" error={errors.fileUrl?.message}>
              {fileUrl ? (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    File uploaded
                    {fileSize ? (
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {formatFileSize(fileSize)}
                      </span>
                    ) : null}
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                    Preview
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={clearUpload}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border px-4 py-5">
                  <p className="text-xs text-muted-foreground">
                    Documents (PDF, slides, sheets, notebooks, zip) up to 10 MB;
                    video, audio and images up to 25 MB. Larger? Host it and use Link.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Upload className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {uploading ? "Uploading…" : "Choose file"}
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onPickFile(f);
                }}
              />
            </Field>
          )}
        </FormSection>

        <FormSection
          title={sourceMode === "instructions" ? "Guide" : "Notes (optional)"}
          description={
            sourceMode === "instructions"
              ? "This is what students read. Use the toolbar for lists, bold and links."
              : "Context or supplementary notes shown next to the file."
          }
        >
          <Field label={sourceMode === "instructions" ? "Guide" : "Notes"} error={errors.description?.message}>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={20000}
                  placeholder={
                    sourceMode === "instructions"
                      ? "Write the steps…"
                      : "Add context (optional)…"
                  }
                />
              )}
            />
          </Field>
          <Controller
            control={control}
            name="isPublic"
            render={({ field }) => (
              <ToggleRow
                id="material-public"
                label="Visible to every enrolled student"
                description="Turn off to keep it as a draft only instructors can see."
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </FormSection>

        <FormError message={serverError} />
        <FormActions
          cancelHref={cohortHref}
          submitting={submitting}
          disabled={uploading}
          submitLabel={isEdit ? "Save changes" : "Add material"}
        />
      </form>

      {fileUrl && (
        <MaterialPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          title={title || "Preview"}
          url={fileUrl}
          fileType={fileType}
        />
      )}
    </AuthoringShell>
  );
}
