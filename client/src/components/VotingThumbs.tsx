import { Button } from './Ui/Button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

export default function VotingThumbs() {
  return (
    <div className="p-4">
      <h4>Vote video</h4>
      <div className="py-4 flex gap-4 items-center">
        <Button type="button" variant="default">
          <ThumbsUp />
        </Button>

        <Button type="button" variant="default">
          <ThumbsDown />
        </Button>
      </div>
    </div>
  );
}
