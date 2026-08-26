import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import {
  Accordion,
  Card,
  Spinner,
  Button,
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
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { SkipNext, Assignment, History } from "@mui/icons-material";
import convertDuration from "./ConvertDuration";
import { useObjectVal } from "react-firebase-hooks/database";
import { UserContext, UserState } from "./UserProvider";
import { Visibility } from "@mui/icons-material";
import { RecentlyPlayedModal } from "./RecentlyPlayedModal";


function Toggle({ children, eventKey, onclick }: { children: ReactNode, eventKey: string, onclick?: () => void }) {
  const decoratedOnClick = useAccordionButton(eventKey, () => {
    if (onclick) onclick();
  });

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      href="#"
      style={{ display: "inline-block", flex: 1 }}
      onClick={decoratedOnClick}
    >
      {children}
    </a>
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
            {user.firebaseUser && (
              <Tooltipped tooltipText="Recently Played"><Button className="history-btn" style={{ flex: 0 }} onClick={() => setRecentlyPlayedVisible(true)}><History /></Button></Tooltipped>)}
          </Card.Header>
          <Card.Body>
            <Playlist />
          </Card.Body>
        </Card>
        {user.firebaseUser && (
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
  const { isAdmin, playNextVideo, openToolbox } = useContext(AdminToolsContext);
  const [videoData, setVideoData] = useState<any>(null);

  const [hasVoteskipped] = useObjectVal<boolean | null>(
    firebase.database().ref(`voteskip/user/${userData?.firebaseUser?.uid}`)
  );

  const voteSkip = useCallback(async () => {
    await firebase
      .database()
      .ref(`voteskip/user/${userData?.firebaseUser?.uid}`)
      .set(true);
  }, [userData]);

  useEffect(() => {
    if (nowPlaying?.video === undefined) {
      setVideoData(undefined);
      return;
    }
    const getVideoData = async () => {
      const vidData = await firebase
        .database()
        .ref(`videos/${nowPlaying.video}`)
        .once("value");
      setVideoData(vidData.val());
    };
    getVideoData();
  }, [nowPlaying]);

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
                {videoData.channelTitle} - {convertDuration(videoData.duration)}
              </p>
              <p className="displayName">{nowPlaying?.queuedByDisplayName}</p>
            </div>
          </>
        )}
      </div>
      <div className="button-row">
        {(isAdmin ||
          (nowPlaying?.queuedBy &&
            nowPlaying?.queuedBy === userData?.userData?.uid)) && (
            <Tooltipped tooltipText="Skip">
              <Button
                as="a"
                className="delete admin"
                variant="dark"
                onClick={() => playNextVideo(nowPlaying.video)}
              >
                <SkipNext />
              </Button>
            </Tooltipped>
          )}
        {isAdmin && (
          <Tooltipped tooltipText="Open Toolbox">
            <Button
              as="a"
              className="tools admin"
              variant="dark"
              onClick={() =>
                openToolbox({
                  video: nowPlaying?.video,
                  user: nowPlaying?.queuedBy,
                })
              }
            >
              <Assignment />
            </Button>
          </Tooltipped>
        )}
        {userData.firebaseUser !== undefined && hasVoteskipped !== true && (
          <Tooltipped tooltipText="Voteskip">
            <Button
              as="a"
              className="voteskip"
              variant="dark"
              onClick={voteSkip}
            >
              <SkipNext />
            </Button>
          </Tooltipped>
        )}
      </div>
    </>
  );
};

const CurrentViewers = () => {
  const user = useContext<UserState>(UserContext);
  const numViewersRef = firebase.database().ref(`numViewers`);
  const [numViewers] = useObjectVal<number>(numViewersRef);

  useEffect(() => {
    const uid = user?.firebaseUser?.uid;
    if (uid === undefined) return;
    const ref = firebase.database().ref(`users/${uid}/online`);
    ref.set(true);
    ref.onDisconnect().set(false);
  }, [user]);

  if (numViewers === undefined) return <></>;
  return (
    <span className="num-viewers">
      <Visibility />
      {numViewers}
    </span>
  );
};

const CurrentSkips = () => {
  const numSkipsRef = firebase.database().ref(`voteskip/count`);
  const [numSkips] = useObjectVal<number>(numSkipsRef);
  const user = useContext(UserContext);

  const skippedRef = useMemo(
    () =>
      !user
        ? undefined
        : firebase.database().ref(`voteskip/user/${user.firebaseUser?.uid}`),
    [user]
  );

  const [hasSkipped] = useObjectVal<boolean>(skippedRef);

  const voteSkip = useCallback(async () => {
    await skippedRef?.set(true);
  }, [skippedRef]);

  const skip = useMemo(
    () =>
      hasSkipped
        ? () => {
          console.log("Skipped already");
        }
        : voteSkip,
    [hasSkipped, voteSkip]
  );

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
  const user = useContext<UserState>(UserContext);
  const skippedRef = firebase
    .database()
    .ref(`voteskip/user/${user.firebaseUser?.uid}`);

  const [hasSkipped] = useObjectVal<boolean>(skippedRef);

  if (!user.firebaseUser?.uid) {
    return <></>;
  }
  return hasSkipped === true ? <span>voteskipped</span> : <></>;
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



