import { Container, Row, Col, Accordion, Card } from "react-bootstrap";
import React from "react";

import YouTube, { YouTubeProps } from 'react-youtube';

const Main = () => {

  return (
  <Container fluid={true} as="main" className="flex-column text-light">
    <Row className="flex-grow-1">
      <Col sm={9} xs={12}>
        <YouTube
          videoId="_qTESaoSU_8" 
          className="video"
          containerClassName="video-wrapper"
          opts={{
            height: '100%',
            width: '100%',
            playerVars: { // https://developers.google.com/youtube/player_parameters
              autoplay: 1
            }
          }}    
          onEnd={()=>{}}
        />
      </Col>
      <Col sm={3} xs={12} className="sidebar" as="aside">
        <div className="playlist">
        <h6>
          Current Playlist
        </h6>
        </div>
        <Card bg="dark">
        </Card>
        <Accordion>
          <Card bg="dark">
            <Card.Header>
              <Accordion.Toggle as="a" variant="link" eventKey="1">
                My Queue
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="1">
              <Card.Body>
                Not yet implemented
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </Col>
    </Row>
  </Container>
  )
};

export default Main;