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
import { Loader2, Trash2 } from "lucide-react";
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {memberName}</DialogTitle>
          <DialogDescription>
            Update member details. Non-admin changes will require admin
            re-approval.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <FormField
                control={form.control}
                name="isAlive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormLabel className="mt-0">Is Alive?</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(val) => {
                          field.onChange(val);
                          if (val) {
                            form.setValue("dateOfDeath", "");
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {!watchIsAlive && (
                <FormField
                  control={form.control}
                  name="dateOfDeath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Death</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="familyClan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Family Clan</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marital Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profession</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isPending}>
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
                    variant="destructive"
                    size="icon"
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove {memberName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove {memberName} and all their
                      connections from the family tree. This action cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
