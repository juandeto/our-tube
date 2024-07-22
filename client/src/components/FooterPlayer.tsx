import { Card } from './Ui/Card';
import VolumeHandler from './VolumeHandler';
import VotingThumbs from './VotingThumbs';

export default function FooterPlayer({
  handleVolumePlayer,
  videoTitle,
  author,
}: {
  handleVolumePlayer: (v: string) => void;
  videoTitle: string;
  author: string;
}) {
  return (
    <Card className="border-[0.5px]  h-28 rounded-md flex m-4 justify-between">
      <VolumeHandler handleVolumePlayer={handleVolumePlayer} />
      <div className="p-4">
        <h4 className="text-xl">Video data</h4>
        {author && <div className="text-md py-2">author: {author}</div>}
        <div className="text-md py-2">Title: {videoTitle}</div>
      </div>
      <VotingThumbs />
    </Card>
  );
}
