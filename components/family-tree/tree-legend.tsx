"use client";

export function TreeLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-30 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl px-4 py-3 shadow-lg">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2.5">
        Legend
      </p>
      <div className="space-y-2">
        <LegendDot color="#3b82f6" label="Male" />
        <LegendDot color="#ec4899" label="Female" />
        <LegendDot color="#8b5cf6" label="Other" />
        <LegendDot color="#9ca3af" label="Deceased" />
        <div className="border-t border-zinc-100 dark:border-zinc-800 my-2" />
        <div className="flex items-center gap-2.5">
          <svg width="24" height="6" className="shrink-0">
            <line
              x1="0"
              y1="3"
              x2="24"
              y2="3"
              stroke="#94a3b8"
              strokeWidth="2.5"
            />
          </svg>
          <span className="text-[10px] text-zinc-500 font-medium">
            Parent–Child
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <svg width="24" height="6" className="shrink-0">
            <line
              x1="0"
              y1="3"
              x2="24"
              y2="3"
              stroke="#f472b6"
              strokeWidth="2"
              strokeDasharray="5,3"
            />
          </svg>
          <span className="text-[10px] text-zinc-500 font-medium">Spouse</span>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="h-3.5 w-3.5 rounded-full shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
        {label}
      </span>
    </div>
  );
}
