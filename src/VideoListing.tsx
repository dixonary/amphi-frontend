import React, { useContext, useState } from "react";
import Delete from "@mui/icons-material/Delete";
import Assignment from "@mui/icons-material/Assignment";
import { Spinner } from "react-bootstrap";

import convertDuration from "./ConvertDuration";
import { QueueContext } from "./QueueProvider";
import { AdminToolsContext } from "./AdminToolsProvider";
import { Tooltipped } from "./Sidebar";
import { PlaybackBucketItem, QueueItem, ServerContext } from "./ServerProvider";

const VideoListing = ({
  provided,
  data,
  localQueue,
}: {
  provided: any;
  data: QueueItem | PlaybackBucketItem;
  localQueue: boolean;
}) => {
  const { state, sendCommand } = useContext(ServerContext);
  const { removeVideo } = useContext(QueueContext);
  const { isAdmin, dequeueVideo, openToolbox } = useContext(AdminToolsContext);
  const [isDeleting, setisDeleting] = useState<boolean>(false);
  const videoData = state?.videos[data.videoId];
  const queueUser = "user" in data ? data.user : state?.currentUser?.user;
  const displayName = "displayName" in data ? data.displayName : state?.currentUser?.displayName;

  const adminDequeue = async function () {
    if (!queueUser) return;
    setisDeleting(true);
    await sendCommand("admin.queue.remove", { user: queueUser, queueItemId: data.queueItemId });
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
        data.queuedAt === undefined ? (
        <Spinner animation="border" />
      ) : (
        <>
          <p className="title">{videoData.title}</p>
          <div className="other-details">
            <p className="channel-title">
              {videoData.channelTitle} - {convertDuration(videoData.durationSeconds)}
              {" - "}
              <a
                href={`https://www.youtube.com/watch?v=${data.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                {data.videoId}
              </a>
            </p>
            <p className="displayName">{displayName}</p>
          </div>
        </>
      )}
      <div className="button-row">
        {localQueue && (
          <Tooltipped tooltipText="Remove">
            <button
              type="button"
              className="btn btn-dark delete"
              onClick={() => removeVideo(data.queueItemId)}
            >
              <Delete />
            </button>
          </Tooltipped>
        )}
        {!localQueue && isAdmin && (
          <Tooltipped tooltipText="Remove">
            <button
              type="button"
              className="btn btn-dark delete admin"
              onClick={adminDequeue}
            >
              {isDeleting ? <Spinner animation="border" /> : <Delete />}
            </button>
          </Tooltipped>
        )}
        {!localQueue && isAdmin && (
          <Tooltipped tooltipText="Open Toolbox">
            <button
              type="button"
              className="btn btn-dark tools admin"
              onClick={() =>
                openToolbox({ video: data.videoId, user: queueUser ?? null })
              }
            >
              <Assignment />
            </button>
          </Tooltipped>
        )}
      </div>
    </div>
  );
};

export default VideoListing;
