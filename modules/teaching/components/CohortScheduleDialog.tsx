"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/utils";
import { useCohortSlackStatus, useUpdateAssignmentSchedule } from "../api/teaching.queries";
import { ToggleRow, errorText } from "./authoring/authoring-kit";
import {
  addDaysToLocalInput,
  isFutureLocalInput,
  isoToLocalInput,
} from "./authoring/datetime-local";

export interface CohortScheduleTarget {
  assignmentId: string;
  title: string;
  dueDate?: string;
  allowLateSubmission?: boolean;
}

/**
 * Edit one cohort's copy of an assignment: due date (with quick
 * extensions), whether late work is accepted, and an optional Slack
 * post about the change. Other cohorts are untouched. Merges legacy's
 * EditCohortDueDateDialog and EditCohortAssignmentScheduleDialog.
 */
export function CohortScheduleDialog({
  scheduleId,
  target,
  onOpenChange,
}: {
  scheduleId: string;
  /** Null closes the dialog. */
  target: CohortScheduleTarget | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Keyed so each open starts from that assignment's saved values. */}
        {target && (
          <ScheduleForm
            key={target.assignmentId}
            scheduleId={scheduleId}
            target={target}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ScheduleForm({
  scheduleId,
  target,
  onDone,
}: {
  scheduleId: string;
  target: CohortScheduleTarget;
  onDone: () => void;
}) {
  const update = useUpdateAssignmentSchedule(scheduleId);
  const slack = useCohortSlackStatus(scheduleId);
  const initialDue = isoToLocalInput(target.dueDate);
  const initialLate = !!target.allowLateSubmission;
  const [dueDate, setDueDate] = useState(initialDue);
  const [allowLate, setAllowLate] = useState(initialLate);
  const [notifySlack, setNotifySlack] = useState(false);

  const dueChanged = dueDate !== initialDue;
  const changed = dueChanged || allowLate !== initialLate;
  const slackConnected = !!slack.data?.connected;

  const save = async () => {
    if (!isFutureLocalInput(dueDate)) {
      toast.error("Pick a due date in the future.");
      return;
    }
    try {
      await update.mutateAsync({
        assignmentId: target.assignmentId,
        patch: {
          dueDate: new Date(dueDate).toISOString(),
          allowLateSubmission: allowLate,
          notifySlack: notifySlack && slackConnected && dueChanged,
        },
      });
      toast.success("Cohort settings updated");
      onDone();
    } catch (err) {
      toast.error(errorText(err, "Couldn't update the due date."));
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Due date and late work</DialogTitle>
        <DialogDescription>
          For <span className="font-medium text-foreground">{target.title}</span>{" "}
          in this cohort only. Other cohorts aren&apos;t affected.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5">
        <p className="text-xs text-muted-foreground">
          Currently due{" "}
          <span className="font-mono text-foreground">
            {target.dueDate ? formatDateTime(target.dueDate) : "— not set"}
          </span>
        </p>
        <div className="space-y-2">
          <Label htmlFor="cohort-due">New due date</Label>
          <Input
            id="cohort-due"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {[1, 3, 7].map((days) => (
              <Button
                key={days}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDueDate(addDaysToLocalInput(initialDue, days))}
              >
                +{days} {days === 1 ? "day" : "days"}
              </Button>
            ))}
          </div>
        </div>
        <ToggleRow
          id="cohort-late"
          label="Accept late submissions"
          checked={allowLate}
          onCheckedChange={setAllowLate}
        />
        <ToggleRow
          id="cohort-slack"
          label={
            slackConnected
              ? `Post the new date to #${slack.data?.channelName ?? "Slack"}`
              : "Post to Slack"
          }
          description={
            slackConnected
              ? "Only sent when the due date changes."
              : "This cohort has no Slack channel connected."
          }
          checked={notifySlack && slackConnected}
          onCheckedChange={setNotifySlack}
          disabled={!slackConnected || !dueChanged}
        />
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onDone} disabled={update.isPending}>
          Cancel
        </Button>
        <Button onClick={save} disabled={update.isPending || !dueDate || !changed}>
          {update.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Save
        </Button>
      </DialogFooter>
    </>
  );
}
