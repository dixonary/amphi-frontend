import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import {
  Accordion,
  Card,
  Spinner,
  OverlayTrigger,
  Tooltip,
  useAccordionButton,
} from "react-bootstrap";
import NewVideo from "./NewVideo";
import MyQueue from "./MyQueue";
import Playlist from "./Playlist";
import AdminToolbox from "./AdminToolbox";
import { NowPlayingContext } from "./NowPlayingProvider";
import { AdminToolsContext } from "./AdminToolsProvider";
import SkipNext from "@mui/icons-material/SkipNext";
import Assignment from "@mui/icons-material/Assignment";
import History from "@mui/icons-material/History";
import convertDuration from "./ConvertDuration";
import { UserContext } from "./UserProvider";
import Visibility from "@mui/icons-material/Visibility";
import { RecentlyPlayedModal } from "./RecentlyPlayedModal";
import { ServerContext } from "./ServerProvider";
import OpenInNew from "@mui/icons-material/OpenInNew";


function Toggle({ children, eventKey, onclick }: { children: ReactNode, eventKey: string, onclick?: () => void }) {
  const decoratedOnClick = useAccordionButton(eventKey, () => {
    if (onclick) onclick();
  });

  return (
    <button
      type="button"
      className="accordion-toggle"
      onClick={decoratedOnClick}
    >
      {children}
    </button>
  );
}

const Sidebar = () => {
  const user = useContext(UserContext);
  const [activeKey, setActiveKey] = useState("my-queue");
  const inputRef = useRef<HTMLElement>(null);

  const [recentlyPlayedVisible, setRecentlyPlayedVisible] = useState(false);

  const focusInput = () =>
    inputRef.current !== null && inputRef.current.focus();

  const activate = (key: string) => {
    // We have to set a timeout here so that focus() knows the input is visible
    if (key === "new-video") setTimeout(focusInput, 100);

    if (activeKey === key) setActiveKey("");
    else setActiveKey(key);
  };


  return (
    <>
      <Accordion activeKey={activeKey.toString()}>
        <Card bg="dark" className="now-playing">
          <Card.Header>
            <Toggle eventKey="__">
              <div className="now-playing-heading-flex">
                <span style={{ flex: 1, textAlign: "left" }}>Now Playing</span>
                <CurrentViewers />
                <CurrentSkips />
                <HasVoteskipped />
              </div>
            </Toggle>
          </Card.Header>
          <Card.Body>
            <NowPlayingSidebar />
          </Card.Body>
        </Card>
        <Card bg="dark" className="playlist">
          <Card.Header style={{ display: "flex" }}>
            <Toggle eventKey="__">
              <span style={{ display: "inline" }}>Playlist</span>
            </Toggle>
            {user.currentUser && (
              <Tooltipped tooltipText="Recently Played"><button type="button" className="btn history-btn" style={{ flex: 0 }} onClick={() => setRecentlyPlayedVisible(true)}><History /></button></Tooltipped>)}
          </Card.Header>
          <Card.Body>
            <Playlist />
          </Card.Body>
        </Card>
        {user.currentUser && (
          <>
            <Card bg="dark" className="my-queue">
              <Card.Header>
                <Toggle
                  eventKey="my-queue"
                  onclick={() => activate("my-queue")}
                >
                  My Queue
                </Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="my-queue">
                <Card.Body className="">
                  <MyQueue />
                </Card.Body>
              </Accordion.Collapse>
            </Card>

            <Card bg="dark" className="new-video">
              <Card.Header>
                <Toggle
                  eventKey="new-video"
                  onclick={() => {
                    activate("new-video");
                  }}
                >
                  Add a Song
                </Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="new-video">
                <Card.Body className="">
                  <NewVideo setAccordion={setActiveKey} inputRef={inputRef} />
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </>
        )}
      </Accordion>
      <AdminToolbox />
      {user.userData !== undefined ? <RecentlyPlayedModal visible={recentlyPlayedVisible} closeRecentlyPlayed={() => setRecentlyPlayedVisible(false)} /> : <></>
      }
    </>
  );
};

const NowPlayingSidebar = () => {
  const userData = useContext(UserContext);
  const nowPlaying = useContext(NowPlayingContext);
  const { openToolbox } = useContext(AdminToolsContext);
  const { state, sendCommand } = useContext(ServerContext);
  const isAdmin = state?.currentUser?.isAdmin === true;
  const videoData = nowPlaying ? state?.videos[nowPlaying.video] : undefined;
  const hasVoteskipped = state?.voteSkip.hasVoted === true;

  const voteSkip = useCallback(async () => {
    await sendCommand("vote.skip");
  }, [sendCommand]);

  if (nowPlaying === null || nowPlaying === undefined)
    return (
      <>
        <p>No song is currently playing.</p>
      </>
    );
  return (
    <>
      <div className="video-details">
        {videoData === null || videoData === undefined ? (
          <Spinner animation="border" />
        ) : (
          <>
            <p className="title">{videoData.title}</p>
            <div className="other-details">
              <p className="channel-title">
                {videoData.channelTitle} - {convertDuration(videoData.durationSeconds)}
              </p>
              <p className="displayName">{nowPlaying?.queuedByDisplayName}</p>
            </div>
          </>
        )}
      </div>
      <div className="button-row">
        {isAdmin && (
          <Tooltipped tooltipText="Skip">
            <button
              type="button"
              className="btn btn-dark delete admin"
              onClick={() => sendCommand("admin.play-next")}
            >
              <SkipNext />
            </button>
          </Tooltipped>
        )}
        {isAdmin && (
          <Tooltipped tooltipText="Open Toolbox">
            <button
              type="button"
              className="btn btn-dark tools admin"
              onClick={() =>
                openToolbox({
                  video: nowPlaying?.video,
                  user: nowPlaying?.queuedBy,
                })
              }
            >
              <Assignment />
            </button>
          </Tooltipped>
        )}
        {userData.currentUser !== undefined && (
          <Tooltipped tooltipText={hasVoteskipped ? "Voteskip recorded" : "Voteskip"}>
            <button
              type="button"
              className="btn btn-dark voteskip"
              onClick={voteSkip}
              disabled={hasVoteskipped}
              aria-label={hasVoteskipped ? "Voteskip recorded" : "Voteskip"}
            >
              <SkipNext />
            </button>
          </Tooltipped>
        )}
        <Tooltipped tooltipText="Open on YouTube">
          <a
            className="btn btn-dark video-link"
            href={`https://www.youtube.com/watch?v=${nowPlaying.video}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            aria-label="Open on YouTube"
          >
            <OpenInNew />
          </a>
        </Tooltipped>
      </div>
    </>
  );
};

const CurrentViewers = () => {
  const { state } = useContext(ServerContext);
  const numViewers = state?.viewerCount;

  if (numViewers === undefined) return <></>;
  return (
    <span className="num-viewers">
      <Visibility />
      {numViewers}
    </span>
  );
};

const CurrentSkips = () => {
  const { state, sendCommand } = useContext(ServerContext);
  const numSkips = state?.voteSkip.count;
  const hasSkipped = state?.voteSkip.hasVoted === true;

  const skip = () => {
    if (!hasSkipped) {
      void sendCommand("vote.skip");
    }
  };

  if (!numSkips) return <></>;
  return (
    <span
      className="num-skips"
      onClick={skip}
      style={{ cursor: hasSkipped ? "default" : "pointer" }}
    >
      {numSkips}
      <SkipNext />
    </span>
  );
};

const HasVoteskipped = () => {
  const { state } = useContext(ServerContext);

  if (!state?.currentUser) {
    return <></>;
  }
  return state.voteSkip.hasVoted ? <span>voteskipped</span> : <></>;
};

const Tooltipped = ({ tooltipText, children }: any) => {
  const tooltip = (props: any) => (
    <Tooltip id={`button-tooltip-${tooltipText}`} {...props}>
      {tooltipText}
    </Tooltip>
  );

  return (
    <OverlayTrigger placement="bottom" overlay={tooltip}>
      {children}
    </OverlayTrigger>
  );
};


export default Sidebar;
export { Tooltipped };



