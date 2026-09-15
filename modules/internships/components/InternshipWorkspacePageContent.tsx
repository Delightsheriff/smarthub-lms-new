"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CircleDot,
  FileCheck2,
  FlaskConical,
  Mail,
  Send,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import {
  useCreateInternshipCheckIn,
  useInternshipWorkspace,
  useUpdateInternshipTask,
} from "../api/internships.queries";
import type {
  ApiInternshipTask,
} from "../types/api.types";
import type {
  InternshipCheckInInput,
  InternshipTaskUpdateInput,
} from "../types";

const TASK_STATUS_STYLES: Record<ApiInternshipTask["status"], string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-warning/10 text-warning",
  submitted: "bg-info/10 text-info",
  done: "bg-success/10 text-success",
};

export function InternshipWorkspacePageContent() {
  const { data, isLoading, isError } = useInternshipWorkspace();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={BriefcaseBusiness}
        title="No internship placement yet"
        description="Once you're accepted into the internship program, your workspace shows up here with your tasks, milestones and mentor."
        action={
          <Button render={<Link href="/dashboard" />}>
            Back to dashboard
          </Button>
        }
      />
    );
  }

  if (isError) return null;

  const { internship, tasks, checkIns, progressPercent } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Internship workspace"
        description={`${internship.product.name} · started ${formatDate(internship.startDate)}`}
      />

      <Card className="p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Placement progress
            </p>
            <p className="text-sm font-semibold mt-1 tabular-nums">
              {progressPercent}% of the program completed
            </p>
          </div>
          <Badge variant="outline" className="normal-case">
            {internship.status}
          </Badge>
        </div>
        <Progress value={progressPercent} className="mt-4 gap-3">
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <PlacementSummaryCard
          title="Mentor"
          detail={internship.mentor.name}
          sub={internship.mentor.title}
          icon={<UserRound className="h-4 w-4" />}
        />
        <PlacementSummaryCard
          title="Mentor contact"
          detail={internship.mentor.email}
          icon={<Mail className="h-4 w-4" />}
        />
        <PlacementSummaryCard
          title="Placement window"
          detail={`${formatDate(internship.startDate)} – ${formatDate(internship.endDate)}`}
          icon={<CalendarDays className="h-4 w-4" />}
        />
      </div>

      <TaskListSection tasks={tasks} />

      <CheckInsSection checkIns={checkIns} />
    </div>
  );
}

function PlacementSummaryCard({
  title,
  detail,
  sub,
  icon,
}: {
  title: string;
  detail?: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1.5">
        <span className="text-primary">{icon}</span>
        {title}
      </p>
      <p className="mt-1 text-sm font-semibold truncate">{detail || "—"}</p>
      {sub && (
        <p className="text-xs text-muted-foreground truncate mt-0.5">{sub}</p>
      )}
    </Card>
  );
}

function TaskListSection({ tasks }: { tasks: ApiInternshipTask[] }) {
  if (tasks.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="font-semibold">Tasks</h2>
      <Card className="p-0 divide-y">
        {tasks.map((task) => (
          <TaskRow key={task._id} task={task} />
        ))}
      </Card>
    </section>
  );
}

function TaskRow({ task }: { task: ApiInternshipTask }) {
  const mutation = useUpdateInternshipTask();
  const [submitOpen, setSubmitOpen] = useState(false);

  const progress = (input: InternshipTaskUpdateInput) => {
    mutation.mutate({ taskId: task._id, ...input });
  };

  return (
    <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <span
        className={
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " +
          (task.status === "done"
            ? "bg-success/10 text-success"
            : task.status === "submitted"
              ? "bg-info/10 text-info"
              : "bg-primary/10 text-primary")
        }
      >
        {task.status === "done" ? (
          <FileCheck2 className="h-4 w-4" />
        ) : (
          <FlaskConical className="h-4 w-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight">{task.title}</p>
        {task.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
            {task.description}
          </p>
        )}
        {task.dueDate && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Due {formatDate(task.dueDate)}
          </p>
        )}
      </div>
      <Badge variant="outline" className={"normal-case " + TASK_STATUS_STYLES[task.status]}>
        {task.status.replace("_", " ")}
      </Badge>
      {task.status === "todo" && (
        <Button
          size="sm"
          variant="outline"
          disabled={mutation.isPending}
          onClick={() => progress({ status: "in_progress" })}
        >
          Start
        </Button>
      )}
      {task.status === "in_progress" && (
        <Button
          size="sm"
          disabled={mutation.isPending}
          onClick={() => setSubmitOpen(true)}
        >
          Submit
        </Button>
      )}
      {task.status === "submitted" && task.submissionUrl && (
        <Button
          size="sm"
          variant="outline"
          render={<a href={task.submissionUrl} target="_blank" rel="noreferrer" />}
        >
          <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />
          View
        </Button>
      )}
      {task.status === "done" && task.reviewNotes && (
        <p className="text-xs text-muted-foreground max-w-xs truncate">
          {task.reviewNotes}
        </p>
      )}

      {task.status === "in_progress" && (
        <SubmitTaskDialog
          open={submitOpen}
          onOpenChange={setSubmitOpen}
          onSubmit={progress}
          pending={mutation.isPending}
        />
      )}
    </div>
  );
}

function SubmitTaskDialog({
  open,
  onOpenChange,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: InternshipTaskUpdateInput) => void;
  pending: boolean;
}) {
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [note, setNote] = useState("");

  const submit = () => {
    onSubmit({
      status: "submitted",
      submissionUrl: submissionUrl.trim() || undefined,
      submissionNote: note.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit task</DialogTitle>
          <DialogDescription>
            Paste the link to your work, then add a short note if helpful.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="submission-url" className="text-sm font-medium">
              Work link
            </label>
            <Input
              id="submission-url"
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="submission-note" className="text-sm font-medium">
              Note (optional)
            </label>
            <Textarea
              id="submission-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="What did you change since the draft?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending || !submissionUrl.trim()}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CheckInsSection({
  checkIns,
}: {
  checkIns: Array<{
    _id: string;
    weekOf?: string;
    summary: string;
    blockers?: string;
    hoursLogged?: number;
    submittedAt?: string;
    mentorFeedback?: string;
  }>;
}) {
  const [open, setOpen] = useState(false);
  const mutation = useCreateInternshipCheckIn();

  const submit = (input: InternshipCheckInInput) => {
    mutation.mutate(input);
    setOpen(false);
  };

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="font-semibold">Check-ins</h2>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Send className="h-3.5 w-3.5 mr-1.5" />
          New check-in
        </Button>
      </header>

      {checkIns.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          No check-ins yet this placement.
        </Card>
      ) : (
        <Card className="p-0 divide-y">
          {checkIns.map((ci) => (
            <div key={ci._id} className="p-4 gap-3 flex flex-col sm:flex-row sm:items-start">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CircleDot className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <p className="text-sm font-semibold">
                    {ci.weekOf || "Weekly check-in"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ci.submittedAt ? formatDate(ci.submittedAt) : ""}
                    {ci.hoursLogged ? ` · ${ci.hoursLogged}h logged` : ""}
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{ci.summary}</p>
                {ci.blockers && (
                  <p className="mt-1 text-xs text-warning">
                    Blockers: {ci.blockers}
                  </p>
                )}
                {ci.mentorFeedback && (
                  <p className="mt-2 rounded-lg bg-accent/50 px-3 py-2 text-sm">
                    <span className="font-semibold">Mentor: </span>
                    {ci.mentorFeedback}
                  </p>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      <CheckInDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={submit}
        pending={mutation.isPending}
      />
    </section>
  );
}

function CheckInDialog({
  open,
  onOpenChange,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: InternshipCheckInInput) => void;
  pending: boolean;
}) {
  const [weekOf, setWeekOf] = useState("");
  const [summary, setSummary] = useState("");
  const [blockers, setBlockers] = useState("");
  const [hoursLogged, setHoursLogged] = useState("");

  const submit = () => {
    onSubmit({
      weekOf: weekOf.trim(),
      summary: summary.trim(),
      blockers: blockers.trim() || undefined,
      hoursLogged: hoursLogged ? Number(hoursLogged) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New check-in</DialogTitle>
          <DialogDescription>
            Note your progress so your mentor can review it before class.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="week-of" className="text-sm font-medium">
              Week covering
            </label>
            <Input
              id="week-of"
              value={weekOf}
              onChange={(e) => setWeekOf(e.target.value)}
              placeholder="Week 3 — e.g. 1–7 September"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="checkin-summary" className="text-sm font-medium">
              What did you do this week?
            </label>
            <Textarea
              id="checkin-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder="Tasks delivered, classes attended, blockers…"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="hours-logged" className="text-sm font-medium">
                Hours logged
              </label>
              <Input
                id="hours-logged"
                type="number"
                min={0}
                value={hoursLogged}
                onChange={(e) => setHoursLogged(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="checkin-blockers" className="text-sm font-medium">
                Blockers
              </label>
              <Input
                id="checkin-blockers"
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                placeholder="None"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={pending || !weekOf.trim() || !summary.trim()}
          >
            Send check-in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}