import React, { useContext, useState } from "react";
import { ServerContext } from "./ServerProvider";

export type ToolboxData = { video: string | null; user: string | null };

type AdminTools = {
  isAdmin: boolean;
  dequeueVideo: (queueItemId: number, user: string) => Promise<void>;
  playNextVideo: () => Promise<void>;
  blacklistVideo: (videoId: string) => Promise<void>;
  unblacklistVideo: (videoId: string) => Promise<void>;
  suspendUser: (user: string, durationSeconds: number) => Promise<void>;
  unsuspendUser: (user: string) => Promise<void>;
  toolboxData: ToolboxData;
  openToolbox: (data: ToolboxData) => void;
  closeToolbox: () => void;
  showSettings: boolean;
  openSettings: () => void;
  closeSettings: () => void;
};

const emptyToolbox: ToolboxData = { video: null, user: null };

const unavailable: AdminTools = {
  isAdmin: false,
  dequeueVideo: async () => { },
  playNextVideo: async () => { },
  blacklistVideo: async () => { },
  unblacklistVideo: async () => { },
  suspendUser: async () => { },
  unsuspendUser: async () => { },
  toolboxData: emptyToolbox,
  openToolbox: () => { },
  closeToolbox: () => { },
  showSettings: false,
  openSettings: () => { },
  closeSettings: () => { },
};

const AdminToolsContext = React.createContext<AdminTools>(unavailable);

const AdminToolsProvider = ({ children }: React.PropsWithChildren) => {
  const { state, sendCommand } = useContext(ServerContext);
  const [toolboxData, setToolboxData] = useState<ToolboxData>(emptyToolbox);
  const [showSettings, setShowSettings] = useState(false);
  const isAdmin = state?.currentUser?.isAdmin === true;

  const runAdminCommand = async (type: string, payload: Record<string, unknown> = {}) => {
    if (isAdmin) {
      await sendCommand(type, payload);
    }
  };

  const value: AdminTools = {
    isAdmin,
    dequeueVideo: (queueItemId, user) => runAdminCommand("admin.queue.remove", { queueItemId, user }),
    playNextVideo: () => runAdminCommand("admin.play-next"),
    blacklistVideo: (videoId) => runAdminCommand("admin.video.blacklist", { videoId }),
    unblacklistVideo: (videoId) => runAdminCommand("admin.video.unblacklist", { videoId }),
    suspendUser: (user, durationSeconds) => runAdminCommand("admin.user.suspend", { user, until: new Date(Date.now() + durationSeconds * 1000).toISOString() }),
    unsuspendUser: (user) => runAdminCommand("admin.user.unsuspend", { user }),
    toolboxData,
    openToolbox: (data) => setToolboxData(data),
    closeToolbox: () => setToolboxData(emptyToolbox),
    showSettings,
    openSettings: () => setShowSettings(true),
    closeSettings: () => setShowSettings(false),
  };

  return <AdminToolsContext.Provider value={value}>{children}</AdminToolsContext.Provider>;
};

export default AdminToolsProvider;
export { AdminToolsContext, emptyToolbox };
