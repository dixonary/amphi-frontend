import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Alert, Spinner, Button } from "react-bootstrap";
import { useObjectVal } from "react-firebase-hooks/database";
import { PlaylistAdd } from "@material-ui/icons";
import React from "react";
import firebase from "firebase";

import convertDuration from "./ConvertDuration";
import { UserContext } from "./UserProvider";
import { QueueContext } from "./QueueProvider";
import { AddPlaylistContext } from "./AddPlaylistProvider";

// Regex for youtube playlist URLs
const PLAYLIST_REGEX = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?(?:youtube\.com)(\/playlist(\?list=)?)([\w-]+)(\S+)?$/;

// Regex for youtube video URLs
const YT_REGEX = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]{11})(\S+)?$/;
// Regex for youtube IDs only
const ID_REGEX = /^([\w-]{11})$/;

const NewVideo = ({ setAccordion, inputRef }: any) => {
  const [inputVal, setInputVal] = useState("");
  const [error, setError] = useState("");
  const [videoId, setVideoId] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const user = useContext(UserContext);


  const updateVideoUrl = useCallback(async (newVal: string) => {
    let res;
    setInputVal(newVal);

    res = newVal.match(PLAYLIST_REGEX);
    if (res !== null) {
      // Exact match on playlist IDs
      setError("");
      setVideoId("");
      setPlaylistId(res[5] as string);
      return;
    }

    res = newVal.match(ID_REGEX);
    if (res !== null) {
      // Exact match on video IDs
      setError("");
      setVideoId(newVal);
      setPlaylistId("");
      return;
    }

    res = newVal.match(YT_REGEX);
    if (res !== null) {
      // Match YT url pattern
      setError("");
      setVideoId(res[5] as string);
      setPlaylistId("");
      return;
    }

    setVideoId("");
    setPlaylistId("");
  }, []);



  const reset = () => {
    setInputVal("");
    setVideoId("");
    setPlaylistId("");
    setAccordion("my-queue");
  };


  useEffect(() => {
    const pasteHandler = async (e: KeyboardEvent) => {
      if (inputRef.current?.id === document.activeElement?.id) {
        console.log("Skipping auto paste");
        return;
      }
      console.log(e.key);
      if (e.ctrlKey && !e.shiftKey && e.key === "v") {
        e.preventDefault();
        let clip = "";
        try {
          clip = await navigator.clipboard.readText()
        }
        catch (e: any) {
          setAccordion("new-video");
          setTimeout(() => inputRef.current?.focus(), 1);
          return;
        }
        console.log(clip);
        if (clip.match(YT_REGEX) !== null)
          updateVideoUrl(clip);
        setAccordion("new-video");
      }
    };

    window.addEventListener('keydown', pasteHandler);
    return () => {
      window.removeEventListener('keydown', pasteHandler);
    };
  }, [updateVideoUrl, inputRef, setAccordion]);



  if (user.firebaseUser === undefined || user.firebaseUser === null) {
    return <p>Sign in to add videos to your queue.</p>;
  }

  if (user.userData?.status === "banned") {
    return <p>You may not queue videos.</p>;
  }
  if (user.userData?.status !== null && user.userData?.status !== undefined) {
    return (
      <p>
        You may queue songs again after{" "}
        {timeToDurationString(user.userData.status)}.
      </p>
    );
  }

  return (
    <>
      <div className="input-group">
        <input
          ref={inputRef}
          className="form-control"
          id="yt-video-input"
          name="yt-video"
          value={inputVal}
          onChange={(e) => updateVideoUrl(e.target.value)}
          type="text"
          placeholder="Youtube ID or URL..."
          autoComplete="off"
        />
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {videoId !== "" && (
        <VideoData
          videoId={videoId}
          updateVideoUrl={updateVideoUrl}
          resetData={reset}
        />
      )}
      {playlistId !== "" && (
        <PlaylistData
          playlistId={playlistId}
          resetData={reset}
        />
      )}
    </>
  );
};

const timeToDurationString = (then: number) => {
  const seconds = (then - Date.now()) / 1000;
  if (seconds > 3600) {
    return Math.round(seconds / 3600) + " hours";
  }
  if (seconds > 60) {
    return Math.round(seconds / 60) + " minutes";
  }
  return seconds + " seconds";
};

const PlaylistData = ({ playlistId, resetData }: any) => {
  const playlistRef = firebase.database().ref(`playlists/${playlistId}`);
  const [playlistData, loading] = useObjectVal<any>(playlistRef);
  const { addPlaylist, setAddPlaylist } = useContext(AddPlaylistContext);

  // Tell the cloud about the new playlist ID we want populated
  // (But check if it's already been done first!)
  useEffect(() => {
    const runAsync = async () => {
      const currentState = (await playlistRef.once("value")).val();
      if (currentState === null) {
        await playlistRef.set({ loading: true });
      }
    };
    runAsync();
  }, [playlistRef]);

  const enqueue = useMemo(() => async () => {
    if (playlistData === null) return;
    if (addPlaylist) return;

    setAddPlaylist(playlistId);

    resetData();
  }, [playlistData, resetData, addPlaylist, setAddPlaylist, playlistId]);

  useEffect(() => {
    const enterHandler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        enqueue();
      }
    };

    window.addEventListener('keypress', enterHandler);
    return () => {
      window.removeEventListener('keypress', enterHandler);
    };
  }, [enqueue]);

  if (loading || (playlistData?.loading && !playlistData.title)) {
    return (
      <div className="video-details">
        <Spinner animation="border" className="margin-auto" />
      </div>
    );
  }

  if (playlistData !== null) {
    return (
      <>
        <div className="video-details">
          <div className="info">
            <p className="title">{playlistData.title}</p>
            <p className="channel">{playlistData.channelTitle}</p>
          </div>
        </div>

        <Button
          as="a"
          onClick={enqueue}
          variant="info"
          className="enqueue-video"
        >
          {playlistData?.loading ? (
            <Spinner animation="border" />
          ) : (
            <PlaylistAdd />
          )}
        </Button>
      </>
    );
  }
};

const VideoData = ({ videoId, resetData }: any) => {
  const videoRef = firebase.database().ref(`videos/${videoId}`);
  const [videoData, loading, error] = useObjectVal<any>(videoRef);
  const userQueue = useContext(QueueContext);

  // Tell the cloud about the new video ID we want populated
  // (But check if it's already been done first!)
  useEffect(() => {
    const runAsync = async () => {
      const currentState = (await videoRef.once("value")).val();
      if (currentState === null) {
        await videoRef.set({ loading: true });
      }
    };
    runAsync();
  }, [videoRef]);

  const enqueue = useMemo(() => async () => {
    if (videoData === null) return;

    const queue = userQueue.queue?.val() as any[] | undefined | null;
    if (queue === undefined) return;

    // Silently die if we already have the video
    if (queue !== null && queue.findIndex((x) => x.video === videoId) !== -1) {
      // window.alert("You cannot queue the same song more than once at a time.");
      // return;
    }

    // Force loading state on button
    videoData.loading = true;

    await userQueue.enqueueVideo(videoId);
    resetData();
  }, [resetData, userQueue, videoData, videoId]);

  useEffect(() => {
    const enterHandler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        console.log(videoData?.embeddable);
        (!(videoData?.embeddable) ? () => { } : enqueue)();
      }
    };

    window.addEventListener('keypress', enterHandler);
    return () => {
      window.removeEventListener('keypress', enterHandler);
    };
  }, [videoData, enqueue]);


  if (loading || (videoData?.loading && !videoData.title)) {
    return (
      <div className="video-details">
        <Spinner animation="border" className="margin-auto" />
      </div>
    );
  }



  let isProblem: string | null = null;
  if (videoData?.embeddable === false) isProblem = "Video is not embeddable";




  if (videoData !== null) {
    return (
      <>
        <div className="video-details">
          <div className="thumb-sizer">
            <div
              className="thumb-wrapper"
              style={{
                backgroundImage: `url(${videoData.thumbnail})`,
                backgroundPosition: "center center",
                backgroundSize: "cover",
              }}
            >
            </div>
            <p className="duration">{convertDuration(videoData.duration)}</p>
          </div>
          <div className="info">
            <p className="title">{videoData.title}</p>
            <p className="channel">{videoData.channelTitle}</p>
          </div>
        </div>

        <Button
          as="a"
          onClick={isProblem ? () => { } : enqueue}
          variant={isProblem ? "danger" : "info"}
          className="enqueue-video"
        >
          {videoData?.loading ? (
            <Spinner animation="border" />
          ) : isProblem !== null ? (
            isProblem
          ) : (
            <PlaylistAdd />
          )}
        </Button>
      </>
    );
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  // If all else fails, render a spinner
  return <Spinner animation="border" />;
};

export default NewVideo;
