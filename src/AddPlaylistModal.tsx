import React, { useCallback, useContext, useState } from 'react';
import { InputGroup, Modal, Spinner } from 'react-bootstrap';
import CheckBox from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import { AddPlaylistContext } from './AddPlaylistProvider';
import convertDuration from './ConvertDuration';
import { QueueContext } from './QueueProvider';
import { ServerContext } from './ServerProvider';

export const AddPlaylistModal = () => {

  const { addPlaylist, setAddPlaylist } = useContext(AddPlaylistContext);

  const close = useCallback(() => setAddPlaylist(null), [setAddPlaylist]);

  return (
    <Modal
      onShow={() => { }}
      onHide={close}
      show={addPlaylist !== null}
      centered
      dialogClassName="narrow-dialog"
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>Add Songs From Playlist</Modal.Title>
      </Modal.Header>
      <Modal.Body className="playlist-modal-body">
        <RenderPlaylist playlistId={addPlaylist!} close={close} />
      </Modal.Body>
    </Modal>
  )
};

export const RenderPlaylist = ({ playlistId, close }: { playlistId: string, close: () => void }) => {
  const { state } = useContext(ServerContext);
  const playlistData = state?.playlists[playlistId]?.videoIds;

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

    if (userQueue.queue === undefined) return;

    // // Silently die if we already have the video
    // if (queue !== null && queue.findIndex((x) => x.video === videoId) !== -1) {
    //   // window.alert("You cannot queue the same song more than once at a time.");
    //   // return;
    // }

    await userQueue.enqueueAll(selected.filter(v => v.enabled).map(v => v.v));
    close();
  }, [userQueue, selected, close]);

  return (
    <div className="playlist-selection">
      <div className="playlist-selection-list">
        <ul>
        {playlistData === undefined || playlistData === null
          ? <Spinner animation="border" />
          : selected.map((v: { v: string, enabled: boolean }) => (
            <PlaylistItem key={v.v} vid={v.v} selected={v.enabled} setSel={setSel} />
          ))
        }
        </ul>
      </div>
      <button type="button" className="btn btn-info playlist-selection-submit" onClick={enqueueAll}>
        Add all selected songs to queue
      </button>
    </div>
  );

};


const PlaylistItem = ({ vid, selected, setSel }: { vid: string, selected: boolean, setSel: (v: string, c: boolean) => void }) => {

  const { state } = useContext(ServerContext);
  const videoData = state?.videos[vid];

  return (
    <div className="history-item">
      <InputGroup style={{ alignItems: "center" }} onClick={() => setSel(vid, !selected)} >
        {videoData === undefined || videoData === null ? (
          <Spinner animation="border" />
        ) : (
          <>
            <img src={videoData.thumbnailUrl} alt={videoData.title} style={{ objectFit: "cover", overflow: "hidden", aspectRatio: "16/9", marginRight: "1em" }} />
            <div className="details">

              <p className="title">{videoData.title}</p>
              <div className="other-details">
                <p className="channel-title">
                  {videoData.channelTitle} - {convertDuration(videoData.durationSeconds)}
                </p>
              </div>

            </div>
          </>)}
        <button className="playlist-selection-toggle ms-auto" type="button" onClick={(event) => { event.stopPropagation(); setSel(vid, !selected); }} aria-label={`${selected ? "Deselect" : "Select"} ${videoData?.title ?? vid}`} aria-pressed={selected}>
          {selected ? <CheckBox /> : <CheckBoxOutlineBlank />}
        </button>
      </InputGroup>
    </div >
  );
};