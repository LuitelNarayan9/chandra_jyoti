"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, Link2 } from "lucide-react";
import type { TreeNode, FamilyEdgeData } from "@/types/family-tree";
import { getNodeColor, getInitials } from "@/lib/family-tree-utils";
import { linkExistingParent } from "@/lib/actions/family-tree.actions";

type MissingParentType = "FATHER" | "MOTHER";

interface MissingParentPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The child who is missing a parent */
  member: TreeNode;
  /** Which parent is missing */
  missingType: MissingParentType;
  /** All nodes in the tree */
  allNodes: TreeNode[];
  /** All edges in the tree */
  edges: FamilyEdgeData[];
  /** Called when user chooses to add a brand-new member instead */
  onAddNew: () => void;
}

export function MissingParentPicker({
  open,
  onOpenChange,
  member,
  missingType,
  allNodes,
  edges,
  onAddNew,
}: MissingParentPickerProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Find the existing parent (the one that IS present)
  const existingParent = useMemo(() => {
    const parentEdges = edges.filter(
      (e) =>
        e.toNodeId === member.id &&
        (e.type === "PARENT_CHILD" || e.type === "ADOPTION")
    );
    const parentNodes = parentEdges
      .map((e) => allNodes.find((n) => n.id === e.fromNodeId))
      .filter(Boolean) as TreeNode[];

    // The existing parent is the one whose gender is opposite to what's missing
    if (missingType === "MOTHER") {
      return parentNodes.find((p) => p.gender === "MALE") ?? null;
    } else {
      return parentNodes.find((p) => p.gender === "FEMALE") ?? null;
    }
  }, [member.id, edges, allNodes, missingType]);

  // Find the existing parent's spouses — these are candidates for the missing parent
  const spouseCandidates = useMemo(() => {
    if (!existingParent) return [];

    const spouseIds = new Set<string>();
    edges.forEach((e) => {
      if (e.type === "SPOUSE" || e.type === "DIVORCED_SPOUSE") {
        if (e.fromNodeId === existingParent.id) spouseIds.add(e.toNodeId);
        if (e.toNodeId === existingParent.id) spouseIds.add(e.fromNodeId);
      }
    });

    return allNodes.filter((n) => spouseIds.has(n.id));
  }, [existingParent, edges, allNodes]);

  const missingLabel = missingType === "MOTHER" ? "Mother" : "Father";
  const existingParentName = existingParent
    ? `${existingParent.firstName} ${existingParent.lastName}`
    : "";

  function handleLink() {
    if (!selectedId) return;

    startTransition(async () => {
      const result = await linkExistingParent(member.id, selectedId);
      if (result.success) {
        toast.success(result.message || "Parent linked successfully!");
        onOpenChange(false);
        setSelectedId(null);
      } else {
        toast.error(result.error || "Failed to link parent.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Add {missingLabel} for {member.firstName} {member.lastName}
          </DialogTitle>
          <DialogDescription>
            {spouseCandidates.length > 0 ? (
              <>
                Select {existingParentName}&apos;s spouse to link as{" "}
                {missingLabel.toLowerCase()}, or add a new person.
              </>
            ) : (
              <>
                No existing spouse found for the other parent. You can add a new{" "}
                {missingLabel.toLowerCase()}.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Spouse candidates list */}
          {spouseCandidates.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                {existingParentName}&apos;s Spouse{spouseCandidates.length > 1 ? "s" : ""}
              </p>
              {spouseCandidates.map((spouse) => {
                const c = getNodeColor(spouse.gender, spouse.isAlive);
                const isSelected = selectedId === spouse.id;

                return (
                  <button
                    key={spouse.id}
                    type="button"
                    onClick={() => setSelectedId(isSelected ? null : spouse.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${c.fill}, ${c.stroke})`,
                      }}
                    >
                      {getInitials(spouse.firstName, spouse.lastName)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {spouse.firstName} {spouse.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {spouse.familyClan && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                            {spouse.familyClan}
                          </span>
                        )}
                        {spouse.birthYear && (
                          <span className="text-[10px] text-zinc-400">
                            b. {spouse.birthYear}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-400">
                          {spouse.gender === "MALE" ? "♂" : spouse.gender === "FEMALE" ? "♀" : ""}
                        </span>
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
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Divider */}
          {spouseCandidates.length > 0 && (
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400 font-medium">
                  or
                </span>
              </div>
            </div>
          )}

          {/* Add new button */}
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              setSelectedId(null);
              onAddNew();
            }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span className="text-sm font-medium">
              Add New {missingLabel}
            </span>
          </button>
        </div>

        {/* Action buttons */}
        {selectedId && (
          <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSelectedId(null);
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleLink}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Link2 className="h-4 w-4 mr-2" />
              )}
              Link as {missingLabel}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
