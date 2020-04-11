import React, { useState, useContext, useEffect } from "react";
import { Accordion, Card,Spinner, Button } from "react-bootstrap";
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


const Sidebar = () => {
  const [activeKey, setActiveKey] = useState("my-queue");

  const active = (key:string) => {
    if(activeKey === key) {
      setActiveKey("");
    }
    else {
      setActiveKey(key);
    }
  }

  return (<>
    <QueueProvider>
      <Card bg="dark" className="now-playing">
        <Card.Header>
          <Accordion.Toggle as="a" variant="link" eventKey="__">Now Playing</Accordion.Toggle>
        </Card.Header>
        <Card.Body>
          <NowPlayingSidebar />
        </Card.Body>
      </Card>
      <Card bg="dark" className="playlist">
        <Card.Header>
          <Accordion.Toggle as="a" variant="link" eventKey="__">Playlist</Accordion.Toggle>
        </Card.Header>
        <Card.Body>
          <Playlist />
        </Card.Body>
      </Card>
      <Accordion activeKey={activeKey.toString()}>
        <Card bg="dark" className="my-queue">
          <Card.Header>
            <Accordion.Toggle 
                as="a" 
                variant="link" 
                eventKey="my-queue"
                onClick={() => active("my-queue")}
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
                variant="link" 
                eventKey="new-video"
                onClick={() => active("new-video")}
            >
              Add a Song
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="new-video">
            <Card.Body className="">
              <NewVideo setAccordion={setActiveKey} />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </QueueProvider>
    <AdminToolbox />
    </>
  );
}


const NowPlayingSidebar = () => {
  const nowPlaying                              = useContext(NowPlayingContext);
  const { isAdmin, playNextVideo, openToolbox } = useContext(AdminToolsContext);
  const [ videoData, setVideoData ]             = useState<any>(null);

  useEffect(() => {
    if(nowPlaying?.video === undefined) {
      setVideoData(undefined);
      return;
    };
    const getVideoData = async () => {
      const vidData = await firebase.database()
          .ref(`videos/${nowPlaying.video}`)
          .once('value');
      setVideoData(vidData.val());
    };
    getVideoData();
  }, [nowPlaying]);


  if(nowPlaying === null || nowPlaying === undefined) return (<>
    <p>No song is currently playing.</p>
  </>);
  return (
    <div className="video-details">
    {videoData === null || videoData === undefined
    ? (<Spinner animation="border" />)
    :
      (<>
        <p className="title">{videoData.title}</p>
        <div className="other-details">
          <p className="channel-title">
            {videoData.channelTitle} - {convertDuration(videoData.duration)}
          </p>
          <p className="displayName">{nowPlaying?.queuedByDisplayName}</p>
        </div>
      </>)
    }
    {isAdmin && (
      <Button 
          as="a" 
          className="delete admin" 
          variant="dark" 
          onClick={() => playNextVideo()}
      >
        <SkipNext />    
      </Button>
    )}
    {isAdmin && (
      <Button 
          as="a" 
          className="tools admin" 
          variant="dark" 
          onClick={() => openToolbox({video:nowPlaying?.video, user:nowPlaying?.queuedBy})}
      >
        <Assignment />
      </Button>
    )}
    </div>
  )
};

export default Sidebar;