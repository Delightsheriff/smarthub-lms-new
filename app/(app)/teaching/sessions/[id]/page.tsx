import { use } from "react";
import { ClassSessionAttendancePage } from "@/modules/teaching/components/ClassSessionAttendancePage";

interface AttendanceSessionPageProps {
  params: Promise<{ id: string }>;
}

export default function AttendanceSessionPage({ params }: AttendanceSessionPageProps) {
  const { id } = use(params);
  return <ClassSessionAttendancePage sessionId={id} />;
}
