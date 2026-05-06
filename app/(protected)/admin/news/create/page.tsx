import type { Metadata } from "next";
import { Megaphone } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { LocalNewsEditor } from "@/components/news/admin/local-news-editor";

export const metadata: Metadata = {
  title: "Create Local News — Admin | Chandra Jyoti Sanstha",
  description: "Publish a new local news article for the community.",
};

export default async function AdminCreateNewsPage() {
  await requireAdmin();

  return (
    <div className="min-h-screen pb-20">
      {/* Page hero */}
      <div className="relative overflow-hidden border-b border-border/60 bg-linear-to-b from-muted/40 to-transparent">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 left-1/4 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-8 right-1/3 h-36 w-36 rounded-full bg-emerald-500/5 blur-2xl"
        />

        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                <Megaphone className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-500/80">
                Local News
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight font-(family-name:--font-outfit) leading-[1.05]">
              Publish community{" "}
              <span className="relative inline-block">
                news
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-linear-to-r from-emerald-500 to-emerald-500/40"
                />
              </span>
            </h1>

            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Share GPU meetings, ward updates, notices, and events with
              the Chandra Jyoti Sanstha community.
            </p>
          </div>
        </div>
      </div>

      {/* Editor card */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-10">
        <div className="rounded-3xl border border-border/50 bg-card shadow-sm shadow-black/5 dark:shadow-black/20 p-6 md:p-8 lg:p-10">
          <LocalNewsEditor />
        </div>
      </div>
    </div>
  );
}
