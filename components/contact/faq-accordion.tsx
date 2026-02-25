"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Where is the Sanstha located?",
    answer:
      "Chandra Jyoti Sanstha is located in Tumin Dhanbari Village, East Sikkim, India. We serve the local community and our diaspora members globally.",
  },
  {
    question: "How can I update my family tree information?",
    answer:
      "Registered users can submit a request through the 'Family Tree' section by navigating to the desired member or adding a new branch. All changes are reviewed by administrators before being published.",
  },
  {
    question: "Are donations tax-deductible?",
    answer:
      "Yes, Chandra Jyoti Sanstha is a registered non-profit organization. We provide tax exemption receipts for all eligible donations made through the platform.",
  },
  {
    question: "Who can join the forum discussions?",
    answer:
      "Our forum is open to all registered community members. Guests are able to read public announcements, but an account is required to post or reply to threads.",
  },
  {
    question: "How do I pay a community fine?",
    answer:
      "You can securely pay fines through the 'Fines' section in your user dashboard using our integrated Razorpay gateway via UPI, Card, or Net Banking.",
  },
];

export function FaqAccordion() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto mt-24 mb-16"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold font-(family-name:--font-outfit) mb-4 text-stone-900 dark:text-stone-100">
          Frequently Asked Questions
        </h2>
        <p className="text-stone-600 dark:text-stone-400">
          Find quick answers to common questions about our platform and
          organization.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border-stone-200 dark:border-stone-800"
          >
            <AccordionTrigger className="text-left font-medium text-stone-900 dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-400">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-stone-600 dark:text-stone-400 leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
}
