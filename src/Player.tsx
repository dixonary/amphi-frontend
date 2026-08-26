import React, { memo, useContext, useMemo } from "react";
import YouTube from "react-youtube";
import NoVideo from "./NoVideo";
import { NowPlayingContext } from "./NowPlayingProvider";

const Player = () => {
  const nowPlaying = useContext(NowPlayingContext);

  if (nowPlaying === undefined || nowPlaying === null) {
    return <NoVideo />;
  }

  const startSeconds = useMemo(
    () => Math.max(0, Math.floor((Date.now() - nowPlaying.startedAt) / 1000)),
    [nowPlaying.video, nowPlaying.startedAt]
  );
  const playerOptions = useMemo(
    () => ({
      height: "100%",
      width: "100%",
      playerVars: {
        autoplay: 1,
        start: startSeconds,
      },
    }),
    [startSeconds]
  );

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
      key={nowPlaying.video}
      videoId={nowPlaying.video}
      className="video-wrapper"
      opts={playerOptions}
      onPlay={startedPlaying}
      onStateChange={(event) => {
        // console.log("===Debug information===");
        // console.log(event);
        const player: any = event.target;
        switch (event.data) {
          case 2: // paused
            // unpause
            player.playVideo();
            break;
          case 3: // buffering
            setTimeout(() => {
              // If we're still buffering, try pulling forward a little
              if (player.getPlayerState() === 3 && player.getCurrentTime() > 0) {
                player.seekTo(player.getCurrentTime() + 0.1);
              }
              player.playVideo();
            }, 100);
            break;
        }
      }}
      onEnd={() => { }}
    />
  );
};

export default memo(Player);
