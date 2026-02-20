"use client";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";

function AnimatedCounter({
  end,
  suffix = "",
}: {
  end: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp: number;
    const duration = 2200;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end]);
  return (
    <>
      {count}
      {suffix}
    </>
  );
}

// Unsplash images: Himalayan peaks, Sikkim jungle, misty valleys, snow mountains, terraced fields
const heroImages = [
  {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85&auto=format&fit=crop",
    alt: "Himalayan mountain peaks at golden hour",
  },
  {
    url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&q=85&auto=format&fit=crop",
    alt: "Sikkim lush green mountain valley",
  },
  {
    url: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1920&q=85&auto=format&fit=crop",
    alt: "Misty Sikkim jungle hills",
  },
  {
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=85&auto=format&fit=crop",
    alt: "Snow-capped Himalayan peaks",
  },
  {
    url: "https://images.unsplash.com/photo-1569246976119-c4e207d1c1a2?w=1920&q=85&auto=format&fit=crop",
    alt: "Terraced rice fields in Sikkim hills",
  },
];

const stats = [
  { label: "Registered Members", value: 500, suffix: "+" },
  { label: "Connected Families", value: 100, suffix: "+" },
  { label: "Community Stories", value: 50, suffix: "+" },
];

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentImage, setCurrentImage] = useState(0);

  // Auto-cycle background every 2 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
  });

  // Scene 1 — Title
  const titleOpacity = useTransform(smoothProgress, [0, 0.18, 0.28], [1, 1, 0]);
  const titleY = useTransform(smoothProgress, [0, 0.28], ["0%", "-12%"]);

  // Scene 2 — Subtitle
  const subOpacity = useTransform(smoothProgress, [0.15, 0.3, 0.48], [0, 1, 0]);
  const subY = useTransform(
    smoothProgress,
    [0.15, 0.3, 0.48],
    ["6%", "0%", "-6%"]
  );

  // Scene 3 — Stats
  const statsOpacity = useTransform(
    smoothProgress,
    [0.44, 0.57, 0.76],
    [0, 1, 0]
  );
  const statsY = useTransform(
    smoothProgress,
    [0.44, 0.57, 0.76],
    ["5%", "0%", "-5%"]
  );

  // Scene 4 — CTA
  const ctaOpacity = useTransform(smoothProgress, [0.72, 0.86], [0, 1]);
  const ctaY = useTransform(smoothProgress, [0.72, 0.86], ["5%", "0%"]);

  // Parallax BG
  const bgY = useTransform(smoothProgress, [0, 1], ["0%", "25%"]);

  const scrollDown = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={containerRef} className="relative h-[450vh]">
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* ── Crossfading image carousel background ─────────── */}
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 z-0 scale-110"
        >
          <AnimatePresence mode="sync">
            <motion.img
              key={currentImage}
              src={heroImages[currentImage].url}
              alt={heroImages[currentImage].alt}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />
          </AnimatePresence>
        </motion.div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 z-1 bg-linear-to-b from-stone-950/70 via-stone-950/40 to-stone-950/90" />
        <div className="absolute inset-0 z-1 bg-linear-to-r from-stone-950/50 via-transparent to-transparent" />

        {/* Noise texture */}
        <div
          className="absolute inset-0 z-2 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Dot indicators — bottom center */}
        <div className="absolute bottom-7 left-1/2 z-5 -translate-x-1/2 flex items-center gap-2">
          {heroImages.map((_, i) => (
            <motion.span
              key={i}
              animate={{
                width: i === currentImage ? 22 : 5,
                opacity: i === currentImage ? 0.9 : 0.3,
              }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="block h-[3px] rounded-full bg-white"
            />
          ))}
        </div>

        {/* ── Scene 1: Main Title ─────────────────────────────── */}
        <motion.div
          style={{ opacity: titleOpacity, y: titleY }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 flex items-center gap-3"
          >
            <span className="h-px w-10 bg-amber-400/70" />
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300/90">
              Tumin Dhanbari · Sikkim
            </span>
            <span className="h-px w-10 bg-amber-400/70" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="font-(family-name:--font-outfit) text-[clamp(3.5rem,10vw,9rem)] font-black leading-[0.9] tracking-tighter text-stone-50"
          >
            Chandra
            <br />
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: "1.5px rgba(251,191,36,0.7)" }}
            >
              Jyoti
            </span>
            <br />
            <span className="bg-linear-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              Sanstha
            </span>
          </motion.h1>

          {/* Scroll cue */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            onClick={scrollDown}
            className="absolute bottom-14 flex flex-col items-center gap-2 text-stone-400 hover:text-amber-300 transition-colors"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium">
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ArrowDown className="h-4 w-4" />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* ── Scene 2: Mission ────────────────────────────────── */}
        <motion.div
          style={{ opacity: subOpacity, y: subY }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
        >
          <p className="font-(family-name:--font-outfit) text-[clamp(2rem,5.5vw,5.5rem)] font-light leading-tight tracking-tight text-stone-100 max-w-5xl">
            Connecting our{" "}
            <em className="not-italic font-semibold text-amber-300">legacy</em>.
            <br />
            Building our{" "}
            <em className="not-italic font-semibold text-emerald-300">
              future
            </em>{" "}
            together.
          </p>
          <p className="mt-8 max-w-xl text-base md:text-lg text-stone-400 font-light leading-relaxed">
            A digital home for every family of Tumin Dhanbari — from the village
            heart to the farthest diaspora.
          </p>
        </motion.div>

        {/* ── Scene 3: Stats ──────────────────────────────────── */}
        <motion.div
          style={{ opacity: statsOpacity, y: statsY }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6"
        >
          <p className="mb-12 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">
            Our Growing Community
          </p>
          <div className="grid w-full max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center gap-3 bg-stone-950/50 backdrop-blur-xl px-4 py-10 md:py-14 first:rounded-l-3xl last:rounded-r-3xl"
              >
                <span className="font-(family-name:--font-outfit) text-[clamp(2.5rem,6vw,5rem)] font-black leading-none text-stone-50">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-center text-[11px] font-medium uppercase tracking-widest text-stone-400">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Scene 4: CTA ────────────────────────────────────── */}
        <motion.div
          style={{ opacity: ctaOpacity, y: ctaY }}
          className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center"
        >
          <h2 className="font-(family-name:--font-outfit) text-[clamp(2.5rem,7vw,7rem)] font-black leading-[0.95] tracking-tighter text-stone-50 mb-10">
            Be part of
            <br />
            <span className="text-amber-300">the journey.</span>
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="h-14 rounded-full bg-amber-400 px-10 text-base font-bold text-stone-950 hover:bg-amber-300 shadow-xl shadow-amber-400/20 hover:shadow-amber-400/30 transition-all duration-300 hover:scale-105 border-0"
              >
                Join the Network
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollDown}
              className="h-14 rounded-full border border-white/20 bg-white/5 px-10 text-base font-semibold text-stone-100 backdrop-blur-md hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              Explore Features
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
