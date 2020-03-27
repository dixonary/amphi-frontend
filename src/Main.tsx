import { Container, Row, Col, Card } from "react-bootstrap";
import React, { useContext, useEffect, useState } from "react";

import YouTube, { YouTubeProps } from 'react-youtube';

import Sidebar from "./Sidebar";
import NoVideo from "./NoVideo";
import { NowPlayingContext } from "./NowPlayingProvider";

const Main = () => {


  return (
  <Container fluid={true} as="main" className="flex-column text-light">
    <Row className="main-row">
      <Col lg={9}>
        <Player />
      </Col>
      <Col lg={3} className="sidebar" as="aside">
        <Sidebar />
      </Col>
    </Row>
  </Container>
  )
};

const Player = () => {

  const nowPlaying = useContext(NowPlayingContext);
  const [ startSeconds, setStartSeconds ] = useState(0);

  useEffect(() => {
    if(nowPlaying === undefined) return;
    if(nowPlaying === null)      return;
    const ss = Math.floor((Date.now() - nowPlaying.startedAt) / 1000);
    setStartSeconds(ss);
    console.log("Running");
  });

  if(nowPlaying === undefined || nowPlaying === null) {
    return (<NoVideo />);
  }

  const startedPlaying = ({target}:{target:any}) => {
    const now = Date.now(); // now in ms

    // where it should be
    const shouldBe = now - nowPlaying.startedAt;

    // where it should be vs where it is
    const msDiff = shouldBe - target.getCurrentTime()*1000;

    if(msDiff > 2000) { // at least 2 seconds out of sync
      target.seekTo(Math.floor(shouldBe / 1000));
    }
  }
  
  return (
    <YouTube
      videoId={nowPlaying.video} 
      className="video"
      containerClassName="video-wrapper"
      opts={{
        height: '100%',
        width: '100%',
        playerVars: { // https://developers.google.com/youtube/player_parameters
          autoplay: 1,
          start:startSeconds
        }
      }}
      key={nowPlaying?.startedAt??"video"}
      onPlay={startedPlaying}
      onEnd={()=>{}}
    />
  );
};

export default Main;