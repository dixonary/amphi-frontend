import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import YouTube from "react-youtube";
import NoVideo from "./NoVideo";
import { NowPlayingContext } from "./NowPlayingProvider";

const Player = () => {
  const nowPlaying = useContext(NowPlayingContext);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [youtube, setYoutube] = useState<any>(null);

  const ready = useCallback(
    ({ target }: { target: any }) => {
      setYoutube(target);
    },
    [setYoutube]
  );

  useEffect(() => {
    if (nowPlaying === undefined) return;
    if (nowPlaying === null) return;
    const ss = Math.floor((Date.now() - nowPlaying.startedAt) / 1000);
    // setStartSeconds(ss);
    if (youtube !== null) {
      youtube.loadVideoById({ videoId: nowPlaying.video, startSeconds: ss });
    }
  }, [nowPlaying, youtube]);

  if (nowPlaying === undefined || nowPlaying === null) {
    return <NoVideo />;
  }

  const startedPlaying = ({ target }: { target: any }) => {

    // Rubber-banding

    /*
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
    */
  };

  return (
    <YouTube
      videoId={"NO_VIDEO"}
      className="video"
      containerClassName="video-wrapper"
      opts={{
        height: "100%",
        width: "100%",
        playerVars: {
          // https://developers.google.com/youtube/player_parameters
          autoplay: 1,
          start: 0,
        },
      }}
      onReady={ready}
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

export default Player;
