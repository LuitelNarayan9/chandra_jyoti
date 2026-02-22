"use client";

import { motion } from "framer-motion";

export function GoogleMap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full h-[400px] sm:h-[500px] mt-16 rounded-3xl overflow-hidden shadow-lg border border-stone-200/50 dark:border-stone-800/50 relative bg-stone-100 dark:bg-stone-900"
    >
      <iframe
        title="Tumin Dhanbari Google Map"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14143.535038318257!2d88.51351221715423!3d27.36371720888062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e6a090403cd453%3A0xc3c945ece5f43da2!2sTumin%2C%20Sikkim%20737134!5e0!3m2!1sen!2sin!4v1714561234567!5m2!1sen!2sin"
        className="w-full h-full border-0 grayscale-20 sepia-10 opacity-90 hover:grayscale-0 hover:sepia-0 hover:opacity-100 transition-all duration-700 pointer-events-auto"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </motion.div>
  );
}
