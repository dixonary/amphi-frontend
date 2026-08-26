import React, { useContext, useEffect, useState } from "react";
import Settings from "@mui/icons-material/Settings";
import { Form, Modal, Spinner } from "react-bootstrap";
import { AdminToolsContext } from "./AdminToolsProvider";
import { ServerContext } from "./ServerProvider";

const AdminSettings = () => {
  const { showSettings, closeSettings, openToolbox } = useContext(AdminToolsContext);
  const { state, sendCommand } = useContext(ServerContext);
  const [maxPlayTime, setMaxPlayTime] = useState(0);
  const [minTimeDiff, setMinTimeDiff] = useState(0);
  const [skipMinPct, setSkipMinPct] = useState(0);
  const [skipMinViewers, setSkipMinViewers] = useState(0);

  useEffect(() => {
    if (state) {
      setMaxPlayTime(state.settings.maxPlayTime);
      setMinTimeDiff(state.settings.minTimeDiff);
      setSkipMinPct(state.settings.skipMinPct);
      setSkipMinViewers(state.settings.skipMinViewers);
    }
  }, [state]);

  const saveSettings = async () => {
    await sendCommand("admin.settings.update", { maxPlayTime, minTimeDiff, skipMinPct, skipMinViewers });
  };

  return (
    <Modal show={showSettings} onHide={closeSettings} centered scrollable size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Control Panel</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {!state ? <Spinner animation="border" /> : (
          <>
            <Form onSubmit={(event) => { event.preventDefault(); void saveSettings(); }}>
              <h5 className="d-flex align-items-center gap-2 mb-3"><Settings fontSize="small" /> Playback settings</h5>
              <NumericSetting label="Maximum play time (seconds)" value={maxPlayTime} setValue={setMaxPlayTime} />
              <NumericSetting label="Minimum replay time (seconds)" value={minTimeDiff} setValue={setMinTimeDiff} />
              <NumericSetting label="Skip threshold (%)" value={skipMinPct} setValue={setSkipMinPct} />
              <NumericSetting label="Minimum skip voters" value={skipMinViewers} setValue={setSkipMinViewers} />
              <button type="submit" className="btn admin-action admin-action-yellow">Save settings</button>
            </Form>
            <section className="border-top mt-4 pt-4">
              <h6>Recently played</h6>
              <div className="list-group list-group-flush">
                {state.history.slice(0, 15).map((entry) => <button type="button" className="list-group-item list-group-item-action d-flex align-items-center justify-content-between gap-3 px-0" key={`${entry.videoId}-${entry.playedAt}`} onClick={() => openToolbox({ video: entry.videoId, user: entry.queuerId })}><span className="text-truncate">{state.videos[entry.videoId]?.title ?? entry.videoId}</span><span className="text-body-secondary flex-shrink-0">{state.users[entry.queuerId]?.displayName ?? entry.queuerId}</span></button>)}
              </div>
            </section>
            <section className="border-top mt-4 pt-4">
              <h6>Blacklisted videos</h6>
              {Object.keys(state.blacklist).length === 0 ? <p className="mb-0 text-body-secondary">None.</p> : <div className="list-group list-group-flush">{Object.keys(state.blacklist).map((videoId) => <button type="button" className="list-group-item list-group-item-action px-0" key={videoId} onClick={() => openToolbox({ video: videoId, user: null })}>{state.videos[videoId]?.title ?? videoId}</button>)}</div>}
            </section>
            <section className="border-top mt-4 pt-4">
              <h6>Users</h6>
              <div className="list-group list-group-flush">
                {Object.entries(state.users).map(([userId, user]) => <button type="button" className="list-group-item list-group-item-action px-0" key={userId} onClick={() => openToolbox({ video: null, user: userId })}>{user.displayName}{user.suspendedUntil ? " (suspended)" : ""}</button>)}
              </div>
            </section>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

const NumericSetting = ({ label, value, setValue }: { label: string; value: number; setValue: (value: number) => void }) => (
  <Form.Group className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control type="number" min="0" value={value} onChange={(event) => setValue(Number(event.target.value))} />
  </Form.Group>
);

export default AdminSettings;
