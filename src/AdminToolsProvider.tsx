import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "./UserProvider";
import firebase from "firebase";

const AdminToolsProvider = ({children}:any) => {
  const currentUser = useContext(UserContext);
  const [ isAdmin, setIsAdmin ] = useState<any>(null);
  const [ toolboxData, setToolboxData ] = useState<ToolboxData>(noToolboxData);
  const [ showSettings, setShowSettings ] = useState<boolean>(false);

  // We only get this once per login. Logging out and in again should repop.
  // Manually overriding isAdmin will show you the administrator tools, but
  // none of them will work.
  useEffect(() => {
    const fbuser = currentUser?.firebaseUser;
    if(fbuser === undefined) return;
    if(fbuser === null)      return;
    const getUserData = async () => {
      const userDataRef = firebase.database().ref(`users/${fbuser.uid}`);
      const userData = (await userDataRef.once('value')).val();
      setIsAdmin(userData !== null && userData.isAdmin === true);
    };
    getUserData();
  }, [currentUser]);

  const dequeueVideo = async (vidId:string, uid:string) => {
    // TODO add audit
    await firebase.functions().httpsCallable('admin_dequeueVideo')({vidId, uid});
  };

  const playNextVideo  = async () => {
    // TODO add audit
    await firebase.functions().httpsCallable('admin_playNextVideo')();
  };

  const blacklistVideo = async (vidId:string) => {
    await playNextVideo();
    await firebase.database().ref(`blacklist/${vidId}`).set(true);
  }
  const unblacklistVideo = async (vidId:string) => {
    await firebase.database().ref(`blacklist/${vidId}`).remove();
  }
  const clearUserQueue = async (userId:string) => {
    await firebase.database().ref(`queues/${userId}`).remove();
  }
  const suspendUser = async (userId:string, duration:number) => {
    const until = Date.now() + duration*1000;
    await firebase.database().ref(`users/${userId}/status`).set(until);
    await clearUserQueue(userId);
  }
  const banUser = async (userId:string) => {
    await firebase.database().ref(`users/${userId}/status`).set("banned");
    await clearUserQueue(userId);
  }
  const unbanUser = async (userId:string) => {
    await firebase.database().ref(`users/${userId}/status`).remove();
  }

  const closeToolbox = () => { setToolboxData(noToolboxData); }

  const openToolbox = (data:ToolboxData) => {
    if(toolboxData.video === null && toolboxData.user === null)
      setToolboxData(data);
  }

  const openSettings  = () => { setShowSettings(true);  }
  const closeSettings = () => { setShowSettings(false); }


  const admin = {
    isAdmin, 
    dequeueVideo, 
    playNextVideo,
    closeToolbox,
    openToolbox,
    toolboxData,
    blacklistVideo,
    unblacklistVideo,
    clearUserQueue,
    suspendUser,
    banUser,
    unbanUser,
    showSettings,
    openSettings,
    closeSettings
  };

  return (
    <AdminToolsContext.Provider value={isAdmin ? admin : notAdmin}>
      {children}
    </AdminToolsContext.Provider>
  );

};

/******************************************************************************/
/* Types */

// ToolboxData represents the video and current user which are currently
// open in the modal. If both are null, the modal is closed.
export type ToolboxData = {video:string|null, user:string|null};
const noToolboxData:ToolboxData = {video:null, user:null};



// AdminTools includes references to all the admin data parts of the
// frontend may need access to. Use sites may destructure only the 
// relevant values.
export type AdminTools = {
  isAdmin         : boolean,
  dequeueVideo    : (vidId:string, userId:string) => any,
  playNextVideo   : () => any,
  closeToolbox    : () => any,
  openToolbox     : (data:ToolboxData) => any,
  toolboxData     : ToolboxData,
  blacklistVideo  : (vidId:string) => any,
  unblacklistVideo: (vidId:string) => any,
  clearUserQueue  : (userId:string) => any,
  suspendUser     : (userId:string, duration:number) => any,
  banUser         : (userId:string) => any,
  unbanUser       : (userId:string) => any,
  showSettings    : boolean,
  openSettings    : () => any,
  closeSettings   : () => any
};

// The admin property is also checked serverside.
// No non-admin will be able to invoke any tools provided here.
const notAdmin:AdminTools = {
  isAdmin         : false,
  dequeueVideo    : () => { alert("You are not an admin!"); },
  playNextVideo   : () => { alert("You are not an admin!"); },
  closeToolbox    : () => { alert("You are not an admin!"); },
  openToolbox     : () => { alert("You are not an admin!"); },
  blacklistVideo  : () => { alert("You are not an admin!"); },
  unblacklistVideo: () => { alert("You are not an admin!"); },
  clearUserQueue  : () => { alert("You are not an admin!"); },
  suspendUser     : () => { alert("You are not an admin!"); },
  banUser         : () => { alert("You are not an admin!"); },
  unbanUser       : () => { alert("You are not an admin!"); },
  openSettings    : () => { alert("You are not an admin!"); },
  closeSettings   : () => { alert("You are not an admin!"); },
  showSettings    : false,
  toolboxData     : noToolboxData
}

const AdminToolsContext = React.createContext(notAdmin)

export default AdminToolsProvider;
export { AdminToolsContext, noToolboxData };