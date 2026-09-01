import { Suspense } from "react";
import { AcceptInvitationPageContent } from "@/modules/auth/components/AcceptInvitationPageContent";

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AcceptInvitationPageContent />
    </Suspense>
  );
}
