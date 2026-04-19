"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Compass, Map } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4 text-center overflow-hidden">
      {/* Background abstract elements */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-5 overflow-hidden flex items-center justify-center">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        >
          <Compass className="w-[800px] h-[800px]" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center max-w-md"
      >
        <div className="relative mb-8 flex justify-center items-center">
          <motion.div
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Map className="w-32 h-32 md:w-40 md:h-40 text-primary drop-shadow-xl opacity-80" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute -right-6 -bottom-4 bg-background rounded-full p-2 shadow-lg border"
          >
            <div className="bg-destructive/10 text-destructive text-sm font-bold px-3 py-1 rounded-full">
              404
            </div>
          </motion.div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
          Lost in the Archives
        </h1>

        <p className="text-lg text-muted-foreground mb-8 text-balance">
          The page you are looking for does not exist, has been moved, or you
          don't have access to it.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button
            asChild
            size="lg"
            className="gap-2.5 rounded-full px-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            <Link href="/home">
              <Home className="w-5 h-5" />
              Return Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 hover:-translate-y-0.5 transition-all"
          >
            <Link href="/contact-us">Contact Support</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
