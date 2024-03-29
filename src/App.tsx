import React, { useEffect, useContext, useState, useRef, useMemo } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import {
  Navbar,
  Tooltip,
  OverlayTrigger,
  NavItem,
  Button,
} from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "./main.css";

import Main from "./Main";
import { UserBox, LoginCallback, BespokeLoginCallback, AdminButton } from "./User";
import { UserProvider } from "./UserProvider";
import AdminToolsProvider, { AdminToolsContext } from "./AdminToolsProvider";
import { NowPlayingProvider, NowPlayingContext } from "./NowPlayingProvider";
import { Close, Settings, CenterFocusStrong } from "@mui/icons-material";
import { Mode, modeClass, ModeContext, ModeProvider } from "./ModeProvider";
import { Tooltipped } from "./Sidebar";

/******************************************************************************/
/* Constants */
const UnderConstruction: boolean = false;

/******************************************************************************/
/* Main application logic */

firebase.initializeApp({
  projectId: "amphi-compsoc",
  apiKey: "AIzaSyCOXtTbrBZ3qAKlfBHPh1t5KzPYqLA3CZU", // Auth / General Use
  authDomain: "amphi-compsoc.firebaseapp.com", // Auth with popup/redirect
  databaseURL: "https://amphi-compsoc.firebaseio.com", // Realtime Database
  storageBucket: "amphi-compsoc.appspot.com", // Storage
});

function App() {
  return (
    <Router>
      <ModeProvider>
        <NowPlayingProvider>
          <UserProvider>
            <AdminToolsProvider>
              <Header />
              <Main />
            </AdminToolsProvider>
          </UserProvider>
        </NowPlayingProvider>
      </ModeProvider>
    </Router>
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
          <Routes>
            <Route path="/auth/login/*" element={<LoginCallback />} />
            <Route path="/auth/bespoke-login/*" element={<BespokeLoginCallback />} />
            <Route path="/" element={<UserBox />} />
          </Routes>
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
        <Button
          as="a"
          onClick={() => switchMode(nextMode)}
          className="switch-mode"
        >
          <CenterFocusStrong />
        </Button>
      </Tooltipped>
    </NavItem>
  );
};

const NowPlayingText = () => {
  const nowPlaying = useContext(NowPlayingContext);
  const [videoData, setVideoData] = useState<any>(null);

  useEffect(() => {
    if (nowPlaying?.video === undefined) {
      setVideoData(undefined);
      window.document.title = "Amphi";
      return;
    }
    const getVideoData = async () => {
      const vidData = await firebase
        .database()
        .ref(`videos/${nowPlaying.video}`)
        .once("value");
      window.document.title = `${vidData.val().title} - Amphi`;
      setVideoData(vidData.val());
    };
    getVideoData();
  }, [nowPlaying]);

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
