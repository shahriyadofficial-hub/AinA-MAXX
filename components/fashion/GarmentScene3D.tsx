"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Float } from "@react-three/drei";
import * as THREE from "three";

export interface FloatingTag {
  id: string;
  label: string;
  position: [number, number, number];
  focusTarget: [number, number, number];
  accentColor?: string;
}

interface GarmentMeshProps {
  color: string;
  accentColor: string;
  scale: number;
  tags: FloatingTag[];
  onSelectTag: (tag: FloatingTag) => void;
  activeTagId: string | null;
}

/**
 * Procedural Stylized 3D Garment (South Asian Kurta / Streetwear Jacket)
 * Features tailored torso, mandarin collar, structured sleeves, and floating Drei HTML tags.
 */
function StylizedGarment({
  color,
  accentColor,
  scale,
  tags,
  onSelectTag,
  activeTagId,
}: GarmentMeshProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle breathing idle rotation
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating yaw
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.12;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.04 - 0.2;
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} position={[0, -0.2, 0]}>
      {/* --- Hanger / Mannequin Stand Top --- */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.45, 16]} />
        <meshStandardMaterial color="#222225" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Shoulder Crossbar */}
      <mesh position={[0, 1.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 1.5, 16]} />
        <meshStandardMaterial color="#1A1A1D" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* --- Main Torso (Tailored Kurta / Streetwear Silhouette) --- */}
      <mesh position={[0, 0.25, 0]}>
        {/* Custom tapered profile */}
        <cylinderGeometry args={[0.55, 0.68, 1.6, 32, 4]} />
        <meshStandardMaterial
          color={color}
          roughness={0.68}
          metalness={0.08}
        />
      </mesh>

      {/* --- Front Placket / Button Seam (Vertical Accent) --- */}
      <mesh position={[0, 0.45, 0.56]}>
        <boxGeometry args={[0.06, 1.1, 0.02]} />
        <meshStandardMaterial color={accentColor} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Placket Buttons */}
      {[-0.2, 0.1, 0.4, 0.7].map((yOffset, idx) => (
        <mesh key={idx} position={[0, yOffset, 0.58]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.01, 16]} />
          <meshStandardMaterial color="#FFFFFF" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* --- Mandarin / Camp Collar --- */}
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.3, 0.32, 0.16, 24, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.65} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Collar Accent Trim */}
      <mesh position={[0, 1.16, 0]}>
        <torusGeometry args={[0.3, 0.015, 8, 24]} />
        <meshStandardMaterial color={accentColor} metalness={0.6} roughness={0.2} />
      </mesh>

      {/* --- Left Sleeve (Angled) --- */}
      <group position={[-0.7, 0.6, 0]} rotation={[0, 0, -0.32]}>
        <mesh position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.22, 0.18, 1.1, 24]} />
          <meshStandardMaterial color={color} roughness={0.7} metalness={0.08} />
        </mesh>
        {/* Cuff */}
        <mesh position={[0, -1.02, 0]}>
          <cylinderGeometry args={[0.185, 0.185, 0.08, 24]} />
          <meshStandardMaterial color={accentColor} roughness={0.4} metalness={0.3} />
        </mesh>
      </group>

      {/* --- Right Sleeve (Angled) --- */}
      <group position={[0.7, 0.6, 0]} rotation={[0, 0, 0.32]}>
        <mesh position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.22, 0.18, 1.1, 24]} />
          <meshStandardMaterial color={color} roughness={0.7} metalness={0.08} />
        </mesh>
        {/* Cuff */}
        <mesh position={[0, -1.02, 0]}>
          <cylinderGeometry args={[0.185, 0.185, 0.08, 24]} />
          <meshStandardMaterial color={accentColor} roughness={0.4} metalness={0.3} />
        </mesh>
      </group>

      {/* --- Side Slits (Traditional Panjabi / Kurta Cut) --- */}
      <mesh position={[-0.64, -0.45, 0]} rotation={[0, 0, -0.05]}>
        <boxGeometry args={[0.02, 0.5, 0.04]} />
        <meshStandardMaterial color={accentColor} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.64, -0.45, 0]} rotation={[0, 0, 0.05]}>
        <boxGeometry args={[0.02, 0.5, 0.04]} />
        <meshStandardMaterial color={accentColor} metalness={0.5} roughness={0.3} />
      </mesh>

      {/* --- Floating 3D HTML World Space Tags --- */}
      {tags.map((tag) => {
        const isSelected = activeTagId === tag.id;
        return (
          <Html
            key={tag.id}
            position={tag.position}
            center
            distanceFactor={5.5}
            zIndexRange={[100, 0]}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectTag(tag);
              }}
              className={`group flex items-center space-x-2 px-3 py-1.5 rounded-full text-[11px] font-mono tracking-tight transition-all duration-300 backdrop-blur-md cursor-pointer select-none shadow-xl ${
                isSelected
                  ? "bg-aina-rose text-black font-bold ring-2 ring-white shadow-[0_0_20px_rgba(255,45,149,0.8)] scale-110"
                  : "bg-aina-black/85 text-white/90 border border-white/20 hover:border-aina-light-cerulean hover:scale-105"
              }`}
              style={{
                borderColor: isSelected ? "#FFFFFF" : tag.accentColor || "#3FB6E0",
              }}
              title="Click to zoom in"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSelected
                    ? "bg-black animate-ping"
                    : "bg-aina-rose shadow-[0_0_8px_#FF2D95]"
                }`}
              />
              <span className="whitespace-nowrap">{tag.label}</span>
            </button>
          </Html>
        );
      })}
    </group>
  );
}

/**
 * Camera Controller to support smooth click-to-focus zoom glides
 */
function CameraRig({
  targetPos,
  isFocused,
}: {
  targetPos: [number, number, number] | null;
  isFocused: boolean;
}) {
  const { camera } = useThree();
  const defaultPos = new THREE.Vector3(0, 0, 6.2);
  const currentTarget = useRef(new THREE.Vector3(0, 0, 6.2));

  useFrame(() => {
    if (isFocused && targetPos) {
      // Smoothly glide camera toward fabric texture
      currentTarget.current.lerp(
        new THREE.Vector3(targetPos[0] * 0.7, targetPos[1] * 0.7, 3.2),
        0.08
      );
    } else {
      // Smoothly glide back to overview
      currentTarget.current.lerp(defaultPos, 0.08);
    }
    camera.position.copy(currentTarget.current);
  });

  return null;
}

export interface GarmentScene3DProps {
  color: string;
  accentColor: string;
  isMobile: boolean;
  tags: FloatingTag[];
  activeTag: FloatingTag | null;
  onSelectTag: (tag: FloatingTag) => void;
  onResetView: () => void;
}

export function GarmentScene3D({
  color,
  accentColor,
  isMobile,
  tags,
  activeTag,
  onSelectTag,
  onResetView,
}: GarmentScene3DProps) {
  const scale = isMobile ? 1.6 : 2.1;

  return (
    <div className="relative w-full h-[460px] sm:h-[540px] lg:h-[620px] rounded-3xl overflow-hidden bg-radial-gradient select-none">
      {/* 3D Canvas Layer */}
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          // Deselect tag when user clicks on background canvas
          if (e.target === e.currentTarget) {
            onResetView();
          }
        }}
      >
        {/* Constrained Studio Lighting */}
        {/* Soft Ambient */}
        <ambientLight intensity={0.4} color="#15151B" />

        {/* Front Key Light */}
        <directionalLight position={[2, 3, 4]} intensity={2.2} color="#FFFFFF" />

        {/* Studio Rim Backlight (#FF2D95 Neon Rose) */}
        <pointLight
          position={[0, 3.2, -3.8]}
          intensity={4.5}
          color="#FF2D95"
          distance={12}
        />

        {/* Fill Light (#007BA7 Cerulean) */}
        <directionalLight
          position={[-4, 1.5, 2]}
          intensity={1.6}
          color="#007BA7"
        />

        {/* Under-glow Accent (#3FB6E0 Light Cerulean) */}
        <pointLight
          position={[0, -2.5, 1]}
          intensity={1.2}
          color="#3FB6E0"
          distance={8}
        />

        {/* Camera glide controller */}
        <CameraRig
          targetPos={activeTag ? activeTag.focusTarget : null}
          isFocused={activeTag !== null}
        />

        {/* Constrained Orbit Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3.0}
          maxDistance={8.5}
          minPolarAngle={Math.PI / 2.5} // ~72 deg
          maxPolarAngle={Math.PI / 1.8} // ~100 deg
          rotateSpeed={0.7}
          dampingFactor={0.06}
        />

        {/* 3D Model with Floating Tags */}
        <StylizedGarment
          color={color}
          accentColor={accentColor}
          scale={scale}
          tags={tags}
          onSelectTag={onSelectTag}
          activeTagId={activeTag?.id || null}
        />

        {/* Dark Reflective Studio Floor Plane */}
        <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial
            color="#08080A"
            roughness={0.25}
            metalness={0.7}
          />
        </mesh>
      </Canvas>

      {/* High-Contrast Interactive Overlay Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-aina-rose animate-pulse" />
          <span>3D Studio · 360° Drag Orbit</span>
        </span>

        {activeTag && (
          <button
            type="button"
            onClick={onResetView}
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium backdrop-blur-md border border-white/15 transition-all active:scale-95"
          >
            Reset View ✕
          </button>
        )}
      </div>

      {/* Floating Zoom Indicator Pill */}
      {activeTag && (
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
          <div className="px-3.5 py-1.5 rounded-full bg-aina-rose/90 backdrop-blur-md text-black font-extrabold text-xs shadow-glow-rose flex items-center space-x-1.5 animate-bounce">
            <span>🔍 Focused: {activeTag.label}</span>
          </div>
        </div>
      )}

      {/* Studio Floor Vignette / Glow Effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-aina-black via-transparent to-transparent opacity-80" />
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-aina-black to-transparent pointer-events-none" />
    </div>
  );
}

export default GarmentScene3D;
