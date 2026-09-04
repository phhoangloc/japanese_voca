"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { SearchProvider } from "@/components/SearchContext";
import { useAuth } from "@/lib/auth";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (ready && !isAuthenticated) router.replace("/login");
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-faint">
        Loading…
      </div>
    );
  }

  return (
    <SearchProvider>
      <div className="flex min-h-screen gap-3.5 bg-paper p-3.5">
        <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
        <main className="flex min-w-0 flex-1 flex-col gap-3.5">
          <Topbar onMenu={() => setMenuOpen(true)} />
          <div className="min-w-0 flex-1">{children}</div>
        </main>
      </div>
    </SearchProvider>
  );
}
