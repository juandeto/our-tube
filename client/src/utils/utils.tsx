import { VOTES_TYPES, VoteUser } from 'typing/shared';

export function getYoutubeVideoId(url: string) {
  const regex =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function formatDuration(seconds: number) {
  // Calculate minutes
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

  return `${minutes}:${formattedSeconds}`;
}

export function calculateVotePercentages(
  votes: VoteUser[],
  totalUsers: number
): { repeatPercentage: string; nextPercentage: string } {
  let repeatCount = 0;
  let nextCount = 0;

  votes.forEach((vote) => {
    if (vote.vote === VOTES_TYPES.REPEAT) {
      repeatCount++;
    } else if (vote.vote === VOTES_TYPES.NEXT) {
      nextCount++;
    }
  });

  const repeatPercentage =
    repeatCount && totalUsers
      ? ((repeatCount / totalUsers) * 100).toFixed(1)
      : '0';
  const nextPercentage =
    nextCount && totalUsers ? ((nextCount / totalUsers) * 100).toFixed(1) : '0';

  return {
    repeatPercentage,
    nextPercentage,
  };
}
