"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Spinner } from "@/components/Spinner";
import { ApiError } from "@/lib/api";
import { api } from "@/lib/client";
import { formatDate, initials } from "@/lib/format";
import type { Admin, Customer, FileRecord } from "@/lib/types";

interface Data {
  admins: Admin[];
  customers: Customer[];
  files: FileRecord[];
}

const AVATAR_BG = [
  "oklch(0.62 0.14 25)",
  "oklch(0.60 0.10 230)",
  "oklch(0.60 0.10 300)",
  "oklch(0.60 0.13 155)",
  "oklch(0.70 0.10 40)",
];

export default function DashboardPage() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [admins, customers, files] = await Promise.all([
          api.list<Admin>("admins"),
          api.list<Customer>("customers"),
          api.list<FileRecord>("files"),
        ]);
        setData({ admins, customers, files });
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load dashboard");
      }
    })();
  }, []);

  const derived = useMemo(() => {
    if (!data) return null;
    const totalPoints = data.customers.reduce((s, c) => s + c.point, 0);
    const avgPoints = data.customers.length
      ? Math.round(totalPoints / data.customers.length)
      : 0;
    const recent = [...data.customers].sort((a, b) => b.id - a.id).slice(0, 5);
    const topByPoints = [...data.customers]
      .sort((a, b) => b.point - a.point)
      .slice(0, 5);

    const perAdmin = data.admins
      .map((a) => ({
        name: a.username,
        count: data.customers.filter((c) => c.adminId === a.id).length,
      }))
      .sort((x, y) => y.count - x.count)
      .slice(0, 7);
    const maxPerAdmin = Math.max(1, ...perAdmin.map((p) => p.count));

    return { totalPoints, avgPoints, recent, topByPoints, perAdmin, maxPerAdmin };
  }, [data]);

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
    );
  }
  if (!data || !derived) return <Spinner />;

  const adminName = (id: number) =>
    data.admins.find((a) => a.id === id)?.username ?? `#${id}`;

  const stats = [
    {
      label: "Admins",
      value: data.admins.length,
      note: "with console access",
      href: "/admins",
      green: true,
    },
    {
      label: "Customers",
      value: data.customers.length,
      note: `${derived.recent.length ? "latest " + derived.recent[0].username : "none yet"}`,
      href: "/customers",
      green: false,
    },
    {
      label: "Files",
      value: data.files.length,
      note: "records stored",
      href: "/files",
      green: false,
    },
    {
      label: "Avg points",
      value: derived.avgPoints,
      note: `${derived.totalPoints.toLocaleString()} total`,
      href: "/customers",
      green: false,
    },
  ];

  return (
    <div className="flex flex-col gap-3.5">
      <h1 className="text-[26px] font-extrabold tracking-tight text-ink">
        Dashboard
      </h1>

      {/* hero */}
      <div className="flex items-center justify-between rounded-xl bg-night px-7 py-6 text-white">
        <div>
          <div className="text-[13px] font-bold text-white/70">
            Total loyalty points
          </div>
          <div className="mt-1 text-[32px] font-extrabold">
            {derived.totalPoints.toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[13px] font-bold text-[oklch(0.65_0.14_155)]">
            {data.customers.length} customers
          </div>
          <div className="mt-1 text-[12px] text-white/70">
            avg {derived.avgPoints.toLocaleString()} / customer
          </div>
        </div>
      </div>

      {/* stat grid */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={[
              "flex flex-col gap-3.5 rounded-xl p-5 transition-transform hover:-translate-y-0.5",
              s.green
                ? "bg-brand-600 text-white"
                : "border border-line-soft bg-white text-ink",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold">{s.label}</div>
              <span
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-full",
                  s.green ? "bg-white/15" : "bg-line-faint",
                ].join(" ")}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <path d="M3 9L9 3M4 3h5v5" />
                </svg>
              </span>
            </div>
            <div className="text-[22px] font-extrabold">
              {s.value.toLocaleString()}
            </div>
            <div className="text-xs opacity-75">{s.note}</div>
          </Link>
        ))}
      </div>

      {/* two-column */}
      <div className="grid gap-3.5 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-line-soft bg-white p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <div className="text-[15px] font-bold text-ink">
              Customers per admin
            </div>
            <div className="text-[20px] font-extrabold text-ink">
              {data.customers.length}
            </div>
          </div>
          {derived.perAdmin.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-ink-faint">
              No admins yet.
            </p>
          ) : (
            <div className="flex h-[150px] items-end justify-between gap-2.5">
              {derived.perAdmin.map((p) => (
                <div
                  key={p.name}
                  className="relative flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="absolute -top-[18px] text-[10px] font-bold text-ink-soft">
                    {p.count}
                  </div>
                  <div
                    className="w-[22px] rounded-lg bg-brand-400"
                    style={{
                      height: `${Math.max(6, (p.count / derived.maxPerAdmin) * 120)}px`,
                    }}
                  />
                  <div className="max-w-[56px] truncate text-[12px] font-semibold text-ink-soft">
                    {p.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-line-soft bg-white p-5">
          <div className="text-[15px] font-bold text-ink">Recent customers</div>
          {derived.recent.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-ink-faint">
              No customers yet.
            </p>
          ) : (
            derived.recent.map((c, i) => (
              <div key={c.id} className="flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                  style={{ background: AVATAR_BG[i % AVATAR_BG.length] }}
                >
                  {initials(c.username)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-bold text-ink">
                    {c.username}
                  </div>
                  <div className="truncate text-[11.5px] text-ink-soft">
                    {c.email}
                  </div>
                </div>
                <div className="text-[12px] font-bold text-brand-500">
                  {c.point} pts
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* top spenders style */}
      <div className="grid gap-6 rounded-xl border border-line-soft bg-white p-5 md:grid-cols-2">
        <div>
          <div className="mb-3.5 text-[15px] font-bold text-ink">
            Top customers by points
          </div>
          <div className="flex flex-col gap-3">
            {derived.topByPoints.length === 0 && (
              <p className="text-[13px] text-ink-faint">No customers yet.</p>
            )}
            {derived.topByPoints.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-[18px] text-[12.5px] font-bold text-ink-soft">
                  {i + 1}
                </div>
                <span
                  className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold text-white"
                  style={{ background: AVATAR_BG[i % AVATAR_BG.length] }}
                >
                  {initials(c.username)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-bold text-ink">
                    {c.username}
                  </div>
                  <div className="text-[11.5px] text-ink-soft">
                    admin {adminName(c.adminId)}
                  </div>
                </div>
                <div className="text-[14px] font-extrabold text-ink">
                  {c.point}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="md:border-l md:border-line-soft md:pl-6">
          <div className="mb-3.5 text-[15px] font-bold text-ink">
            Recently added files
          </div>
          <div className="flex flex-col gap-3">
            {data.files.length === 0 && (
              <p className="text-[13px] text-ink-faint">No files yet.</p>
            )}
            {[...data.files]
              .sort((a, b) => b.id - a.id)
              .slice(0, 5)
              .map((f) => (
                <div key={f.id} className="flex items-center gap-3">
                  <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-lg bg-line-faint">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="oklch(0.45 0.01 150)"
                      strokeWidth="1.4"
                    >
                      <path d="M2.5 1.5h6l3 3v9.5a1 1 0 01-1 1h-8a1 1 0 01-1-1v-11.5a1 1 0 011-1z" />
                      <path d="M8.5 1.5v3h3" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-bold text-ink">
                      {f.name}
                    </div>
                    <div className="text-[11.5px] text-ink-soft">
                      {formatDate(f.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
