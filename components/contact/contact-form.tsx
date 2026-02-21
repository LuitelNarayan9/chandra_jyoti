"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ContactFormSchema,
  ContactFormValues,
} from "@/lib/validations/contact";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(data: ContactFormValues) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // Safety check — make sure server returned JSON not HTML
        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          toast.error("Server error.", {
            description: "Something went wrong on our end. Please try again.",
          });
          return;
        }

        const result = await res.json();

        if (res.ok && result.success) {
          toast.success("Message sent!", {
            description: "We'll get back to you within 24-48 hours.",
            duration: 5000,
          });
          form.reset();
        } else {
          toast.error("Failed to send message.", {
            description:
              result.error || "Something went wrong. Please try again.",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error("Contact form error:", error);
        toast.error("Failed to send message.", {
          description: "Please check your connection and try again.",
          duration: 5000,
        });
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800/50 rounded-2xl p-6 sm:p-8 shadow-xs"
    >
      <h2 className="text-2xl font-bold font-(family-name:--font-outfit) mb-6 text-stone-900 dark:text-stone-100">
        Send us a message
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      className="bg-stone-50/50 dark:bg-stone-950/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@example.com"
                      type="email"
                      {...field}
                      className="bg-stone-50/50 dark:bg-stone-950/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input
                    placeholder="How can we help?"
                    {...field}
                    className="bg-stone-50/50 dark:bg-stone-950/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your message here..."
                    className="min-h-[150px] resize-none bg-stone-50/50 dark:bg-stone-950/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto min-w-[150px] bg-amber-500 hover:bg-amber-600 text-white border-0"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isPending ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
