"use client";

import { motion } from "framer-motion";

export function LeadershipTeam() {
  const team = [
    {
      name: "Bikash Adhikari",
      role: "President",
      image:
        "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=85&auto=format&fit=crop",
    },
    {
      name: "Sita Sharma",
      role: "Vice President",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=85&auto=format&fit=crop",
    },
    {
      name: "Ramesh Dahal",
      role: "Secretary",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=85&auto=format&fit=crop",
    },
    {
      name: "Gita Luitel",
      role: "Treasurer",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=85&auto=format&fit=crop",
    },
  ];

  return (
    <section className="relative py-24 bg-white dark:bg-stone-900 px-6 sm:px-12 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-500 mb-4"
            >
              Leadership
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-(family-name:--font-outfit) text-[clamp(2rem,3vw,3.5rem)] font-black text-stone-900 dark:text-stone-50 leading-tight"
            >
              Guiding our community forward
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-stone-600 dark:text-stone-400 font-light max-w-sm"
          >
            Meet the dedicated individuals who volunteer their time and
            expertise to lead the Chandra Jyoti Sanstha.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {team.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
              className="group relative"
            >
              <div className="aspect-3/4 overflow-hidden rounded-3xl bg-stone-200 dark:bg-stone-800 mb-6">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                />
              </div>
              <div>
                <h3 className="font-(family-name:--font-outfit) text-xl font-bold text-stone-900 dark:text-stone-50">
                  {member.name}
                </h3>
                <p className="text-sm font-medium uppercase tracking-wider text-amber-500 dark:text-amber-400 mt-1">
                  {member.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
