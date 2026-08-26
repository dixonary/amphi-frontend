import React, { useContext } from "react";
import { Modal } from "react-bootstrap";
import { AdminToolsContext } from "./AdminToolsProvider";
import convertDuration from "./ConvertDuration";
import { ServerContext } from "./ServerProvider";

const AdminToolbox = () => {
  const { state } = useContext(ServerContext);
  const { isAdmin, toolboxData, closeToolbox, blacklistVideo, unblacklistVideo, suspendUser, unsuspendUser } = useContext(AdminToolsContext);
  const video = toolboxData.video ? state?.videos[toolboxData.video] : undefined;
  const user = toolboxData.user ? state?.users[toolboxData.user] : undefined;
  const blacklisted = toolboxData.video ? state?.blacklist[toolboxData.video] === true : false;

  return (
    <Modal show={toolboxData.video !== null || toolboxData.user !== null} onHide={closeToolbox} centered dialogClassName="admin-toolbox-dialog">
      <Modal.Header closeButton>
        <Modal.Title>Toolbox</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {!isAdmin && <p>You are not an administrator.</p>}
        {isAdmin && video && toolboxData.video && (
          <section>
            <h5 className="mb-3">Video</h5>
            <div className="video-info horz mb-3">
              <img alt="" className="thumbnail" src={video.thumbnailUrl} />
              <div className="vert details">
                <p className="title">{video.title}</p>
                <p>{video.channelTitle} - {convertDuration(video.durationSeconds)}</p>
              </div>
            </div>
            <div className="text-end">
              <button type="button" className={`btn admin-action ${blacklisted ? "admin-action-yellow" : "admin-action-red"}`} onClick={() => blacklisted ? unblacklistVideo(toolboxData.video!) : blacklistVideo(toolboxData.video!)}>
                {blacklisted ? "Remove from blacklist" : "Add to blacklist"}
              </button>
            </div>
          </section>
        )}
        {isAdmin && video && user && <hr />}
        {isAdmin && user && toolboxData.user && (
          <section>
            <h5 className="mb-3">User</h5>
            <p className="mb-2">Display name: {user.displayName}</p>
            {user.suspendedUntil ? <p><span className="badge text-bg-warning">Suspended until {new Date(user.suspendedUntil).toLocaleString()}</span></p> : <p><span className="badge text-bg-success">Active</span></p>}
            <div className="d-flex flex-wrap justify-content-end gap-2">
              <button type="button" className="btn admin-action admin-action-yellow" onClick={() => suspendUser(toolboxData.user!, 3600)}>Suspend 1 hour</button>
              <button type="button" className="btn admin-action admin-action-red" onClick={() => suspendUser(toolboxData.user!, 86400)}>Suspend 24 hours</button>
              {user.suspendedUntil && <button type="button" className="btn admin-action admin-action-yellow" onClick={() => unsuspendUser(toolboxData.user!)}>Unsuspend</button>}
            </div>
          </section>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AdminToolbox;
