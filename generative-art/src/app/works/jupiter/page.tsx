"use client";
// @refresh reset

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { useControls, button, folder } from "leva";

const Mesh = () => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const [jupiterShader, setJupiterShader] = useState<string | undefined>(
    undefined
  );
  const [vertexShader, setVertexShader] = useState<string | undefined>(
    undefined
  );

  const gl = useThree((state) => state.gl);

  useControls({
    screenshot: button(() => {
      const link = document.createElement("a");
      link.setAttribute("download", "canvas.png");
      link.setAttribute(
        "href",
        gl.domElement
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream")
      );
      link.click();
    }),
  });

  useEffect(() => {
    fetch("/shaders/jupiter.frag")
      .then((r) => r.text())
      .then(setJupiterShader);
    fetch("/shaders/jupiter.vert")
      .then((r) => r.text())
      .then(setVertexShader);
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
      {jupiterShader && (
        <shaderMaterial
          ref={shaderRef}
          attach="material"
          fragmentShader={jupiterShader}
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
          width: "calc(100vh * 0.6)",
          height: "100vh",
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
