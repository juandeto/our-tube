import { useRef, useState } from 'react';
import { Input } from './Ui/Input';
import { Label } from './Ui/Label';
import { Volume1, Volume, Volume2, VolumeX } from 'lucide-react';

export default function VolumeHandler({
  handleVolumePlayer,
}: {
  handleVolumePlayer: (v: string) => void;
}) {
  const [volume, setVolume] = useState<number>(50);

  function getVolumeIcon() {
    switch (true) {
      case volume === 0:
        return <VolumeX />;
      case volume < 25:
        return <Volume />;
      case volume > 75:
        return <Volume2 />;
      default:
        return <Volume1 />;
    }
  }

  return (
    <div className="p-4 inline">
      <Label htmlFor="volume">{getVolumeIcon()}</Label>
      <div className="w-36">
        <Input
          className="px-0"
          type="range"
          id="volume"
          name="volume"
          min={0}
          max={100}
          onChange={(e) => {
            setVolume(Number(e.target.value));
            handleVolumePlayer(e.target.value);
          }}
        />
      </div>
    </div>
  );
}
