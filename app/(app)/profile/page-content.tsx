"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User as UserIcon,
} from "lucide-react";
import { EditProfileDetailsDialog } from "@/modules/profile/components/EditProfileDetailsDialog";
import { AvatarUploader } from "@/modules/profile/components/AvatarUploader";
import { ProfessionalTab } from "@/modules/profile/components/ProfessionalTab";
import { BankingTab } from "@/modules/profile/components/BankingTab";
import { AttendancePinSection } from "@/modules/profile/components/AttendancePinSection";
import { SiwesPlacementTab } from "@/modules/siwes-profile/components/SiwesPlacementTab";
import { ChangePasswordForm } from "@/modules/auth/components/ChangePasswordForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { formatDate } from "@/lib/utils";

/**
 * Profile surface — identity card up top, tab strip below with
 * `?tab=` deep-link support (dashboard "Achievements" pulse card
 * points here). Notifications + Achievements render as placeholder
 * panels until those modules ship in a later slice.
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
  // Honour `?tab=…` so deep-links from the dashboard pulse card
  // (which points at the achievements tab) land on the right view.
  const initialTab = searchParams.get("tab") || "overview";
  const [tab, setTab] = useState(initialTab);

  const handleTabChange = (value: string) => {
    setTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Professional details (job title / department / bio / etc.) are an
  // instructor concern — the fields exist on every User row but only
  // make sense for someone teaching. Hide the tab for pure students;
  // show for instructors and dual-role users.
  const { mode } = useEffectiveMode();
  const showProfessional = mode !== "student";

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "";
  const initial = (fullName || "?").slice(0, 1).toUpperCase();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        {tab === "overview" && (
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit details
          </Button>
        )}
      </header>

      {/* Identity card — always visible above the tab strip so the
          user always sees who they're editing. */}
      <Card className="p-5 md:p-6 flex items-start gap-4">
        <AvatarUploader
          imageUrl={user?.imageUrl}
          initial={initial}
          size="lg"
          className="shrink-0"
        />
        <div className="min-w-0 flex-1 space-y-1">
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
          {user?.studentCode && (
            <p className="text-xs font-mono tracking-wide text-muted-foreground">
              {user.studentCode}
            </p>
          )}
          {user?.createdAt && (
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5 pt-1">
              <Calendar className="h-3.5 w-3.5" />
              Joined {formatDate(user.createdAt, "long")}
            </p>
          )}
        </div>
      </Card>

      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {showProfessional && (
            <TabsTrigger value="professional">Professional</TabsTrigger>
          )}
          <TabsTrigger value="siwes">SIWES</TabsTrigger>
          <TabsTrigger value="banking">Banking</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Details — every populated field shows; null/missing
              ones are silently dropped so an incomplete record
              doesn't leave dashes everywhere. */}
          <Card className="divide-y">
            <Row icon={Mail} label="Email" value={user?.email} />
            {user?.studentCode && (
              <Row
                icon={GraduationCap}
                label="Student code"
                value={user.studentCode}
              />
            )}
            {user?.phone && (
              <Row icon={Phone} label="Phone" value={user.phone} />
            )}
            <div className="flex items-center gap-4 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <UserIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Gender
                </p>
                <p className="text-sm font-medium truncate">
                  {user?.gender || (
                    <span className="text-muted-foreground italic">
                      Not set
                    </span>
                  )}
                </p>
              </div>
            </div>
            {(() => {
              // country / state arrive as `{ isoCode, name }` from
              // smarthub-api (or plain strings on legacy accounts).
              // Normalise to a string before joining so the cell never
              // ends up rendering "[object Object]".
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
            {/* Institution + department — read-only. Admin-editable on
                the Student doc; students with corrections reach out to
                ops. Hidden unless at least one is set so non-SIWES
                profiles don't grow a stranded row. */}
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
          </Card>

          {/* Settings entry points */}
          <Card className="divide-y">
            <SettingsRow
            label="Change password"
            href="/profile?tab=security"
          />
            <SettingsRow label="Notifications" />
            <SettingsRow label="Help & support" href="/help" />
          </Card>

          <AttendancePinSection />

          {/* Sign out — confirmation modal prevents accidental session loss */}
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
        </TabsContent>

        <TabsContent value="professional">
          <ProfessionalTab
            current={{
              jobTitle: user?.jobTitle,
              department: user?.department,
              bio: user?.bio,
              altPhone: user?.altPhone,
              timeZone: user?.timeZone,
            }}
          />
        </TabsContent>

        <TabsContent value="siwes">
          <SiwesPlacementTab />
        </TabsContent>

        <TabsContent value="banking">
          <BankingTab />
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6 text-center space-y-1">
            <p className="font-semibold">Notification preferences</p>
            <p className="text-sm text-muted-foreground">
              Coming in a later slice.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card className="p-6 text-center space-y-1">
            <p className="font-semibold">Achievements</p>
            <p className="text-sm text-muted-foreground">
              Coming in a later slice.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <ChangePasswordForm />
        </TabsContent>
      </Tabs>

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
  value: string | undefined;
}) {
  return (
    <div className="flex items-center gap-4 p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

function SettingsRow({ label, href }: { label: string; href?: string }) {
  const className =
    "flex items-center justify-between gap-4 p-4 w-full hover:bg-muted/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl";
  const body = (
    <>
      <span className="text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" className={className}>
      {body}
    </button>
  );
}