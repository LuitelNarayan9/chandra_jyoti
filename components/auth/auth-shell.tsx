import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileCheck2,
  MessageSquareText,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type AuthShellProps = {
  children: React.ReactNode;
  mode: "sign-in" | "sign-up";
};

const authCopy = {
  "sign-in": {
    eyebrow: "Protected community access",
    title: "Welcome back",
    description:
      "Sign in to continue managing community updates, family records, and member conversations.",
    switchPrompt: "New to Chandra Jyoti?",
    switchHref: "/sign-up",
    switchLabel: "Create account",
  },
  "sign-up": {
    eyebrow: "Join the digital village network",
    title: "Create your account",
    description:
      "Start with a secure account. Residency and family-tree access are reviewed through the community approval flow.",
    switchPrompt: "Already registered?",
    switchHref: "/sign-in",
    switchLabel: "Sign in",
  },
} as const;

const communityStats = [
  { label: "Family records", value: "Heritage" },
  { label: "Forum access", value: "Members" },
  { label: "Admin review", value: "Verified" },
];

const contextCards = [
  {
    icon: Network,
    title: "Family tree",
    detail: "Approved lineage records and relationship mapping",
  },
  {
    icon: Users,
    title: "Community",
    detail: "Village forum, announcements, and shared updates",
  },
  {
    icon: BookOpen,
    title: "Stories",
    detail: "Blogs and records preserving Tumin Dhanbari heritage",
  },
];

const activityItems = [
  {
    icon: FileCheck2,
    title: "Resident request",
    detail: "Ready for admin approval",
  },
  {
    icon: Network,
    title: "Lineage update",
    detail: "Relationship mapping protected",
  },
  {
    icon: MessageSquareText,
    title: "Community post",
    detail: "Sanitized before publishing",
  },
];

function FamilyGraph() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden opacity-80">
      <svg
        className="absolute inset-x-0 top-8 h-[360px] w-full text-emerald-200/30"
        viewBox="0 0 760 440"
        fill="none"
      >
        <path
          d="M118 88C210 110 240 188 328 190C432 192 448 92 564 104C640 112 678 168 704 218"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M168 330C250 282 298 320 370 258C432 204 498 238 604 198"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M234 120L328 190L370 258L476 286"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {[
          [118, 88],
          [234, 120],
          [328, 190],
          [370, 258],
          [476, 286],
          [564, 104],
          [604, 198],
          [704, 218],
          [168, 330],
        ].map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="7"
            className="fill-emerald-950 stroke-emerald-100/50"
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  );
}

function ReviewQueue() {
  const rows = [
    { name: "New member", status: "Identity check", value: "2" },
    { name: "Family link", status: "Admin review", value: "5" },
    { name: "Story draft", status: "Sanitized", value: "8" },
  ];

  return (
    <div className="rounded-lg border border-white/12 bg-white/[0.09] p-4 shadow-2xl shadow-black/25 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-white">Review queue</div>
          <div className="mt-1 text-xs text-emerald-100/70">
            Protected community workflow
          </div>
        </div>
        <div className="rounded-md border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-100">
          Live
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div
            key={row.name}
            className="grid grid-cols-[1fr_auto] gap-3 rounded-md border border-white/10 bg-white/[0.07] px-3 py-2.5"
          >
            <div>
              <div className="text-xs font-semibold text-white">
                {row.name}
              </div>
              <div className="mt-0.5 text-[11px] text-emerald-100/60">
                {row.status}
              </div>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-bold text-emerald-950">
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityPass() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-amber-100/30 bg-[#f8f1dc] p-5 text-emerald-950 shadow-2xl shadow-black/30">
      <div className="absolute inset-y-0 right-0 w-28 bg-[linear-gradient(135deg,rgba(245,158,11,0.24),rgba(20,83,45,0.12))]" />
      <div className="absolute right-4 top-4 grid grid-cols-4 gap-1 opacity-40">
        {Array.from({ length: 16 }).map((_, item) => (
          <div
            key={item}
            className="h-1.5 w-1.5 rounded-[2px] bg-emerald-950"
          />
        ))}
      </div>

      <div className="relative flex items-start justify-between gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-emerald-950/10 bg-white shadow-sm">
            <Image
              src="/logo.svg"
              alt=""
              width={46}
              height={46}
              className="h-11 w-11 object-contain"
            />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800">
              Community access
            </div>
            <div className="mt-1 font-(family-name:--font-outfit) text-xl font-semibold">
              Chandra Jyoti
            </div>
          </div>
        </div>
        <div className="rounded-md bg-emerald-950 px-2.5 py-1 text-xs font-semibold text-amber-100">
          Verified
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-[1fr_auto] items-end gap-5">
        <div>
          <div className="text-sm font-semibold">Tumin Dhanbari</div>
          <div className="mt-1 text-xs leading-5 text-emerald-900/70">
            Secure access for family records, resident approvals, and village
            conversations.
          </div>
        </div>
        <div className="grid h-16 w-16 grid-cols-4 gap-1 rounded-md border border-emerald-950/10 bg-white p-2">
          {Array.from({ length: 16 }).map((_, item) => (
            <span
              key={item}
              className={
                item % 3 === 0 || item === 7 || item === 11
                  ? "rounded-[2px] bg-emerald-950"
                  : "rounded-[2px] bg-emerald-950/16"
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LineageBoard() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/12 bg-[#112f2b] p-5 shadow-2xl shadow-black/35">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_42%),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:auto,36px_36px,36px_36px]" />

      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-white">Lineage board</div>
          <div className="mt-1 text-xs text-emerald-100/62">
            Privacy-aware family visibility
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-200 text-emerald-950">
          <Network className="h-4 w-4" />
        </div>
      </div>

      <div className="relative mt-6 h-56">
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full text-emerald-100/30"
          viewBox="0 0 420 220"
          fill="none"
        >
          <path d="M78 50H176L238 108H342" stroke="currentColor" />
          <path d="M176 108H92V166" stroke="currentColor" />
          <path d="M238 108L180 168H312" stroke="currentColor" />
        </svg>

        <div className="absolute left-0 top-2 rounded-lg border border-amber-100/30 bg-amber-100 p-3 text-emerald-950 shadow-xl shadow-black/20">
          <div className="text-xs font-semibold">Root family</div>
          <div className="mt-1 h-1.5 w-20 rounded-full bg-emerald-900/20" />
        </div>
        <div className="absolute left-[38%] top-20 rounded-lg border border-white/14 bg-white p-3 text-emerald-950 shadow-xl shadow-black/25">
          <div className="text-xs font-semibold">Approved member</div>
          <div className="mt-1 h-1.5 w-24 rounded-full bg-emerald-900/20" />
        </div>
        <div className="absolute bottom-2 left-8 rounded-lg border border-white/12 bg-white/12 p-3 text-white backdrop-blur">
          <div className="text-xs font-semibold">Relatives</div>
          <div className="mt-1 h-1.5 w-16 rounded-full bg-white/25" />
        </div>
        <div className="absolute bottom-1 right-8 rounded-lg border border-white/12 bg-white/12 p-3 text-white backdrop-blur">
          <div className="text-xs font-semibold">Life events</div>
          <div className="mt-1 h-1.5 w-20 rounded-full bg-white/25" />
        </div>
        <div className="absolute right-0 top-8 rounded-lg border border-white/12 bg-white/12 p-3 text-white backdrop-blur">
          <div className="text-xs font-semibold">Stories</div>
          <div className="mt-1 h-1.5 w-14 rounded-full bg-white/25" />
        </div>
      </div>
    </div>
  );
}

function DesktopShowcase() {
  return (
    <div className="relative min-h-[560px]">
      <div className="absolute left-4 top-4 h-[520px] w-[78%] rounded-lg border border-white/10 bg-white/[0.05] shadow-2xl shadow-black/25" />
      <div className="absolute left-0 top-0 w-[70%] rotate-[-2deg]">
        <CommunityPass />
      </div>
      <div className="absolute right-0 top-24 w-[82%] rotate-[1deg]">
        <LineageBoard />
      </div>
      <div className="absolute bottom-8 left-2 w-[50%]">
        <ReviewQueue />
      </div>
      <div className="absolute bottom-0 right-6 w-[48%]">
        <div className="rounded-lg border border-white/12 bg-white/[0.1] p-4 shadow-2xl shadow-black/25 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">
                Access health
              </div>
              <div className="mt-1 text-xs text-emerald-100/60">
                Clerk protected route
              </div>
            </div>
            <Sparkles className="h-5 w-5 text-amber-200" />
          </div>
          <div className="mt-4 space-y-2">
            {["Secure sign up", "Admin review", "Member workspace"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" />
                  <span className="text-xs font-medium text-emerald-50">
                    {item}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileBrandPanel({ mode }: { mode: AuthShellProps["mode"] }) {
  const copy = authCopy[mode];

  return (
    <div className="relative mb-7 overflow-hidden rounded-lg border border-emerald-950/10 bg-[#123731] p-4 text-white shadow-xl shadow-emerald-950/10 lg:hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(12,45,40,0.96),rgba(18,55,49,0.88),rgba(93,70,38,0.62))]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="absolute right-5 top-20 h-px w-36 rotate-[-18deg] bg-emerald-100/20" />

      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white shadow-lg shadow-black/20">
              <Image
                src="/logo.svg"
                alt="Chandra Jyoti Sanstha"
                width={38}
                height={38}
                priority
                className="h-9 w-9 object-contain"
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                Chandra Jyoti Sanstha
              </span>
              <span className="block text-xs text-emerald-100/70">
                Tumin Dhanbari
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-1.5 rounded-md border border-emerald-200/20 bg-emerald-200/10 px-2 py-1 text-[11px] font-medium text-emerald-50">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure
          </div>
        </div>

        <div className="mt-5">
          <div className="inline-flex rounded-md border border-amber-200/20 bg-amber-200/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-100">
            {copy.eyebrow}
          </div>
          <div className="mt-3 max-w-sm font-(family-name:--font-outfit) text-2xl font-semibold leading-tight">
            Chandra Jyoti community platform
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-amber-100/25 bg-amber-50 p-3 text-emerald-950 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white">
                <Image
                  src="/logo.svg"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-emerald-800">
                  Community access
                </div>
                <div className="text-sm font-semibold">Verified pathway</div>
              </div>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-800" />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-lg border border-white/12 bg-white/[0.08]">
          {communityStats.map((stat) => (
            <div
              key={stat.label}
              className="border-r border-white/12 px-3 py-2 last:border-r-0"
            >
              <div className="text-xs font-semibold text-white">
                {stat.value}
              </div>
              <div className="mt-1 text-[10px] font-medium uppercase text-emerald-100/55">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuthShell({ children, mode }: AuthShellProps) {
  const copy = authCopy[mode];

  return (
    <main className="min-h-screen w-full bg-[#f5f2ea] text-stone-950">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(430px,0.68fr)]">
        <section className="relative hidden overflow-hidden border-r border-emerald-950/20 bg-[#123731] lg:block">
          <FamilyGraph />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(12,45,40,0.98),rgba(18,55,49,0.91)_48%,rgba(80,58,34,0.72))]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px]" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(0deg,rgba(5,18,16,0.72),transparent)]" />

          <div className="relative z-10 flex min-h-screen flex-col justify-between gap-8 px-10 py-9 xl:px-14">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-3 text-white transition-opacity hover:opacity-85"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-white/15 bg-white shadow-lg shadow-black/20">
                  <Image
                    src="/logo.svg"
                    alt="Chandra Jyoti Sanstha"
                    width={44}
                    height={44}
                    priority
                    className="h-11 w-11 object-contain"
                  />
                </span>
                <span>
                  <span className="block text-base font-semibold leading-tight">
                    Chandra Jyoti Sanstha
                  </span>
                  <span className="block text-xs font-medium text-emerald-100/70">
                    Tumin Dhanbari
                  </span>
                </span>
              </Link>

              <div className="inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/10 px-3 py-2 text-xs font-medium text-emerald-50 shadow-sm backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-emerald-200" />
                Protected by Clerk
              </div>
            </div>

            <div className="grid items-center gap-10 xl:grid-cols-[0.88fr_1.12fr]">
              <div className="max-w-xl">
                <div className="mb-5 inline-flex rounded-md border border-amber-200/20 bg-amber-200/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-amber-100">
                  {copy.eyebrow}
                </div>
                <h1 className="max-w-lg font-(family-name:--font-outfit) text-4xl font-semibold leading-tight text-white xl:text-5xl">
                  Chandra Jyoti community platform
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-emerald-50/75">
                  A secure workspace for family heritage, village conversations,
                  community records, and admin-reviewed access.
                </p>

                <div className="mt-8 grid max-w-lg grid-cols-3 overflow-hidden rounded-lg border border-white/12 bg-white/[0.08] shadow-2xl shadow-black/15 backdrop-blur">
                  {communityStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="border-r border-white/12 px-4 py-3 last:border-r-0"
                    >
                      <div className="text-sm font-semibold text-white">
                        {stat.value}
                      </div>
                      <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-emerald-100/60">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  {activityItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-amber-100">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {item.title}
                          </div>
                          <div className="text-xs text-emerald-100/60">
                            {item.detail}
                          </div>
                        </div>
                        <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-200" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <DesktopShowcase />
            </div>

            <div className="grid gap-3 xl:grid-cols-3">
              {contextCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-lg border border-white/12 bg-white/[0.08] p-4 shadow-lg shadow-black/10 backdrop-blur"
                  >
                    <Icon className="h-5 w-5 text-amber-200" />
                    <div className="mt-3 text-sm font-semibold text-white">
                      {item.title}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-emerald-50/62">
                      {item.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen flex-col bg-stone-50">
          <div className="flex items-center justify-between px-4 py-4 sm:px-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>

            <div className="flex items-center gap-2 text-sm">
              <span className="hidden text-stone-500 sm:inline">
                {copy.switchPrompt}
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href={copy.switchHref}>{copy.switchLabel}</Link>
              </Button>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center px-4 py-5 sm:px-8 sm:py-8">
            <MobileBrandPanel mode={mode} />

            <div className="mb-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-900">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure authentication
              </div>
              <h2 className="font-(family-name:--font-outfit) text-3xl font-semibold tracking-tight text-stone-950">
                {copy.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                {copy.description}
              </p>
            </div>

            <div className="w-full">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
