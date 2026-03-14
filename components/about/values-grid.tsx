"use client";

import { motion } from "framer-motion";
import {
  Handshake,
  Heart,
  Shield,
  Globe,
  Sunrise,
  BookOpen,
} from "lucide-react";

export function ValuesGrid() {
  const values = [
    {
      title: "Unity",
      description:
        "Fostering an unbreakable bond among all members, transcending geographical boundaries.",
      icon: Handshake,
      color: "text-amber-500",
      bgHover: "hover:bg-amber-500/5",
    },
    {
      title: "Compassion",
      description:
        "Supporting one another through life's challenges with profound empathy and proactive aid.",
      icon: Heart,
      color: "text-rose-500",
      bgHover: "hover:bg-rose-500/5",
    },
    {
      title: "Transparency",
      description:
        "Operating with absolute clarity in our governance, financial management, and decision-making.",
      icon: Shield,
      color: "text-emerald-500",
      bgHover: "hover:bg-emerald-500/5",
    },
    {
      title: "Legacy",
      description:
        "Preserving the rich cultural heritage and documenting the lineage of Tumin Dhanbari for eternity.",
      icon: BookOpen,
      color: "text-blue-500",
      bgHover: "hover:bg-blue-500/5",
    },
    {
      title: "Adaptability",
      description:
        "Embracing modern technology while remaining deeply rooted in our ancestral traditions.",
      icon: Globe,
      color: "text-indigo-500",
      bgHover: "hover:bg-indigo-500/5",
    },
    {
      title: "Progress",
      description:
        "Continuously striving to uplift the community infrastructure, education, and collective prosperity.",
      icon: Sunrise,
      color: "text-orange-500",
      bgHover: "hover:bg-orange-500/5",
    },
  ];

  return (
    <section className="relative py-24 bg-stone-50 dark:bg-stone-950 px-6 sm:px-12 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.3em] text-amber-500 mb-4"
          >
            Core Pillars
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-(family-name:--font-outfit) text-[clamp(2rem,3vw,3.5rem)] font-black text-stone-900 dark:text-stone-50"
          >
            What we stand for
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`group flex flex-col p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 transition-all duration-300 ${value.bgHover} hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-xl hover:-translate-y-1`}
            >
              <div
                className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-950 transition-colors ${value.color}`}
              >
                <value.icon strokeWidth={2} className="h-7 w-7" />
              </div>
              <h3 className="font-(family-name:--font-outfit) text-xl font-bold text-stone-900 dark:text-stone-50 mb-3">
                {value.title}
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
