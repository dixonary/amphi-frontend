import React, {Component, Fragment} from 'react';

import { useAuthState } from 'react-firebase-hooks/auth';
import firebase from 'firebase';

import useFetch, { useAsync } from "react-async";
import * as Querystring from 'querystring';

import UWCSLogo from './uwcsLogo';

import {Spinner, Button, Navbar, Row, NavItem} from 'react-bootstrap';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  useLocation
} from 'react-router-dom'

import {Container} from 'react-bootstrap';

const AUTH_ENDPOINT    
  = "https://us-central1-amphi-compsoc.cloudfunctions.net/uwcsAuth";
const AUTH_CB_ENDPOINT 
  = "https://us-central1-amphi-compsoc.cloudfunctions.net/uwcsAuthCallback";

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const useAuth = () => {
  const [state, setState] = React.useState(() => { 
    const user = firebase.auth().currentUser;
    return [user, !user];
  });

  const onChange = (user:firebase.User | null) => {
    setState([user, false]);
  }

  React.useEffect(() => {
    // listen for auth state changes
    const unsubscribe = firebase.auth().onAuthStateChanged(onChange)
    // unsubscribe to the listener when unmounting
    return () => unsubscribe()
  }, [])

  return state;
}

const login = () => {
  window.location.href = AUTH_ENDPOINT;
};

const logout = () => {
  firebase.auth().signOut();
};

// const login  = () => {};
// const logout = () => {};

const UserBox = () => {
  // const [user, initialising] = [false, false];
  const [user, initializing] = useAuth();
  return (<Navbar.Collapse className="justify-content-end">
    { user
      ? (<>
        <Navbar.Text>
          Logged in as {(user as firebase.User).displayName}
        </Navbar.Text>
        <NavItem>
          <Button as="a" onClick={logout} className="uwcs-signin" >Log out</Button>
        </NavItem>
        </>
      )
      : initializing
      ? (<Spinner variant="light" animation="border" role="status" />)
      : (
        <Button as="a" className="uwcs-signin" onClick={login}>
          <span>Log in with UWCS</span>
          <UWCSLogo />
        </Button>
      )
    }
  </Navbar.Collapse>
  );
}

const firebaseLogin = async ({code}:any, {signal}:any) => {
  const response = await fetch(`${AUTH_CB_ENDPOINT}?code=${code}`);
  if(!response.ok) throw new Error(response.status.toString());
  const data     = await response.json();   
  
  await firebase.auth().signInWithCustomToken(data.token);

  return code;
  // const [token  , setToken]   = React.useState(null);
  // const [loading, setLoading] = React.useState(false);

  // React.useEffect(() => {
  //   setLoading(true);
  //   async function getCode() {
  //     try {

  //       const response = await fetch(`${AUTH_CB_ENDPOINT}?code=${code}`);
  //       const data     = await response.json();    

  //       await firebase.auth().signInWithCustomToken(data.token);
  //       setToken(data.token);

  //       setLoading(false);

  //     } catch (error) {
  //       setLoading(false);
  //     }
  //   }
  //   getCode();
  // }, []);

  // return [token, loading];
}

const LoginCallback = () => {
  const code  = useQuery().get('code');
  // const {data, error, isPending} = useAsync({promiseFn:firebaseLogin, code: (query.get('code') ?? ""});
  const { data, error } = useAsync({ promiseFn: firebaseLogin, code })


  return (
    <Navbar.Collapse className="justify-content-end">
      <Navbar.Text>Loading user data...</Navbar.Text>
      <Spinner variant="light" animation="border" role="status" />
      { data && ( <Redirect to="/" /> )}
    </Navbar.Collapse>
  );

}

export {UserBox, login, logout, LoginCallback};