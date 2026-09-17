# Plan 017 Validation Audit

The form pass cross-checked the current client against the legacy LMS and
the backend validators.

- Assignment submissions now enforce the legacy five-character text minimum,
  HTTP(S) URLs, and a 2,000-character notes limit. File type and size remain
  upload-service concerns because the backend limits vary by upload category.
- Grading now uses `PATCH /lms/teaching/submissions/:id/grade` and sends
  `generalFeedback`; score is bounded by the assignment total and feedback by
  2,000 characters.
- SIWES duration remains bounded to 1–12 months and now validates inline.
- Profile names and phone values now match backend length rules. Birthday
  editing remains absent from the current screen even though the legacy
  screen exposed it and the backend accepts `birthDay`/`birthMonth`.
- Internship payment references now match the backend 500-character limit.
- Attendance marking now uses the backend `PATCH /lms/class-sessions/:id/attendance`
  method contract; student history now includes the required cohort schedule ID.

The scholarship photo/caption surface remains an action-oriented share flow,
not a submitted backend form: the photo is validated by the shared upload
helper and the caption is only used to construct share links. Attendance PIN
rotation is likewise an action-only confirmation flow, so neither is forced
into RHF without user-entered request data.
