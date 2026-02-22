"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";

export function ContactHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax effects
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const scrollDown = () => {
    document
      .getElementById("contact-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      className="relative h-[80vh] min-h-[600px] overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0 h-[120%]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url("https://699864673b28d3b181f7727a.imgix.net/sikkim-traditional-nepali-heritage-383277.png?w=1920&q=85&auto=format&fit=full")',
          }}
        />
        {/* Gradients to blend with the page */}
        <div className="absolute inset-0 bg-linear-to-b from-stone-950/60 via-stone-950/40 to-stone-50 dark:to-stone-950" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="h-px w-12 bg-amber-400/80" />
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            Contact Us
          </span>
          <span className="h-px w-12 bg-amber-400/80" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="font-(family-name:--font-outfit) text-[clamp(3rem,8vw,6rem)] font-black leading-tight tracking-tighter text-white drop-shadow-lg"
        >
          Get in{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-300 to-amber-500">
            Touch.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-6 max-w-2xl text-lg md:text-xl font-light text-stone-200 drop-shadow-md px-4"
        >
          Have questions, suggestions, or want to contribute? Reach out to the
          Chandra Jyoti Sanstha community. We&apos;re here to help.
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2"
      >
        <button
          onClick={scrollDown}
          className="flex flex-col items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors"
          aria-label="Scroll down"
        >
          <span className="text-[10px] uppercase font-bold tracking-[0.2em]">
            Reach Out
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-5 w-5" />
          </motion.div>
        </button>
      </motion.div>
    </section>
  );
}
