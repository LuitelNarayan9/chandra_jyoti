"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  approveFamilyMember,
  rejectFamilyMember,
  approveFamilyEdge,
  rejectFamilyEdge,
} from "@/lib/actions/admin-family.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Users, GitBranch, Loader2 } from "lucide-react";

interface PendingNode {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  familyClan: string | null;
  generation: number | null;
  createdAt: string | Date;
  addedByUser: { firstName: string; lastName: string };
}

interface PendingEdge {
  id: string;
  type: string;
  createdAt: string | Date;
  fromNode: { firstName: string; lastName: string };
  toNode: { firstName: string; lastName: string };
  addedByUser: { firstName: string; lastName: string };
}

interface AdminFamilyApprovalsProps {
  pendingNodes: PendingNode[];
  pendingEdges: PendingEdge[];
}

function ApproveRejectButtons({
  id,
  type,
}: {
  id: string;
  type: "node" | "edge";
}) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const result =
        type === "node"
          ? await approveFamilyMember(id)
          : await approveFamilyEdge(id);
      if (result.success) {
        toast.success("Approved successfully!");
      } else {
        toast.error(result.error || "Failed to approve.");
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result =
        type === "node"
          ? await rejectFamilyMember(id)
          : await rejectFamilyEdge(id);
      if (result.success) {
        toast.success("Rejected and removed.");
      } else {
        toast.error(result.error || "Failed to reject.");
      }
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <Button
        size="sm"
        variant="outline"
        className="h-8 gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950"
        onClick={handleApprove}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
        onClick={handleReject}
        disabled={isPending}
      >
        <X className="h-3.5 w-3.5" />
        Reject
      </Button>
    </div>
  );
}

function formatEdgeType(type: string) {
  const map: Record<string, string> = {
    PARENT_CHILD: "Parent → Child",
    SPOUSE: "Spouse",
    ADOPTION: "Adoption",
    DIVORCED_SPOUSE: "Divorced Spouse",
  };
  return map[type] || type;
}

export function AdminFamilyApprovals({
  pendingNodes,
  pendingEdges,
}: AdminFamilyApprovalsProps) {
  const hasNodes = pendingNodes.length > 0;
  const hasEdges = pendingEdges.length > 0;

  if (!hasNodes && !hasEdges) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-6 mb-4">
          <Check className="h-10 w-10 text-emerald-500" />
        </div>
        <h3 className="text-lg font-semibold mb-1">All caught up!</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          There are no pending family tree submissions to review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Members */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Pending Members</CardTitle>
            <Badge variant="secondary" className="ml-auto">
              {pendingNodes.length}
            </Badge>
          </div>
          <CardDescription>
            New family members awaiting approval to appear in the tree.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasNodes ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No pending members.
            </p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Clan</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingNodes.map((node) => (
                    <TableRow key={node.id}>
                      <TableCell className="font-medium">
                        {node.firstName} {node.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {node.gender}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {node.familyClan || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {node.addedByUser.firstName} {node.addedByUser.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(node.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <ApproveRejectButtons id={node.id} type="node" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Edges */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Pending Relationships</CardTitle>
            <Badge variant="secondary" className="ml-auto">
              {pendingEdges.length}
            </Badge>
          </div>
          <CardDescription>
            Relationship connections awaiting admin approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasEdges ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No pending relationships.
            </p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingEdges.map((edge) => (
                    <TableRow key={edge.id}>
                      <TableCell className="font-medium">
                        {edge.fromNode.firstName} {edge.fromNode.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {formatEdgeType(edge.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {edge.toNode.firstName} {edge.toNode.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {edge.addedByUser.firstName} {edge.addedByUser.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(edge.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <ApproveRejectButtons id={edge.id} type="edge" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
