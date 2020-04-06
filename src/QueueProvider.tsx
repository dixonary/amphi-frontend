import React, { useContext } from "react";
import { UserContext } from "./UserProvider";
import { useObject } from "react-firebase-hooks/database/";
import firebase from "firebase";

const QueueProvider = ({children}:any) => {
  const currentUser = useContext(UserContext);
  const ref = firebase.database().ref(`queues/${currentUser?.uid}`);
  const [ queue ]   = useObject(ref);

  const enqueueVideo = async (videoId:string) => {

    if(currentUser === undefined) return;
    if(queue       === undefined) return;

    await queue.ref
      .child(queue.numChildren().toString())
      .child("video")
      .set(videoId);

  };

  const removeVideo = async (videoId:string) => {
    if(queue === undefined) return;

    let newQueue = queue.val() as VidInfo[] | null;
    if(newQueue === null) return;

    const idx = newQueue.findIndex((x) => x.video === videoId);
    if(idx === -1) return;

    newQueue.splice(idx, 1);
    
    await queue.ref.set(newQueue);

  };

  const moveVideo = async (vidId:string, toIdx:number) => {

    if(queue === undefined) return;

    const oldQueue = queue.val() as VidInfo[] | null;
    if(oldQueue === null) return;

    if(toIdx < 0 || toIdx >= oldQueue.length) return;

    // Build a list of the IDs
    let queueIds = oldQueue.map((x:any) => x.video);
    const fromIdx = queueIds.indexOf(vidId);
    if(fromIdx === -1) return;


    // Move the relevant ID to its new home
    queueIds.splice(fromIdx, 1);
    queueIds.splice(toIdx, 0, vidId);

    console.log(queueIds);

    const newQueue: VidInfo[] = [];
    oldQueue.forEach((vid) => {
      const newPos = queueIds.indexOf(vid.video);
      newQueue[newPos] = vid;
    });

    // Update the remote version
    await queue.ref.set(newQueue);
  };

  const obj = {queue, enqueueVideo, removeVideo, moveVideo}

  return (<QueueContext.Provider value={obj}>
    {children}
    </QueueContext.Provider>
  );
}

export type VidInfo = {
  video:string,
  queuedAt:number
}

// The type representing contents of our queue data.
type QueueInfo = {
  queue:firebase.database.DataSnapshot | undefined,
  enqueueVideo:(videoId:string) => any,
  removeVideo: (videoId:string) => any,
  moveVideo:(videoId:string, toIdx:number) => any
};

// An empty default value.
const noQueueInfo:QueueInfo = {
  queue:undefined,
  enqueueVideo:(v:string          ) => {},
  removeVideo :(v:string          ) => {},
  moveVideo   :(v:string, n:number) => {}
}

// A context sentinel for React to use.
const QueueContext = React.createContext<QueueInfo>(noQueueInfo);

export default QueueProvider;
export { QueueContext };