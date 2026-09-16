export interface RevokedEnrolment {
  courseId: string;
  courseName: string;
  revokedAt?: string;
  /** What the student was told at revoke time. Absent when the
   *  enrolment was deactivated by something other than a revocation,
   *  in which case the notice points at support instead of inventing
   *  a reason. */
  reasonText?: string;
  outstandingAmount?: number;
}

export interface AccessStatus {
  hasActiveEnrolment: boolean;
  revoked: RevokedEnrolment[];
}
