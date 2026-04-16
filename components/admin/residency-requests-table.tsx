"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Inbox,
  ShieldCheck,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  approveResidencyRequest,
  rejectResidencyRequest,
} from "@/lib/actions/family-tree.actions";

type Request = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  createdAt: Date;
};

export function ResidencyRequestsTable({
  requests: initialRequests,
}: {
  requests: Request[];
}) {
  const [requests, setRequests] = useState(initialRequests);

  if (requests.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">All Clear!</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            There are no pending residency requests to review right now. Check
            back later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Pending Requests
          </CardTitle>
          <Badge variant="secondary">
            {requests.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <RequestRow
                key={req.id}
                request={req}
                onRemove={(id) =>
                  setRequests((prev) => prev.filter((r) => r.id !== id))
                }
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RequestRow({
  request,
  onRemove,
}: {
  request: Request;
  onRemove: (id: string) => void;
}) {
  const [approving, startApprove] = useTransition();
  const [rejecting, startReject] = useTransition();
  const isLoading = approving || rejecting;

  const fullName =
    `${request.firstName || ""} ${request.lastName || ""}`.trim() || "Unknown";
  const initials = `${(request.firstName || "?")[0]}${(request.lastName || "?")[0]}`.toUpperCase();

  function handleApprove() {
    startApprove(async () => {
      const result = await approveResidencyRequest(request.id);
      if (result.success) {
        toast.success(`${fullName} has been approved as a resident.`);
        onRemove(request.id);
      } else {
        toast.error(result.error || "Failed to approve.");
      }
    });
  }

  function handleReject() {
    startReject(async () => {
      const result = await rejectResidencyRequest(request.id);
      if (result.success) {
        toast.success(`${fullName}'s request has been rejected.`);
        onRemove(request.id);
      } else {
        toast.error(result.error || "Failed to reject.");
      }
    });
  }

  return (
    <TableRow className={isLoading ? "opacity-50 pointer-events-none" : ""}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={request.avatar || ""} alt={fullName} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{fullName}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{request.email}</TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {new Date(request.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800"
            onClick={handleReject}
            disabled={isLoading}
          >
            {rejecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4 mr-1" />
            )}
            Reject
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleApprove}
            disabled={isLoading}
          >
            {approving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-1" />
            )}
            Approve
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
