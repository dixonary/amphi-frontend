import React, { useContext, useEffect, useState } from 'react';
import { Modal, ModalBody, ModalTitle, CloseButton, Button } from 'react-bootstrap';
import { AdminToolsContext } from './AdminToolsProvider';
import ModalHeader from 'react-bootstrap/ModalHeader';
import firebase from 'firebase';
import convertDuration from './ConvertDuration';


/** This modal dialog shows up when an administrator wishes to
 *  make major moves based on a 
 */

const AdminToolbox = () => {

  const { isAdmin, closeToolbox, toolboxData } = useContext(AdminToolsContext);

  // We have to use a state hook here because we cannot chain two 
  // hooks together nicely otherwise.
  const [ videoData, setVideoData ] = useState<any>(undefined);
  const [ userData , setUserData  ] = useState<any>(undefined);

  // If the video ID is updated, grab the video info from the DB.
  useEffect( () => {
    if(toolboxData.video === null) {
      setVideoData(undefined);
      return;
    }
    const videoRef = firebase.database().ref(`videos/${toolboxData.video}`);
    videoRef.on('value', (snapshot) => { 
      setVideoData(snapshot.val());
    });
  }, [toolboxData]);

  // If the user ID is updated, grab the video info from the DB.
  useEffect( () => {
    if(toolboxData.user === null) {
      setUserData(undefined);
      return;
    }
    const userRef = firebase.database().ref(`users/${toolboxData.user}`);
    userRef.on('value', (snapshot) => { 
      setUserData(snapshot.val());
    });
  }, [toolboxData]);

  const videoUrl = "https://youtube.com/watch?v="+toolboxData.video??"";

  const renderStatus = (status:string | undefined) => {
    if(status === undefined) 
      return (<span className="green">OK</span>);
    if(status === "banned")
      return (<span className="red"> Banned indefinitely</span>);
    
    // Assume that the ban status is a timestamp
    return (<span className="amber">
      Banned until {Date.parse(status).toLocaleString()}
    </span>)
  }

  return (<Modal
    onShow={()=>{}}
    onHide={()=>{}}
    show={toolboxData.video !== null}
  >
    <ModalHeader>
      <ModalTitle>Admin Toolbox</ModalTitle>
      <CloseButton onClick={closeToolbox}/>
    </ModalHeader>
    <ModalBody>
      <p style={{textAlign:"center"}}>The buttons here aren't hooked up yet!</p>
      {isAdmin || (
        <p>You are not an admin. You may not use the admin toolbox.</p>
      )}
      {videoData && (<>
        <h6>Video</h6>
        <div className="video-info horz">
          <img alt="" className="thumbnail" src={videoData.thumbnail} />
          <div className="vert details">
            <p className="title">{videoData.title}</p>
            <div className="horz justify-spread-evenly">
              <p className="url">
                <a target="_blank" href={videoUrl}>{toolboxData.video}</a>
              </p>
              <p className="length">&nbsp;-&nbsp; 
                <span>{convertDuration(videoData.duration)}</span>
              </p>
            </div>
          </div>
        </div>
        <Button as="a" className="wide blacklist">
          Blacklist video
        </Button>
      </>)}
      {videoData && userData && (<hr />)}
      {userData && (<>
        <h6>User</h6>
        <div className="user-info vert">
          <p className="info-line"><span>Display name </span>{userData.displayName}</p>
          <p className="info-line"><span>Username </span>{userData.uid}</p>
          <p className="info-line"><span>Current status </span>{renderStatus(userData.status)}</p>
        </div>
        <div className="button-row">
          <Button as="a" className="wide ban-1">
            Clear queue
          </Button>
          <Button as="a" className="wide ban-2">
            Suspend (1h)
          </Button>
          <Button as="a" className="wide ban-3">
            Suspend (24h)
          </Button>
          <Button as="a" className="wide ban-4">
            Ban
          </Button>
        </div>
      </>)}
    </ModalBody>
  </Modal>)
}


export default AdminToolbox;