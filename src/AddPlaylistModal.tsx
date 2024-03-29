import React, { useContext } from 'react';
import { CloseButton, Modal, Spinner } from 'react-bootstrap';
import { AddPlaylistContext } from './AddPlaylistProvider';
import { useAsync } from 'react-async';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

export const AddPlaylistModal = () => {

  const { addPlaylist, setAddPlaylist } = useContext(AddPlaylistContext);

  return (
    <Modal
      onShow={() => { }}
      onHide={() => { }}
      show={addPlaylist !== null}
    >
      <Modal.Header>
        <Modal.Title>{addPlaylist}</Modal.Title>
        <CloseButton onClick={() => setAddPlaylist(null)} />
      </Modal.Header>
      <Modal.Body>
        {addPlaylist && (
          <PlaylistVideos playlistId={addPlaylist} />
        )}
      </Modal.Body>
    </Modal>
  )
};


export const PlaylistVideos = ({ playlistId }: { playlistId: string }) => {

  // const { data } = useMemo(() => ({ data: { videos: [] } }), []);

  const { data } = useAsync(async () => {
    // Get all items from the playlist
    const playlistRef = firebase.database().ref(`playlists/${playlistId}/videoIds`);

    const playlist = (await playlistRef.once("value")).val();

    // Get all the video data
    const videoData = await Promise.all(Object.keys(playlist).map(async (vidId) => {
      const vidData = await firebase.database().ref(`videos/${vidId}`).once("value");
      return vidData.val();
    }));

    return { videos: videoData };
  });

  return (
    <>
      <h3>Playlist</h3>
      <ul>
        {data?.videos === undefined
          ? <Spinner animation="border" />
          : data.videos.map((vid: any) => (
            <li key={vid.id}>
              <p>{vid.title}</p>
            </li>
          ))}
      </ul>
    </>
  );
};