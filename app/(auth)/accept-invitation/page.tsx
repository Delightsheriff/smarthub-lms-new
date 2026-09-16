import { Suspense } from "react";
import { AcceptInvitationPageContent } from "@/modules/auth/components/AcceptInvitationPageContent";

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-80" />}>
      <AcceptInvitationPageContent />
    </Suspense>
  );
}
