import { use } from "react";
import { ResetPasswordForm } from "@/modules/auth/components/ResetPasswordForm";

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = use(params);
  return <ResetPasswordForm token={token} />;
}
