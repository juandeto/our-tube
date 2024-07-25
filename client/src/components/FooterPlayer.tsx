import { useEffect, useState } from 'react';
import { Card } from './Ui/Card';
import VolumeHandler from './VolumeHandler';
import VotingActions from './VotingActions';
import { formatDuration } from 'utils/utils';
import { VOTES_TYPES, VoteUser } from 'typing/shared';

export default function FooterPlayer({
  handleVolumePlayer,
  videoTitle,
  author,
  duration,
  volume,
  handleUserVote,
  sendingVote,
  userVotes,
  totalUsers,
  username,
}: {
  handleVolumePlayer: (v: string) => void;
  videoTitle?: string;
  author?: string;
  duration?: number;
  volume: number;
  handleUserVote: (vote: VOTES_TYPES) => void;
  sendingVote: boolean;
  userVotes: VoteUser[];
  totalUsers: number;
  username: string;
}) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!duration) return;

    setTimeRemaining(duration);

    // Update the remaining time every second
    const interval = setInterval(() => {
      setTimeRemaining((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <Card className="border-[0.5px]  rounded-md flex m-4 justify-between">
      <VolumeHandler volume={volume} handleVolumePlayer={handleVolumePlayer} />
      <div className="p-4">
        <h4 className="text-xl">Video data</h4>
        {author && <div className="text-md">Author: {author}</div>}
        <div className="text-md">Title: {videoTitle}</div>
        <div className="text-md">{formatDuration(timeRemaining)}</div>
      </div>
      <VotingActions
        handleUserVote={handleUserVote}
        sendingVote={sendingVote}
        userVotes={userVotes}
        totalUsers={totalUsers}
        username={username}
      />
    </Card>
  );
}
