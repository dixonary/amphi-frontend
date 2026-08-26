import { Spinner } from "react-bootstrap";
import React, { useContext } from "react";

import VideoListing from "./VideoListing";
import { Draggable, DragDropContext, Droppable } from '@hello-pangea/dnd';
import { QueueContext } from "./QueueProvider";
import { UserContext } from "./UserProvider";

const MyQueue = () => {
  const { currentUser: user } = useContext(UserContext);
  return (!user
    ? (<p>Sign in to see your queue.</p>)
    : (<UserQueue />)
  );
};

const UserQueue = () => {
  const { queue, moveVideo } = useContext(QueueContext);

  const reorderList = async ({ source, destination, draggableId }: any) => {
    if (!destination) return;
    if (source === destination) return;

    await moveVideo(Number(draggableId), destination.index)
  };

  if (queue === undefined) {
    return (<Spinner animation="border" />);
  }
  if (queue.length === 0) {
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
            {queue.map((v, idx) => (
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