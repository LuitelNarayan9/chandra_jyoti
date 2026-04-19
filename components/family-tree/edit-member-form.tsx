"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Trash2,
  User,
  Calendar,
  Heart,
  Briefcase,
  FileText,
  Droplets,
} from "lucide-react";
import {
  updateFamilyMemberSchema,
  type UpdateFamilyMemberInput,
} from "@/lib/validations/family-tree";
import {
  updateFamilyMember,
  deleteFamilyMember,
} from "@/lib/actions/family-tree.actions";
import type { TreeNode } from "@/types/family-tree";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EditMemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TreeNode;
}

function getMemberDefaultValues(member: TreeNode): UpdateFamilyMemberInput {
  return {
    memberId: member.id,
    firstName: member.firstName || "",
    lastName: member.lastName || "",
    gender: member.gender as "MALE" | "FEMALE" | "OTHER",
    dateOfBirth: member.dateOfBirth
      ? format(new Date(member.dateOfBirth), "yyyy-MM-dd")
      : "",
    dateOfDeath: member.dateOfDeath
      ? format(new Date(member.dateOfDeath), "yyyy-MM-dd")
      : "",
    familyClan: member.familyClan || "",
    bio: member.bio || "",
    maritalStatus:
      (member.maritalStatus as
        | "SINGLE"
        | "MARRIED"
        | "DIVORCED"
        | "WIDOWED") || "SINGLE",
    bloodGroup: member.bloodGroup || "",
    profession: member.profession || "",
    isAlive: member.isAlive !== false,
  };
}

export function EditMemberForm({
  open,
  onOpenChange,
  member,
}: EditMemberFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<UpdateFamilyMemberInput>({
    resolver: zodResolver(updateFamilyMemberSchema),
    defaultValues: getMemberDefaultValues(member),
  });

  // Ensure form values stay perfectly synchronized if the member prop changes while mounted
  useEffect(() => {
    form.reset(getMemberDefaultValues(member));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.id, form]);

  const watchIsAlive = form.watch("isAlive");

  function onSubmit(data: UpdateFamilyMemberInput) {
    startTransition(async () => {
      const result = await updateFamilyMember(data);
      if (result.success) {
        toast.success(result.message || "Updated successfully!");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Something went wrong.");
      }
    });
  }

  function handleDelete() {
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteFamilyMember(member.id);
      if (result.success) {
        toast.success(result.message || "Member removed.");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Something went wrong.");
      }
      setIsDeleting(false);
    });
  }

  const memberName =
    `${member.firstName || ""} ${member.lastName || ""}`.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-zinc-200 dark:border-zinc-700/80 shadow-2xl p-0">
        {/* Header with gradient accent */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent dark:from-violet-500/15 dark:via-indigo-500/10 px-6 pt-6 pb-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-400/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">
              Edit {memberName}
            </DialogTitle>
            <DialogDescription className="text-zinc-500 dark:text-zinc-400">
              Update member details. Non-admin changes require re-approval.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6 space-y-5">

            {/* ── Section: Identity ── */}
            <fieldset className="space-y-3">
              <legend className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                <User className="h-3.5 w-3.5" /> Identity
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">First Name</FormLabel>
                      <FormControl>
                        <Input className="rounded-xl h-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Last Name</FormLabel>
                      <FormControl>
                        <Input className="rounded-xl h-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl h-10">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="familyClan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Family Clan</FormLabel>
                      <FormControl>
                        <Input className="rounded-xl h-10" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>

            <div className="border-t border-zinc-100 dark:border-zinc-800" />

            {/* ── Section: Timeline ── */}
            <fieldset className="space-y-3">
              <legend className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                <Calendar className="h-3.5 w-3.5" /> Timeline
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" className="rounded-xl h-10" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isAlive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Status</FormLabel>
                      <div className="flex items-center gap-3 h-10 px-3 rounded-xl border border-input bg-background">
                        <span className={`text-sm ${field.value ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
                          {field.value ? "♥ Alive" : "✝ Deceased"}
                        </span>
                        <FormControl>
                          <Switch
                            className="ml-auto"
                            checked={field.value}
                            onCheckedChange={(val) => {
                              field.onChange(val);
                              if (val) {
                                form.setValue("dateOfDeath", "");
                              }
                            }}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              {!watchIsAlive && (
                <FormField
                  control={form.control}
                  name="dateOfDeath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Date of Death</FormLabel>
                      <FormControl>
                        <Input type="date" className="rounded-xl h-10" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </fieldset>

            <div className="border-t border-zinc-100 dark:border-zinc-800" />

            {/* ── Section: Details ── */}
            <fieldset className="space-y-3">
              <legend className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                <Briefcase className="h-3.5 w-3.5" /> Details
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                        <Heart className="h-3 w-3 text-rose-400" /> Marital Status
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl h-10">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="SINGLE">Single</SelectItem>
                          <SelectItem value="MARRIED">Married</SelectItem>
                          <SelectItem value="DIVORCED">Divorced</SelectItem>
                          <SelectItem value="WIDOWED">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                        <Droplets className="h-3 w-3 text-red-400" /> Blood Group
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-xl h-10">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                            (bg) => (
                              <SelectItem key={bg} value={bg}>
                                {bg}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Profession</FormLabel>
                    <FormControl>
                      <Input className="rounded-xl h-10" placeholder="e.g. Teacher, Farmer" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>

            <div className="border-t border-zinc-100 dark:border-zinc-800" />

            {/* ── Section: Bio ── */}
            <fieldset className="space-y-3">
              <legend className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                <FileText className="h-3.5 w-3.5" /> Bio
              </legend>
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        className="resize-none rounded-xl"
                        rows={3}
                        placeholder="A short note about this person..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>

            {/* ── Actions ── */}
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="flex-1 rounded-xl h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-500/20 transition-all"
                disabled={isPending}
              >
                {isPending && !isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-xl h-11 w-11 border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 hover:border-red-300"
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove {memberName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove {memberName} and all their
                      connections from the family tree. This action cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
