import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "./UserProvider";
import firebase from "firebase";

const AdminToolsProvider = ({children}:any) => {
  const currentUser = useContext(UserContext);
  const [ isAdmin, setIsAdmin ] = useState<any>(null);
  const [ toolboxData, setToolboxData ] = useState<ToolboxData>(noToolboxData);

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
    // TODO add audit
    await firebase.functions().httpsCallable('admin_dequeueVideo')({vidId, uid});
  };

  const playNextVideo  = async () => {
    // TODO add audit
    await firebase.functions().httpsCallable('admin_playNextVideo')();
  };

  const closeToolbox = () => { setToolboxData(noToolboxData); }

  const openToolbox = (data:ToolboxData) => {
    if(toolboxData.video === null && toolboxData.user === null)
      setToolboxData(data);
  }

  const admin = {
    isAdmin, 
    dequeueVideo, 
    playNextVideo,
    closeToolbox,
    openToolbox,
    toolboxData
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
  isAdmin      : boolean,
  dequeueVideo : (vidId:string, userId:string) => any,
  playNextVideo: () => any,
  closeToolbox : () => any,
  openToolbox  : (data:ToolboxData) => any,
  toolboxData  : ToolboxData
};

// The admin property is also checked serverside.
// No non-admin will be able to invoke any tools provided here.
const notAdmin:AdminTools = {
  isAdmin      : false,
  dequeueVideo : () => { alert("You are not an admin!"); },
  playNextVideo: () => { alert("You are not an admin!"); },
  closeToolbox : () => { alert("You are not an admin!"); },
  openToolbox  : () => { alert("You are not an admin!"); },
  toolboxData  : noToolboxData
}

const AdminToolsContext = React.createContext(notAdmin)

export default AdminToolsProvider;
export { AdminToolsContext, noToolboxData };