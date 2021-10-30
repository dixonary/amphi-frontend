import React, { useCallback, useEffect, useMemo, useState } from "react";
import firebase from "firebase";
import { useObjectVal } from "react-firebase-hooks/database/";

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

const NowPlayingProvider_ = ({ children }: any) => {
  const nowPlayingRef = firebase.database().ref("currentVideo");
  const [nowPlaying] = useObjectVal<NowPlaying>(nowPlayingRef);

  return (
    <NowPlayingContext.Provider value={nowPlaying}>
      {children}
    </NowPlayingContext.Provider>
  );
};

/**
 * A mock version of the NowPlayingProvider which, on spacebar, 
 * starts or stops a single song.
 */

const NowPlayingProviderMock = ({ children }: any) => {

  const [nowPlaying, setNowPlaying] = useState<NowPlaying | undefined>(undefined);

  const nowPlayingRaw = useMemo(() => ({
    video: "uxUATkpMQ8A",
    queuedBy: "uwcs:1300831",
    seconds: 215,
    queuedAt: 0,
    startedAt: Date.now(),
    queuedByDisplayName: "dixonary"
  }), []);

  const switchNowPlaying = useCallback((e:any) => {
    if (e.key === "k") {
      if (!nowPlaying)
        setNowPlaying(nowPlayingRaw);
      else
        setNowPlaying(undefined);
    }

  }, [nowPlaying]);

  useEffect(() => {

    window.addEventListener("keydown",switchNowPlaying);

    return (() => {
      window.removeEventListener("keydown", switchNowPlaying);
    });
      
  }, [switchNowPlaying]);

  return (
    <NowPlayingContext.Provider value={nowPlaying}>
      {children}
    </NowPlayingContext.Provider>
  );
};


// Switch between the main provider and the mock
const NowPlayingProvider = NowPlayingProvider_;

export { NowPlayingContext, NowPlayingProvider };
