import React, { useContext, useState, useEffect } from 'react';
import { Modal, ModalBody, ModalTitle, CloseButton, Button, Spinner, Form, InputGroup, Accordion, Card } from 'react-bootstrap';
import { AdminToolsContext } from './AdminToolsProvider';
import ModalHeader from 'react-bootstrap/ModalHeader';
import firebase from 'firebase';
import convertDuration from './ConvertDuration';
import { useObjectVal } from 'react-firebase-hooks/database';
import { Assignment, SkipNext, RemoveFromQueue, VisibilityOff, Visibility, ClearAll, RemoveCircle, RemoveCircleOutline, HourglassEmpty, Settings } from '@material-ui/icons';


/** This modal dialog shows up when an administrator wishes to
 *  make major moves based on a 
 */

const AdminSettings = () => {

  const {
    showSettings,
    closeSettings,
    openToolbox,
    audit
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
              <ConstantsSettings audit={audit} />
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

        <Card className="audit-log">
          <Card.Header>
            <Accordion.Toggle as={Button} variant="link" eventKey="3">
              Audit Log
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="3">
            <Card.Body>
              <AuditLog openToolbox={openToolbox} />
            </Card.Body>
          </Accordion.Collapse>
        </Card>

      </Accordion>
     
    </ModalBody>
  </Modal>);

}

/******************************************************************************/
/* Constants */

const ConstantsSettings = ({audit}:any) => (<>
  <NumericControl
    valueRef={firebase.database().ref("settings/maxPlayTime")}
    label="Maximum play time in seconds (0 to disable)"
    shortLabel="max play time"
    audit={audit}
  />
  <NumericControl
    valueRef={firebase.database().ref("settings/minTimeDiff")}
    label="Minimum time diff between playing a video and allowing it to be queued again (0 to disable)"
    shortLabel="min replay time"
    audit={audit}
  />
</>);

type NumericControlData = {
  valueRef  : firebase.database.Reference,
  label     : string,
  shortLabel: string,
  audit     : (data:any) => any
}

const NumericControl = (data:NumericControlData) => {
  const [ localValue, setLocalValue ] = useState<number | null>(null);
  const [ sendTimer , setSendTimer  ] = useState<any>(null);

  useEffect(() => {
    data.valueRef.on('value', (snapshot) => {
      setLocalValue(snapshot.val());
    });

    return (() => data.valueRef.off('value'));
  }, [data.valueRef]);

  const setVal = async (val:string) => {
    let valInt = parseInt(val);
    if(Number.isNaN(valInt)) valInt = 0;
    if(!(Number.isInteger(valInt)) || valInt < 0) return;
    setLocalValue(valInt);

    if(sendTimer !== null) clearTimeout(sendTimer);
    
    const send = async () => {
      await data.valueRef.set(valInt);
      data.audit({type:"setting", setting:data.shortLabel, value:valInt});
    }
    setSendTimer(setTimeout(send, 1000));
    console.log(sendTimer);
  } 

  return (
    <Form.Group>
      <Form.Label>{data.label}</Form.Label>
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
    .ref('history');
  const [ history ] = useObjectVal<any>(historyRef);

  if(history === undefined) {
    return (<Spinner animation="border" />);
  }
  if(history === null) {
    return (<p>There are no songs in the history.</p>)
  }
  return (<>
    {Object.entries(history)
      .sort(([akey,a]:any, [bkey, b]:any) => b.playedAt - a.playedAt)
      .map(([key, value]:any) => (
      <HistoryItem key={key} data={{...value, video:key}} openToolbox={openToolbox}/>
    ))}
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
            <UserItem key={uid} data={udata} openToolbox={openToolbox} />
          ))}
        </>)
      }
    </div>
  )
}

const UserItem = ({data, openToolbox}:any) => {

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


const AuditLog = ({openToolbox}:any) => {

  const auditRef = firebase.database().ref(`audit`).orderByKey();
  const [ allAudits ] = useObjectVal<any>(auditRef);

  return (
    <div className="audit-list">
      { allAudits === null || allAudits === undefined 
      ? (<Spinner animation="border" />)
      : (<>
          {Object.entries(allAudits)
           .reverse()
           .map(([key, auditData] : any[]) => (
            <AuditItem key={key} data={auditData} openToolbox={openToolbox} />
          ))}
        </>)
      }
    </div>
  )

}

const AuditItem = ({data, openToolbox}:any) => {
  const open = () => {
    openToolbox({
      video: data.vidId ?? null,
      user : data.userId ?? null
    });
  };

  return (<div className="audit-item" onClick={open}>
    <div className="icon">
    { data.type === 'dequeue'     && (<RemoveFromQueue />    ) }
    { data.type === 'skip'        && (<SkipNext />           ) }
    { data.type === 'blacklist'   && (<VisibilityOff />      ) }
    { data.type === 'unblacklist' && (<Visibility />         ) }
    { data.type === 'clear'       && (<ClearAll />           ) }
    { data.type === 'suspend'     && (<HourglassEmpty />     ) }
    { data.type === 'ban'         && (<RemoveCircle />       ) }
    { data.type === 'unban'       && (<RemoveCircleOutline />) }
    { data.type === 'setting'     && (<Settings />           ) }
    </div>
    <span className="actor">{data.actor}</span>
    {' '}
    { data.type === 'dequeue' && (<>
      <span className="action">removed</span>
      {' '}
      <span className="video-id">{data.vidId}</span>
      <span className="action">, queued by</span>
      {' '}
      <span className="user-id">{data.userId}</span>
    </>)} 

    { data.type === 'skip' && (<>
      <span className="action">skipped</span>
      {' '}
      <span className="video-id">{data.vidId}</span>
    </>)} 

    { data.type === 'blacklist' && (<>
      <span className="action">blacklisted</span>
      {' '}
      <span className="video-id">{data.vidId}</span>
    </>)} 

    { data.type === 'unblacklist' && (<>
      <span className="action">unblacklisted</span>
      {' '}
      <span className="video-id">{data.vidId}</span>
    </>)} 

    { data.type === 'clear' && (<>
      <span className="action">cleared</span>
      {' '}
      <span className="video-id">{data.userId}</span>
      <span className="action">'s queue</span>
    </>)} 

    { data.type === 'suspend' && (<>
      <span className="action">suspended</span>
      {' '}
      <span className="video-id">{data.userId}</span>
      <span className="action">until</span>
      <span className="until">{data.until}</span>
    </>)} 

    { data.type === 'ban' && (<>
      <span className="action">banned</span>
      {' '}
      <span className="video-id">{data.userId}</span>
    </>)} 

    { data.type === 'unban' && (<>
      <span className="action">unbanned</span>
      {' '}
      <span className="video-id">{data.userId}</span>
    </>)} 

    { data.type === 'setting' && (<>
      <span className="action">set</span>
      {' '}
      <span className="setting">{data.setting}</span>
      {' '}
      <span className="action">to</span>
      {' '}
      <span className="value">{data.value}</span>
    </>)} 
    .
  </div>);
}

export default AdminSettings;