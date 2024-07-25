import { VOTES_TYPES, VoteUser } from 'typing/shared';
import { Button } from './Ui/Button';
import { SkipForward, Repeat } from 'lucide-react';
import { calculateVotePercentages } from 'utils/utils';

export default function VotingThumbs({
  handleUserVote,
  sendingVote,
  userVotes,
  totalUsers,
  username,
}: {
  handleUserVote: (vote: VOTES_TYPES) => void;
  sendingVote: boolean;
  userVotes: VoteUser[];
  totalUsers: number;
  username: string;
}) {
  const percentages = calculateVotePercentages(userVotes, totalUsers);

  const thisUserVote = userVotes.find((vote) => vote.username === username);

  return (
    <div className="p-4">
      <h4>Actions to vote</h4>
      <div className="pt-4 flex gap-4 items-center">
        <span>
          <Button
            type="button"
            disabled={sendingVote}
            variant="default"
            onClick={() => handleUserVote(VOTES_TYPES.REPEAT)}
            className={`${
              thisUserVote?.vote === VOTES_TYPES.REPEAT
                ? 'bg-green-400'
                : 'bg-primary'
            }`}
          >
            <Repeat />
          </Button>
          <p className="py-1 text-center text-primary">
            {percentages.repeatPercentage}%
          </p>
        </span>
        <span>
          <Button
            type="button"
            disabled={sendingVote}
            variant="default"
            onClick={() => handleUserVote(VOTES_TYPES.NEXT)}
            className={`${
              thisUserVote?.vote === VOTES_TYPES.NEXT
                ? 'bg-green-400'
                : 'bg-primary'
            }`}
          >
            <SkipForward />
          </Button>
          <p className="py-1 text-center text-primary">
            {percentages.nextPercentage}%
          </p>
        </span>
      </div>
    </div>
  );
}
