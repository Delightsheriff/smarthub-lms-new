"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Area } from "react-easy-crop";
import { getCroppedFile } from "@/lib/crop-image";
import { uploadSizeError } from "@/lib/utils";
import { useUpdateScholarshipPhoto } from "../api/tech-scholarship.queries";

/**
 * Pick → crop → upload state shared by the photo gate and the share
 * dialog. Holds the object URL of the picked file (revoked when replaced,
 * cleared or unmounted) and runs the crop + upload + persist on confirm.
 * The caller owns the hidden `<input type="file">` and wires
 * `onFileChange` to it.
 */
export function usePickedPhoto({ onSaved }: { onSaved?: () => void } = {}) {
  const [pickedSrc, setPickedSrc] = useState<string | null>(null);
  const srcRef = useRef<string | null>(null);
  const upload = useUpdateScholarshipPhoto();

  const replaceSrc = (next: string | null) => {
    if (srcRef.current) URL.revokeObjectURL(srcRef.current);
    srcRef.current = next;
    setPickedSrc(next);
  };

  useEffect(
    () => () => {
      if (srcRef.current) URL.revokeObjectURL(srcRef.current);
    },
    [],
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image.");
      return;
    }
    const sizeError = uploadSizeError(file);
    if (sizeError) {
      toast.error(sizeError);
      return;
    }
    replaceSrc(URL.createObjectURL(file));
  };

  const confirm = async (area: Area) => {
    if (!pickedSrc) return;
    try {
      const file = await getCroppedFile(pickedSrc, area, "scholarship-photo.jpg");
      await upload.mutateAsync(file);
      replaceSrc(null);
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  return {
    pickedSrc,
    busy: upload.isPending,
    onFileChange,
    clear: () => replaceSrc(null),
    confirm,
  };
}
