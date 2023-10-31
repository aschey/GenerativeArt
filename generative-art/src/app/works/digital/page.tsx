"use client";
// @refresh reset

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { useControls, button, folder } from "leva";
import { useScreenshot } from "@/useScreenshot";

const Mesh = () => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const [fragShader, setFragShader] = useState<string | undefined>(undefined);

  const gl = useThree((state) => state.gl);

  useScreenshot(
    gl.domElement,
    gl.domElement.width * 0.25,
    gl.domElement.height * 0.25
  );

  useEffect(() => {
    Promise.all([fetch("/shaders/util.frag"), fetch("/shaders/digital.frag")])
      .then((shaders) => Promise.all(shaders.map((s) => s.text())))
      .then(([util, frag]) =>
        setFragShader(frag.replace("#pragma util;", util))
      );
  }, []);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms["iResolution"].value.x = state.size.width;
      shaderRef.current.uniforms["iResolution"].value.y = state.size.height;
    }
  });

  return (
    <mesh>
      <boxGeometry args={[100, 100]} />
      {fragShader && (
        <shaderMaterial
          ref={shaderRef}
          attach="material"
          fragmentShader={fragShader}
          uniforms={{
            iResolution: {
              value: new Vector3(0, 0, 0),
            },
          }}
        />
      )}
    </mesh>
  );
};

const Digital: React.FC<{}> = () => {
  useEffect(() => {
    document.getElementsByTagName("canvas")[0].style.transformOrigin = "center";
    document.getElementsByTagName("canvas")[0].style.transform =
      "scale(0.25) translateY(-150%)";
  }, []);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <div style={{ width: "400vw", height: "400vh" }}>
        <Canvas frameloop="demand" gl={{ preserveDrawingBuffer: true }}>
          <Mesh />
        </Canvas>
      </div>
    </div>
  );
};

export default Digital;
