"use client";

import { motion } from "framer-motion";

const objectives = [
  {
    num: "01",
    text: "Unite village residents and diaspora under one digital platform.",
  },
  {
    num: "02",
    text: "Preserve cultural heritage and family lineage with accurate records.",
  },
  {
    num: "03",
    text: "Ensure total transparency in village governance and finances.",
  },
  {
    num: "04",
    text: "Provide a platform for discussing critical community issues.",
  },
  {
    num: "05",
    text: "Support families during emergencies with rapid fundraising.",
  },
];

export function SansthaSection() {
  return (
    <section className="relative py-28 md:py-36 bg-stone-50 dark:bg-stone-950 px-5 sm:px-8 overflow-hidden transition-colors">
      {/* Decorative large serif quote mark */}
      <div className="absolute -top-8 right-8 font-serif text-[18rem] leading-none text-stone-900/2.5 dark:text-stone-100/3 select-none pointer-events-none">
        ❋
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-amber-500" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">
                Our Sanstha
              </span>
            </div>

            <h2 className="font-(family-name:--font-outfit) text-[clamp(2.5rem,4.5vw,4rem)] font-black leading-[0.95] tracking-tighter text-stone-900 dark:text-stone-50 mb-8">
              Dedicated to our
              <br />
              community's
              <br />
              <span className="text-amber-500 dark:text-amber-400">
                progress.
              </span>
            </h2>

            <p className="text-base md:text-lg text-stone-500 dark:text-stone-400 leading-relaxed mb-12 max-w-md">
              The Chandra Jyoti Sanstha was established with a singular vision:
              to bring Tumin Dhanbari into the digital age while keeping our
              traditions deeply alive.
            </p>

            {/* Mission & Vision cards */}
            <div className="space-y-4">
              {[
                {
                  label: "Mission",
                  color: "bg-amber-500",
                  text: "To create a transparent, inclusive, and supportive environment for every family of Tumin Dhanbari through comprehensive digital governance and open communication.",
                },
                {
                  label: "Vision",
                  color: "bg-emerald-500",
                  text: "A connected, prosperous, and culturally vibrant Tumin Dhanbari where every member, regardless of location, can actively participate in the village's future.",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="group flex gap-5 p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-lg hover:shadow-stone-200/60 dark:hover:shadow-none transition-all duration-400"
                >
                  <div
                    className={`mt-1 w-1.5 rounded-full shrink-0 self-stretch ${item.color}`}
                  />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 dark:text-stone-500 mb-2">
                      {item.label}
                    </p>
                    <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right column — numbered objectives */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="lg:pt-24"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 mb-10">
              Our Objectives
            </p>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[2.35rem] top-0 bottom-0 w-px bg-stone-200 dark:bg-stone-800" />

              <div className="space-y-0">
                {objectives.map((obj, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.5,
                      delay: idx * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="group relative flex items-start gap-6 py-6 cursor-default"
                  >
                    {/* Number badge */}
                    <div className="relative z-10 flex h-[4.7rem] w-[4.7rem] shrink-0 items-center justify-center rounded-full border-2 border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 group-hover:border-amber-400 dark:group-hover:bg-amber-400 dark:group-hover:border-amber-400 group-hover:bg-amber-400 transition-all duration-300">
                      <span className="font-(family-name:--font-outfit) text-sm font-black text-stone-400 dark:text-stone-500 group-hover:text-stone-950 transition-colors duration-300">
                        {obj.num}
                      </span>
                    </div>

                    {/* Text */}
                    <p className="pt-6 text-base text-stone-600 dark:text-stone-400 leading-relaxed group-hover:text-stone-900 dark:group-hover:text-stone-200 transition-colors duration-300">
                      {obj.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
