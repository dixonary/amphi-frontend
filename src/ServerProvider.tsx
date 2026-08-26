import React, { createContext, useEffect, useRef, useState } from "react";

export type Video = {
  title: string;
  channelTitle: string;
  durationSeconds: number;
  thumbnailUrl: string;
  embeddable: boolean;
};

export type CurrentPlayback = {
  videoId: string;
  queuerId: string;
  queuedAt: string;
  startedAt: string;
  durationSeconds: number;
};

export type User = {
  displayName: string;
  isAdmin: boolean;
  suspendedUntil: string | null;
};

export type CurrentUser = {
  user: string;
  displayName: string;
  isAdmin: boolean;
};

export type QueueItem = {
  queueItemId: number;
  videoId: string;
  queuedAt: string;
  position: number;
};

export type PlaybackBucketItem = {
  queueItemId: number;
  videoId: string;
  queuedAt: string;
  user: string;
  displayName: string;
};

export type HistoryEntry = {
  videoId: string;
  queuerId: string;
  queuedAt: string;
  playedAt: string;
};

export type ServerState = {
  viewerCount: number;
  settings: {
    maxPlayTime: number;
    minTimeDiff: number;
    skipMinPct: number;
    skipMinViewers: number;
  };
  currentVideo: CurrentPlayback | null;
  videos: Record<string, Video>;
  playlists: Record<string, { videoIds: string[] }>;
  buckets: PlaybackBucketItem[][];
  queues: Record<string, QueueItem[]>;
  history: HistoryEntry[];
  currentUser: CurrentUser | null;
  users: Record<string, User>;
  blacklist: Record<string, true>;
  voteSkip: {
    count: number;
    hasVoted: boolean;
  };
};

type CommandPayload = Record<string, unknown>;

type CommandResult = {
  ok: boolean;
  code?: string;
};

type ServerContextValue = {
  state: ServerState | null;
  connected: boolean;
  sendCommand: (type: string, payload?: CommandPayload) => Promise<CommandResult>;
};

const ServerContext = createContext<ServerContextValue>({
  state: null,
  connected: false,
  sendCommand: async () => ({ ok: false, code: "disconnected" }),
});

function getWebSocketUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

const ServerProvider = ({ children }: React.PropsWithChildren) => {
  const [state, setState] = useState<ServerState | null>(null);
  const [connected, setConnected] = useState(false);
  const connectionRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const pendingRequestsRef = useRef(new Map<string, (result: CommandResult) => void>());

  useEffect(() => {
    let disposed = false;

    const connect = () => {
      const connection = new WebSocket(getWebSocketUrl());
      connectionRef.current = connection;

      connection.onopen = () => {
        if (!disposed) {
          setConnected(true);
        }
      };

      connection.onmessage = (event) => {
        const message = JSON.parse(event.data) as { type?: string; state?: ServerState; requestId?: string; ok?: boolean; code?: string };
        if (message.type === "state" && message.state) {
          setState(message.state);
          return;
        }
        if (message.type === "result" && message.requestId) {
          const resolve = pendingRequestsRef.current.get(message.requestId);
          if (resolve) {
            pendingRequestsRef.current.delete(message.requestId);
            resolve({ ok: message.ok === true, code: message.code });
          }
        }
      };

      connection.onclose = () => {
        if (!disposed) {
          setConnected(false);
          reconnectTimerRef.current = window.setTimeout(connect, 1000);
        }
      };
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      connectionRef.current?.close();
      for (const resolve of pendingRequestsRef.current.values()) {
        resolve({ ok: false, code: "disconnected" });
      }
      pendingRequestsRef.current.clear();
    };
  }, []);

  const sendCommand = (type: string, payload: CommandPayload = {}) =>
    new Promise<CommandResult>((resolve) => {
      const connection = connectionRef.current;
      if (!connection || connection.readyState !== WebSocket.OPEN) {
        resolve({ ok: false, code: "disconnected" });
        return;
      }

      const requestId = crypto.randomUUID();
      pendingRequestsRef.current.set(requestId, resolve);
      connection.send(JSON.stringify({ type, requestId, ...payload }));
    });

  return (
    <ServerContext.Provider value={{ state, connected, sendCommand }}>
      {children}
    </ServerContext.Provider>
  );
};

export { ServerContext, ServerProvider };
