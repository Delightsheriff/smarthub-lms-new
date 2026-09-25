"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, HelpCircle, LogOut, User } from "lucide-react";
import { cn, getInitial } from "@/lib/utils";
import { useAuthStore } from "@/store/slices/authStore";
import { useAppLogout } from "@/modules/auth/api/auth.queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Avatar in the top-bar that opens a quick-action dropdown. Sign-out is
 * gated by the same confirmation dialog the profile page uses, so a
 * stray click on the menu can't drop the session.
 */
export function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const handleLogout = useAppLogout();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "";
  const initial = getInitial(fullName);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              aria-label="Account menu"
              className="p-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-transparent active:scale-[0.96] transition-transform"
            >
              <Avatar className="h-8.5 w-8.5 ring-2 ring-border/80 transition-all hover:ring-primary/50 shadow-2xs">
                {user?.imageUrl && (
                  <AvatarImage src={user.imageUrl} alt="Profile photo" />
                )}
                <AvatarFallback className="text-xs font-semibold">{initial}</AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex flex-col gap-0.5 normal-case">
              <span className="truncate text-sm font-semibold text-foreground">
                {fullName || "—"}
              </span>
              {user?.email && (
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {user.email}
                </span>
              )}
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User />
            Profile &amp; settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/assignments")}>
            <ClipboardList />
            My tasks
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/help")}>
            <HelpCircle />
            Help &amp; support
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className={cn("text-destructive focus:text-destructive")}
            onClick={() => setConfirmOpen(true)}
          >
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
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
    </>
  );
}
