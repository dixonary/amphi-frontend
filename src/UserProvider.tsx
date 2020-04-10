import { useAuthState } from "react-firebase-hooks/auth";
import React from "react";
import firebase from "firebase";
import { useObjectVal } from "react-firebase-hooks/database";


type UserState = { 
  firebaseUser: firebase.User | undefined,
  userData    : any 
};
const noUserState = { 
  firebaseUser: undefined, 
  userData    : undefined
}

const UserContext = React.createContext<UserState>(noUserState);

const UserProvider = ({children}:any) => {
  const [ user ]  = useAuthState(firebase.auth());
  const [ udata ] = useObjectVal(firebase.database().ref(`users/${user?.uid}`));

  return (
    <UserContext.Provider
      value={{firebaseUser:user, userData:udata }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider }