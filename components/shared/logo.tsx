import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ""}`}>
      <img src="/logo.svg" alt="Logo" className="h-9 w-9 object-contain" />
      <span className="text-lg font-bold tracking-tight font-(family-name:--font-outfit)">
        Chandra Jyoti
      </span>
    </Link>
  );
}
