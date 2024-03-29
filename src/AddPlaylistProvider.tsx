import React, { useState } from "react";

const AddPlaylistContext = React.createContext<AddPlaylist>(
  { addPlaylist: null, setAddPlaylist: (a) => { } }
);

export type AddPlaylist = {
  addPlaylist: string | null;
  setAddPlaylist: (playlist: string | null) => void;
};

const AddPlaylistProvider = ({ children }: any) => {

  const [addPlaylist, setAddPlaylist] = useState<string | null>(null)

  return (
    <AddPlaylistContext.Provider value={{ addPlaylist, setAddPlaylist }}>
      {children}
    </AddPlaylistContext.Provider>
  );
};



export { AddPlaylistContext, AddPlaylistProvider };
