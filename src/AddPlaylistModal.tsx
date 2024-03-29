import React, { useCallback, useContext, useRef, useState } from 'react';
import { Button, CloseButton, InputGroup, Modal, Spinner } from 'react-bootstrap';
import { AddPlaylistContext } from './AddPlaylistProvider';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { Close } from '@mui/icons-material';
import { useObjectVal } from 'react-firebase-hooks/database';
import convertDuration from './ConvertDuration';
import { Checkbox } from '@mui/material';
import { QueueContext } from './QueueProvider';

export const AddPlaylistModal = () => {

  const { addPlaylist, setAddPlaylist } = useContext(AddPlaylistContext);

  const close = useCallback(() => setAddPlaylist(null), [setAddPlaylist]);

  return (
    <Modal
      onShow={() => { }}
      onHide={() => { }}
      show={addPlaylist !== null}
      centered
      dialogClassName="narrow-dialog"
      scrollable
    >
      <Modal.Header>
        <Modal.Title>Add Songs From Playlist</Modal.Title>
        <CloseButton onClick={() => setAddPlaylist(null)}>
          <Close />
        </CloseButton>
      </Modal.Header>
      <Modal.Body style={{ overflow: "hidden", padding: "0" }} >
        <RenderPlaylist playlistId={addPlaylist!} close={close} />
      </Modal.Body>
    </Modal>
  )
};

export const RenderPlaylist = ({ playlistId, close }: { playlistId: string, close: () => void }) => {
  const [playlistData] = useObjectVal<string[]>(firebase.database().ref(`playlists/${playlistId}/videoIds`));

  return playlistData
    ? <PlaylistSelection playlistData={playlistData} close={close} />
    : <Spinner animation="border" />

    ;

}


export const PlaylistSelection = ({ playlistData, close }: { playlistData: string[], close: () => void }) => {

  const userQueue = useContext(QueueContext);

  const [selected, setSelected] = useState<{ v: string, enabled: boolean }[]>(playlistData.map(v => ({ v, enabled: true })));


  const setSel = useCallback((vid: string, checked: boolean) => {
    setSelected(selected.map(v => v.v === vid ? { ...v, enabled: checked } : v));
  }, [selected, setSelected]);

  const enqueueAll = useCallback(async () => {
    console.dir(userQueue);
    if (!selected) return;

    const queue = userQueue.queue?.val() as any[] | undefined | null;
    if (queue === undefined) return;

    // // Silently die if we already have the video
    // if (queue !== null && queue.findIndex((x) => x.video === videoId) !== -1) {
    //   // window.alert("You cannot queue the same song more than once at a time.");
    //   // return;
    // }

    await userQueue.enqueueAll(selected.filter(v => v.enabled).map(v => v.v));
    close();
  }, [userQueue, selected, close]);

  return (
    <>
      <div style={{ overflowY: "auto", height: "100%", padding: "1em", paddingBottom: "3.5em" }}> <ul style={{ paddingLeft: 0 }}>
        {playlistData === undefined || playlistData === null
          ? <Spinner animation="border" />
          : selected.map((v: { v: string, enabled: boolean }) => (
            <PlaylistItem key={v.v} vid={v.v} selected={v.enabled} setSel={setSel} />
          ))
        }
      </ul>
      </div>
      <Button as="a" variant="info" style={{ position: "absolute", bottom: "1em", left: "50%", transform: "translateX(-50%)" }} onClick={enqueueAll}>
        Add all selected songs to queue
      </Button>
    </>
  );

};


const PlaylistItem = ({ vid, selected, setSel }: { vid: string, selected: boolean, setSel: (v: string, c: boolean) => void }) => {

  const checkboxRef = useRef<HTMLButtonElement>(null);

  const [videoData] = useObjectVal<any>(
    firebase.database().ref(`videos/${vid}`)
  );

  return (
    <div className="history-item">
      <InputGroup style={{ alignItems: "center" }} onClick={() => checkboxRef.current?.click()} >
        {videoData === undefined || videoData === null ? (
          <Spinner animation="border" />
        ) : (
          <>
            <img src={videoData.thumbnail} alt={videoData.title} style={{ objectFit: "cover", overflow: "hidden", aspectRatio: "16/9", marginRight: "1em" }} />
            <div className="details">

              <p className="title">{videoData.title}</p>
              <div className="other-details">
                <p className="channel-title">
                  {videoData.channelTitle} - {convertDuration(videoData.duration)}
                </p>
              </div>

            </div>
          </>)}
        <Checkbox ref={checkboxRef} checked={selected} onClick={(e) => setSel(vid, !selected)} />
      </InputGroup>
      {/* Todo: Checkboxes for each video */}
    </div >
  );
};