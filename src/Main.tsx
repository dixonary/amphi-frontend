import { Container, Row, Col } from "react-bootstrap";
import React, { useContext, useEffect, useState, useRef } from "react";

import YouTube from "react-youtube";

import Sidebar from "./Sidebar";
import NoVideo from "./NoVideo";
import { NowPlayingContext } from "./NowPlayingProvider";
import AdminSettings from "./AdminSettings";
import { ModeContext, modeClass, Mode } from "./ModeProvider";

const Main = () => {
  const { currentMode } = useContext(ModeContext);

  return (
    <Container
      fluid={true}
      as="main"
      className={`flex-column text-light ${modeClass(currentMode)}`}
    >
      <AdminSettings />
      <Row className="main-row">
        {currentMode !== Mode.PLAYLIST_ONLY && (
          <Col lg={9}>
            <Player />
          </Col>
        )}
        {currentMode !== Mode.VIDEO_ONLY && (
          <Col lg={3} className="sidebar" as="aside">
            <Sidebar />
          </Col>
        )}
      </Row>
    </Container>
  );
};

const Player = () => {
  const nowPlaying = useContext(NowPlayingContext);
  const [startSeconds, setStartSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (nowPlaying === undefined) return;
    if (nowPlaying === null) return;
    const ss = Math.floor((Date.now() - nowPlaying.startedAt) / 1000);
    setStartSeconds(ss);
  }, [nowPlaying]);

  if (nowPlaying === undefined || nowPlaying === null) {
    return <NoVideo />;
  }

  const startedPlaying = ({ target }: { target: any }) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const now = Date.now(); // now in ms

    // where it isn't
    const shouldBe = now - nowPlaying.startedAt;

    // by subtracting where it is from where it isn't (or where it isn't from
    // where it is, whichever is greater) it obtains a difference, or deviation.
    const msDiff = shouldBe - target.getCurrentTime() * 1000;

    if (Math.abs(msDiff) > 2000) {
      // at least 2 seconds out of sync
      target.seekTo(Math.floor(shouldBe / 1000));
    }
  };

  return (
    <YouTube
      videoId={nowPlaying.video}
      className="video"
      containerClassName="video-wrapper"
      opts={{
        height: "100%",
        width: "100%",
        playerVars: {
          // https://developers.google.com/youtube/player_parameters
          autoplay: 1,
          start: startSeconds,
        },
      }}
      key={nowPlaying?.startedAt ?? "video"}
      onPlay={startedPlaying}
      onStateChange={(event) => {
        console.log("===Debug information===");
        console.log(event);
        const player: any = event.target;
        switch (event.data) {
          case 2: // paused
            // unpause
            player.playVideo();
            break;
          case 3: // buffering
            setTimeout(() => {
              // If we're still buffering, try pulling forward a little
              if (player.currentState === 3) {
                player.seekTo(player.getCurrentTime() + 1);
              }
              player.playVideo();
            }, 1000);
            break;
        }
      }}
      onEnd={() => {}}
    />
  );
};

export default Main;
