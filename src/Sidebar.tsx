import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Accordion,
  Card,
  Spinner,
  Button,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import NewVideo from "./NewVideo";
import MyQueue from "./MyQueue";
import Playlist from "./Playlist";
import QueueProvider from "./QueueProvider";
import AdminToolbox from "./AdminToolbox";
import { NowPlayingContext } from "./NowPlayingProvider";
import { AdminToolsContext } from "./AdminToolsProvider";
import firebase from "firebase";
import { SkipNext, Assignment } from "@material-ui/icons";
import convertDuration from "./ConvertDuration";
import { useObject, useObjectVal } from "react-firebase-hooks/database";
import { UserContext, UserState } from "./UserProvider";
import { Visibility } from "@material-ui/icons";
import { database } from "firebase-functions/lib/providers/firestore";

const Sidebar = () => {
  const [activeKey, setActiveKey] = useState("my-queue");
  const { isAdmin, playNextVideo, openToolbox } = useContext(AdminToolsContext);
  const inputRef = useRef<HTMLElement>(null);

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
      <QueueProvider>
        <Accordion activeKey={activeKey.toString()}>
          <Card bg="dark" className="now-playing">
            <Card.Header>
              <Accordion.Toggle as="a" eventKey="__">
                <div className="now-playing-heading-flex">
                  <span style={{ flex: 1 }}>Now Playing</span>
                  <CurrentViewers />
                  {isAdmin && <CurrentSkips />}
                  <HasVoteskipped />
                </div>
              </Accordion.Toggle>
            </Card.Header>
            <Card.Body>
              <NowPlayingSidebar />
            </Card.Body>
          </Card>
          <Card bg="dark" className="playlist">
            <Card.Header>
              <Accordion.Toggle as="a" eventKey="__">
                Playlist
              </Accordion.Toggle>
            </Card.Header>
            <Card.Body>
              <Playlist />
            </Card.Body>
          </Card>
          <Card bg="dark" className="my-queue">
            <Card.Header>
              <Accordion.Toggle
                as="a"
                // variant="link"
                eventKey="my-queue"
                onClick={() => activate("my-queue")}
              >
                My Queue
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="my-queue">
              <Card.Body className="">
                <MyQueue />
              </Card.Body>
            </Accordion.Collapse>
          </Card>

          <Card bg="dark" className="new-video">
            <Card.Header>
              <Accordion.Toggle
                as="a"
                // variant="link"
                eventKey="new-video"
                onClick={() => {
                  activate("new-video");
                }}
              >
                Add a Song
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="new-video">
              <Card.Body className="">
                <NewVideo setAccordion={setActiveKey} inputRef={inputRef} />
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </QueueProvider>
      <AdminToolbox />
    </>
  );
};

const NowPlayingSidebar = () => {
  const userData = useContext(UserContext);
  const nowPlaying = useContext(NowPlayingContext);
  const { isAdmin, playNextVideo, openToolbox } = useContext(AdminToolsContext);
  const [videoData, setVideoData] = useState<any>(null);

  const [hasVoteskipped] = useObjectVal(
    firebase.database().ref(`voteskip/user/${userData?.firebaseUser?.uid}`)
  );

  const voteSkip = useCallback(async () => {
    await firebase
      .database()
      .ref(`voteskip/user/${userData?.firebaseUser?.uid}`)
      .set(true);
  }, [videoData, userData]);

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
        {isAdmin && (
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

  if (numSkips === undefined || numSkips === null || numSkips === 0)
    return <></>;
  return (
    <span className="num-skips">
      {numSkips}
      <SkipNext />
    </span>
  );
};

const HasVoteskipped = () => {
  const user = useContext<UserState>(UserContext);
  const skippedRef = firebase
    .database()
    .ref(`voteskip/user${user.firebaseUser?.uid}`);

  const [hasSkipped] = useObjectVal<boolean>(skippedRef);

  if (!user.firebaseUser?.uid) {
    return <></>;
  }
  return hasSkipped === true ? <span>voteskipped</span> : <></>;
};

const Tooltipped = ({ tooltipText, children }: any) => {
  const targetRef = useRef(null);

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
