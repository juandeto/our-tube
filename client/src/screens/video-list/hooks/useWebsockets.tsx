import { useRef, useState, useEffect } from 'react';
import {
  EVENTS_TYPE,
  ReadyState,
  MessageResponse,
  WssEvent,
} from 'typing/shared';
import ENV from 'utils/constants';

export default function useWebsockets({
  listId,
  onMessageReceive,
  enabled,
}: {
  listId: string | undefined;
  onMessageReceive: (event: WssEvent<MessageResponse>) => void;
  enabled: boolean;
}) {
  const WS_URL = (listId: string) => `${ENV.WS_API_URL}/ws?listId=${listId}`;
  const webSocket = useRef<WebSocket | null>(null);

  const [webSocketReady, setWebSocketReady] = useState(false);

  useEffect(() => {
    const connectWebSocket = () => {
      if (webSocket.current || !URL || !enabled || !listId) return;
      console.log('run connectWebSocket');

      webSocket.current = new WebSocket(WS_URL(listId));

      webSocket.current.onopen = () => {
        console.log('open');
        setWebSocketReady(true);
      };

      webSocket.current.onmessage = function (event) {
        try {
          const msg = JSON.parse(event.data);

          onMessageReceive(msg);
        } catch (error) {
          console.error('Error parsing message', error);
        }
      };

      webSocket.current.onclose = function () {
        console.log('closing');
        setWebSocketReady(false);
      };

      webSocket.current.onerror = function (err: Event) {
        console.log('Socket encountered error: ', err, 'Closing socket');
        setWebSocketReady(false);

        if (webSocket.current && webSocket.current.readyState === 1) {
          webSocket.current.close(1000, 'closing');
        }
      };
    };

    connectWebSocket();
  }, [enabled, URL]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[webSocket?.current?.readyState || 4];

  function sendMessage<T>(event: EVENTS_TYPE, data: T) {
    webSocket?.current?.send(
      JSON.stringify({
        event,
        data,
      })
    );
  }

  return {
    connectionStatus,
    sendMessage,
    webSocketReady,
  };
}
