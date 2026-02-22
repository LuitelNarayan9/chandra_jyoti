"use client";

import { motion } from "framer-motion";
import {
  Network,
  FileText,
  MessageSquare,
  Newspaper,
  HeartHandshake,
  LineChart,
} from "lucide-react";

const features = [
  {
    title: "Family Tree",
    description:
      "Interactive visual map of your ancestry. Preserve village lineage with stunning generational timelines built for the next 100 years.",
    icon: Network,
    accent: "from-blue-500 to-indigo-600",
    tag: "Heritage",
  },
  {
    title: "Community Blog",
    description:
      "Share stories, cultural knowledge, and lived experiences with the entire network. Your voice, amplified.",
    icon: FileText,
    accent: "from-emerald-500 to-teal-600",
    tag: "Stories",
  },
  {
    title: "Village Forum",
    description:
      "Discuss local issues, organize events, and participate in community decisions — real governance, online.",
    icon: MessageSquare,
    accent: "from-violet-500 to-purple-600",
    tag: "Governance",
  },
  {
    title: "Local News",
    description:
      "Stay updated with verified news from the village, state, and around the world. Always be in the know.",
    icon: Newspaper,
    accent: "from-amber-500 to-orange-500",
    tag: "News",
  },
  {
    title: "Transparent Donations",
    description:
      "Contribute to development and emergency campaigns with full on-chain traceability and community accountability.",
    icon: HeartHandshake,
    accent: "from-rose-500 to-pink-600",
    tag: "Finance",
  },
  {
    title: "Smart Analytics",
    description:
      "Track community growth, fundraising progress, and participation metrics — data-driven decision making for everyone.",
    icon: LineChart,
    accent: "from-cyan-500 to-sky-600",
    tag: "Insights",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative py-28 md:py-36 bg-stone-50/40 dark:bg-stone-950/40 px-5 sm:px-8 overflow-hidden transition-colors"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-amber-400/5 dark:bg-amber-400/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-emerald-400/5 dark:bg-emerald-400/3 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-amber-500" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">
                Platform Features
              </span>
            </div>
            <h2 className="font-(family-name:--font-outfit) text-[clamp(2.5rem,5vw,4.5rem)] font-black leading-[0.95] tracking-tighter text-stone-900 dark:text-stone-50">
              Everything your
              <br />
              community needs.
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.7,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-sm text-stone-500 dark:text-stone-400 text-base leading-relaxed"
          >
            A complete digital ecosystem built specifically for Tumin Dhanbari —
            combining heritage preservation with modern connectivity.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: idx * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative flex flex-col p-7 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700 transition-all duration-500 hover:shadow-2xl hover:shadow-stone-200/60 dark:hover:shadow-stone-950/60 overflow-hidden cursor-default"
            >
              {/* Hover gradient reveal */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${feature.accent} opacity-0 group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08] transition-opacity duration-500`}
              />

              {/* Tag */}
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 dark:text-stone-500">
                  {feature.tag}
                </span>
                <span className="text-xs font-medium text-stone-300 dark:text-stone-700">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Icon */}
              <div
                className={`mb-6 w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br ${feature.accent} shadow-lg shadow-stone-200/50 dark:shadow-none transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="font-(family-name:--font-outfit) text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-3">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400 flex-1">
                {feature.description}
              </p>

              {/* Bottom accent line */}
              <div
                className={`absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-linear-to-r ${feature.accent} transition-all duration-500 ease-out`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
