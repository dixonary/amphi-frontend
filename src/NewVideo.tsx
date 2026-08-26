import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import PlaylistAdd from "@mui/icons-material/PlaylistAdd";
import convertDuration from "./ConvertDuration";
import { AddPlaylistContext } from "./AddPlaylistProvider";
import { ServerContext, type Video } from "./ServerProvider";
import { UserContext } from "./UserProvider";

const VIDEO_URL = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?((?:youtube\.com|youtu\.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]{11})(\S+)?$/;
const VIDEO_ID = /^([\w-]{11})$/;
const PLAYLIST_URL = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?(?:youtube\.com)(\/playlist(\?list=)?)([\w-]+)(\S+)?$/;

const NewVideo = ({ setAccordion, inputRef }: any) => {
  const [inputValue, setInputValue] = useState("");
  const [videoId, setVideoId] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const { currentUser, userData } = useContext(UserContext);

  const updateInput = useCallback((value: string) => {
    setInputValue(value);
    const playlistMatch = value.match(PLAYLIST_URL);
    if (playlistMatch) {
      setVideoId("");
      setPlaylistId(playlistMatch[5]);
      return;
    }

    const videoMatch = value.match(VIDEO_ID) ?? value.match(VIDEO_URL);
    if (videoMatch) {
      setVideoId(videoMatch[videoMatch.length - 2] ?? value);
      setPlaylistId("");
      return;
    }

    setVideoId("");
    setPlaylistId("");
  }, []);

  const reset = useCallback(() => {
    setInputValue("");
    setVideoId("");
    setPlaylistId("");
    setAccordion("my-queue");
  }, [setAccordion]);

  useEffect(() => {
    const pasteHandler = async (event: KeyboardEvent) => {
      if (inputRef.current?.id === document.activeElement?.id) {
        return;
      }
      if (event.ctrlKey && !event.shiftKey && event.key === "v") {
        event.preventDefault();
        try {
          updateInput(await navigator.clipboard.readText());
          setAccordion("new-video");
        } catch {
          setAccordion("new-video");
          window.setTimeout(() => inputRef.current?.focus(), 1);
        }
      }
    };

    window.addEventListener("keydown", pasteHandler);
    return () => window.removeEventListener("keydown", pasteHandler);
  }, [inputRef, setAccordion, updateInput]);

  if (!currentUser) {
    return <p>Sign in to add videos to your queue.</p>;
  }
  if (userData?.status) {
    return <p>You may queue songs again after {new Date(userData.status).toLocaleString()}.</p>;
  }

  return (
    <>
      <div className="input-group">
        <input
          ref={inputRef}
          className="form-control"
          id="yt-video-input"
          value={inputValue}
          onChange={(event) => updateInput(event.target.value)}
          type="text"
          placeholder="YouTube ID or URL..."
          autoComplete="off"
        />
      </div>
      {inputValue && !videoId && !playlistId && <Alert variant="danger">Enter a valid YouTube video or playlist URL.</Alert>}
      {videoId && <VideoAction videoId={videoId} reset={reset} />}
      {playlistId && <PlaylistAction playlistId={playlistId} reset={reset} />}
    </>
  );
};

const VideoAction = ({ videoId, reset }: { videoId: string; reset: () => void }) => {
  const { state, sendCommand } = useContext(ServerContext);
  const [previewVideo, setPreviewVideo] = useState<{ videoId: string; video: Video } | null>(null);
  const [loading, setLoading] = useState(false);
  const [failureMessage, setFailureMessage] = useState("");
  const attemptedVideoId = useRef<string | null>(null);
  const video = state?.videos[videoId] ?? (previewVideo?.videoId === videoId ? previewVideo.video : undefined);
  const alreadyQueued = Object.values(state?.queues ?? {}).some((queue) =>
    queue.some((item) => item.videoId === videoId)
  );
  const recentlyPlayed = state?.history.some(
    (entry) =>
      entry.videoId === videoId &&
      Date.now() - new Date(entry.playedAt).getTime() < (state.settings.minTimeDiff * 1000)
  ) === true;
  const queueBlockMessage = alreadyQueued
    ? "Already in the playlist"
    : recentlyPlayed
      ? "Played too recently"
      : "";

  const loadVideo = useCallback(async () => {
    setLoading(true);
    setFailureMessage("");
    const result = await sendCommand("video.add", { videoId });
    if (result.ok && result.video) {
      setPreviewVideo({ videoId, video: result.video });
    } else {
      setFailureMessage("Unable to load this video.");
    }
    setLoading(false);
  }, [sendCommand, videoId]);

  useEffect(() => {
    if (!video && attemptedVideoId.current !== videoId) {
      attemptedVideoId.current = videoId;
      void loadVideo();
    }
  }, [loadVideo, video, videoId]);

  const queueVideo = async () => {
    setLoading(true);
    setFailureMessage("");
    const result = await sendCommand("queue.add", { videoId });
    if (result.ok) {
      reset();
    } else if (result.code === "video_already_queued") {
      setFailureMessage("This video is already in the playlist.");
    } else if (result.code === "video_recently_played") {
      setFailureMessage("This video was played too recently.");
    } else {
      setFailureMessage("Unable to add this video to the playlist.");
    }
    setLoading(false);
  };

  return (
    <div className="video-details">
      {!video && loading && <div className="d-flex align-items-center gap-2"><Spinner animation="border" size="sm" /><span>Loading video...</span></div>}
      {video && (
        <>
          <img className="thumbnail" src={video.thumbnailUrl} alt="" />
          <div className="info">
            <p className="title">{video.title}</p>
            <p className="channel">{video.channelTitle} - {convertDuration(video.durationSeconds)}</p>
          </div>
        </>
      )}
      {video && <button type="button" className={`btn enqueue-video ${video.embeddable ? "btn-info" : "btn-danger"}`} onClick={queueVideo} disabled={loading || !video.embeddable || Boolean(queueBlockMessage)}>
        {loading ? <Spinner animation="border" /> : video.embeddable ? queueBlockMessage || <PlaylistAdd /> : "Video is not embeddable"}
      </button>}
      {failureMessage && <Alert variant="danger">{failureMessage}</Alert>}
    </div>
  );
};

const PlaylistAction = ({ playlistId, reset }: { playlistId: string; reset: () => void }) => {
  const { state, sendCommand } = useContext(ServerContext);
  const { setAddPlaylist } = useContext(AddPlaylistContext);
  const [loading, setLoading] = useState(false);
  const playlist = state?.playlists[playlistId];

  const addOrSelect = async () => {
    setLoading(true);
    if (!playlist) {
      await sendCommand("playlist.add", { playlistId });
    } else {
      setAddPlaylist(playlistId);
      reset();
    }
    setLoading(false);
  };

  return (
    <button type="button" className="btn btn-info enqueue-video" onClick={addOrSelect} disabled={loading}>
      {loading ? <Spinner animation="border" /> : playlist ? "Select playlist videos" : "Load playlist"}
    </button>
  );
};

export default NewVideo;
