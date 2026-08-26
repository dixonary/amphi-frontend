import React from "react";
import { Spinner } from "react-bootstrap";
import VideoListing from "./VideoListing";
import { useContext } from "react";
import { ServerContext } from "./ServerProvider";

/** The global playlist.
 */
const Playlist = () => {
  const { state } = useContext(ServerContext);

  if (state === null) return <Spinner animation="border" />;
  if (state.buckets.length === 0) {
    return <p>The global playlist is empty.</p>;
  }

  return (
    <>
      {(state.buckets.length === 0)
        ? (<p>The global playlist is empty.</p>)
        :
        state.buckets.map((b, idx) => (
          <Bucket bucket={b} key={idx} bucketIdx={idx} />
        ))
      }
    </>
  );
};

const Bucket = ({ bucket }: any) => {
  return (
    <div className="bucket">
      {bucket.map((vid: any, idx: number) => (
        <VideoListing
          provided={{}}
          data={vid}
          localQueue={false}
          key={vid.queueItemId}
        />
      ))}
    </div>
  );
};


export default Playlist;
