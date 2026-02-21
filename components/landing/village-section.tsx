"use client";

import { motion, useInView } from "framer-motion";
import { MapPin, Mountain, Users, Home } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

function AnimatedCounter({
  end,
  suffix = "",
  text = "",
}: {
  end?: number;
  suffix?: string;
  text?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView || end === undefined) return;

    let startTimestamp: number;
    const duration = 2000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [end, isInView]);

  return <span ref={ref}>{text || `${count}${suffix}`}</span>;
}

const villageImages = [
  {
    src: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1400&h=900&fit=crop&q=85",
    alt: "Lush green Sikkim forest valley with mist",
    span: "col-span-2 md:col-span-2 row-span-2",
    minH: "min-h-[300px] md:min-h-[420px]",
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=500&fit=crop&q=85",
    alt: "Himalayan mountain peaks of Sikkim",
    span: "",
    minH: "min-h-[150px] md:min-h-[205px]",
  },
  {
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&h=500&fit=crop&q=85",
    alt: "Dense forest canopy in Sikkim hills",
    span: "",
    minH: "min-h-[150px] md:min-h-[205px]",
  },
];

export function VillageSection() {
  const stats = [
    {
      icon: MapPin,
      value: "Gangtok Dist.",
      label: "Location",
      text: "Gangtok Dist.",
    },
    { icon: Mountain, end: 5000, suffix: "ft", label: "Elevation" },
    { icon: Users, end: 2000, suffix: "+", label: "Population" },
    { icon: Home, end: 300, suffix: "+", label: "Homes" },
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-950 px-4 transition-colors">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-(family-name:--font-outfit) mb-6 tracking-tight text-slate-900 dark:text-slate-100">
            Discover Tumin Dhanbari
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-400">
            Nestled in the beautiful mountains of Sikkim, Tumin Dhanbari is a
            vibrant village community with a rich heritage. Our platform serves
            to connect generations, preserving our history while embracing the
            digital future.
          </p>
        </motion.div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {villageImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.1 * (i + 1),
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`group relative rounded-3xl overflow-hidden ${img.span} ${img.minH}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes={i === 0 ? "(max-width: 768px) 100vw, 66vw" : "33vw"}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                priority={i === 0}
              />
              {/* Subtle gradient overlay for depth */}
              <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-md dark:hover:shadow-slate-900/50 transition-shadow"
            >
              <div className="p-4 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 mb-4 transition-transform hover:scale-110">
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="text-2xl md:text-3xl font-bold mb-1 text-slate-900 dark:text-slate-100 tracking-tight">
                <AnimatedCounter
                  end={stat.end}
                  suffix={stat.suffix}
                  text={stat.text}
                />
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-center mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
