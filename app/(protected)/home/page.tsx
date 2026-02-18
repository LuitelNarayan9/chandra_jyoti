export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome to your community dashboard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Members", value: "—" },
          { label: "Blog Posts", value: "—" },
          { label: "Forum Threads", value: "—" },
          { label: "Family Members", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">Dashboard content coming soon</p>
        <p className="mt-1 text-sm">
          This page will display community stats, recent activity, and quick
          actions.
        </p>
      </div>
    </div>
  );
}
