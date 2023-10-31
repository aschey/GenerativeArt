"use client";
// @refresh reset

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { useScreenshot } from "@/useScreenshot";

const Mesh = () => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const [fragShader, setFragShader] = useState<string | undefined>(undefined);
  const [vertexShader, setVertexShader] = useState<string | undefined>(
    undefined
  );

  const gl = useThree((state) => state.gl);

  useScreenshot(
    gl.domElement,
    gl.domElement.width * 0.25,
    gl.domElement.height * 0.25
  );

  useEffect(() => {
    Promise.all([
      fetch("/shaders/util.frag"),
      fetch("/shaders/jupiter.frag"),
      fetch("/shaders/jupiter.vert"),
    ])
      .then((shaders) => Promise.all(shaders.map((s) => s.text())))
      .then(([util, frag, vert]) => {
        setFragShader(frag.replace("#pragma util;", util));
        setVertexShader(vert);
      });
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
          vertexShader={vertexShader}
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

const Jupiter: React.FC<{}> = () => {
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
      <div
        style={{
          width: "calc(400vh * 0.6)",
          height: "400vh",
        }}
      >
        <Canvas frameloop="demand" gl={{ preserveDrawingBuffer: true }}>
          <Mesh />
        </Canvas>
      </div>
    </div>
  );
};

export default Jupiter;
