import React, {Component, useEffect, useContext, useState, useRef} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth';
import firebase from 'firebase';
import { Navbar } from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css';

import Main from './Main';
import {UserBox, LoginCallback} from './User';
import { FirebaseUserProvider } from './UserProvider';
import AdminToolsProvider from './AdminToolsProvider';
import { NowPlayingProvider, NowPlayingContext } from './NowPlayingProvider';
import { Close } from '@material-ui/icons';

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
      <FirebaseUserProvider>
        <AdminToolsProvider>
          <NowPlayingProvider>
            <Header />
            <Main />
          </NowPlayingProvider>
        </AdminToolsProvider>
      </FirebaseUserProvider>
    </Router>
  );

}

const Header = () => (<>
  <Navbar variant="dark" bg="dark">
    <Navbar.Brand>AMPHI</Navbar.Brand>
    <Navbar.Toggle />
    <NowPlayingText />
    <Route path="/auth/login" component={LoginCallback} />
    <Route exact path="/" component={UserBox} />
  </Navbar>
  { UnderConstruction && (<UnderConstructionNotice />) }
</>);

const NowPlayingText = () => {
  const nowPlaying = useContext(NowPlayingContext);
  const [videoData, setVideoData] = useState<any>(null);
  
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
  });

  if(videoData === null || videoData === undefined) return (<></>);
  return (
    <Navbar.Text>Now playing: {videoData.title}</Navbar.Text>
  )
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

const Public = () => <h3>Public</h3>
const Protected = () => <h3>Protected</h3>

export default App;