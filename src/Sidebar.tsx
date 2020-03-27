import React, { useState } from "react";
import { Accordion, Card } from "react-bootstrap";
import NewVideo from "./NewVideo";
import MyQueue from "./MyQueue";
import Playlist from "./Playlist";
import QueueProvider from "./QueueProvider";


const Sidebar = () => {
  const [activeKey, setActiveKey] = useState("my-queue");

  const active = (key:string) => {
    if(activeKey == key) {
      setActiveKey("");
    }
    else {
      setActiveKey(key);
    }
  }

  return (
    <QueueProvider>
      <Card bg="dark" className="playlist">
        <Card.Header>
          <a>Playlist</a>
        </Card.Header>
        <Card.Body>
          <Playlist />
        </Card.Body>
      </Card>
      <Accordion activeKey={activeKey.toString()}>
        <Card bg="dark" className="my-queue">
          <Card.Header>
            <Accordion.Toggle 
                as="a" 
                variant="link" 
                eventKey="my-queue"
                onClick={() => active("my-queue")}
            >
              My Queue
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="my-queue">
            <Card.Body className="">
              <MyQueue />
            </Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card bg="dark" className="new-video">
          <Card.Header>
            <Accordion.Toggle 
                as="a" 
                variant="link" 
                eventKey="new-video"
                onClick={() => active("new-video")}
            >
              Add a Song
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="new-video">
            <Card.Body className="">
              <NewVideo setAccordion={setActiveKey} />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </QueueProvider>
  );
}

export default Sidebar;