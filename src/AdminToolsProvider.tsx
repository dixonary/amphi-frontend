import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "./UserProvider";
import firebase from "firebase";

const AdminToolsProvider = ({children}:any) => {
  const currentUser = useContext(UserContext);
  const [ isAdmin, setIsAdmin ] = useState<any>(null);

  // We only get this once per login. Logging out and in again should repop.
  // Manually overriding isAdmin will show you the administrator tools, but
  // none of them will work.
  useEffect(() => {
    if(currentUser === undefined) return;
    if(currentUser === null)      return;
    const getUserData = async () => {
      const userDataRef = firebase.database().ref(`users/${currentUser.uid}`);
      const userData = (await userDataRef.once('value')).val();
      setIsAdmin(userData !== null && userData.isAdmin === true);
    };
    getUserData();
  }, [currentUser]);

  const dequeueVideo = async (vidId:string, uid:string) => {
    console.log(vidId, uid);
    await firebase.functions().httpsCallable('admin_dequeueVideo')({vidId, uid});
  };

  const playNextVideo  = async () => {
    await firebase.functions().httpsCallable('admin_playNextVideo')();
  };

  const admin = {isAdmin, dequeueVideo, playNextVideo};

  return (
    <AdminToolsContext.Provider value={isAdmin ? admin : notAdmin}>
      {children}
    </AdminToolsContext.Provider>
  );

};

export type AdminTools = {
  isAdmin:boolean,
  dequeueVideo:(vidId:string, userId:string) => any,
  playNextVideo:() => any
};

// The admin property is also checked serverside.
const notAdmin:AdminTools = {
  isAdmin:false,
  dequeueVideo:(v:string, u:string) => { alert("You are not an admin!"); },
  playNextVideo:() => { alert ("You are not an admin!"); }
}

const AdminToolsContext = React.createContext(notAdmin)

export default AdminToolsProvider;
export { AdminToolsContext };