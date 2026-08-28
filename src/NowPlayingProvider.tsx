import React, { useContext, useMemo } from "react";
import { ServerContext } from "./ServerProvider";

const NowPlayingContext = React.createContext<NowPlaying | undefined>(
  undefined
);

export type NowPlaying = {
  video: string;
  queuedBy: string;
  seconds: number;
  queuedAt: number;
  startedAt: number;
  queuedByDisplayName: string;
};

const NowPlayingProvider = ({ children }: any) => {
  const { state } = useContext(ServerContext);
  const playback = state?.currentVideo;
  const queuedByDisplayName = playback?.displayName ?? "";
  const nowPlaying = useMemo(
    () =>
      playback
        ? {
          video: playback.videoId,
          queuedBy: playback.queuerId,
          seconds: playback.durationSeconds,
          queuedAt: new Date(playback.queuedAt).getTime(),
          startedAt: new Date(playback.startedAt).getTime(),
          queuedByDisplayName,
        }
        : undefined,
    [playback?.videoId, playback?.queuerId, playback?.durationSeconds, playback?.queuedAt, playback?.startedAt, queuedByDisplayName]
  );

  return (
    <NowPlayingContext.Provider value={nowPlaying}>
      {children}
    </NowPlayingContext.Provider>
  );
};

export { NowPlayingContext, NowPlayingProvider };
