import React, { useContext } from "react";
import { ServerContext } from "./ServerProvider";

export type ClientUser = {
  id: string;
  displayName: string;
};

export type UserState = {
  currentUser: ClientUser | null | undefined;
  userData: {
    id: string;
    displayName: string;
    isAdmin: boolean;
    status: string | undefined;
  } | undefined;
  error: undefined;
};
const noUserState = {
  currentUser: undefined,
  userData: undefined,
  error: undefined,
};

const UserContext = React.createContext<UserState>(noUserState);

const UserProvider = ({ children }: any) => {
  const { state } = useContext(ServerContext);
  const sessionUser = state?.currentUser;
  const user = sessionUser
    ? { id: sessionUser.user, displayName: sessionUser.displayName }
    : state
      ? null
      : undefined;
  const userData = sessionUser
    ? {
      id: sessionUser.user,
      displayName: sessionUser.displayName,
      isAdmin: sessionUser.isAdmin,
      status: state?.users[sessionUser.user]?.suspendedUntil ?? undefined,
    }
    : undefined;

  return (
    <UserContext.Provider
      value={{ error: undefined, currentUser: user, userData }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
