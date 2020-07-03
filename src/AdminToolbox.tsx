import React, { useContext } from "react";
import {
  Modal,
  ModalBody,
  ModalTitle,
  CloseButton,
  Button,
  Spinner,
} from "react-bootstrap";
import { AdminToolsContext } from "./AdminToolsProvider";
import ModalHeader from "react-bootstrap/ModalHeader";
import firebase from "firebase";
import convertDuration from "./ConvertDuration";
import { useObjectVal } from "react-firebase-hooks/database";

/** This modal dialog shows up when an administrator wishes to
 *  make major moves based on a
 */

const AdminToolbox = () => {
  const {
    isAdmin,
    closeToolbox,
    blacklistVideo,
    unblacklistVideo,
    toolboxData,
    clearUserQueue,
    suspendUser,
    banUser,
    unbanUser,
  } = useContext(AdminToolsContext);

  return (
    <Modal
      onShow={() => {}}
      onHide={() => {}}
      show={toolboxData.video !== null || toolboxData.user !== null}
    >
      <ModalHeader>
        <ModalTitle>Toolbox</ModalTitle>
        <CloseButton onClick={closeToolbox} />
      </ModalHeader>
      <ModalBody>
        {isAdmin || (
          <p>You are not an admin. You may not use the admin toolbox.</p>
        )}
        {isAdmin && (
          <>
            {toolboxData.video && (
              <VideoToolbox
                videoId={toolboxData.video}
                blacklistVideo={blacklistVideo}
                unblacklistVideo={unblacklistVideo}
              />
            )}
            {toolboxData.video && toolboxData.user && <hr />}
            {toolboxData.user && (
              <UserToolbox
                userId={toolboxData.user}
                clearUserQueue={clearUserQueue}
                suspendUser={suspendUser}
                banUser={banUser}
                unbanUser={unbanUser}
              />
            )}
          </>
        )}
      </ModalBody>
    </Modal>
  );
};

const VideoToolbox = ({ videoId, blacklistVideo, unblacklistVideo }: any) => {
  const videoRef = firebase.database().ref(`videos/${videoId}`);
  const blacklistRef = firebase.database().ref(`blacklist/${videoId}`);
  const [videoData] = useObjectVal<any>(videoRef);
  const [blacklisted] = useObjectVal<boolean>(blacklistRef);

  const videoUrl = "https://youtube.com/watch?v=" + videoId;

  return (
    <>
      {videoData && (
        <>
          <h6>Video</h6>
          <div className="video-info horz">
            <img alt="" className="thumbnail" src={videoData.thumbnail} />
            <div className="vert details">
              <p className="title">{videoData.title}</p>
              <div className="horz justify-spread-evenly">
                <p className="url">
                  <a target="_blank" rel="noopener noreferrer" href={videoUrl}>
                    {videoId}
                  </a>
                </p>
                <p className="length">
                  &nbsp;-&nbsp;
                  <span>{convertDuration(videoData.duration)}</span>
                </p>
              </div>
            </div>
          </div>
          {blacklisted && (
            <Button
              as="a"
              className="wide unblacklist"
              onClick={() => unblacklistVideo(videoId)}
            >
              Remove from blacklist
            </Button>
          )}
          {blacklisted || (
            <Button
              as="a"
              className="wide blacklist"
              onClick={() => blacklistVideo(videoId)}
            >
              Add to blacklist
            </Button>
          )}
        </>
      )}
    </>
  );
};

const UserToolbox = ({
  userId,
  clearUserQueue,
  suspendUser,
  banUser,
  unbanUser,
}: any) => {
  const userRef = firebase.database().ref(`users/${userId}`);
  const [userData] = useObjectVal<any>(userRef);

  const renderStatus = (status: string | undefined) => {
    const unban = (
      <Button as="a" className="unban" onClick={() => unbanUser(userId)}>
        Unban
      </Button>
    );

    if (status === undefined) return <span className="green">OK</span>;
    if (status === "banned")
      return <span className="red"> Banned indefinitely {unban}</span>;

    // Assume that the ban status is a timestamp
    return (
      <span className="amber">
        Banned until {new Date(status).toLocaleString()}
        {unban}
      </span>
    );
  };

  if (userData === undefined || userData === null) {
    return <Spinner animation="border" />;
  }

  return (
    <>
      <h6>User</h6>
      <div className="user-info vert">
        <p className="info-line">
          <span>Display name </span>
          {userData.displayName}
        </p>
        <p className="info-line">
          <span>Username </span>
          {userData.uid}
        </p>
        <p className="info-line">
          <span>Current status </span>
          {renderStatus(userData.status)}
        </p>
      </div>
      <div className="button-row">
        <Button
          as="a"
          className="wide ban-1"
          onClick={() => clearUserQueue(userId)}
        >
          Clear queue
        </Button>
        <Button
          as="a"
          className="wide ban-2"
          onClick={() => suspendUser(userId, 3600)}
        >
          Suspend (1h)
        </Button>
        <Button
          as="a"
          className="wide ban-3"
          onClick={() => suspendUser(userId, 86400)}
        >
          Suspend (24h)
        </Button>
        <Button as="a" className="wide ban-4" onClick={() => banUser(userId)}>
          Ban
        </Button>
      </div>
    </>
  );
};

export default AdminToolbox;
