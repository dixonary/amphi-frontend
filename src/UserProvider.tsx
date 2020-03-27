import { useAuthState } from "react-firebase-hooks/auth";
import React from "react";
import firebase from "firebase";


const UserContext = React.createContext<undefined | firebase.User>(undefined);

const FirebaseUserProvider = ({children}:any) => {
  const [user, loading, error] = useAuthState(firebase.auth());

  return (
    <UserContext.Provider
      value={user}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, FirebaseUserProvider }