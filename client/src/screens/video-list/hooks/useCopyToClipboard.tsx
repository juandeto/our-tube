import { useState } from 'react';

const unsecuredCopyToClipboard = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Unable to copy to clipboard', err);
  }
  document.body.removeChild(textArea);
};

export default function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (content: string) => {
    try {
      if (window.isSecureContext && navigator.clipboard) {
        navigator.clipboard.writeText(content);
      } else {
        unsecuredCopyToClipboard(content);
      }
      setIsCopied(true);
      console.log('Copied to clipboard:', content);
    } catch (error) {
      setIsCopied(false);
      console.error('Unable to copy to clipboard:', error);
    }
  };

  return { isCopied, copyToClipboard };
}
