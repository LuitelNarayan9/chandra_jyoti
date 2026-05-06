"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
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
import {
  Loader2,
  AlertTriangle,
  UserPlus,
  Link2,
  Search,
  Check,
  User,
  Calendar,
  Briefcase,
  FileText,
  Heart,
  Droplets,
  Users,
} from "lucide-react";
import {
  addRelativeSchema,
  type AddRelativeInput,
} from "@/lib/validations/family-tree";
import {
  addRelative,
  linkExistingRelative,
} from "@/lib/actions/family-tree.actions";
import type { TreeNode, FamilyEdgeData } from "@/types/family-tree";
import {
  getConnectedNodeIds,
  getNodeColor,
  getInitials,
} from "@/lib/family-tree-utils";
import posthog from "posthog-js";

interface AddRelativeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetNode: TreeNode;
  clans: string[];
  allNodes?: TreeNode[];
  edges?: FamilyEdgeData[];
  preselectedRelationship?:
    | "FATHER"
    | "MOTHER"
    | "SPOUSE"
    | "CHILD"
    | "BROTHER"
    | "SISTER";
}

export function AddRelativeForm({
  open,
  onOpenChange,
  targetNode,
  clans,
  allNodes = [],
  edges = [],
  preselectedRelationship,
}: AddRelativeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [openClanDropdown, setOpenClanDropdown] = useState(false);
  const [mode, setMode] = useState<"create" | "link">("create");
  const [linkSearch, setLinkSearch] = useState("");
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [linkAliveFilter, setLinkAliveFilter] = useState<
    "all" | "alive" | "deceased"
  >("all");

  // O(1) lookup map for node resolution
  const nodesMap = useMemo(
    () => new Map(allNodes.map((n) => [n.id, n])),
    [allNodes]
  );

  // Determine which parents already exist for this member
  const { hasFather, hasMother } = useMemo(() => {
    if (!edges.length || !allNodes.length)
      return { hasFather: false, hasMother: false };
    const parentEdges = edges.filter(
      (e) =>
        e.toNodeId === targetNode.id &&
        (e.type === "PARENT_CHILD" || e.type === "ADOPTION")
    );
    let father = false;
    let mother = false;
    for (const pe of parentEdges) {
      const parent = nodesMap.get(pe.fromNodeId);
      if (parent?.gender === "MALE") father = true;
      if (parent?.gender === "FEMALE") mother = true;
    }
    return { hasFather: father, hasMother: mother };
  }, [targetNode.id, edges, allNodes.length, nodesMap]);

  // Find target's spouse(s) for auto-suggesting the second parent
  const targetSpouses = useMemo(() => {
    if (!edges.length || !allNodes.length) return [];
    const spouseIds = new Set<string>();
    edges.forEach((e) => {
      if (e.type === "SPOUSE" || e.type === "DIVORCED_SPOUSE") {
        if (e.fromNodeId === targetNode.id) spouseIds.add(e.toNodeId);
        if (e.toNodeId === targetNode.id) spouseIds.add(e.fromNodeId);
      }
    });
    return allNodes.filter((n) => spouseIds.has(n.id));
  }, [targetNode.id, edges, allNodes]);

  // All possible second parents: same clan members (excluding the target itself + the new child being created)
  const secondParentCandidates = useMemo(() => {
    if (!allNodes.length) return [];
    return allNodes.filter((n) => n.id !== targetNode.id);
  }, [allNodes, targetNode.id]);

  const defaultSecondParentId =
    targetSpouses.length === 1 ? targetSpouses[0].id : "";

  const form = useForm<AddRelativeInput>({
    resolver: zodResolver(addRelativeSchema),
    defaultValues: {
      relatedToNodeId: targetNode.id,
      relationshipType: preselectedRelationship || undefined,
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
      secondParentId: defaultSecondParentId,
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
        relationshipType: preselectedRelationship || undefined,
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
        secondParentId: defaultSecondParentId,
        startDate: "",
        endDate: "",
        notes: "",
      });
      setMode("create");
      setLinkSearch("");
      setSelectedLinkId(null);
      setLinkAliveFilter("all");
    }
  }, [
    open,
    targetNode.id,
    targetNode.familyClan,
    form,
    preselectedRelationship,
    defaultSecondParentId,
  ]);

  const watchRelationship = form.watch("relationshipType");
  const watchIsAlive = form.watch("isAlive");
  const watchSecondParentId = form.watch("secondParentId");
  const [secondParentSearch, setSecondParentSearch] = useState("");
  const [showSecondParentDropdown, setShowSecondParentDropdown] =
    useState(false);

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

  // BFS: compute connected tree IDs (excludes these from link candidates)
  const connectedIds = useMemo(
    () => getConnectedNodeIds(targetNode.id, edges),
    [targetNode.id, edges]
  );

  // Link existing candidates: same clan, correct gender, not in connected tree
  const linkCandidates = useMemo(() => {
    if (!allNodes.length || !watchRelationship) return [];

    return allNodes.filter((n) => {
      // Exclude members already in the target's connected tree
      if (connectedIds.has(n.id)) return false;

      // Gender filter based on relationship
      if (watchRelationship === "FATHER" || watchRelationship === "BROTHER") {
        if (n.gender !== "MALE") return false;
      } else if (
        watchRelationship === "MOTHER" ||
        watchRelationship === "SISTER"
      ) {
        if (n.gender !== "FEMALE") return false;
      } else if (watchRelationship === "SPOUSE") {
        // Spouse should be opposite gender (or allow any for OTHER)
        if (targetNode.gender === "MALE" && n.gender !== "FEMALE") return false;
        if (targetNode.gender === "FEMALE" && n.gender !== "MALE") return false;
      }
      // CHILD: no gender filter

      // For FATHER, BROTHER, SISTER — same clan only
      // For MOTHER, SPOUSE, CHILD — any clan (mothers/spouses typically come from different clans)
      if (
        (watchRelationship === "FATHER" ||
          watchRelationship === "BROTHER" ||
          watchRelationship === "SISTER") &&
        targetNode.familyClan &&
        n.familyClan !== targetNode.familyClan
      ) {
        return false;
      }

      // Alive/Deceased filter
      if (linkAliveFilter === "alive" && !n.isAlive) return false;
      if (linkAliveFilter === "deceased" && n.isAlive) return false;

      // Age/DOB filter based on relationship (only when both DOBs are available)
      if (targetNode.dateOfBirth && n.dateOfBirth) {
        const targetDob = new Date(targetNode.dateOfBirth);
        const candidateDob = new Date(n.dateOfBirth);

        if (watchRelationship === "FATHER" || watchRelationship === "MOTHER") {
          // Parent must be older (born before the target)
          if (candidateDob >= targetDob) return false;
        } else if (watchRelationship === "CHILD") {
          // Child must be younger (born after the target)
          if (candidateDob <= targetDob) return false;
        }
        // SPOUSE, BROTHER, SISTER — no age restriction
      }

      // Search filter
      if (linkSearch) {
        const q = linkSearch.toLowerCase();
        const fullName = `${n.firstName} ${n.lastName}`.toLowerCase();
        if (!fullName.includes(q)) return false;
      }

      return true;
    });
  }, [
    allNodes,
    watchRelationship,
    connectedIds,
    targetNode.gender,
    targetNode.familyClan,
    targetNode.dateOfBirth,
    linkAliveFilter,
    linkSearch,
  ]);

  function onSubmit(data: AddRelativeInput) {
    // Client-side DOB age validation (only when both DOBs are available)
    if (data.dateOfBirth && targetNode.dateOfBirth) {
      const newDob = new Date(data.dateOfBirth);
      const targetDob = new Date(targetNode.dateOfBirth);

      if (
        data.relationshipType === "FATHER" ||
        data.relationshipType === "MOTHER"
      ) {
        // Parent must be born BEFORE the child
        if (newDob >= targetDob) {
          const label =
            data.relationshipType === "FATHER" ? "Father" : "Mother";
          toast.error(
            `${label} must be older than ${targetName}. The date of birth you entered (${data.dateOfBirth}) is not before ${targetName}'s date of birth (${targetNode.dateOfBirth}).`
          );
          return;
        }
      } else if (data.relationshipType === "CHILD") {
        // Child must be born AFTER the parent
        if (newDob <= targetDob) {
          toast.error(
            `A child must be younger than ${targetName}. The date of birth you entered (${data.dateOfBirth}) is not after ${targetName}'s date of birth (${targetNode.dateOfBirth}).`
          );
          return;
        }
      }
      // SPOUSE, BROTHER, SISTER — no age restriction
    }

    startTransition(async () => {
      const result = await addRelative(data);
      if (result.success) {
        toast.success(result.data?.message || "Relative added!");
        posthog.capture("family_tree_member_added", {
          targetId: result.data?.nodeId,
          relationship: data.relationshipType,
        });
        onOpenChange(false);
        form.reset();
      } else {
        toast.error(result.error || "Something went wrong.");
      }
    });
  }

  function handleLinkExisting() {
    if (!selectedLinkId || !watchRelationship) return;
    startTransition(async () => {
      const result = await linkExistingRelative({
        targetNodeId: targetNode.id,
        existingNodeId: selectedLinkId,
        relationshipType: watchRelationship,
      });
      if (result.success) {
        toast.success(result.data?.message || "Member linked!");
        posthog.capture("family_tree_member_linked", {
          targetId: selectedLinkId,
          relationship: watchRelationship,
        });
        onOpenChange(false);
        setSelectedLinkId(null);
        setLinkSearch("");
      } else {
        toast.error(result.error || "Something went wrong.");
      }
    });
  }

  const targetName =
    `${targetNode.firstName || ""} ${targetNode.lastName || ""}`.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-zinc-200 dark:border-zinc-700/80 shadow-2xl p-0">
        {/* Header with gradient accent */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-500/15 dark:via-teal-500/10 px-6 pt-6 pb-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-400/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Add Relative
            </DialogTitle>
            <DialogDescription className="text-zinc-500 dark:text-zinc-400">
              Add a family member related to{" "}
              <strong className="text-zinc-700 dark:text-zinc-200">
                {targetName}
              </strong>
              . The submission will be reviewed by an admin.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-6 pb-6 space-y-5"
          >
            {/* Relationship Type */}
            <FormField
              control={form.control}
              name="relationshipType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
                    <Heart className="h-3.5 w-3.5" /> Relationship to{" "}
                    {targetName}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {!hasFather && (
                        <SelectItem value="FATHER">
                          Father of {targetName}
                        </SelectItem>
                      )}
                      {!hasMother && (
                        <SelectItem value="MOTHER">
                          Mother of {targetName}
                        </SelectItem>
                      )}
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

            {/* Mode toggle: Create New vs Link Existing */}
            {watchRelationship && (
              <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("create");
                    setSelectedLinkId(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === "create"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  Create New
                </button>
                <button
                  type="button"
                  onClick={() => setMode("link")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === "link"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  <Link2 className="h-4 w-4" />
                  Link Existing ({linkCandidates.length})
                </button>
              </div>
            )}

            {/* ═══ CREATE NEW MODE ═══ */}
            {mode === "create" && (
              <>
                {/* ── Section: Identity ── */}
                <fieldset className="space-y-3">
                  <legend className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    <User className="h-3.5 w-3.5" /> Identity
                  </legend>
                  {/* Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">
                            First Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-xl h-10"
                              placeholder="First name"
                              {...field}
                            />
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
                          <FormLabel className="text-xs font-medium">
                            Last Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-xl h-10"
                              placeholder="Last name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Gender + DOB */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">
                            Gender *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="rounded-xl h-10">
                                <SelectValue placeholder="Select gender" />
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
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">
                            Date of Birth
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="rounded-xl h-10"
                              {...field}
                              value={field.value || ""}
                            />
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
                      name="isAlive"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">
                            Status
                          </FormLabel>
                          <div className="flex items-center gap-3 h-10 px-3 rounded-xl border border-input bg-background">
                            <span
                              className={`text-sm ${field.value ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}
                            >
                              {field.value ? "♥ Alive" : "✝ Deceased"}
                            </span>
                            <FormControl>
                              <Switch
                                className="ml-auto"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                    {!watchIsAlive && (
                      <FormField
                        control={form.control}
                        name="dateOfDeath"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium">
                              Date of Death
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                className="rounded-xl h-10"
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
                </fieldset>

                <div className="border-t border-zinc-100 dark:border-zinc-800" />

                {/* ── Section: Details ── */}
                <fieldset className="space-y-3">
                  <legend className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    <Briefcase className="h-3.5 w-3.5" /> Details
                  </legend>
                  {/* Clan + Profession */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="familyClan"
                      render={({ field }) => (
                        <FormItem className="flex flex-col justify-end relative">
                          <FormLabel>Family Clan</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-xl h-10"
                              placeholder="Type or select clan"
                              {...field}
                              value={field.value?.toString()}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                setOpenClanDropdown(true);
                              }}
                              onFocus={() => setOpenClanDropdown(true)}
                              onBlur={() => {
                                setTimeout(
                                  () => setOpenClanDropdown(false),
                                  200
                                );
                              }}
                            />
                          </FormControl>
                          {openClanDropdown && (
                            <div className="absolute top-[68px] z-100 w-full rounded-xl border bg-popover text-popover-foreground shadow-lg outline-none animate-in fade-in-0 zoom-in-95">
                              <div className="max-h-[200px] overflow-auto p-1">
                                {clans
                                  .filter((clan) =>
                                    clan
                                      .toLowerCase()
                                      .includes(
                                        (field.value || "").toLowerCase()
                                      )
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
                          <FormLabel className="text-xs font-medium">
                            Profession
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-xl h-10"
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
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                            <Heart className="h-3 w-3 text-rose-400" /> Marital
                            Status
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || "SINGLE"}
                          >
                            <FormControl>
                              <SelectTrigger className="rounded-xl h-10">
                                <SelectValue placeholder="Select status" />
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
                            <Droplets className="h-3 w-3 text-red-400" /> Blood
                            Group
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="rounded-xl h-10">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
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
                            placeholder="A short note about this person..."
                            className="resize-none rounded-xl"
                            rows={2}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </fieldset>

                {/* Second Parent (when adding a CHILD) */}
                {watchRelationship === "CHILD" &&
                  secondParentCandidates.length > 0 && (
                    <FormField
                      control={form.control}
                      name="secondParentId"
                      render={({ field }) => {
                        const selectedParent = allNodes.find(
                          (n) => n.id === field.value
                        );
                        const filteredCandidates =
                          secondParentCandidates.filter((c) =>
                            `${c.firstName} ${c.lastName}`
                              .toLowerCase()
                              .includes(secondParentSearch.toLowerCase())
                          );

                        return (
                          <FormItem className="relative">
                            <FormLabel className="flex items-center gap-1">
                              Second Parent (Other Parent)
                              <span className="text-xs text-muted-foreground font-normal">
                                — optional
                              </span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Search for second parent..."
                                  value={
                                    showSecondParentDropdown
                                      ? secondParentSearch
                                      : selectedParent
                                        ? `${selectedParent.firstName} ${selectedParent.lastName}`
                                        : ""
                                  }
                                  onChange={(e) => {
                                    setSecondParentSearch(e.target.value);
                                    setShowSecondParentDropdown(true);
                                    // Clear the current selection if typing
                                    if (field.value) {
                                      field.onChange("");
                                    }
                                  }}
                                  onFocus={() => {
                                    setShowSecondParentDropdown(true);
                                    setSecondParentSearch("");
                                  }}
                                  onBlur={() => {
                                    setTimeout(
                                      () => setShowSecondParentDropdown(false),
                                      200
                                    );
                                  }}
                                />
                                {field.value && (
                                  <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                      field.onChange("");
                                      setSecondParentSearch("");
                                    }}
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </FormControl>
                            {showSecondParentDropdown && (
                              <div className="absolute top-[68px] z-[100] w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                                <div className="max-h-[200px] overflow-auto p-1">
                                  {/* Show target's spouse(s) first with a label */}
                                  {targetSpouses.length > 0 && (
                                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                      Spouse of {targetName}
                                    </div>
                                  )}
                                  {targetSpouses
                                    .filter((sp) =>
                                      `${sp.firstName} ${sp.lastName}`
                                        .toLowerCase()
                                        .includes(
                                          secondParentSearch.toLowerCase()
                                        )
                                    )
                                    .map((sp) => (
                                      <div
                                        key={sp.id}
                                        className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                                          field.value === sp.id
                                            ? "bg-accent"
                                            : ""
                                        }`}
                                        onClick={() => {
                                          field.onChange(sp.id);
                                          setShowSecondParentDropdown(false);
                                          setSecondParentSearch("");
                                        }}
                                      >
                                        <span className="mr-2 text-xs">💍</span>
                                        {sp.firstName} {sp.lastName}
                                        {sp.familyClan ? (
                                          <span className="ml-auto text-xs text-muted-foreground">
                                            {sp.familyClan}
                                          </span>
                                        ) : null}
                                      </div>
                                    ))}

                                  {/* Divider */}
                                  {targetSpouses.length > 0 &&
                                    filteredCandidates.length > 0 && (
                                      <div className="my-1 border-t border-border" />
                                    )}

                                  {/* Other members */}
                                  {filteredCandidates
                                    .filter(
                                      (c) =>
                                        !targetSpouses.some(
                                          (sp) => sp.id === c.id
                                        )
                                    )
                                    .slice(0, 20)
                                    .map((candidate) => (
                                      <div
                                        key={candidate.id}
                                        className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                                          field.value === candidate.id
                                            ? "bg-accent"
                                            : ""
                                        }`}
                                        onClick={() => {
                                          field.onChange(candidate.id);
                                          setShowSecondParentDropdown(false);
                                          setSecondParentSearch("");
                                        }}
                                      >
                                        {candidate.firstName}{" "}
                                        {candidate.lastName}
                                        {candidate.familyClan ? (
                                          <span className="ml-auto text-xs text-muted-foreground">
                                            {candidate.familyClan}
                                          </span>
                                        ) : null}
                                      </div>
                                    ))}

                                  {filteredCandidates.length === 0 && (
                                    <div className="py-2 text-center text-sm text-muted-foreground">
                                      No members found.
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            <FormMessage />

                            {/* Warning if no second parent selected */}
                            {!watchSecondParentId && (
                              <div className="flex items-start gap-1.5 mt-1.5 p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                                  No second parent selected. You can add one
                                  later via the member&apos;s profile.
                                </p>
                              </div>
                            )}
                          </FormItem>
                        );
                      }}
                    />
                  )}

                {/* Marriage date (only for spouse) */}
                {watchRelationship === "SPOUSE" && (
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Marriage Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="rounded-xl h-10"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button
                  type="submit"
                  className="w-full rounded-xl h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 transition-all"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Approval"
                  )}
                </Button>
              </>
            )}

            {/* ═══ LINK EXISTING MODE ═══ */}
            {mode === "link" && watchRelationship && (
              <div className="space-y-3">
                {/* Alive / Deceased filter */}
                <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 gap-1">
                  {(["all", "alive", "deceased"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setLinkAliveFilter(filter)}
                      className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                        linkAliveFilter === filter
                          ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                      }`}
                    >
                      {filter === "all" && "All"}
                      {filter === "alive" && (
                        <>
                          <span className="text-emerald-500">♥</span> Alive
                        </>
                      )}
                      {filter === "deceased" && (
                        <>
                          <span className="text-zinc-400">✝</span> Deceased
                        </>
                      )}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search by name..."
                    value={linkSearch}
                    onChange={(e) => setLinkSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                    className="pl-9 rounded-xl h-10"
                  />
                </div>

                {/* Candidate list */}
                <div className="max-h-[280px] overflow-y-auto space-y-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 p-2">
                  {linkCandidates.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        No matching members found from other family trees.
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        Try a different search or create a new member instead.
                      </p>
                    </div>
                  ) : (
                    linkCandidates.slice(0, 50).map((candidate) => {
                      const c = getNodeColor(
                        candidate.gender,
                        candidate.isAlive
                      );
                      const isSelected = selectedLinkId === candidate.id;

                      return (
                        <button
                          key={candidate.id}
                          type="button"
                          onClick={() =>
                            setSelectedLinkId(isSelected ? null : candidate.id)
                          }
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg border-2 transition-all text-left ${
                            isSelected
                              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm"
                              : "border-transparent hover:border-zinc-200 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {/* Avatar */}
                          <div
                            className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${c.fill}, ${c.stroke})`,
                            }}
                          >
                            {getInitials(
                              candidate.firstName,
                              candidate.lastName
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {candidate.firstName} {candidate.lastName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {candidate.familyClan && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                                  {candidate.familyClan}
                                </span>
                              )}
                              {candidate.birthYear && (
                                <span className="text-[10px] text-zinc-400">
                                  b. {candidate.birthYear}
                                </span>
                              )}
                              <span className="text-[10px] text-zinc-400">
                                {candidate.gender === "MALE"
                                  ? "♂"
                                  : candidate.gender === "FEMALE"
                                    ? "♀"
                                    : ""}
                              </span>
                              {!candidate.isAlive && (
                                <span className="text-[10px] text-zinc-400">
                                  (deceased)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Selection indicator */}
                          <div
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-500"
                                : "border-zinc-300 dark:border-zinc-600"
                            }`}
                          >
                            {isSelected && (
                              <Check
                                className="h-3 w-3 text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Link button */}
                <Button
                  type="button"
                  className="w-full rounded-xl h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 transition-all"
                  disabled={!selectedLinkId || isPending}
                  onClick={handleLinkExisting}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Linking...
                    </>
                  ) : (
                    <>
                      <Link2 className="mr-2 h-4 w-4" />
                      Link Selected Member
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
