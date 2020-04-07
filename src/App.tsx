import React, {useEffect, useContext, useState, useRef} from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'
import firebase from 'firebase';
import { Navbar, Tooltip, OverlayTrigger } from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css';

import Main from './Main';
import {UserBox, LoginCallback, AdminButton} from './User';
import { UserProvider } from './UserProvider';
import AdminToolsProvider, { AdminToolsContext } from './AdminToolsProvider';
import { NowPlayingProvider, NowPlayingContext } from './NowPlayingProvider';
import { Close, Assignment, SkipNext } from '@material-ui/icons';

/******************************************************************************/
/* Constants */
const UnderConstruction:boolean = true;



/******************************************************************************/
/* Main application logic */

function App() {

  firebase.initializeApp({
    projectId:     "amphi-compsoc",
    apiKey:        "AIzaSyCOXtTbrBZ3qAKlfBHPh1t5KzPYqLA3CZU", // Auth / General Use
    authDomain:    "amphi-compsoc.firebaseapp.com",           // Auth with popup/redirect
    databaseURL:   "https://amphi-compsoc.firebaseio.com",    // Realtime Database
    storageBucket: "amphi-compsoc.appspot.com",               // Storage
  });

  return (
    <Router>
      <NowPlayingProvider>
        <UserProvider>
          <AdminToolsProvider>
              <Header />
              <Main />
          </AdminToolsProvider>
        </UserProvider>
      </NowPlayingProvider>
    </Router>
  );

}

const Header = () => (<>
  <Navbar expand="lg" variant="dark" bg="dark">
    <Navbar.Brand>AMPHI</Navbar.Brand>
    <Navbar.Toggle />
    <Navbar.Collapse>
      <NowPlayingText />
      <Route path="/auth/login" component={LoginCallback} />
      <Route exact path="/" component={UserBox} />
    </Navbar.Collapse>
  </Navbar>
  { UnderConstruction && (<UnderConstructionNotice />) }
</>);

const NowPlayingText = () => {
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

  const tooltip = (props:any) => (
    <Tooltip 
      id={`now-playing-tooltip`}
      {...props}
    >
      Queued by {nowPlaying?.queuedByDisplayName}
    </Tooltip>
  );

  const tryOpenToolbox = () => 
    openToolbox({
      video:nowPlaying?.video    ?? null, 
      user :nowPlaying?.queuedBy ?? null
    });

  if(videoData === null || videoData === undefined) return (<></>);
  return (<>
    {isAdmin && (<>
      <AdminButton
        tooltipText="Skip video"
        icon={(<SkipNext />)}
        callback={playNextVideo} 
      />
      <AdminButton 
        tooltipText="Tools"
        icon={(<Assignment />)}
        callback={tryOpenToolbox}
      />
    </>)}
    
    <OverlayTrigger
      placement="bottom"
      overlay={tooltip}
      >
      <Navbar.Text>Now playing: {videoData.title}</Navbar.Text>
    </OverlayTrigger>
  </>)
};

const UnderConstructionNotice = () => {
  const noticeRef = useRef<HTMLDivElement>(null);
  
  const killNotice = () => {
    if(noticeRef?.current !== null) {
      noticeRef.current.remove();
    }
  }
  
  return (
    <div className="notice" ref={noticeRef}>
      <p>
        This site is being actively developed. 
        Things may change or behave strangely without warning.
      </p>
      <button className="closer" onClick={killNotice}>
        <Close />
      </button>
    </div>
  );
};

export default App;