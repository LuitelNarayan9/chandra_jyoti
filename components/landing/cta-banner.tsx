"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTABanner() {
  return (
    <section className="relative py-0 overflow-hidden transition-colors">
      <div className="relative bg-white dark:bg-stone-900">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-28 md:py-36 lg:py-44">
          <div className="flex flex-col items-center text-center">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-px w-8 bg-amber-500" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">
                Join Us Today
              </span>
              <div className="h-px w-8 bg-amber-500" />
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-(family-name:--font-outfit) text-[clamp(3rem,8vw,8rem)] font-black leading-[0.9] tracking-tighter text-stone-900 dark:text-stone-50 mb-8"
            >
              Your village.
              <br />
              <span
                className="text-transparent"
                style={{ WebkitTextStroke: "1.5px rgba(180,130,20,0.6)" }}
              >
                Your story.
              </span>
              <br />
              <span className="bg-linear-to-r from-amber-500 to-orange-500 dark:from-amber-300 dark:to-orange-400 bg-clip-text text-transparent">
                Your network.
              </span>
            </motion.h2>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-base md:text-lg text-stone-500 dark:text-stone-400 max-w-lg mx-auto leading-relaxed mb-12"
            >
              Create your free account to access the forum, explore your family
              tree, and become part of the Tumin Dhanbari digital community.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col sm:flex-row gap-4 items-center"
            >
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="group h-14 rounded-full bg-amber-500 hover:bg-amber-400 dark:bg-amber-400 dark:hover:bg-amber-300 px-10 text-base font-bold text-white dark:text-stone-950 shadow-xl shadow-amber-400/20 hover:shadow-amber-400/30 border-0 transition-all duration-300 hover:scale-105"
                >
                  Register Now — It's Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/about-us">
                <span className="text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 underline underline-offset-4 decoration-stone-300 dark:decoration-stone-700 hover:decoration-stone-500 dark:hover:decoration-stone-400 transition-all duration-200 cursor-pointer">
                  Learn more about us
                </span>
              </Link>
            </motion.div>

            {/* Trust indicator */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-8 text-xs text-stone-400 dark:text-stone-600 font-medium"
            >
              Free to join · No credit card required · Trusted by 500+ members
            </motion.p>
          </div>
        </div>

        {/* Bottom border with gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-amber-500/30 to-transparent" />
      </div>
    </section>
  );
}
