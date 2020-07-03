import React, { useContext, useRef } from "react";
import { useAsync } from "react-async";
import {
  Spinner,
  Button,
  Navbar,
  NavItem,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";

import firebase from "firebase";

import { Redirect, useLocation } from "react-router-dom";

import { AdminToolsContext } from "./AdminToolsProvider";
import UWCSLogo from "./uwcsLogo";

const AUTH_ENDPOINT =
  "https://us-central1-amphi-compsoc.cloudfunctions.net/uwcsAuth";
const AUTH_CB_ENDPOINT =
  "https://us-central1-amphi-compsoc.cloudfunctions.net/uwcsAuthCallback";

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

  const onChange = (user: firebase.User | null) => {
    setState([user, false]);
  };

  React.useEffect(() => {
    // listen for auth state changes
    const unsubscribe = firebase.auth().onAuthStateChanged(onChange);
    // unsubscribe to the listener when unmounting
    return () => unsubscribe();
  }, []);

  return state;
};

const login = () => {
  const endpoint = AUTH_ENDPOINT + `?host=${escape(window.location.origin)}`;
  window.location.href = endpoint;
};
const logout = () => {
  firebase.auth().signOut();
};

const UserBox = () => {
  const [user, initializing] = useAuth();
  const { isAdmin } = useContext(AdminToolsContext);

  return (
    <Navbar.Collapse className="justify-content-end">
      {user ? (
        <>
          <Navbar.Text>
            Logged in as {(user as firebase.User).displayName}
            {isAdmin ? " (Admin)" : ""}
          </Navbar.Text>
          <NavItem>
            <Button as="a" onClick={logout} className="uwcs-signin">
              Log out
            </Button>
          </NavItem>
        </>
      ) : initializing ? (
        <Spinner variant="light" animation="border" role="status" />
      ) : (
        <Button as="a" className="uwcs-signin" onClick={login}>
          <span>Log in with UWCS</span>
          <UWCSLogo />
        </Button>
      )}
    </Navbar.Collapse>
  );
};

const AdminButton = ({ tooltipText, callback, icon }: any) => {
  const targetRef = useRef(null);

  const tooltip = (props: any) => (
    <Tooltip id={`button-tooltip-${tooltipText}`} {...props}>
      {tooltipText}
    </Tooltip>
  );

  return (
    <OverlayTrigger placement="bottom" overlay={tooltip}>
      <Button as="a" ref={targetRef} onClick={callback}>
        {icon}
      </Button>
    </OverlayTrigger>
  );
};

const firebaseLogin = async ({ code }: any) => {
  const host = escape(window.location.origin);
  const response = await fetch(`${AUTH_CB_ENDPOINT}?host=${host}&code=${code}`);
  if (!response.ok) throw new Error(response.status.toString());
  const data = await response.json();

  await firebase.auth().signInWithCustomToken(data.token);

  return code;
};

const LoginCallback = () => {
  const code = useQuery().get("code");
  // const {data, error, isPending} = useAsync({promiseFn:firebaseLogin, code: (query.get('code') ?? ""});
  const { data } = useAsync({ promiseFn: firebaseLogin, code });

  return (
    <Navbar.Collapse className="justify-content-end">
      <Navbar.Text>Loading user data...</Navbar.Text>
      <Spinner variant="light" animation="border" role="status" />
      {data && <Redirect to="/" />}
    </Navbar.Collapse>
  );
};

export { UserBox, login, logout, LoginCallback, AdminButton };
