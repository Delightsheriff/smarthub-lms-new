import { describe, expect, it } from "vitest";
import { assignmentsService } from "@/modules/assignments/api/assignments.service";

describe("Submission Lifecycle Integration (Mock Seam)", () => {
  it("creates initial submission and handles resubmission versioning", async () => {
    const assignmentId = "asgn_test_lifecycle";

    // 1. Submit initial work
    const initialSubmission = await assignmentsService.createSubmission({
      assignmentId,
      submissionType: "url",
      externalUrl: "https://github.com/test/repo",
      notes: "Initial submission notes",
    });

    expect(initialSubmission).toBeDefined();
    expect(initialSubmission.assignment).toBe(assignmentId);
    expect(initialSubmission.version).toBe(1);
    expect(initialSubmission.status).toBe("submitted");
    expect(initialSubmission.externalUrl).toBe("https://github.com/test/repo");
    expect(initialSubmission.submissionHistory).toHaveLength(1);

    // 2. Fetch my submission for this assignment
    const fetched = await assignmentsService.getMySubmission(assignmentId);
    expect(fetched).toBeDefined();
    expect(fetched?._id).toBe(initialSubmission._id);

    // 3. Resubmit updated work
    const resubmitted = await assignmentsService.resubmit(initialSubmission._id, {
      assignmentId,
      submissionType: "url",
      externalUrl: "https://github.com/test/repo-v2",
      notes: "Resubmitted v2 notes",
    });

    expect(resubmitted.version).toBe(2);
    expect(resubmitted.status).toBe("resubmitted");
    expect(resubmitted.externalUrl).toBe("https://github.com/test/repo-v2");
    expect(resubmitted.previousVersionId).toBe(initialSubmission._id);
    expect(resubmitted.submissionHistory?.length).toBeGreaterThanOrEqual(2);
  });

  it("handles mock file upload", async () => {
    const mockFile = new File(["sample content"], "test-submission.pdf", {
      type: "application/pdf",
    });

    const upload = await assignmentsService.uploadAssignmentFile(mockFile);
    expect(upload.fileUrl).toContain("http");
    expect(upload.fileName).toBe("assignment-file.pdf");
    expect(upload.fileSize).toBeGreaterThan(0);
  });
});
