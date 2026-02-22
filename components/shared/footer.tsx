"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About Us" },
  { href: "/events", label: "Events" },
  { href: "/blog", label: "Blog" },
  { href: "/contact-us", label: "Contact" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookie-policy", label: "Cookie Policy" },
];

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "Youtube" },
];

export function Footer() {
  return (
    <footer className="relative bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 overflow-hidden transition-colors">
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-amber-500/40 to-transparent" />

      {/* Background ambient */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[400px] rounded-full bg-amber-500/4 blur-[120px] pointer-events-none" />

      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 py-16 md:py-20 lg:py-24">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-col gap-6">
            <Logo />
            <p className="text-sm leading-relaxed text-stone-400 dark:text-stone-500 max-w-xs">
              Empowering the Tumin Dhanbari community through digital
              connection, cultural preservation, and collective growth.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="group h-10 w-10 rounded-full border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-500 hover:border-amber-400/50 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-400/10 dark:hover:bg-amber-400/5 transition-all duration-200"
                  >
                    <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 mb-6">
              Navigation
            </h3>
            <ul className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="h-px w-0 group-hover:w-4 bg-amber-500 dark:bg-amber-400 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 mb-6">
              Contact
            </h3>
            <ul className="flex flex-col gap-5">
              <li>
                <a
                  href="mailto:chandrajyotisanstha@gmail.com"
                  className="group flex items-start gap-3 text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors duration-200"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-500/70 dark:text-amber-500/60 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors" />
                  <span className="leading-relaxed break-all">
                    chandrajyotisanstha@gmail.com
                  </span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-stone-500 dark:text-stone-400">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500/70 dark:text-amber-500/60" />
                  <span className="leading-relaxed">
                    Tumin Dhanbari,
                    <br />
                    Sikkim, India
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-4 lg:col-start-9">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 mb-6">
              Newsletter
            </h3>
            <p className="text-sm text-stone-400 dark:text-stone-500 leading-relaxed mb-5">
              Stay updated with our latest news, events, and community
              initiatives.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Your email"
                required
                className="bg-stone-100 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus-visible:ring-amber-500/30 focus-visible:border-amber-500/50 rounded-xl h-11 flex-1"
              />
              <Button
                type="submit"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-xl bg-amber-500 hover:bg-amber-400 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-stone-950 border-0 shadow-none"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-stone-100 dark:bg-stone-800" />

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-6">
          <p className="text-xs text-stone-400 dark:text-stone-600">
            © {new Date().getFullYear()} Chandra Jyoti Sanstha. All rights
            reserved.
          </p>
          <div className="flex flex-wrap gap-4 md:gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-stone-400 dark:text-stone-600 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
