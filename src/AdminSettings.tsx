import React, { useContext, useState, useEffect } from 'react';
import { Modal, ModalBody, ModalTitle, CloseButton, Button, Spinner, Form, InputGroup, Accordion, Card } from 'react-bootstrap';
import { AdminToolsContext } from './AdminToolsProvider';
import ModalHeader from 'react-bootstrap/ModalHeader';
import firebase from 'firebase';
import convertDuration from './ConvertDuration';
import { useObjectVal } from 'react-firebase-hooks/database';
import { Assignment } from '@material-ui/icons';


/** This modal dialog shows up when an administrator wishes to
 *  make major moves based on a 
 */

const AdminSettings = () => {

  const {
    showSettings,
    closeSettings,
    openToolbox
  } = useContext(AdminToolsContext);
 
  return (<Modal
    onShow={()=>{}}
    onHide={()=>{}}
    show={showSettings}
    className="admin-settings"
  >
    <ModalHeader>
      <ModalTitle>Control Panel</ModalTitle>
      <CloseButton onClick={closeSettings}/>
    </ModalHeader>
    <ModalBody>
      <Accordion defaultActiveKey="">
        <Card className="constants">
          <Card.Header>
            <Accordion.Toggle as={Button} variant="link" eventKey="0">
              Constants
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="0">
            <Card.Body>
              <ConstantsSettings />
            </Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card className="video-history">
          <Card.Header>
            <Accordion.Toggle as={Button} variant="link" eventKey="1">
              Video History
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="1">
            <Card.Body>
              <VideoHistory openToolbox={openToolbox} />
            </Card.Body>
          </Accordion.Collapse>
        </Card>


        <Card className="master-user-list">
          <Card.Header>
            <Accordion.Toggle as={Button} variant="link" eventKey="2">
              Master User List
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="2">
            <Card.Body>
              <UserList openToolbox={openToolbox} />
            </Card.Body>
          </Accordion.Collapse>
        </Card>

      </Accordion>
     
    </ModalBody>
  </Modal>);

}

/******************************************************************************/
/* Constants */

const ConstantsSettings = () => (<>
  <NumericControl
    valueRef={firebase.database().ref("settings/maxPlayTime")}
    label="Maximum play time in seconds (0 for no maximum)"
  />
  <NumericControl
    valueRef={firebase.database().ref("settings/minTimeDiff")}
    label="Minimum time diff between playing a video and allowing it to be queued again (0 for no maximum)"
  />
</>);

type NumericControlData = {
  valueRef : firebase.database.Reference,
  label    : string
}

const NumericControl = ({valueRef, label}:NumericControlData) => {
  const [ localValue, setLocalValue ] = useState<number | null>(null);

  useEffect(() => {
    valueRef.on('value', (snapshot) => {
      setLocalValue(snapshot.val());
    });

    return (() => valueRef.off('value'));
  }, [valueRef]);

  const setVal = async (val:string) => {
    let valInt = parseInt(val);
    if(!(Number.isInteger(valInt)) || valInt < 0) return;
    setLocalValue(valInt);
    await valueRef.set(valInt);
  } 

  return (
    <Form.Group>
      <Form.Label>{label}</Form.Label>
      <InputGroup>
        <Form.Control 
          as="input" 
          type="number"
          value={localValue?.toString() ?? ""}
          onChange={(e) => setVal(e.currentTarget.value)}
        />
        <InputGroup.Append>
          <InputGroup.Text>seconds</InputGroup.Text>
        </InputGroup.Append>
      </InputGroup>
    </Form.Group>
  );
}


/******************************************************************************/
/* Video History */

type VideoHistory = {
  playedAt: number,
  queuedBy: string,
  queuedByDisplayName:string,
}

const VideoHistory = ({openToolbox}:any) => {
  const historyRef = firebase.database()
    .ref('history')
    .orderByChild('queuedAt');
  const [ history ] = useObjectVal<any>(historyRef);

  if(history === undefined) {
    return (<Spinner animation="border" />);
  }
  if(history === null) {
    return (<p>There are no songs in the history.</p>)
  }
  return (<>
    {Object.entries(history).map(([key, value]:any) => (
      <HistoryItem data={{...value, video:key}} openToolbox={openToolbox}/>
    )).reverse()}
  </>);
}

const HistoryItem = ({data, openToolbox}:any) => {
  const [ videoData ] = useObjectVal<any>(firebase.database().ref(`videos/${data.video}`));
  const [ userData  ] = useObjectVal<any>(firebase.database().ref(`users/${data.queuedBy}`));

  return (
    <div className="history-item">
      <div className="details">
        {  videoData === undefined || videoData === null 
        || userData  === undefined || userData  === null
        ? (<Spinner animation="border" />)
        :
        (<>
          <p className="title">{videoData.title}</p>
          <div className="other-details">
            <p className="channel-title">
              {videoData.channelTitle} - {convertDuration(videoData.duration)}
            </p>
            <p className="displayName">Last queued by {data.queuedByDisplayName}</p>
          </div>
        </>)
      }
     </div>
      <Button 
          as="a" 
          className="tools admin" 
          variant="light" 
          onClick={() => openToolbox({video:data.video, user:data.queuedBy})}
      >
        <Assignment />
      </Button>
    </div>
  );
}



/******************************************************************************/
/* User List */

const UserList = ({openToolbox}:any) => {
  const [ allUserData ] = useObjectVal<any>(firebase.database().ref(`users`));

  return (
    <div className="user-list">
      { allUserData === null || allUserData === undefined 
      ? (<Spinner animation="border" />)
      : (<>
          {Object.entries(allUserData).map(([uid, udata] : any[]) => (
            <UserItem data={udata} openToolbox={openToolbox} />
          ))}
        </>)
      }
    </div>
  )
}

const UserItem = ({data, openToolbox}:any,) => {

  const renderStatus = (status:string | undefined) => {
    if(status === undefined) 
      return (<span className="green">OK</span>);
    if(status === "banned")
      return (<span className="red"> Banned indefinitely</span>);
    
    // Assume that the ban status is a timestamp
    return (<span className="amber">
      Banned until {new Date(status).toLocaleString()}
    </span>)
  }

  return (<div className="user-item">
    <p className="display-name">
      {data.displayName ?? "<No display name set>"}
      <span className="user-name">{data.uid}</span>
    </p>
    <p className="status">{renderStatus(data.status)}</p>
    <Button 
        as="a" 
        className="tools admin" 
        variant="light" 
        onClick={() => openToolbox({video:null, user:data.uid})}
    >
      <Assignment />
    </Button>
  </div>);
}

export default AdminSettings;