import { redirect } from "next/navigation";

export default function ProfileSecurityPage() {
  redirect("/profile?tab=security");
}
