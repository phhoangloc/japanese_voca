"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const MENU = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/admins",
    label: "Admins",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <path d="M8 1.5l5.5 2v4c0 3.4-2.3 6-5.5 7-3.2-1-5.5-3.6-5.5-7v-4z" />
      </svg>
    ),
  },
  {
    href: "/customers",
    label: "Customers",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <circle cx="8" cy="5.5" r="2.5" />
        <path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/words",
    label: "Words",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      >
        <path d="M2.5 3.5h11M2.5 8h11M2.5 12.5h7" />
      </svg>
    ),
  },
  {
    href: "/courses",
    label: "Courses",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3.5A1.5 1.5 0 013.5 2H8v12H3.5A1.5 1.5 0 012 12.5v-9zM14 3.5A1.5 1.5 0 0012.5 2H8v12h4.5a1.5 1.5 0 001.5-1.5v-9z" />
      </svg>
    ),
  },
  {
    href: "/chapters",
    label: "Chapters",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      >
        <path d="M4 2.5h8a1 1 0 011 1v10l-2-1.4-2 1.4-2-1.4-2 1.4v-10a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    href: "/files",
    label: "Files",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <path d="M2.5 1.5h6l3 3v9.5a1 1 0 01-1 1h-8a1 1 0 01-1-1v-11.5a1 1 0 011-1z" />
        <path d="M8.5 1.5v3h3" />
      </svg>
    ),
  },
];

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-night/40 lg:hidden"
          onClick={onNavigate}
        />
      )}
      <aside
        className={[
          "fixed inset-y-3 left-3 z-40 flex w-60 transform flex-col gap-7 rounded-2xl bg-white p-5 transition-transform",
          "lg:static lg:inset-y-0 lg:left-0 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-[110%]",
        ].join(" ")}
      >
        <div className="px-1.5 text-[18px] font-extrabold tracking-tight text-ink">
          Admin
        </div>

        <nav className="flex flex-col gap-1">
          <p className="px-2.5 pb-1 text-[11px] font-bold tracking-[0.06em] text-ink-faint">
            MENU
          </p>
          {MENU.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={[
                  "flex items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-brand-600 text-white"
                    : "text-ink-soft hover:bg-line-faint",
                ].join(" ")}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}

          <p className="px-2.5 pb-1 pt-4 text-[11px] font-bold tracking-[0.06em] text-ink-faint">
            GENERAL
          </p>
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-left text-sm font-semibold text-ink-soft transition-colors hover:bg-line-faint"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            >
              <path d="M6 1.5H3a1 1 0 00-1 1v11a1 1 0 001 1h3M10.5 11l3-3-3-3M13 8H5.5" />
            </svg>
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
}
