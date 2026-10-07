"use client";

import { Button } from "@/components/ui/button";
import { useDescope, useSession, useUser } from "@descope/nextjs-sdk/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ChatPanel from "@/components/dashboard/chat-panel";
import ConnectionsPanel from "@/components/dashboard/connections-panel";
import { LogOut } from "lucide-react";

const styles = {
  loadingShell:
    "app-shell-bg flex h-svh items-center justify-center text-sm text-muted-foreground",
  shell: "app-shell-bg",
  userRow:
    "flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 shadow-sm",
  avatar:
    "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold uppercase text-primary-foreground",
  userInfo: "min-w-0 flex-1",
  userName: "truncate text-sm font-medium",
  userSub: "text-[11px] text-muted-foreground",
  logoutBtn:
    "size-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
  logoutIcon: "size-4",
} as const;

export default function DashboardPage() {
  const sdk = useDescope();
  const router = useRouter();
  const { isAuthenticated, sessionToken } = useSession();
  const { user, isUserLoading } = useUser();
  const [loggingOut, setLoggingOut] = useState(false);

  const label = user?.email || user?.name || "Signed in User";
  const initial = label.charAt(0);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await sdk.logout();
      router.replace("/sign-in");
    } catch {
      setLoggingOut(false);
    }
  }

  if (!isAuthenticated || !sessionToken) {
    return <div className={styles.loadingShell}>Checking session...</div>;
  }

  return (
    <div className={styles.shell}>
      <ChatPanel
        sessionToken={sessionToken}
        connections={<ConnectionsPanel sessionToken={sessionToken} />}
        footer={
          <div className={styles.userRow}>
            <div className={styles.avatar}>
              {isUserLoading ? "·" : initial}
            </div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>
                {isUserLoading ? "Loading..." : label}
              </p>
              <p className={styles.userSub}>Signed in</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={styles.logoutBtn}
              disabled={loggingOut}
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className={styles.logoutIcon} />
            </Button>
          </div>
        }
      />
    </div>
  );
}