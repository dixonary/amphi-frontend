import { Spinner } from "react-bootstrap";
import React, { useContext } from "react";
import firebase from "firebase";

import { useAuthState }         from "react-firebase-hooks/auth";

import VideoListing from "./VideoListing";
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd'; 
import { QueueContext, VidInfo } from "./QueueProvider";

const MyQueue = () => {
  const [ user ] = useAuthState(firebase.auth());
  return (!user
    ? (<p>Sign in to see your queue.</p>)
    : (<UserQueue user={user} />)
  );
};

const UserQueue = ({user}:{user:firebase.User}) => {
  const {queue, moveVideo} = useContext(QueueContext);

  const reorderList = async ({source, destination, draggableId}:any) => {
    if(!destination) return;
    if(source === destination) return;

    await moveVideo(draggableId, destination.index)
  };

  if(queue === undefined) {
    return (<Spinner animation="border" />);
  }
  const queueVal = queue.val() as VidInfo[] | null;

  if(queueVal === null || queue.numChildren() === 0) {
    return (<p>Your queue is empty.</p>);
  }
  
  return (
    <DragDropContext
      onDragEnd = {reorderList}
    >
      <Droppable droppableId="myQueue">
        {(provided) => (
          <div className="queue"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {queueVal.map((v:any, idx:number) => (
              <Draggable
                draggableId={v.video}
                index={idx}
                key={v.video??undefined}
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