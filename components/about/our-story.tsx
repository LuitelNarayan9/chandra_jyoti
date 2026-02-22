"use client";

import { motion } from "framer-motion";

export function OurStory() {
  return (
    <section
      id="our-story"
      className="relative py-24 md:py-36 bg-stone-50 dark:bg-stone-950 px-6 sm:px-12 overflow-hidden transition-colors"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Column: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="aspect-4/5 overflow-hidden rounded-3xl bg-stone-200 dark:bg-stone-800 relative shadow-2xl">
              <img
                src="/images/about-us-our-story.jpg"
                alt="Historical village gathering"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-stone-900/60 to-transparent" />
            </div>

            {/* Floating smaller image */}
            <div className="absolute -bottom-10 -right-10 w-2/3 aspect-square overflow-hidden rounded-3xl border-8 border-stone-50 dark:border-stone-950 shadow-xl z-10 hidden sm:block">
              <img
                src="/images/about-us-story-2.jpg"
                alt="Traditional heritage"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Decorative Element */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl z-[-1]" />
          </motion.div>

          {/* Right Column: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:pl-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-amber-500" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">
                Our Genesis
              </span>
            </div>

            <h2 className="font-(family-name:--font-outfit) text-[clamp(2rem,4vw,3.5rem)] font-black leading-tight tracking-tighter text-stone-900 dark:text-stone-50 mb-8">
              A century of <br />
              <span className="text-amber-500 dark:text-amber-400">
                heritage & unity.
              </span>
            </h2>

            <div className="space-y-6 text-stone-600 dark:text-stone-400 text-lg leading-relaxed font-light">
              <p>
                Nestled in the pristine hills of Sikkim, Tumin Dhanbari has
                always been more than just a geographic location. It is the
                beating heart of a lineage that traces back generations, firmly
                rooted in community, nature, and tradition.
              </p>
              <p>
                In the early days, our ancestors forged a path through
                resilience and collective effort. Every festival, every harvest,
                and every challenge was met together. The Chandra Jyoti Sanstha
                was born from this exact spirit—to formalize the bonds that have
                always existed naturally among us.
              </p>
              <p>
                Today, as our members spread across the globe in pursuit of new
                horizons, the need to stay connected to our roots is greater
                than ever. Our platform bridges the gap between the ancestral
                village and the global diaspora, ensuring that no matter how far
                we travel, our foundation remains unbreakable.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-8 border-t border-stone-200 dark:border-stone-800 pt-10">
              <div>
                <p className="font-(family-name:--font-outfit) text-4xl font-bold text-stone-900 dark:text-stone-50 mb-2">
                  1920<span className="text-amber-500 text-2xl">+</span>
                </p>
                <p className="text-sm font-medium uppercase tracking-widest text-stone-500 dark:text-stone-400">
                  Tracing Lineage
                </p>
              </div>
              <div>
                <p className="font-(family-name:--font-outfit) text-4xl font-bold text-stone-900 dark:text-stone-50 mb-2">
                  100<span className="text-emerald-500 text-2xl">%</span>
                </p>
                <p className="text-sm font-medium uppercase tracking-widest text-stone-500 dark:text-stone-400">
                  Community Driven
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
