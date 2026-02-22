"use client";

import { motion } from "framer-motion";
import { Target, Lightbulb } from "lucide-react";

export function MissionVision() {
  const cards = [
    {
      title: "Our Mission",
      subtitle: "The Action Plan",
      description:
        "To empower every member of Tumin Dhanbari by providing a transparent, digital ecosystem. We strive to meticulously map our family trees, securely archive our cultural heritage, and create a rapid-response network for community aid and governance.",
      icon: Target,
      color: "from-amber-400 to-amber-600",
      bgBlur: "bg-amber-500/5",
      borderColor: "border-amber-500/20",
      iconColor: "text-amber-500",
      delay: 0.1,
    },
    {
      title: "Our Vision",
      subtitle: "The Future Horizon",
      description:
        "We envision a globally connected Tumin Dhanbari where distance is no longer a barrier. A thriving diaspora deeply anchored in its roots, where future generations can effortlessly access their ancestry and actively contribute to the village's prosperity.",
      icon: Lightbulb,
      color: "from-emerald-400 to-emerald-600",
      bgBlur: "bg-emerald-500/5",
      borderColor: "border-emerald-500/20",
      iconColor: "text-emerald-500",
      delay: 0.3,
    },
  ];

  return (
    <section className="relative py-24 bg-white dark:bg-stone-900 px-6 sm:px-12 overflow-hidden transition-colors">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-amber-200/20 via-transparent to-transparent dark:from-amber-900/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-(family-name:--font-outfit) text-[clamp(2.5rem,4vw,4rem)] font-black text-stone-900 dark:text-stone-50"
          >
            Guiding{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-500 to-amber-400">
              Principles
            </span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: card.delay, ease: "easeOut" }}
              className={`relative overflow-hidden rounded-3xl border ${card.borderColor} ${card.bgBlur} backdrop-blur-sm p-10 sm:p-14 transition-transform hover:-translate-y-2 duration-500`}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div
                  className={`mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-stone-950 shadow-lg ${card.iconColor}`}
                >
                  <card.icon strokeWidth={2} className="h-8 w-8" />
                </div>

                <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400 mb-2">
                  {card.subtitle}
                </p>
                <h3 className="font-(family-name:--font-outfit) text-3xl font-black text-stone-900 dark:text-stone-50 mb-6">
                  {card.title}
                </h3>

                <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed font-light">
                  {card.description}
                </p>
              </div>

              {/* Decorative Gradient Blob */}
              <div
                className={`absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-linear-to-br ${card.color} opacity-20 blur-3xl`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
