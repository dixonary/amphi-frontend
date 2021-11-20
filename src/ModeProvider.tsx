import React, { useCallback, useMemo, useState } from "react";
import firebase from "firebase";
import { serialize } from "v8";

export type ModeData = {
  currentMode: Mode;
  switchMode: (m: Mode) => void;
};

export enum Mode {
  DEFAULT,
  PLAYLIST_ONLY,
  VIDEO_ONLY,
}

const ModeContext = React.createContext<ModeData>({
  currentMode: Mode.DEFAULT,
  switchMode: () => {},
});

const serializeMode = (m: Mode) => {
  switch (m) {
    case Mode.DEFAULT: return "default";
    case Mode.PLAYLIST_ONLY: return "playlist-only";
    case Mode.VIDEO_ONLY: return "video-only";
  }
}
const deserializeMode = (s: any) => {
  switch (s) {
    case "default": return Mode.DEFAULT;
    case "playlist-only": return Mode.PLAYLIST_ONLY;
    case "video-only": return Mode.VIDEO_ONLY;
    default: return Mode.DEFAULT;
  }
}

const ModeProvider = ({ children }: any) => {

  const initialMode = useMemo(() => {
    return deserializeMode(localStorage.getItem('view-mode'));
  }, []);
  const [currentMode, setCurrentMode] = useState<Mode>(initialMode);

  const setMode = useCallback((m) => {
    setCurrentMode(m);
    localStorage.setItem('view-mode', serializeMode(m));
  }, [setCurrentMode]);

  return (
    <ModeContext.Provider value={{ currentMode, switchMode: setMode }}>
      {children}
    </ModeContext.Provider>
  );
};

const modeClass = (m: Mode) => {
  switch (m) {
    case Mode.DEFAULT:
      return "view-default";
    case Mode.PLAYLIST_ONLY:
      return "view-playlist";
    case Mode.VIDEO_ONLY:
      return "view-video";
  }
};

export { ModeContext, ModeProvider, modeClass };
