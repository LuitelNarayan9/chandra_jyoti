import { getUnvotedAdminPoll } from "@/lib/queries/forum.queries";
import { AdminPollInteractive } from "./admin-poll-interactive";

export async function AdminPollPresenter() {
  const poll = await getUnvotedAdminPoll();

  if (!poll) return null;

  const validPoll = {
    id: poll.id,
    question: poll.question,
    description: poll.description,
    type: poll.type as "DISMISSIBLE" | "NON_DISMISSIBLE",
    isMultiChoice: poll.isMultiChoice,
    options: poll.options.map((o) => ({ id: o.id, text: o.text })),
  };

  return <AdminPollInteractive poll={validPoll} />;
}
