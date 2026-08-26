import React, { useEffect, useContext, useRef, useMemo } from "react";
import {
  Navbar,
  Tooltip,
  OverlayTrigger,
  NavItem,
} from "react-bootstrap";

import "./main.css";

import Main from "./Main";
import { UserBox, AdminButton } from "./User";
import { UserProvider } from "./UserProvider";
import AdminToolsProvider, { AdminToolsContext } from "./AdminToolsProvider";
import { NowPlayingProvider, NowPlayingContext } from "./NowPlayingProvider";
import Close from "@mui/icons-material/Close";
import Settings from "@mui/icons-material/Settings";
import CenterFocusStrong from "@mui/icons-material/CenterFocusStrong";
import { Mode, modeClass, ModeContext, ModeProvider } from "./ModeProvider";
import { Tooltipped } from "./Sidebar";
import { AddPlaylistProvider } from "./AddPlaylistProvider";
import QueueProvider from "./QueueProvider";
import { ServerContext, ServerProvider } from "./ServerProvider";

/******************************************************************************/
/* Constants */
const UnderConstruction: boolean = false;

/******************************************************************************/
function App() {
  return (
    <ServerProvider>
      <ModeProvider>
        <NowPlayingProvider>
          <UserProvider>
            <QueueProvider>
              <AddPlaylistProvider>
                <AdminToolsProvider>
                  <Header />
                  <Main />
                </AdminToolsProvider>
              </AddPlaylistProvider>
            </QueueProvider>
          </UserProvider>
        </NowPlayingProvider>
      </ModeProvider>
    </ServerProvider>
  );
}

const Header = () => {
  const { currentMode } = useContext(ModeContext);
  return (
    <>
      <Navbar
        expand="lg"
        variant="dark"
        bg="dark"
        className={modeClass(currentMode)}
      >
        <Navbar.Brand>AMPHI</Navbar.Brand>
        <ToggleModeButton />
        <AdminSettingsButton />
        <Navbar.Toggle />
        <Navbar.Collapse>
          <NowPlayingText />
          <UserBox />
        </Navbar.Collapse>
      </Navbar>
      {UnderConstruction && <UnderConstructionNotice />}
    </>
  );
};

const AdminSettingsButton = () => {
  const { isAdmin, openSettings } = useContext(AdminToolsContext);
  return (
    <>
      {isAdmin && (
        <AdminButton
          tooltipText="Settings"
          icon={<Settings />}
          callback={openSettings}
        />
      )}
    </>
  );
};

const ToggleModeButton = () => {
  const { currentMode, switchMode } = useContext(ModeContext);

  const nextMode = useMemo(() => {
    switch (currentMode) {
      case Mode.DEFAULT:
        return Mode.PLAYLIST_ONLY;
      case Mode.PLAYLIST_ONLY:
        return Mode.VIDEO_ONLY;
      case Mode.VIDEO_ONLY:
        return Mode.DEFAULT;
    }
  }, [currentMode]);

  return (
    <NavItem>
      <Tooltipped tooltipText="Switch View Mode">
        <button
          type="button"
          onClick={() => switchMode(nextMode)}
          className="btn switch-mode"
        >
          <CenterFocusStrong />
        </button>
      </Tooltipped>
    </NavItem>
  );
};

const NowPlayingText = () => {
  const nowPlaying = useContext(NowPlayingContext);
  const { state } = useContext(ServerContext);
  const videoData = nowPlaying ? state?.videos[nowPlaying.video] : undefined;

  useEffect(() => {
    if (nowPlaying?.video === undefined) {
      window.document.title = "Amphi";
      return;
    }
    if (videoData) {
      window.document.title = `${videoData.title} - Amphi`;
    }
  }, [nowPlaying, videoData]);

  const tooltip = (props: any) => (
    <Tooltip id={`now-playing-tooltip`} {...props}>
      Queued by {nowPlaying?.queuedByDisplayName}
    </Tooltip>
  );

  if (videoData === null || videoData === undefined) return <></>;
  return (
    <OverlayTrigger placement="bottom" overlay={tooltip}>
      <Navbar.Text>{videoData.title}</Navbar.Text>
    </OverlayTrigger>
  );
};

const UnderConstructionNotice = () => {
  const noticeRef = useRef<HTMLDivElement>(null);

  const killNotice = () => {
    if (noticeRef?.current !== null) {
      noticeRef.current.remove();
    }
  };

  return (
    <div className="notice" ref={noticeRef}>
      <p>
        This site is being actively developed. Things may change or behave
        strangely without warning.
      </p>
      <button className="closer" onClick={killNotice}>
        <Close />
      </button>
    </div>
  );
};

export default App;
