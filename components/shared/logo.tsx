import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ""}`}>
      <span className="text-2xl">🏛️</span>
      <span className="text-lg font-bold tracking-tight font-[family-name:var(--font-outfit)]">
        Chandra Jyoti
      </span>
    </Link>
  );
}
