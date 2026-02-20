"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useState, useRef } from "react";

function CountUp({
  end,
  prefix = "",
  suffix = "",
}: {
  end: number;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!isInView) return;
    let startTimestamp: number;
    const duration = 2600;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, isInView]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const stats = [
  {
    label: "Total Members",
    value: 1250,
    suffix: "+",
    description: "And growing every week",
  },
  {
    label: "Families Connected",
    value: 156,
    suffix: "",
    description: "Across India and abroad",
  },
  {
    label: "Blog Posts",
    value: 840,
    suffix: "",
    description: "Stories, news & culture",
  },
  {
    label: "Funds Raised",
    value: 50000,
    prefix: "₹",
    suffix: "+",
    description: "For community development",
  },
];

export function StatsCounter() {
  return (
    <section className="relative py-24 md:py-32 bg-white dark:bg-stone-900 overflow-hidden transition-colors">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-8 bg-amber-500" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">
              By the Numbers
            </span>
            <div className="h-px w-8 bg-amber-500" />
          </div>
          <h2 className="font-(family-name:--font-outfit) text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tighter text-stone-900 dark:text-stone-50 leading-tight">
            The strength of our community
            <br />
            <span className="text-stone-400 dark:text-stone-500">
              in plain sight.
            </span>
          </h2>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: idx * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`group relative flex flex-col items-start justify-end min-w-0 p-6 md:p-8 lg:p-10 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors duration-300 ${
                idx < stats.length - 1
                  ? "border-r border-stone-200 dark:border-stone-800"
                  : ""
              } ${idx < 2 ? "border-b lg:border-b-0 border-stone-200 dark:border-stone-800" : ""}`}
            >
              {/* Top accent line on hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500 dark:bg-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left" />

              {/* Stat number */}
              <div className="w-full font-(family-name:--font-outfit) text-[clamp(2rem,3.5vw,3.75rem)] font-black leading-none tracking-tighter text-stone-900 dark:text-stone-50 mb-3 whitespace-nowrap">
                <CountUp
                  end={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </div>

              {/* Label */}
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400 mb-1">
                {stat.label}
              </p>
              {/* Description */}
              <p className="text-xs text-stone-400 dark:text-stone-600 group-hover:text-stone-500 dark:group-hover:text-stone-500 transition-colors duration-300">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
