import React, { useState } from "react";
import firebase from "firebase";

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

const ModeProvider = ({ children }: any) => {
  const [currentMode, setCurrentMode] = useState<Mode>(Mode.DEFAULT);

  return (
    <ModeContext.Provider value={{ currentMode, switchMode: setCurrentMode }}>
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
