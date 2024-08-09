import { UserChatMsg } from 'typing/shared';
import { Input } from './Ui/Input';
import { Button } from './Ui/Button';
import { useRef } from 'react';

export default function ChannelChat({
  chatMessages,
  onSubmitChatMsg,
}: {
  chatMessages: UserChatMsg[];
  onSubmitChatMsg: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="w-full">
      <div className="min-h-48 md:h-96 overflow-y-auto bg-secondary shadow-inner px-2 pt-2">
        {chatMessages.map((msg, index) => (
          <p key={index} className="text-lg text-primary">
            <b>{msg.username}:</b> {msg.message}
          </p>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          onSubmitChatMsg(e);
          if (inputRef?.current) {
            inputRef.current.value = '';
          }
        }}
        className="flex"
      >
        <Input ref={inputRef} type="text" name="message" id="message" />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
