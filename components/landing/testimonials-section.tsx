"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";

const testimonials = [
  {
    id: 1,
    quote:
      "This platform has completely transformed how I stay connected with my home village. Even living thousands of miles away in Bangalore, I feel like I'm part of every decision and event.",
    name: "Sunita Sharma",
    role: "Diaspora Member",
    location: "Bangalore",
    initials: "SS",
    gradient: "from-amber-400 via-orange-400 to-rose-400",
    accentColor: "#f59e0b",
    index: "01",
  },
  {
    id: 2,
    quote:
      "The family tree feature is incredible. We successfully traced back our lineage five generations, now securely documented for our children to explore and cherish.",
    name: "Rajesh Luitel",
    role: "Village Resident",
    location: "Tumin Dhanbari",
    initials: "RL",
    gradient: "from-emerald-400 via-teal-400 to-cyan-400",
    accentColor: "#10b981",
    index: "02",
  },
  {
    id: 3,
    quote:
      "Financial transparency has never been better. Tracking community donations and emergency funds is so easy now — everyone trusts the system completely.",
    name: "Dorjee Bhutia",
    role: "Committee Secretary",
    location: "Gangtok",
    initials: "DB",
    gradient: "from-violet-400 via-purple-400 to-fuchsia-400",
    accentColor: "#8b5cf6",
    index: "03",
  },
];

const DURATION = 6000;

// Matrix characters — katakana + latin + digits
const MATRIX_CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const FONT_SIZE = 15;
    let columns: number;
    let drops: number[];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      columns = Math.floor(canvas.width / FONT_SIZE);
      // Stagger initial drop positions so it doesn't all start from top at once
      drops = Array.from({ length: columns }, () =>
        Math.floor(Math.random() * -50)
      );
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let lastTime = 0;
    const FPS = 18; // gentle drip pace
    const interval = 1000 / FPS;

    const draw = (time: number) => {
      animRef.current = requestAnimationFrame(draw);
      if (time - lastTime < interval) return;
      lastTime = time;

      // Fade trail — dark semi-transparent fill
      ctx.fillStyle = "rgba(2, 10, 4, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char =
          MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;

        // Brightest character at the head of each column
        if (drops[i] >= 0) {
          // Head: near-white green
          ctx.fillStyle = "rgba(200, 255, 210, 0.95)";
          ctx.fillText(char, x, y);

          // Slightly behind: pure bright green for the "trail head"
          if (drops[i] > 1) {
            ctx.fillStyle = "rgba(0, 255, 65, 0.8)";
            const prevChar =
              MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
            ctx.fillText(prevChar, x, (drops[i] - 1) * FONT_SIZE);
          }
        }

        // Reset column when it goes past the bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.floor(Math.random() * -20);
        }
        drops[i]++;
      }
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dir = useRef(1);
  const progressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (paused) return;
    setProgress(0);
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) progressRef.current = setTimeout(tick, 16);
    };
    progressRef.current = setTimeout(tick, 16);
    return () => {
      if (progressRef.current) clearTimeout(progressRef.current);
    };
  }, [current, paused]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      dir.current = 1;
      setCurrent((p) => (p + 1) % testimonials.length);
    }, DURATION);
    return () => clearInterval(id);
  }, [paused]);

  const navigate = useCallback(
    (idx: number) => {
      if (isAnimating || idx === current) return;
      dir.current = idx > current ? 1 : -1;
      setCurrent(idx);
    },
    [isAnimating, current]
  );

  const prev = () => {
    if (isAnimating) return;
    dir.current = -1;
    setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);
  };

  const next = () => {
    if (isAnimating) return;
    dir.current = 1;
    setCurrent((p) => (p + 1) % testimonials.length);
  };

  const t = testimonials[current];

  const avatarVariants = {
    enter: { scale: 0.6, opacity: 0, rotate: -15 },
    center: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
        delay: 0.15,
      },
    },
    exit: { scale: 0.6, opacity: 0, rotate: 15, transition: { duration: 0.2 } },
  };

  const quoteVariants = {
    enter: { y: 30, opacity: 0 },
    center: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
        delay: 0.1,
      },
    },
    exit: { y: -20, opacity: 0, transition: { duration: 0.25 } },
  };

  const metaVariants = {
    enter: { y: 16, opacity: 0 },
    center: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
        delay: 0.25,
      },
    },
    exit: { y: -10, opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <section
      className="relative py-28 md:py-40 overflow-hidden"
      style={{ background: "#020a04" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Layer 1: Matrix rain canvas ── */}
      <MatrixRain />

      {/* ── Layer 2: Blur pass — softens the matrix so it reads as texture ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backdropFilter: "blur(2.5px)" }}
      />

      {/* ── Layer 3: Radial dark veil — keeps center readable ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 75% at 50% 50%, rgba(2,12,5,0.62) 0%, rgba(2,10,4,0.88) 100%)",
        }}
      />

      {/* ── Layer 4: Per-testimonial accent glow ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={t.id + "-glow"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 pointer-events-none"
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-[180px]"
            style={{ background: t.accentColor, opacity: 0.1 }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Decorative giant index number ── */}
      <div className="absolute top-12 right-8 md:right-16 pointer-events-none select-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={t.index}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="font-(family-name:--font-outfit) font-black leading-none tracking-tighter block text-[8rem] md:text-[12rem]"
            style={{ color: "rgba(0,255,65,0.045)" }}
          >
            {t.index}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* ── Content layer ── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 md:mb-24"
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="h-px w-10"
              style={{ background: "rgba(0,255,65,0.5)" }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.4em]"
              style={{ color: "rgba(0,255,65,0.65)" }}
            >
              Community Voices
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className="font-(family-name:--font-outfit) text-[clamp(3rem,6vw,5.5rem)] font-black leading-[0.88] tracking-tighter text-stone-50">
              Heard from
              <br />
              <span style={{ color: "rgba(0,220,65,0.72)" }}>our people.</span>
            </h2>

            {/* Counter + nav arrows */}
            <div className="flex items-center gap-4">
              <span
                className="text-xs tabular-nums hidden sm:block"
                style={{ color: "rgba(0,255,65,0.4)" }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={current}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="inline-block"
                  >
                    {String(current + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
                <span className="mx-1" style={{ color: "rgba(0,255,65,0.18)" }}>
                  /
                </span>
                {String(testimonials.length).padStart(2, "0")}
              </span>

              <div className="flex gap-2">
                {[
                  { fn: prev, label: "Previous", d: "M15 19l-7-7 7-7" },
                  { fn: next, label: "Next", d: "M9 5l7 7-7 7" },
                ].map(({ fn, label, d }) => (
                  <button
                    key={label}
                    onClick={fn}
                    aria-label={label}
                    className="group h-11 w-11 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      border: "1px solid rgba(0,255,65,0.18)",
                      color: "rgba(0,255,65,0.45)",
                      background: "rgba(0,20,5,0.5)",
                      backdropFilter: "blur(12px)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(0,255,65,0.55)";
                      e.currentTarget.style.color = "rgba(0,255,65,1)";
                      e.currentTarget.style.background = "rgba(0,255,65,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(0,255,65,0.18)";
                      e.currentTarget.style.color = "rgba(0,255,65,0.45)";
                      e.currentTarget.style.background = "rgba(0,20,5,0.5)";
                    }}
                  >
                    <svg
                      className="w-4 h-4 transition-transform duration-150 group-hover:scale-110"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={d}
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Main card ── */}
        <div className="relative">
          {/* Gradient border */}
          <AnimatePresence mode="wait">
            <motion.div
              key={t.id + "-border"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute -inset-px rounded-[2rem] pointer-events-none"
              style={{
                background: `linear-gradient(135deg, rgba(0,255,65,0.18), transparent 45%, ${t.accentColor}22)`,
              }}
            />
          </AnimatePresence>

          <div
            className="rounded-[2rem] p-8 md:p-14 overflow-hidden relative"
            style={{
              background: "rgba(2, 15, 5, 0.78)",
              backdropFilter: "blur(28px)",
              border: "1px solid rgba(0,255,65,0.1)",
            }}
          >
            {/* CRT scanline texture (very subtle) */}
            <div
              className="absolute inset-0 rounded-[2rem] pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,65,1) 3px, rgba(0,255,65,1) 4px)",
                opacity: 0.018,
              }}
            />

            <div className="relative grid md:grid-cols-[auto_1px_1fr] gap-10 md:gap-16">
              {/* Left: avatar + meta */}
              <div className="flex md:flex-col items-center md:items-start gap-6 shrink-0 md:w-44">
                <AnimatePresence mode="wait" custom={dir.current}>
                  <motion.div
                    key={t.id + "-avatar"}
                    custom={dir.current}
                    variants={avatarVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="relative shrink-0"
                  >
                    <div
                      className={`absolute -inset-1 rounded-2xl bg-linear-to-br ${t.gradient} blur-sm`}
                      style={{ opacity: 0.5 }}
                    />
                    <div
                      className={`relative w-16 h-16 md:w-[88px] md:h-[88px] rounded-2xl bg-linear-to-br ${t.gradient} flex items-center justify-center shadow-xl`}
                    >
                      <span className="font-(family-name:--font-outfit) text-2xl md:text-3xl font-black text-white tracking-tighter">
                        {t.initials}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait" custom={dir.current}>
                  <motion.div
                    key={t.id + "-meta"}
                    custom={dir.current}
                    variants={metaVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <p className="font-(family-name:--font-outfit) text-[15px] font-bold text-stone-100 leading-tight">
                      {t.name}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "rgba(0,255,65,0.55)" }}
                    >
                      {t.role}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "rgba(0,255,65,0.32)" }}
                    >
                      {t.location}
                    </p>

                    {/* Stars */}
                    <div className="flex gap-1 mt-4">
                      {[...Array(5)].map((_, i) => (
                        <motion.svg
                          key={i}
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            delay: 0.3 + i * 0.06,
                            type: "spring",
                            stiffness: 500,
                            damping: 20,
                          }}
                          className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </motion.svg>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Vertical divider */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={t.id + "-div"}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  exit={{ scaleY: 0, opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="hidden md:block w-px self-stretch origin-top"
                  style={{
                    background: `linear-gradient(to bottom, transparent, rgba(0,255,65,0.3), ${t.accentColor}55, transparent)`,
                  }}
                />
              </AnimatePresence>

              {/* Right: quote */}
              <div className="flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={t.id + "-qmark"}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="mb-6"
                  >
                    <svg width="48" height="36" viewBox="0 0 48 36" fill="none">
                      <path
                        d="M0 36V22.2C0 16.44 1.32 11.52 3.96 7.44C6.72 3.36 10.68 0.84 15.84 0L18 4.44C14.52 5.28 11.94 7.08 10.26 9.84C8.58 12.48 7.8 15.36 7.92 18.48H15.84V36H0ZM26.16 36V22.2C26.16 16.44 27.48 11.52 30.12 7.44C32.88 3.36 36.84 0.84 42 0L44.16 4.44C40.68 5.28 38.1 7.08 36.42 9.84C34.74 12.48 33.96 15.36 34.08 18.48H42V36H26.16Z"
                        fill="rgba(0,255,65,0.22)"
                      />
                    </svg>
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait" custom={dir.current}>
                  <motion.blockquote
                    key={t.id + "-quote"}
                    custom={dir.current}
                    variants={quoteVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    onAnimationStart={() => setIsAnimating(true)}
                    onAnimationComplete={() => setIsAnimating(false)}
                    className="font-(family-name:--font-outfit) text-xl md:text-[1.65rem] font-medium leading-[1.4] tracking-tight text-stone-100"
                  >
                    {t.quote}
                  </motion.blockquote>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="mt-10 flex items-center justify-between gap-6">
          {/* Dots */}
          <div className="flex gap-2.5 items-center">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => navigate(idx)}
                aria-label={`Go to testimonial ${idx + 1}`}
              >
                <span
                  className="block rounded-full transition-all duration-300"
                  style={{
                    width: current === idx ? "2rem" : "0.5rem",
                    height: "0.5rem",
                    background:
                      current === idx
                        ? "rgba(0,255,65,0.85)"
                        : "rgba(0,255,65,0.2)",
                    boxShadow:
                      current === idx ? "0 0 8px rgba(0,255,65,0.5)" : "none",
                  }}
                />
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div
            className="flex-1 max-w-48 h-px rounded-full relative overflow-hidden"
            style={{ background: "rgba(0,255,65,0.1)" }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${progress}%`,
                background: "rgba(0,255,65,0.7)",
                opacity: paused ? 0.3 : 1,
                boxShadow: "0 0 6px rgba(0,255,65,0.6)",
                transition: "opacity 0.3s",
              }}
            />
          </div>

          {/* Pause / Play */}
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Resume autoplay" : "Pause autoplay"}
            style={{ color: "rgba(0,255,65,0.38)" }}
            className="transition-opacity hover:opacity-80"
          >
            {paused ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
