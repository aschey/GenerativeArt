"use client";
// @refresh reset

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { useControls, button, folder } from "leva";

const Mesh = () => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const [fragShader, setFragShader] = useState<string | undefined>(undefined);
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
    Promise.all([fetch("/shaders/util.frag"), fetch("/shaders/jupiter.frag")])
      .then(([a, b]) => Promise.all([a.text(), b.text()]))
      .then(([util, frag]) =>
        setFragShader(frag.replace("#pragma util;", util))
      );
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
