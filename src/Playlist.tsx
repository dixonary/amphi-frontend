import firebase from "firebase";
import React from "react";
import { Spinner } from "react-bootstrap";
import VideoListing from "./VideoListing";
import { useObject } from "react-firebase-hooks/database/";

/** The global playlist.
 */
const Playlist = () => {
  const ref = firebase.database().ref("buckets").orderByChild("bucketIndex");
  const [buckets, , error] = useObject(ref);

  if (error) return <p>{error.message}</p>;

  if (buckets === undefined) return <Spinner animation="border" />;

  const bucketsArr = buckets.val() as any[];
  if (bucketsArr === null) {
    return <p>The global playlist is empty.</p>;
  }

  return (
    <>
      {bucketsArr.map((b: any, idx) => (
        <Bucket bucket={b} key={idx} bucketIdx={idx} />
      ))}
    </>
  );
};

const Bucket = ({ bucket, bucketIdx }: any) => {
  return (
    <div className="bucket">
      {bucket.map((vid: any, idx: number) => (
        <VideoListing
          provided={{}}
          data={vid}
          localQueue={false}
          key={vid + "-" + idx}
        />
      ))}
    </div>
  );
};

export default Playlist;
