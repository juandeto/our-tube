import useCopyToClipboard from 'screens/video-list/hooks/useCopyToClipboard';
import { Button } from './Ui/Button';

export default function LocationToClipboardButton() {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  function handleLinkCopied() {
    copyToClipboard(document.location.toString());
  }

  return (
    <div className="flex gap-1 items-center flex-col">
      <p>Share the link to your friends</p>
      <Button onClick={handleLinkCopied}>
        {isCopied ? 'Link copied!' : 'Copy link to clipboard'}
      </Button>
    </div>
  );
}
