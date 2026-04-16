"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import {
  requestResidencySchema,
  type RequestResidencyInput,
} from "@/lib/validations/family-tree";
import { requestResidency } from "@/lib/actions/family-tree.actions";

export function ResidentVerification({ initiallyRequested = false }: { initiallyRequested?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(initiallyRequested);

  const form = useForm<RequestResidencyInput>({
    resolver: zodResolver(requestResidencySchema),
    defaultValues: {
      fatherName: "",
      motherName: "",
      acknowledgement: undefined,
    },
  });

  async function onSubmit(data: RequestResidencyInput) {
    setIsPending(true);
    try {
      const result = await requestResidency(data);
      if (result.success) {
        toast.success("Residency request submitted successfully.");
        setIsSubmitted(true);
        setIsOpen(false);
      } else {
        toast.error(result.error || "Failed to submit request.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex-1 w-full h-full flex items-center justify-center p-4">
      {/* Ambient background effect */}
      <div className="fixed inset-0 pointer-events-none w-full h-full gradient-blur" />

      <div className="relative z-10 max-w-xl w-full mx-auto p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center ring-8 ring-primary/10">
            <ShieldAlert className="h-8 w-8" />
          </div>

          {!isSubmitted ? (
            <>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  Verification Required
                </h1>
                <p className="text-muted-foreground">
                  The Family Tree is an exclusive feature for verified residents
                  of Tumin Dhanbari village.
                </p>
              </div>

              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8">
                    Click here to request access
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Request Residency Status</DialogTitle>
                    <DialogDescription>
                      Please provide your parents' names to help the admins verify
                      your connection to the village.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6 mt-4"
                    >
                      <FormField
                        control={form.control}
                        name="fatherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Father's Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Ram Kumar Luitel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="motherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mother's Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Sita Devi Luitel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="acknowledgement"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md bg-muted/30">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium leading-snug">
                                I confirm that I am a true resident of Tumin Dhanbari village and the provided parental details are accurate. I understand that submitting fraudulent claims violates community guidelines.
                              </FormLabel>
                            </div>
                            <FormMessage className="col-span-2 block" />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-3 pt-2 w-full">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsOpen(false)}
                          disabled={isPending}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Applying...
                            </>
                          ) : (
                            "Apply"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <div className="space-y-4 py-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                Request Sent Successfully
              </h2>
              <p className="text-muted-foreground text-center text-lg leading-relaxed max-w-md mx-auto">
                Thank you for your request. The admin will verify and approve your request within <strong>12-24 hours</strong>. After approval, you will be able to view all village family trees and create your own.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
