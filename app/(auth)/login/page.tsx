import { Suspense } from "react";
import { LoginPageContent } from "@/modules/auth/components/LoginPageContent";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-80" />}>
      <LoginPageContent />
    </Suspense>
  );
}
