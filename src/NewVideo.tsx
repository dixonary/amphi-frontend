import { useState, useEffect, useContext } from "react";
import { Alert, Spinner, Button } from "react-bootstrap";
import { useObjectVal } from "react-firebase-hooks/database";
import { PlaylistAdd } from "@material-ui/icons";
import React from "react";
import firebase from "firebase";

import convertDuration from './ConvertDuration';
import { UserContext }  from "./UserProvider";
import { QueueContext } from "./QueueProvider";


const NewVideo = ({setAccordion, inputRef}:any) => {
  const [inputVal , setInputVal]   = useState("");
  const [error    , setError   ]   = useState("");
  const [videoId  , setVideoId ]   = useState("");  
  const user = useContext(UserContext);

  // Regex for youtube video URLs
  const YT_REGEX = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]{11})(\S+)?$/;
  // Regex for youtube IDs only
  const ID_REGEX = /^([\w-]{11})$/;

  const updateVideoUrl = async (newVal:string) => {
    let res;
    setInputVal(newVal);

    res = newVal.match(ID_REGEX);
    if(res !== null) { // Exact match on video IDs
      setError("");
      setVideoId(newVal);
      return;
    }
    
    res = newVal.match(YT_REGEX); 
    if(res !== null) { // Match YT url pattern
      setError("");
      setVideoId(res[5] as string);
      return;
    }

    setVideoId("");
  };

  const reset = () => {
    setInputVal("");
    setVideoId("");
    setAccordion("my-queue");
  }

  if(user.firebaseUser === undefined || user.firebaseUser === null) {
    return (<p>Sign in to add videos to your queue.</p>);
  }

  if(user.userData?.status === "banned") {
    return (<p>You may not queue videos.</p>);
  }
  if(user.userData?.status !== null && user.userData?.status !== undefined) {
    return (<p>
      You may queue songs again after{' '}
      {timeToDurationString(user.userData.status)}.
    </p>);
  }

  return (
    <>
      <div className="input-group">
      <input 
        ref={inputRef}
        className="form-control"
        name="yt-video"
        value={inputVal} 
        onChange={(e) => updateVideoUrl(e.target.value)} 
        type="text"
        placeholder="Youtube ID or URL..."
        autoComplete="off"
      />
      </div>
      {error && (<Alert variant="danger">{error}</Alert>)}
      {(videoId !== "") && (
        <VideoData 
          videoId={videoId} 
          updateVideoUrl={updateVideoUrl}
          resetData={reset}
        />)}
    </>
  );
};

const timeToDurationString = (then:number) => {
  const seconds = (then - Date.now()) / 1000;
  if(seconds > 3600) {
    return Math.round(seconds / 3600) + " hours";
  }
  if(seconds > 60) {
    return Math.round(seconds / 60) + " minutes";
  }
  return seconds + " seconds";
}


const VideoData = ({videoId, resetData}:any) => {
  const videoRef = firebase.database().ref(`videos/${videoId}`);
  const [videoData, loading, error] = useObjectVal<any>(videoRef);
  const userQueue = useContext(QueueContext);

  // Tell the cloud about the new video ID we want populated
  // (But check if it's already been done first!)
  useEffect(() => {
      const runAsync = async () => {
        const currentState = await videoRef.once('value');
        if(currentState.val() === null) {
          await videoRef.set({loading:true});
        }
      }
      runAsync();
  }, [videoRef]);


  const enqueue = async () => {

    if(videoData === null) return;

    const queue = userQueue.queue?.val() as any[] | undefined | null;
    if(queue === undefined) return;
    
    // Silently die if we already have the video
    if(queue !== null && queue.findIndex((x) => x.video === videoId) !== -1) {
      // window.alert("You cannot queue the same song more than once at a time.");
      // return;
    }
    
    // Force loading state on button
    videoData.loading = true;

    await userQueue.enqueueVideo(videoId);
    resetData();
  }


  if(loading || (videoData?.loading && !videoData.title)) {
    return (
      <div className="video-details">
        <Spinner animation="border" className="margin-auto" />
      </div>
    );
  }

  if(videoData !== null) {

    return (
      <>

      <div className="video-details">
        <div 
          className="thumb-wrapper"
          style={{
            backgroundImage:`url(${videoData.thumbnail})`,
            backgroundPosition:"center center",
            backgroundSize:"cover"
          }}>
          <p className="duration">{convertDuration(videoData.duration)}</p>
        </div>
        <div className="info">
          <p className="title">{videoData.title}</p>
          <p className="channel">{videoData.channelTitle}</p>
        </div>
      </div>

      <Button 
          as="a" 
          onClick={enqueue} 
          variant="info"
          className="enqueue-video"
      >
        {videoData?.loading 
          ? (<Spinner animation="border" />)
          : (<PlaylistAdd />)
        }
      </Button>

      </>
    );
  }

  if(error) {
    return (<p>{error.message}</p>);
  }

  // If all else fails, render a spinner
  return (
    <Spinner animation="border"/>
  );
}

export default NewVideo;