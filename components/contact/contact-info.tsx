"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const contactDetails = [
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Tumin Dhanbari Village, Gangtok District, Sikkim, India",
    delay: 0.1,
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "+91 98765 43210\n+91 91234 56789",
    delay: 0.2,
  },
  {
    icon: Mail,
    title: "Email Us",
    description: "contact@chandrajyoti.org\nsupport@chandrajyoti.org",
    delay: 0.3,
  },
  {
    icon: Clock,
    title: "Working Hours",
    description:
      "Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 10:00 AM - 2:00 PM",
    delay: 0.4,
  },
];

export function ContactInfo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {contactDetails.map((detail, index) => {
        const Icon = detail.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: detail.delay }}
          >
            <Card className="border-stone-200/50 bg-white/50 backdrop-blur-md shadow-xs dark:border-stone-800/50 dark:bg-stone-900/50 transition-all hover:bg-white dark:hover:bg-stone-900 hover:shadow-md h-full">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                    {detail.title}
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 whitespace-pre-line leading-relaxed">
                    {detail.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
