"use client";
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Bell,
  Briefcase,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Landmark,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Trophy,
  User as UserIcon,
} from "lucide-react";
import { EditProfileDetailsDialog } from "@/modules/profile/components/EditProfileDetailsDialog";
import { AvatarUploader } from "@/modules/profile/components/AvatarUploader";
import { ProfessionalTab } from "@/modules/profile/components/ProfessionalTab";
import { BankingTab } from "@/modules/profile/components/BankingTab";
import { AttendancePinSection } from "@/modules/profile/components/AttendancePinSection";
import { SiwesPlacementTab } from "@/modules/siwes-profile/components/SiwesPlacementTab";
import { ChangePasswordForm } from "@/modules/auth/components/ChangePasswordForm";
import { NotificationSettingsCard } from "@/modules/push/components/NotificationSettingsCard";
import { AchievementsList } from "@/modules/progress/components/AchievementsList";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/store/slices/authStore";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { cn, formatDate } from "@/lib/utils";

type SectionId =
  | "overview"
  | "professional"
  | "siwes"
  | "banking"
  | "notifications"
  | "achievements"
  | "security";

const SECTIONS: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: UserIcon },
  { id: "professional", label: "Professional", icon: Briefcase },
  { id: "siwes", label: "SIWES", icon: GraduationCap },
  { id: "banking", label: "Banking", icon: Landmark },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "security", label: "Security", icon: ShieldCheck },
];

/**
 * Profile / Settings surface — entity header up top, a persistent left
 * settings rail (solid active-state, like the main sidebar) driving a
 * single content pane. Replaces the old horizontal `TabsList`, which
 * wrapped onto 2-3 lines once "Professional" was in play.
 *
 * Client half of the route: reads `?tab=`, so it must live under a
 * `<Suspense>` boundary (the server `page.tsx` provides it) for the
 * static build.
 */
export default function ProfilePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [editOpen, setEditOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  // Professional details (job title / department / bio / etc.) are an
  // instructor concern — the fields exist on every User row but only
  // make sense for someone teaching. Hide the section for pure
  // students; show for instructors and dual-role users.
  const { mode } = useEffectiveMode();
  const showProfessional = mode !== "student";

  const sections = SECTIONS.filter((s) => s.id !== "professional" || showProfessional);

  // Honour `?tab=…` so deep-links from the dashboard pulse card (which
  // points at the achievements tab) land on the right section, and fall
  // back to overview if the tab is hidden (e.g. a student who lands on
  // `?tab=professional` from a stale link).
  const requestedTab = (searchParams.get("tab") as SectionId | null) || "overview";
  const initialTab = sections.some((s) => s.id === requestedTab) ? requestedTab : "overview";
  const [tab, setTab] = useState<SectionId>(initialTab);

  const handleTabChange = (value: SectionId) => {
    setTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "";
  const initial = (fullName || "?").slice(0, 1).toUpperCase();

  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        divider
        dateline={`${dateline} · Account Settings`}
        title="Profile & Settings"
        description={
          user?.createdAt ? (
            <>
              Manage your personal details, credentials, and security. Member since{" "}
              <strong className="text-foreground">{formatDate(user.createdAt)}</strong>.
            </>
          ) : (
            "Your details, credentials, security, and notification preferences."
          )
        }
        actions={
          tab === "overview" && (
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} className="rounded-xl">
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit details
            </Button>
          )
        }
      />

      {/* Identity card — always visible above the settings rail so the
          user always sees who they're editing. */}
      <Card className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center md:p-6">
        <AvatarUploader
          imageUrl={user?.imageUrl}
          initial={initial}
          size="xl"
          className="shrink-0"
        />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-lg font-semibold truncate">{fullName || "—"}</p>
            {user?.isVerified && (
              <span
                title="Email verified"
                className="inline-flex h-5 w-5 items-center justify-center text-success"
              >
                <CheckCircle2 className="h-4 w-4" />
              </span>
            )}
            {user?.isITStudent && (
              <span
                title={
                  user.itVerificationStatus === "approved"
                    ? "SIWES placement — verified"
                    : user.itVerificationStatus === "rejected"
                      ? "SIWES letter rejected — contact ops"
                      : "SIWES letter pending verification"
                }
                className="inline-flex items-center gap-1 rounded-full bg-warning/10 text-warning px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              >
                SIWES
                {user.siwesYear ? ` ${user.siwesYear}` : ""}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {user?.email}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
            {user?.studentCode && (
              <p className="text-xs font-mono tracking-wide text-muted-foreground">
                {user.studentCode}
              </p>
            )}
            {user?.createdAt && (
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Joined {formatDate(user.createdAt, "long")}
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Settings rail — solid active-state, same visual language as
            the main sidebar. Horizontally scrollable pill row on
            mobile, a persistent vertical rail from `lg` up. */}
        <nav
          aria-label="Profile sections"
          className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:w-52 lg:shrink-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {sections.map((section) => {
            const isActive = tab === section.id;
            return (
              <button
                key={section.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => handleTabChange(section.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors lg:w-full",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <section.icon className="h-4 w-4 shrink-0" />
                {section.label}
              </button>
            );
          })}
        </nav>

        {/* Content pane */}
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              {tab === "overview" && (
                <div className="space-y-6">
                  {/* Details — every populated field shows; null/missing
                      ones are silently dropped so an incomplete record
                      doesn't leave dashes everywhere. */}
                  <Card className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                    <CardHeader className="border-b border-border bg-muted/20 p-5">
                      <CardTitle className="flex items-center gap-2 text-base font-display">
                        <UserIcon className="h-4 w-4 text-primary" /> Personal details
                      </CardTitle>
                      <CardDescription>Your verified account credentials and identity.</CardDescription>
                    </CardHeader>
                    <div className="divide-y divide-border">
                    <Row icon={Mail} label="Email" value={user?.email} />
                    {/* Always shown, unlike the optional fields below —
                        every enrolled student has (or will have) a
                        Student ID, so hiding the row when it's not yet
                        assigned reads as "this app has no student ID
                        concept" rather than "not assigned yet". */}
                    <Row
                      icon={GraduationCap}
                      label="Student ID"
                      value={user?.studentCode || "Not assigned yet"}
                    />
                    {user?.phone && (
                      <Row icon={Phone} label="Phone" value={user.phone} />
                    )}
                    <Row
                      icon={UserIcon}
                      label="Gender"
                      value={
                        user?.gender || (
                          <span className="text-muted-foreground italic font-normal">
                            Not set
                          </span>
                        )
                      }
                    />
                    {(() => {
                      // country / state arrive as `{ isoCode, name }` from
                      // smarthub-api (or plain strings on legacy accounts).
                      // Normalise to a string before joining so the cell
                      // never ends up rendering "[object Object]".
                      const locName = (
                        v: { isoCode?: string; name?: string } | string | undefined,
                      ): string | undefined =>
                        !v ? undefined : typeof v === "string" ? v : v.name;
                      const parts = [
                        user?.city,
                        locName(user?.state),
                        locName(user?.country),
                      ].filter(Boolean);
                      if (parts.length === 0) return null;
                      return (
                        <Row icon={MapPin} label="Location" value={parts.join(", ")} />
                      );
                    })()}
                    {user?.address && (
                      <Row icon={MapPin} label="Address" value={user.address} />
                    )}
                    {/* Institution + department — read-only. Admin-editable
                        on the Student doc; students with corrections reach
                        out to ops. Hidden unless at least one is set so
                        non-SIWES profiles don't grow a stranded row. */}
                    {(user?.institution || user?.department) && (
                      <Row
                        icon={GraduationCap}
                        label="School"
                        value={
                          [user?.institution, user?.department]
                            .filter(Boolean)
                            .join(" · ") || undefined
                        }
                      />
                    )}
                    </div>
                  </Card>

                  <AttendancePinSection />

                  {/* Sign out — confirmation modal prevents accidental
                      session loss */}
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="outline"
                          className="w-full text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/40 hover:bg-destructive/5"
                        />
                      }
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sign out of SmartHub?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You&apos;ll need to sign back in to access your courses.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleLogout}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sign out
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}

              {tab === "professional" && showProfessional && (
                <ProfessionalTab
                  current={{
                    jobTitle: user?.jobTitle,
                    department: user?.department,
                    bio: user?.bio,
                    altPhone: user?.altPhone,
                    timeZone: user?.timeZone,
                  }}
                />
              )}

              {tab === "siwes" && <SiwesPlacementTab />}

              {tab === "banking" && <BankingTab />}

              {tab === "notifications" && <NotificationSettingsCard />}

              {tab === "achievements" && <AchievementsList />}

              {tab === "security" && <ChangePasswordForm />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <EditProfileDetailsDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        current={{
          firstName: user?.firstName,
          middleName: user?.middleName,
          lastName: user?.lastName,
          gender: user?.gender,
          phone: user?.phone,
        }}
      />
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/20">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground truncate">{value || "—"}</p>
      </div>
    </div>
  );
}
