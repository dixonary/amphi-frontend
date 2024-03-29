import { Container, Row, Col } from "react-bootstrap";
import React, { useContext } from "react";

import Sidebar from "./Sidebar";
import AdminSettings from "./AdminSettings";
import { ModeContext, modeClass, Mode } from "./ModeProvider";
import Player from "./Player";
import { AddPlaylistModal } from "./AddPlaylistModal";

const Main = () => {
  const { currentMode } = useContext(ModeContext);

  return (
    <Container
      fluid={true}
      as="main"
      className={`flex-column text-light ${modeClass(currentMode)}`}
    >
      <AdminSettings />
      <AddPlaylistModal />
      <Row className="main-row">
        {currentMode !== Mode.PLAYLIST_ONLY && (
          <Col lg={9}>
            <Player />
          </Col>
        )}
        {currentMode !== Mode.VIDEO_ONLY && (
          <Col lg={3} className="sidebar" as="aside">
            <Sidebar />
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Main;
