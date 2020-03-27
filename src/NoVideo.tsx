import ReactDOM from 'react-dom'
import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, RenderCallback } from 'react-three-fiber'
import THREE, { Mesh, BoxBufferGeometry, MeshStandardMaterial, Geometry, Material, Group, EdgesGeometry, LineSegments, LineBasicMaterial, Vector3 } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

const NoVideo = (props:any) => {
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
  const mesh  = useRef<Mesh>();
  const geom  = useRef<Geometry>();
  const mat   = useRef<Material>();
  const group = useRef<Group>();
  
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  
  // Rotate mesh every frame, this is outside of React without overhead
  useFrame((state, delta) => {
    if(group?.current != undefined) {
      group.current.rotation.y += delta;
    }
  });

  const geometry = new STLLoader().load(
    process.env.PUBLIC_URL + "/amphi.stl",
    (bufferGeometry) => {
      if(mesh.current == undefined) return;
      mesh.current.geometry = bufferGeometry;

      var linesMat = new LineBasicMaterial( { color: 0x343a40 } ) ;
      var edges    = new EdgesGeometry( bufferGeometry );
      var lines    = new LineSegments( edges, linesMat );

      if(group.current != undefined)
        group.current.add(lines);

      mesh.current.position.z = -5;
      lines.position.z        = -5;
    }
  );
  
  return (
    <group ref={group} position={[0,0,-100]}>
      <mesh ref={mesh}>
        <meshStandardMaterial ref={mat} attach="material" color={0xfdd835} />
      </mesh>
    </group>
  );
}

export default NoVideo;