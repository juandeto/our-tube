import { enqueueSnackbar } from 'notistack';
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
  let timeout = 250;
  const [webSocketReady, setWebSocketReady] = useState(false);

  const check = () => {
    if (!webSocket.current || webSocket.current.readyState == WebSocket.CLOSED)
      connectWebSocket(); //check if websocket instance is closed, if so call `connect` function.
  };

  const connectWebSocket = () => {
    if (webSocket.current || !enabled || !listId) return;
    let connectInterval: ReturnType<typeof setTimeout>;

    webSocket.current = new WebSocket(WS_URL(listId));

    webSocket.current.onopen = () => {
      console.log('open');
      setWebSocketReady(true);

      timeout = 250; // reset timer to 250 on open of websocket connection
      clearTimeout(connectInterval); // clear Interval on on open of websocket connection
    };

    webSocket.current.onmessage = function (event) {
      if (event.data === 'ping') return;

      try {
        const msg = JSON.parse(event.data);

        onMessageReceive(msg);
      } catch (error) {
        console.error('Error parsing message', error);
      }
    };

    webSocket.current.onclose = function (e) {
      console.log(
        `Socket is closed. Reconnect will be attempted in ${Math.min(
          10000 / 1000,
          (timeout + timeout) / 1000
        )} second.`,
        e.reason
      );

      enqueueSnackbar('Conection lost...', {
        variant: 'warning',
      });

      timeout = timeout + timeout; //increment retry interval
      connectInterval = setTimeout(check, Math.min(10000, timeout)); //call check function after timeout
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

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (webSocket.current) {
        webSocket.current.close();
        webSocket.current = null;
      }
    };
  }, [enabled, listId]);

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
