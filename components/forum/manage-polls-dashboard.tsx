"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  LayoutList,
  Loader2,
  Trash2,
  Users,
  Eye,
  AlertCircle,
  X,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  cancelAdminPoll,
  publishAdminPoll,
  fetchAdminPollVoters,
} from "@/lib/actions/forum.actions";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ManagePollsDashboardProps = {
  initialPolls: any[];
  totalUsers: number;
};

export function ManagePollsDashboard({
  initialPolls,
  totalUsers,
}: ManagePollsDashboardProps) {
  // Use transition for publish & delete actions
  const [isPending, startTransition] = useTransition();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);

  const [deletePollId, setDeletePollId] = useState<string | null>(null);

  // Cache for fetched details
  const [pollDetailsCache, setPollDetailsCache] = useState<Record<string, any>>(
    {}
  );
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  // Stats
  const drafted = initialPolls.filter((p) => !p.isPublished).length;
  const published = initialPolls.filter((p) => p.isPublished).length;

  const handlePublish = (pollId: string) => {
    startTransition(async () => {
      const res = await publishAdminPoll(pollId);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleDelete = (pollId: string) => {
    setDeletePollId(pollId);
  };

  const confirmDelete = () => {
    if (!deletePollId) return;

    startTransition(async () => {
      const res = await cancelAdminPoll(deletePollId);
      if (res.success) {
        toast.success(res.message);
        if (selectedPollId === deletePollId) {
          setDetailsOpen(false);
          setSelectedPollId(null);
        }
        setDeletePollId(null);
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleViewDetails = async (pollId: string) => {
    setSelectedPollId(pollId);
    setDetailsOpen(true);

    // Fetch if not in cache
    if (!pollDetailsCache[pollId]) {
      setIsFetchingDetails(true);
      const res = await fetchAdminPollVoters(pollId);
      if (res.success && res.data) {
        setPollDetailsCache((prev) => ({ ...prev, [pollId]: res.data }));
      } else {
        toast.error("Failed to load poll details");
      }
      setIsFetchingDetails(false);
    }
  };

  const selectedPoll = initialPolls.find((p) => p.id === selectedPollId);
  const selectedDetails = pollDetailsCache[selectedPollId || ""];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-white/2 p-5">
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-2">
            <CheckCircle2 className="h-5 w-5" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Published
            </h3>
          </div>
          <p className="text-3xl font-bold">{published}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-white/2 p-5">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-2">
            <Clock className="h-5 w-5" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Drafts
            </h3>
          </div>
          <p className="text-3xl font-bold">{drafted}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-white/2 p-5">
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-2">
            <Users className="h-5 w-5" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Total Members
            </h3>
          </div>
          <p className="text-3xl font-bold">{totalUsers}</p>
        </div>
      </div>

      {/* Polls List */}
      <div className="space-y-4">
        {initialPolls.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">
              No polls yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Admin polls will appear here.
            </p>
          </div>
        ) : (
          initialPolls.map((poll) => {
            const totalVotes = poll.options.reduce(
              (sum: number, opt: any) => sum + opt._count.votes,
              0
            );
            const participationRate =
              totalUsers > 0 ? (totalVotes / totalUsers) * 100 : 0;

            return (
              <div
                key={poll.id}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-5 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 transition-all hover:border-amber-500/30"
              >
                {/* Info */}
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-start justify-between sm:justify-start gap-3">
                    <h3 className="font-semibold text-base leading-snug">
                      {poll.question}
                    </h3>
                    <div className="flex gap-2 shrink-0 border border-neutral-200 dark:border-white/10 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {poll.type === "DISMISSIBLE" ? "Soft" : "Mandatory"}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <LayoutList className="h-3.5 w-3.5" />
                      {poll._count.options} Options
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDistanceToNow(new Date(poll.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="h-4 w-4 rounded-full overflow-hidden bg-muted flex items-center justify-center text-[8px] font-bold">
                        {poll.createdBy.avatar ? (
                          <Image
                            src={poll.createdBy.avatar}
                            alt="Creator"
                            width={16}
                            height={16}
                            className="object-cover"
                          />
                        ) : (
                          poll.createdBy.firstName[0]
                        )}
                      </div>
                      {poll.createdBy.firstName}
                    </span>
                  </div>

                  {/* Progress (Only if published) */}
                  {poll.isPublished && (
                    <div className="pt-2">
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Participation
                        </span>
                        <span className="text-xs font-bold">
                          {totalVotes} / {totalUsers} voted
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(participationRate, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  {!poll.isPublished && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-none gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/20"
                      onClick={() => handlePublish(poll.id)}
                      disabled={isPending}
                    >
                      <Send className="h-3.5 w-3.5" /> Publish
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 sm:flex-none gap-2"
                    onClick={() => handleViewDetails(poll.id)}
                  >
                    <Eye className="h-3.5 w-3.5" /> Details
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-100 dark:border-red-500/20"
                    onClick={() => handleDelete(poll.id)}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletePollId}
        onOpenChange={(open) => !open && setDeletePollId(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
              <AlertCircle className="h-5 w-5" />
              Delete Poll
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-foreground/80">
              Are you sure you want to delete this poll?
            </p>
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3 text-sm text-red-800 dark:text-red-200">
              <p className="font-semibold mb-1">
                Warning: This action is permanent.
              </p>
              <p>
                This will permanently delete the poll along with{" "}
                <strong>all recorded votes</strong> and options.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setDeletePollId(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Permanently
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-xl mb-1">
                  {selectedPoll?.question}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Detailed voting breakdown
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50 dark:bg-[#111113]">
            {isFetchingDetails || !selectedDetails ? (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Loading voter details...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {selectedDetails.options.map((option: any) => (
                  <div key={option.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm bg-white dark:bg-white/5 border px-3 py-1.5 rounded-lg border-neutral-200 dark:border-white/10 shadow-sm inline-flex">
                        {option.text}
                      </h4>
                      <div className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {option.votes.length} votes
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 border-l-2 border-neutral-100 dark:border-white/5 mx-2">
                      {option.votes.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic col-span-2">
                          No votes yet
                        </span>
                      ) : (
                        option.votes.map((vote: any) => (
                          <div
                            key={vote.id}
                            className="flex items-center gap-2 bg-white dark:bg-white/5 border border-neutral-100 dark:border-white/10 rounded-lg p-2 shadow-sm"
                          >
                            <div className="h-6 w-6 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                              {vote.user.avatar ? (
                                <Image
                                  src={vote.user.avatar}
                                  alt="Voter"
                                  width={24}
                                  height={24}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <span className="text-[10px] font-bold">
                                  {vote.user.firstName[0]}
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-medium truncate">
                              {vote.user.firstName} {vote.user.lastName}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
