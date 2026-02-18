export default function LandingPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 text-4xl font-bold font-[family-name:var(--font-outfit)] tracking-tight sm:text-5xl md:text-6xl">
        Welcome to{" "}
        <span className="text-primary">Chandra Jyoti Sanstha</span>
      </h1>
      <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
        Empowering the Tumin Dhanbari community through digital connection,
        cultural preservation, and collective growth.
      </p>
      <div className="flex gap-4">
        <a
          href="/sign-up"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Get Started
        </a>
        <a
          href="/about"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-input bg-background px-6 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Learn More
        </a>
      </div>
    </div>
  );
}
