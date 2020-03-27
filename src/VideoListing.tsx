import React, { useContext, useEffect, useState } from "react";
import { Spinner, Button } from "react-bootstrap";

import firebase from "firebase";

import { Delete } from "@material-ui/icons";

import convertDuration from "./ConvertDuration";
import { QueueContext } from "./QueueProvider";
import { AdminToolsContext } from "./AdminToolsProvider";

const VideoListing = ({provided, data,  localQueue}:{provided:any, data:any, localQueue:boolean}) => {
  const [videoData, setVideoData] = useState<any>(null);
  const {removeVideo} = useContext(QueueContext);
  const { isAdmin, dequeueVideo } = useContext(AdminToolsContext);
  const [ isDeleting, setisDeleting ] = useState<boolean>(false);

  useEffect(() => {
    if(data?.video === undefined) return;
    const getVideoData = async () => {
      const vidData = await firebase.database().ref(`videos/${data.video}`).once('value');
      setVideoData(vidData.val());
    };
    getVideoData();
  }, [data.video]);

  const adminDequeue = async function(vidId:string, queuedBy:string) {
    setisDeleting(true);
    await dequeueVideo(vidId, queuedBy);
    setisDeleting(false);
  }

  return (
    <div className="video-details" 
        {...provided.draggableProps} 
        {...provided.dragHandleProps}
        ref={provided.innerRef}
    >
      {videoData == null
       ? (<Spinner animation="border" />)
       :
        (<>
          <p className="title">{videoData.title}</p>
          <p className="channel-title">{videoData.channelTitle} - {convertDuration(videoData.duration)}</p>
        </>)
      }
      {localQueue && (
        <Button as="a" className="delete" variant="dark" onClick={() => removeVideo(data.video)}>
          <Delete />
        </Button>
      )}
      {!localQueue && isAdmin && (
        <Button as="a" className="delete admin" variant="dark" onClick={() => adminDequeue(data.video, data.queuedBy)}>
          {isDeleting
            ? (<Spinner animation="border" />)
            : (<Delete />)
          }     
        </Button>
      )}
    </div>
  );
};

export default VideoListing;