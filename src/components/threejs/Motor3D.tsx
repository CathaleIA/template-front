'use client'

import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import { Environment } from "@react-three/drei";


const Computers = ({ url }: { url: string }) => {
    const computer = useGLTF(url);

    const getConfig = () => {
        const filename = url.split('/').pop()?.toLowerCase() || '';

        if (filename.includes('motor')) {
            return { scale: 5, position: [0, -2.5, 0] };
        }
        if (filename.includes('turbine')) {
            return { scale: 3, position: [0, 0, 0] };
        }
        return { scale: 2.5, position: [0, -1.5, 0] };
    }

    const { scale, position} = getConfig();
    return (
        <mesh>
            <ambientLight intensity={0.4} />
            <primitive
                object={computer.scene}
                scale={scale}
                position={position}
            />
        </mesh>
    );
};

const ComputersCanvas = ({ url }: { url: string }) => {
    return (
        <Canvas
            frameloop='demand'
            shadows
            dpr={[1, 2]}
            camera={{ position: [20, 3, -10], fov: 25 }}
            gl={{ preserveDrawingBuffer: true }}
        >
            <Environment preset="city" />
            <OrbitControls
                autoRotate
                autoRotateSpeed={1.5} // Ajusta velocidad de rotación
                enableZoom={true}
                zoomSpeed={0.7}
                minDistance={15}     // ← Distancia mínima (limite de acercamiento)
                maxDistance={30}     // ← Distancia máxima (limite de alejamiento)
                minPolarAngle={Math.PI / 3}   // ~60° - desde arriba
                maxPolarAngle={Math.PI / 2.2} // ~72° - no muy abajo
                enablePan={false}    // Opcional: desactiva movimiento lateral
            />
            <Computers url={url} />
            <Preload all />
        </Canvas>
    );
};

export default ComputersCanvas;