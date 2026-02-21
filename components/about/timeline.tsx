"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const milestones = [
    {
      year: "1920s",
      title: "First Settlements",
      description:
        "The earliest families settled in the Tumin Dhanbari region, initiating the agricultural practices that sustain the village today.",
    },
    {
      year: "1965",
      title: "First Village Council",
      description:
        "A formal council of elders was established to resolve local disputes and govern community resources collaboratively.",
    },
    {
      year: "1998",
      title: "School Establishment",
      description:
        "The community pooled resources to build the first primary school, ensuring education for the next generation locally.",
    },
    {
      year: "2010",
      title: "Diaspora Network",
      description:
        "As many youths traveled abroad for higher education and work, the first informal digital network was created to stay in touch.",
    },
    {
      year: "2024",
      title: "Digital Transformation",
      description:
        "The Chandra Jyoti Sanstha platform was officially launched, digitizing family trees, forums, and community governance.",
    },
  ];

  return (
    <section className="relative py-24 bg-stone-50 dark:bg-stone-950 px-6 sm:px-12 transition-colors overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-(family-name:--font-outfit) text-[clamp(2rem,4vw,3.5rem)] font-black text-stone-900 dark:text-stone-50"
          >
            A Journey Through{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-500 to-amber-400">
              Time
            </span>
          </motion.h2>
        </div>

        <div ref={containerRef} className="relative">
          {/* Vertical Line Base */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-stone-200 dark:bg-stone-800 md:-translate-x-1/2" />

          {/* Animated Vertical Line */}
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-4 md:left-1/2 top-0 w-px bg-linear-to-b from-amber-500 to-amber-300 md:-translate-x-1/2 origin-top"
          />

          <div className="space-y-16">
            {milestones.map((item, idx) => (
              <div
                key={idx}
                className={`relative flex items-center md:justify-between flex-col md:flex-row gap-8 md:gap-0 ${idx % 2 === 0 ? "md:flex-row-reverse" : ""}`}
              >
                {/* Node Dot */}
                <div className="absolute left-4 md:left-1/2 top-0 md:top-1/2 w-4 h-4 rounded-full bg-white dark:bg-stone-900 border-4 border-stone-200 dark:border-stone-700 md:-translate-x-1/2 md:-translate-y-1/2 shrink-0 z-10 transition-colors duration-500 group-hover:border-amber-400" />

                {/* Content Box */}
                <motion.div
                  initial={{ opacity: 0, x: idx % 2 === 0 ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`pl-12 md:pl-0 w-full md:w-[45%] ${idx % 2 === 0 ? "md:pl-12" : "md:pr-12 md:text-right"}`}
                >
                  <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-400/50 transition-colors shadow-xs hover:shadow-lg">
                    <span className="inline-block px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-950 text-amber-600 dark:text-amber-400 text-sm font-bold tracking-widest mb-4">
                      {item.year}
                    </span>
                    <h3 className="font-(family-name:--font-outfit) text-2xl font-bold text-stone-900 dark:text-stone-50 mb-3 block">
                      {item.title}
                    </h3>
                    <p className="text-stone-600 dark:text-stone-400 font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
