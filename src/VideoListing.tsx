import React, { useContext, useEffect, useState } from "react";
import { Delete, Assignment } from "@material-ui/icons";
import { Spinner, Button } from "react-bootstrap";

import firebase from "firebase";

import convertDuration from "./ConvertDuration";
import { QueueContext } from "./QueueProvider";
import { AdminToolsContext } from "./AdminToolsProvider";
import { Tooltipped } from "./Sidebar";

const VideoListing = ({
  provided,
  data,
  localQueue,
}: {
  provided: any;
  data: any;
  localQueue: boolean;
}) => {
  const [videoData, setVideoData] = useState<any>(null);
  const { removeVideo } = useContext(QueueContext);
  const { isAdmin, dequeueVideo, openToolbox } = useContext(AdminToolsContext);
  const [isDeleting, setisDeleting] = useState<boolean>(false);

  useEffect(() => {
    const getVideoData = async () => {
      if (data?.video === undefined) return;
      const vidData = await firebase
        .database()
        .ref(`videos/${data.video}`)
        .once("value");
      setVideoData(vidData.val());
    };
    getVideoData();
  }, [data]);

  const adminDequeue = async function (vidId: string, queuedBy: string) {
    setisDeleting(true);
    await dequeueVideo(vidId, queuedBy);
    setisDeleting(false);
  };

  return (
    <div
      className="video-details"
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
    >
      {videoData == null ||
      data?.queuedAt === undefined ||
      data?.queuedAt === null ? (
        <Spinner animation="border" />
      ) : (
        <>
          <p className="title">{videoData.title}</p>
          <div className="other-details">
            <p className="channel-title">
              {videoData.channelTitle} - {convertDuration(videoData.duration)}
            </p>
            <p className="displayName">{data.queuedByDisplayName}</p>
          </div>
        </>
      )}
      <div className="button-row">
        {localQueue && (
          <Tooltipped tooltipText="Remove">
            <Button
              as="a"
              className="delete"
              variant="dark"
              onClick={() => removeVideo(data.video)}
            >
              <Delete />
            </Button>
          </Tooltipped>
        )}
        {!localQueue && isAdmin && (
          <Tooltipped tooltipText="Remove">
            <Button
              as="a"
              className="delete admin"
              variant="dark"
              onClick={() => adminDequeue(data.video, data.queuedBy)}
            >
              {isDeleting ? <Spinner animation="border" /> : <Delete />}
            </Button>
          </Tooltipped>
        )}
        {!localQueue && isAdmin && (
          <Tooltipped tooltipText="Open Toolbox">
            <Button
              as="a"
              className="tools admin"
              variant="dark"
              onClick={() =>
                openToolbox({ video: data.video, user: data.queuedBy })
              }
            >
              <Assignment />
            </Button>
          </Tooltipped>
        )}
      </div>
    </div>
  );
};

export default VideoListing;
