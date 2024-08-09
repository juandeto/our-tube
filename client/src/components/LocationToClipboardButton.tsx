import useCopyToClipboard from 'screens/video-list/hooks/useCopyToClipboard';
import { Button } from './Ui/Button';
import { Copy, Check } from 'lucide-react';

export default function LocationToClipboardButton() {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  function handleLinkCopied() {
    console.log({ locationString: document.location.toString() });
    copyToClipboard(document.location.toString());
  }

  return (
    <div className="flex gap-1 items-center animate-pulse">
      <p>Share the link!</p>
      <Button onClick={handleLinkCopied} variant="link">
        {isCopied ? <Check colorProfile={'green'} /> : <Copy />}
      </Button>
    </div>
  );
}
