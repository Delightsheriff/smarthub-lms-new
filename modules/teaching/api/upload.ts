"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadFileDetailed, type UploadedFile } from "@/lib/api";
import { LMS_PREFIX } from "@/lib/api/constants";

export type { UploadedFile };

/** Instructor authoring uploads. The API relays the file to Cloudinary
 *  and returns the URL + metadata, so the form holds a ready `fileUrl`
 *  before the operator saves. */
export function uploadTeachingFile(
  file: File,
  kind: "material" | "assignment" = "material",
): Promise<UploadedFile> {
  return uploadFileDetailed(file, `${LMS_PREFIX}/uploads/${kind}`, {
    // Large media can outlive the 30s default on a slow uplink; the API
    // itself allows Cloudinary 120s.
    timeout: 150_000,
    // The form shows the failure inline.
    silent: true,
  });
}

export function useUploadMaterialFile() {
  return useMutation({
    mutationFn: (file: File) => uploadTeachingFile(file, "material"),
  });
}

export function useUploadAssignmentFile() {
  return useMutation({
    mutationFn: (file: File) => uploadTeachingFile(file, "assignment"),
  });
}
