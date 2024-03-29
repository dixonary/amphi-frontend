import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import convertDuration from "./ConvertDuration";
import { useListVals, useObjectVal } from "react-firebase-hooks/database";
import { Spinner, Modal, ModalTitle, CloseButton, ModalBody } from "react-bootstrap";
import ModalHeader from "react-bootstrap/esm/ModalHeader";
import { Close } from '@mui/icons-material';
// import { useAuth } from "./User";



const RecentlyPlayedModal = ({ visible, closeRecentlyPlayed }: any) => {

  const historyRef = firebase
    .database()
    .ref("history")
    .orderByChild("playedAt")
    .limitToLast(15);
  const [history] = useListVals<any>(historyRef, { keyField: "video" });

  var res;
  if (history === null || history === undefined) {
    res = <Spinner animation="border" />;
  }
  else if (history.length === 0) {
    res = <p>There are no songs in the history.</p>;
  }
  else {
    res = history.map((v) => (
      <PublicHistoryItem key={v.video} data={v} />
    )).reverse();
  }

  return (
    <Modal
      show={visible}
      className="recently-played-modal"
    >
      <ModalHeader>
        <ModalTitle>Recently Played Songs</ModalTitle>
        <CloseButton onClick={closeRecentlyPlayed}>
          <Close />
        </CloseButton>
      </ModalHeader>
      <ModalBody>
        {res}
      </ModalBody>
    </Modal>
  );
}


const PublicHistoryItem = ({ data, openToolbox }: any) => {
  const [videoData] = useObjectVal<any>(
    firebase.database().ref(`videos/${data.video}`)
  );

  return (
    <div className="history-item">
      <div className="details">
        {videoData === undefined ||
          videoData === null
          ? (
            <Spinner animation="border" />
          ) : (
            <>
              <p className="title">{videoData.title}</p>
              <div className="other-details">
                <p className="channel-title">
                  {videoData.channelTitle} - {convertDuration(videoData.duration)}
                </p>
                <a href={`https://youtube.com/watch?v=${data.video}`} target="_blank" rel="noreferrer">
                  {data.video}
                </a>
              </div>
            </>
          )}
      </div>
    </div>
  );
};

export { RecentlyPlayedModal, PublicHistoryItem };