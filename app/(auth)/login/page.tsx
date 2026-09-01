import { Suspense } from "react";
import { LoginPageContent } from "@/modules/auth/components/LoginPageContent";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginPageContent />
    </Suspense>
  );
}
