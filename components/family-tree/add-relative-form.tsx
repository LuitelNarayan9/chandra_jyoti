"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { Loader2 } from "lucide-react";
import {
  addRelativeSchema,
  type AddRelativeInput,
} from "@/lib/validations/family-tree";
import { addRelative } from "@/lib/actions/family-tree.actions";
import type { TreeNode } from "@/types/family-tree";

interface AddRelativeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetNode: TreeNode;
  clans: string[];
}

export function AddRelativeForm({
  open,
  onOpenChange,
  targetNode,
  clans,
}: AddRelativeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [openClanDropdown, setOpenClanDropdown] = useState(false);

  const form = useForm<AddRelativeInput>({
    resolver: zodResolver(addRelativeSchema),
    defaultValues: {
      relatedToNodeId: targetNode.id,
      relationshipType: undefined,
      firstName: "",
      lastName: "",
      gender: undefined,
      dateOfBirth: "",
      dateOfDeath: "",
      isAlive: true,
      familyClan: targetNode.familyClan || "",
      maritalStatus: "SINGLE",
      bloodGroup: "",
      profession: "",
      bio: "",
      startDate: "",
      endDate: "",
      notes: "",
    },
  });

  // Reset form when dialog opens with a new target
  useEffect(() => {
    if (open) {
      form.reset({
        relatedToNodeId: targetNode.id,
        relationshipType: undefined,
        firstName: "",
        lastName: "",
        gender: undefined,
        dateOfBirth: "",
        dateOfDeath: "",
        isAlive: true,
        familyClan: targetNode.familyClan || "",
        maritalStatus: "SINGLE",
        bloodGroup: "",
        profession: "",
        bio: "",
        startDate: "",
        endDate: "",
        notes: "",
      });
    }
  }, [open, targetNode.id, targetNode.familyClan, form]);

  const watchRelationship = form.watch("relationshipType");
  const watchIsAlive = form.watch("isAlive");

  // Auto-set gender and marital status based on relationship type
  useEffect(() => {
    if (watchRelationship === "FATHER" || watchRelationship === "BROTHER") {
      form.setValue("gender", "MALE");
    } else if (
      watchRelationship === "MOTHER" ||
      watchRelationship === "SISTER"
    ) {
      form.setValue("gender", "FEMALE");
    }

    if (
      watchRelationship === "FATHER" ||
      watchRelationship === "MOTHER" ||
      watchRelationship === "SPOUSE"
    ) {
      form.setValue("maritalStatus", "MARRIED");
    } else if (watchRelationship === "CHILD") {
      form.setValue("maritalStatus", "SINGLE");
    }
  }, [watchRelationship, form]);

  function onSubmit(data: AddRelativeInput) {
    startTransition(async () => {
      const result = await addRelative(data);
      if (result.success) {
        toast.success(result.data?.message || "Relative added!");
        onOpenChange(false);
        form.reset();
      } else {
        toast.error(result.error || "Something went wrong.");
      }
    });
  }

  const targetName =
    `${targetNode.firstName || ""} ${targetNode.lastName || ""}`.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Relative</DialogTitle>
          <DialogDescription>
            Add a family member related to <strong>{targetName}</strong>. The
            submission will be reviewed by an admin.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Relationship Type */}
            <FormField
              control={form.control}
              name="relationshipType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship to {targetName} *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FATHER">
                        Father of {targetName}
                      </SelectItem>
                      <SelectItem value="MOTHER">
                        Mother of {targetName}
                      </SelectItem>
                      <SelectItem value="CHILD">
                        Child of {targetName}
                      </SelectItem>
                      <SelectItem value="SPOUSE">
                        Spouse of {targetName}
                      </SelectItem>
                      <SelectItem value="BROTHER">
                        Brother of {targetName}
                      </SelectItem>
                      <SelectItem value="SISTER">
                        Sister of {targetName}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
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
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Gender + DOB */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
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

            {/* Alive status + Death date */}
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
                        onCheckedChange={field.onChange}
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

            {/* Clan + Profession */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="familyClan"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end relative">
                    <FormLabel>Family Clan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Type or select clan"
                        {...field}
                        value={field.value?.toString()}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setOpenClanDropdown(true);
                        }}
                        onFocus={() => setOpenClanDropdown(true)}
                        onBlur={() => {
                          // Allow click events on dropdown items before closing
                          setTimeout(() => setOpenClanDropdown(false), 200);
                        }}
                      />
                    </FormControl>
                    {openClanDropdown && (
                      <div className="absolute top-[68px] z-100 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                        <div className="max-h-[200px] overflow-auto p-1">
                          {clans
                            .filter((clan) =>
                              clan
                                .toLowerCase()
                                .includes((field.value || "").toLowerCase())
                            )
                            .map((clan) => (
                              <div
                                key={clan}
                                className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                onClick={() => {
                                  field.onChange(clan);
                                  setOpenClanDropdown(false);
                                }}
                              >
                                {clan}
                              </div>
                            ))}
                          {clans.filter((clan) =>
                            clan
                              .toLowerCase()
                              .includes((field.value || "").toLowerCase())
                          ).length === 0 && (
                            <div className="py-2 text-center text-sm text-muted-foreground">
                              No matches. Type to use custom.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
                      <Input
                        placeholder="e.g. Farmer"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Marital Status + Blood Group */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marital Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "SINGLE"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
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
              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group (optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short note about this person..."
                      className="resize-none"
                      rows={2}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Marriage date (only for spouse) */}
            {watchRelationship === "SPOUSE" && (
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marriage Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit for Approval"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
