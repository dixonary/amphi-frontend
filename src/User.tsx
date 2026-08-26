import React, { useContext, useRef, useState } from "react";
import {
  Badge,
  Spinner,
  Navbar,
  NavItem,
  Popover,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Edit from "@mui/icons-material/Edit";

import { UserContext } from "./UserProvider";
import { ServerContext } from "./ServerProvider";

const login = () => {
  window.location.assign("/auth/github");
};
const logout = async () => {
  await fetch("/auth/logout", { method: "POST" });
  window.location.reload();
};

const UserBox = () => {
  const { currentUser: user, userData } = useContext(UserContext);
  const { sendCommand } = useContext(ServerContext);
  const suspendedUntil = userData?.status;
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [displayNameDraft, setDisplayNameDraft] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");

  const beginDisplayNameEdit = () => {
    setDisplayNameDraft(user?.displayName ?? "");
    setDisplayNameError("");
    setEditingDisplayName(true);
  };

  const saveDisplayName = async (event: React.FormEvent) => {
    event.preventDefault();
    const displayName = displayNameDraft.trim();
    if (!displayName) {
      setDisplayNameError("Display name cannot be empty.");
      return;
    }
    const result = await sendCommand("user.display-name.update", { displayName });
    if (result.ok) {
      setEditingDisplayName(false);
      return;
    }
    setDisplayNameError("Use a display name between 1 and 80 characters.");
  };

  const accountPopover = (
    <Popover id="account-popover" className="user-popover">
      <Popover.Header as="div">
        {editingDisplayName ? (
          <form className="user-display-name-form" onSubmit={saveDisplayName}>
            <input className="form-control form-control-sm" value={displayNameDraft} onChange={(event) => setDisplayNameDraft(event.target.value)} maxLength={80} autoFocus aria-label="Display name" />
            <button type="submit" className="btn btn-sm admin-action admin-action-yellow">Save</button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setEditingDisplayName(false)}>Cancel</button>
          </form>
        ) : (
          <div className="user-popover-header">
            <h3 className="user-popover-title">{user?.displayName}</h3>
            <button type="button" className="btn user-display-name-edit" onClick={beginDisplayNameEdit} aria-label="Edit display name" title="Edit display name"><Edit fontSize="small" /></button>
          </div>
        )}
      </Popover.Header>
      <Popover.Body>
        {displayNameError && <p className="text-danger small mb-3">{displayNameError}</p>}
        <div className="user-detail"><span>Role</span><Badge bg={userData?.isAdmin ? "warning" : "light"} text="dark">{userData?.isAdmin ? "Admin" : "Member"}</Badge></div>
        {suspendedUntil && <div className="user-detail user-suspension"><span>Queue access</span><strong>Until {new Date(suspendedUntil).toLocaleString()}</strong></div>}
      </Popover.Body>
    </Popover>
  );

  return (
    <Navbar.Collapse className="justify-content-end">
      {user ? (
        <>
          <OverlayTrigger trigger="click" rootClose placement="bottom-end" overlay={accountPopover}>
            <button type="button" className="btn user-summary" aria-label="Account details">
              <AccountCircle />
              <span>{user.displayName}</span>
            </button>
          </OverlayTrigger>
          <NavItem>
            <button type="button" onClick={logout} className="btn uwcs-signin">
              Log out
            </button>
          </NavItem>
        </>
      ) : user === undefined ? (
        <Spinner variant="light" animation="border" role="status" />
      ) : (
        <button type="button" className="btn uwcs-signin" onClick={login}>
          Log in with GitHub
        </button>
      )}
    </Navbar.Collapse>
  );
};

const AdminButton = ({ tooltipText, callback, icon }: any) => {
  const targetRef = useRef(null);

  const tooltip = (props: any) => (
    <Tooltip id={`button-tooltip-${tooltipText}`} {...props}>
      {tooltipText}
    </Tooltip>
  );

  return (
    <OverlayTrigger placement="bottom" overlay={tooltip}>
      <button type="button" className="btn" ref={targetRef} onClick={callback}>
        {icon}
      </button>
    </OverlayTrigger>
  );
};

export { UserBox, login, logout, AdminButton };
