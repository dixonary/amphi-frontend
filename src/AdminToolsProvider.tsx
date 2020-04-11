import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "./UserProvider";
import firebase from "firebase";
import { NowPlayingContext } from "./NowPlayingProvider";

const AdminToolsProvider = ({children}:any) => {
  const currentUser = useContext(UserContext);
  const nowPlaying  = useContext(NowPlayingContext);
  const [ isAdmin, setIsAdmin ] = useState<any>(null);
  const [ toolboxData, setToolboxData ] = useState<ToolboxData>(noToolboxData);
  const [ showSettings, setShowSettings ] = useState<boolean>(false);

  const audit = async (data:any) => {
    const now = Date.now(); // millisecond precision, should be OK!
    await firebase.database().ref(`audit/${now}`).set({
      ...data,
      actor: currentUser.userData?.displayName 
            ?? currentUser.firebaseUser?.uid 
            ?? '<unknown>'
    });
  }

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

  const dequeueVideo = async (vidId:string, userId:string) => {
    await firebase.functions().httpsCallable('admin_dequeueVideo')({vidId, uid:userId});
    await audit({type:"dequeue", vidId, userId});
  };

  const playNextVideo  = async (vidId:string, doAudit = true) => {
    if(vidId !== nowPlaying?.video) return;
    await firebase.functions().httpsCallable('admin_playNextVideo')();
    // We have a guard as this is called by other admin tools
    // and we want to prevent double logging
    if(doAudit) await audit({type:"skip", vidId});
  };

  const blacklistVideo = async (vidId:string) => {
    if(nowPlaying?.video === vidId) await playNextVideo(vidId, false);
    await firebase.database().ref(`blacklist/${vidId}`).set(true);
    await audit({type:"blacklist", vidId});
  }
  const unblacklistVideo = async (vidId:string) => {
    await firebase.database().ref(`blacklist/${vidId}`).remove();
    await audit({type:"unblacklist", vidId});
  }
  const clearUserQueue = async (userId:string, doAudit = true) => {
    await firebase.database().ref(`queues/${userId}`).remove();
    // We have a guard as this is called by other admin tools
    // and we want to prevent double logging
    if(doAudit) await audit({type:"clear", userId});
  }
  const suspendUser = async (userId:string, duration:number) => {
    const until = Date.now() + duration*1000;
    await firebase.database().ref(`users/${userId}/status`).set(until);
    await audit({type:"suspend", until:new Date(until).toLocaleString, userId});
    await clearUserQueue(userId, false);
  }
  const banUser = async (userId:string) => {
    await firebase.database().ref(`users/${userId}/status`).set("banned");
    await audit({type:"ban", userId});
    await clearUserQueue(userId, false);
  }
  const unbanUser = async (userId:string) => {
    await firebase.database().ref(`users/${userId}/status`).remove();
    await audit({type:"unban", userId});
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
    closeSettings,
    audit
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
  playNextVideo   : (vidId:string, doAudit?:boolean) => any,
  closeToolbox    : () => any,
  openToolbox     : (data:ToolboxData) => any,
  toolboxData     : ToolboxData,
  blacklistVideo  : (vidId:string) => any,
  unblacklistVideo: (vidId:string) => any,
  clearUserQueue  : (userId:string, doAudit?:boolean) => any,
  suspendUser     : (userId:string, duration:number) => any,
  banUser         : (userId:string) => any,
  unbanUser       : (userId:string) => any,
  showSettings    : boolean,
  openSettings    : () => any,
  closeSettings   : () => any,
  audit           : (data:any) => any,
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
  audit           : () => { alert("You are not an admin!"); },
  showSettings    : false,
  toolboxData     : noToolboxData
}

const AdminToolsContext = React.createContext(notAdmin)

export default AdminToolsProvider;
export { AdminToolsContext, noToolboxData };