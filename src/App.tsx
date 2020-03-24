import React, {Component} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from 'react-router-dom'
import {UserBox, LoginCallback} from './auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import firebase from 'firebase';
import { Navbar, Nav, NavItem} from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css';

import Main from './Main';

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
      <Header />
      <Main />
    </Router>
  );

}

const Header = () => (
  <Navbar variant="dark" bg="dark">
    <Navbar.Brand>AMPHI</Navbar.Brand>
    <Navbar.Toggle />
    <Route path="/auth/login" component={LoginCallback} />
    <Route exact path="/" component={UserBox} />
  </Navbar>
);

// const PrivateRoute = ({ component : Component, ...rest } : any) => {
//   const [user, initialising, error] = useAuthState(firebase.auth());
//     if(user !== null)
//       return (<Route {...rest} render={(props) => <Component {...props}/>}/> );
//     else
//       return (<Redirect to='/login' />);
// }

const Public = () => <h3>Public</h3>
const Protected = () => <h3>Protected</h3>

export default App;
