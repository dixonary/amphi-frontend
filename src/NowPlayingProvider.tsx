import React from "react";
import firebase from "firebase";
import { useObjectVal } from "react-firebase-hooks/database/";
 
const NowPlayingContext = React.createContext<NowPlaying | undefined>(undefined);

export type NowPlaying = {
    video:string,
    queuedBy:string,
    seconds:number,
    queuedAt:number,
    startedAt:number,
    queuedByDisplayName:string
};

const NowPlayingProvider = ({children}:any) => {
  const nowPlayingRef = firebase.database().ref('currentVideo');
  const [ nowPlaying ] = useObjectVal<NowPlaying>(nowPlayingRef);

  console.log(nowPlaying);

  return (
    <NowPlayingContext.Provider
      value={nowPlaying}
    >
      {children}
    </NowPlayingContext.Provider>
  );
}

export { NowPlayingContext, NowPlayingProvider }