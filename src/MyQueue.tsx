import { Spinner } from "react-bootstrap";
import React, { useContext, useEffect, useRef, useState } from "react";

import VideoListing from "./VideoListing";
import { Draggable, DragDropContext, Droppable } from '@hello-pangea/dnd';
import { QueueContext } from "./QueueProvider";
import { UserContext } from "./UserProvider";
import { QueueItem } from "./ServerProvider";

const MyQueue = () => {
  const { currentUser: user } = useContext(UserContext);
  return (!user
    ? (<p>Sign in to see your queue.</p>)
    : (<UserQueue />)
  );
};

const UserQueue = () => {
  const { queue, moveVideo } = useContext(QueueContext);
  const [displayQueue, setDisplayQueue] = useState(queue);
  const pendingQueue = useRef<QueueItem[] | undefined>(undefined);

  useEffect(() => {
    const pendingOrder = pendingQueue.current;
    const serverMatchesPendingOrder =
      pendingOrder !== undefined &&
      queue !== undefined &&
      pendingOrder.length === queue.length &&
      pendingOrder.every((item, index) => item.queueItemId === queue[index]?.queueItemId);
    if (pendingOrder === undefined || serverMatchesPendingOrder) {
      pendingQueue.current = undefined;
      setDisplayQueue(queue);
    }
  }, [queue]);

  const reorderList = async ({ source, destination, draggableId }: any) => {
    if (!destination) return;
    if (source.index === destination.index) return;

    if (!displayQueue) return;
    const reorderedQueue = [...displayQueue];
    const [movedItem] = reorderedQueue.splice(source.index, 1);
    reorderedQueue.splice(destination.index, 0, movedItem);
    pendingQueue.current = reorderedQueue;
    setDisplayQueue(reorderedQueue);

    const moved = await moveVideo(Number(draggableId), destination.index);
    if (!moved) {
      pendingQueue.current = undefined;
      setDisplayQueue(queue);
    }
  };

  if (displayQueue === undefined) {
    return (<Spinner animation="border" />);
  }
  if (displayQueue.length === 0) {
    return (<p>Your queue is empty.</p>);
  }

  return (
    <DragDropContext
      onDragEnd={reorderList}
    >
      <Droppable droppableId="myQueue">
        {(provided) => (
          <div className="queue"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {displayQueue.map((v, idx) => (
              <Draggable
                draggableId={String(v.queueItemId)}
                index={idx}
                key={v.queueItemId}
              >
                {(provided) => (
                  <VideoListing provided={provided} data={v} localQueue={true} />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default MyQueue;