import { Input } from './Ui/Input';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { Button } from './Ui/Button';

export default function VolumeHandler({
  handleVolumePlayer,
  volume,
}: {
  handleVolumePlayer: (v: string) => void;
  volume: number;
}) {
  return (
    <div className="p-4 inline">
      <div className="flex justify-between gap-4">
        <Button
          className="align-center rounded-full px-2 hover:scale-110 transition-transform"
          onClick={() => handleVolumePlayer('0')}
          variant="ghost"
        >
          <VolumeX />
        </Button>
        <Button
          className="align-center rounded-full px-2 hover:scale-110 transition-transform"
          variant="ghost"
        >
          <Volume1 onClick={() => handleVolumePlayer('50')} />
        </Button>
        <Button
          className="align-center rounded-full px-2 hover:scale-110 transition-transform"
          variant="ghost"
        >
          <Volume2 onClick={() => handleVolumePlayer('100')} />
        </Button>
      </div>
      <div className="w-36">
        <Input
          className="px-0"
          type="range"
          id="volume"
          name="volume"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => {
            handleVolumePlayer(e.target.value);
          }}
        />
      </div>
    </div>
  );
}
