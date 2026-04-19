"use client";

import { motion } from "framer-motion";
import { Camera } from "lucide-react";

export function VillageHeritage() {
  const images = [
    {
      src: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=85&auto=format&fit=crop",
      alt: "Lush green valley",
      span: "md:col-span-2 md:row-span-2",
    },
    {
      src: "https://images.unsplash.com/photo-1544735716-e414c5b364db?w=600&q=85&auto=format&fit=crop",
      alt: "Traditional village path",
      span: "md:col-span-1 md:row-span-1",
    },
    {
      src: "https://images.unsplash.com/photo-1536696414777-628f8ac797a7?w=600&q=85&auto=format&fit=crop",
      alt: "Terraced farming",
      span: "md:col-span-1 md:row-span-1",
    },
    {
      src: "https://images.unsplash.com/photo-1626244195191-2ca4f420e6e7?w=600&q=85&auto=format&fit=crop",
      alt: "Himalayan sunset",
      span: "md:col-span-2 md:row-span-1",
    },
    {
      src: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=600&q=85&auto=format&fit=crop",
      alt: "Local festival",
      span: "md:col-span-1 md:row-span-2",
    },
    {
      src: "https://images.unsplash.com/photo-1617300067670-348259b34ced?w=600&q=85&auto=format&fit=crop",
      alt: "Morning mist over hills",
      span: "md:col-span-1 md:row-span-1",
    },
  ];

  return (
    <section className="relative py-24 bg-stone-100 dark:bg-black px-4 sm:px-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 px-4">
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500"
            >
              <Camera className="h-6 w-6" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-(family-name:--font-outfit) text-[clamp(2rem,3vw,3.5rem)] font-black text-stone-900 dark:text-stone-50"
            >
              Village <span className="text-amber-500">Heritage</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-stone-600 dark:text-stone-400 font-light max-w-sm"
          >
            A visual journey through the landscapes, traditions, and memories
            that define Tumin Dhanbari.
          </motion.p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-none md:grid-rows-3 gap-2 sm:gap-4 lg:gap-6 auto-rows-[150px] sm:auto-rows-[200px] md:auto-rows-[250px]">
          {images.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl bg-stone-200 dark:bg-stone-800 ${img.span}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-stone-900/0 hover:bg-stone-900/20 transition-colors duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
