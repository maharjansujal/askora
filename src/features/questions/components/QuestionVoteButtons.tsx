import { VoteButtons } from "../../answers/components/VoteButton";
import { useVoteQuestion } from "../hooks/useVoteQuestion";
import { VoteValue } from "../types/questionTypes";

interface QuestionVoteButtonProps {
  questionId: string;
  score: number;
  userVote: VoteValue | null;
  disabled?: boolean;
}

export function QuestionVoteButtons({
  questionId,
  score,
  userVote,
  disabled = false,
}: QuestionVoteButtonProps) {
  const { voteQuestion, isVoting } = useVoteQuestion();

  function handleVote(value: VoteValue) {
    voteQuestion({ questionId, value: value ?? "UPVOTE" });
  }
  return (
    <VoteButtons
      score={score}
      userVote={userVote}
      onVote={handleVote}
      disabled={disabled || isVoting}
    />
  );
}
