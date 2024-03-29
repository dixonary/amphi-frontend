import { useAuthState } from "react-firebase-hooks/auth";
import React from "react";
import firebase from "firebase";
import { useObjectVal } from "react-firebase-hooks/database";

export type UserState = {
  firebaseUser: firebase.User | null | undefined;
  userData: any;
  error: firebase.auth.Error | undefined;
};
const noUserState = {
  firebaseUser: undefined,
  userData: undefined,
  error: undefined,
};

const UserContext = React.createContext<UserState>(noUserState);

const UserProvider = ({ children }: any) => {
  const [user, , error] = useAuthState(firebase.auth());
  const [udata] = useObjectVal(firebase.database().ref(`users/${user?.uid}`));

  return (
    <UserContext.Provider
      value={{ error, firebaseUser: user, userData: udata }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
