import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Mesh, Group, EdgesGeometry, LineSegments, LineBasicMaterial, MeshStandardMaterial } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

const NoVideo = (props: any) => {
  return (
    <>
      <Canvas>
        <ambientLight />
        <Spin />
      </Canvas>
      <p className="no-video">No video is currently playing.</p>
    </>
  )

}

const Spin = () => {
  // This reference will give us direct access to the mesh
  const mesh = useRef<Mesh>(null);
  const mat = useRef<MeshStandardMaterial>(null);
  const group = useRef<Group>(null);

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame((state, delta) => {
    if (group?.current) {
      group.current.rotation.y += delta;
    }
  });

  new STLLoader().load(
    process.env.PUBLIC_URL + "/amphi.stl",
    (bufferGeometry) => {
      if (!mesh.current) return;
      mesh.current.geometry = bufferGeometry;

      var linesMat = new LineBasicMaterial({ color: 0x343a40 });
      var edges = new EdgesGeometry(bufferGeometry);
      var lines = new LineSegments(edges, linesMat);

      if (group.current)
        group.current.add(lines);

      mesh.current.position.z = -5;
      lines.position.z = -5;
    }
  );

  return (
    <group ref={group} position={[0, 0, -100]}>
      <mesh ref={mesh}>
        <meshStandardMaterial ref={mat} attach="material" color={0xfdd835} />
      </mesh>
    </group>
  );
}

export default NoVideo;