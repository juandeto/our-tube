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
      <div className="pt-4 flex gap-4 items-center justify-center">
        <span className="flex-col flex gap-1 items-center justify-center">
          <h4>Repeat video</h4>
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
        <span className="flex-col flex gap-1 items-center justify-center">
          <h4>Next Video</h4>
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
      <span className="text-neutral-500">
        (Action that gets more than 50% gets executed)
      </span>
    </div>
  );
}
