import React, { useContext } from "react";
import { QueueItem, ServerContext } from "./ServerProvider";

const QueueProvider = ({ children }: any) => {
  const { state, sendCommand } = useContext(ServerContext);
  const currentUser = state?.currentUser;
  const queue = currentUser && state ? state.queues[currentUser.user] ?? [] : undefined;

  const enqueueAll = async (videoIds: string[]) => {
    await Promise.all(videoIds.map((videoId) => sendCommand("queue.add", { videoId })));
  };

  const enqueueVideo = async (videoId: string) => {
    await sendCommand("queue.add", { videoId });
  };

  const removeVideo = async (queueItemId: number) => {
    await sendCommand("queue.remove", { queueItemId });
  };

  const moveVideo = async (queueItemId: number, position: number) => {
    return (await sendCommand("queue.move", { queueItemId, position })).ok;
  };

  const obj = { queue, enqueueVideo, enqueueAll, removeVideo, moveVideo }

  return (<QueueContext.Provider value={obj}>
    {children}
  </QueueContext.Provider>
  );
}

type QueueInfo = {
  queue: QueueItem[] | undefined;
  enqueueVideo: (videoId: string) => Promise<void>;
  enqueueAll: (videoIds: string[]) => Promise<void>;
  removeVideo: (queueItemId: number) => Promise<void>;
  moveVideo: (queueItemId: number, position: number) => Promise<boolean>;
};

// An empty default value.
const noQueueInfo: QueueInfo = {
  queue: undefined,
  enqueueVideo: async () => { },
  enqueueAll: async () => { },
  removeVideo: async () => { },
  moveVideo: async () => false,
};

// A context sentinel for React to use.
const QueueContext = React.createContext<QueueInfo>(noQueueInfo);

export default QueueProvider;
export { QueueContext };