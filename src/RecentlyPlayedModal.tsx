import React, { useContext } from "react";
import { Modal, Spinner } from "react-bootstrap";
import convertDuration from "./ConvertDuration";
import { ServerContext } from "./ServerProvider";

const RecentlyPlayedModal = ({ visible, closeRecentlyPlayed }: { visible: boolean; closeRecentlyPlayed: () => void }) => {
  const { state } = useContext(ServerContext);
  const history = state?.history.slice(0, 15);

  return (
    <Modal show={visible} onHide={closeRecentlyPlayed} centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Recently Played Songs</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!history ? <Spinner animation="border" /> : history.length === 0 ? <p>There are no songs in the history.</p> : history.map((entry) => <PublicHistoryItem key={`${entry.videoId}-${entry.playedAt}`} videoId={entry.videoId} />)}
      </Modal.Body>
    </Modal>
  );
};

const PublicHistoryItem = ({ videoId }: { videoId: string }) => {
  const { state } = useContext(ServerContext);
  const video = state?.videos[videoId];

  return (
    <div className="history-item">
      <div className="details">
        {!video ? <Spinner animation="border" /> : (
          <>
            <p className="title">{video.title}</p>
            <div className="other-details">
              <p className="channel-title">{video.channelTitle} - {convertDuration(video.durationSeconds)}</p>
              <a href={`https://youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer">{videoId}</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { RecentlyPlayedModal, PublicHistoryItem };
