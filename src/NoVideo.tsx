import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { BufferGeometry, EdgesGeometry, Group, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, NoToneMapping } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

const NoVideo = () => {
  return (
    <div className="no-video-container">
      <Canvas gl={{ toneMapping: NoToneMapping }}>
        <Spin />
      </Canvas>
      <p className="no-video">No video is currently playing.</p>
    </div>
  );
};

export const Offline = () => {
  return (
    <div className="no-video-container">
      <Canvas gl={{ toneMapping: NoToneMapping }}>
        <Spin />
      </Canvas>
      <p className="no-video text-white" style={{ marginBottom: "3rem" }}>Amphi is currently offline.</p>
    </div>
  );
};

const Spin = () => {
  const mesh = useRef<Mesh>(null);
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta;
    }
  });

  new STLLoader().load(`${import.meta.env.BASE_URL}amphi.stl`, (bufferGeometry: BufferGeometry) => {
    if (!mesh.current) return;
    mesh.current.geometry = bufferGeometry;

    const linesMaterial = new LineBasicMaterial({ color: 0x343a40 });
    const edges = new EdgesGeometry(bufferGeometry);
    const lines = new LineSegments(edges, linesMaterial);

    if (group.current) group.current.add(lines);

    mesh.current.position.z = -5;
    lines.position.z = -5;
  });

  return (
    <group ref={group} position={[0, 0, -100]}>
      <mesh ref={mesh}>
        <meshBasicMaterial color={0xfdd835} />
      </mesh>
    </group>
  );
};

export default NoVideo;