"use client";

import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";

const socialLinks = [
  {
    icon: Facebook,
    href: "https://facebook.com",
    label: "Facebook",
    color: "hover:text-[#1877F2] hover:bg-[#1877F2]/10",
  },
  {
    icon: Twitter,
    href: "https://twitter.com",
    label: "Twitter",
    color: "hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10",
  },
  {
    icon: Instagram,
    href: "https://instagram.com",
    label: "Instagram",
    color: "hover:text-[#E4405F] hover:bg-[#E4405F]/10",
  },
  {
    icon: Youtube,
    href: "https://youtube.com",
    label: "YouTube",
    color: "hover:text-[#FF0000] hover:bg-[#FF0000]/10",
  },
  {
    icon: Linkedin,
    href: "https://linkedin.com",
    label: "LinkedIn",
    color: "hover:text-[#0A66C2] hover:bg-[#0A66C2]/10",
  },
];

export function SocialLinks() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-12 bg-stone-50 dark:bg-stone-900/50 rounded-2xl p-8 text-center border border-stone-200/50 dark:border-stone-800/50 shadow-xs"
    >
      <h3 className="text-xl font-bold font-(family-name:--font-outfit) mb-6 text-stone-900 dark:text-stone-100">
        Connect With Us
      </h3>
      <div className="flex flex-wrap justify-center gap-4">
        {socialLinks.map((social, index) => {
          const Icon = social.icon;
          return (
            <motion.a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className={`p-4 rounded-full bg-white dark:bg-stone-950 border border-stone-200/50 dark:border-stone-800/50 text-stone-600 dark:text-stone-400 transition-all duration-300 shadow-xs hover:shadow-md ${social.color}`}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.1 * index,
                type: "spring",
                stiffness: 200,
              }}
              whileHover={{ y: -5 }}
            >
              <Icon className="h-6 w-6" />
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}
