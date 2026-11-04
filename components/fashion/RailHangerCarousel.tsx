"use client";

// components/fashion/RailHangerCarousel.tsx
// AinA Drip — RAIL: 3D Virtual Hanger Carousel (Experience 03).
//
// A horizontal metallic rail of hangers. Drag with inertia, snap-to-centre,
// rubber-banded ends, pendulum sway, centre item scales +15%. Two-tap
// inspection: tap 1 glides the camera in and rotates the hanger 180° to
// reveal the back print; tap 2 opens the Quick PDP. Geometry is procedural
// low-poly (no .glb assets ship with the repo) and only the active item and
// its immediate neighbours (i−1, i, i+1) mount real meshes. WebGL-less or
// reduced-motion devices get a CSS 3D swipe-track fallback.
//
// All carousel math lives in lib/fashion/rail.ts (pure, unit-tested).

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useDrag } from "@use-gesture/react";
import * as THREE from "three";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  ShoppingBag,
  X,
} from "lucide-react";
import {
  RAIL_PRODUCTS,
  centerScale,
  clampRailIndex,
  formatRailBdt,
  pendulumSwayDeg,
  railAnnouncement,
  rubberBandOffset,
  snapIndexFromOffset,
  visibleIndices,
  type RailProduct,
} from "@/lib/fashion/rail";
import { useRoutineBag } from "@/lib/fashion/routine-bag";
import { canRender3D } from "@/lib/browser/webgl";
import { WebGLBoundary } from "@/components/system/ErrorBoundary";

const ITEM_SPACING = 2.6; // world units between hangers
const RAIL_Y = 2.05; // height of the metallic bar

// ---------------------------------------------------------------------------
// Procedural hanger + garment (low-poly, high-roughness PBR).
// Reuses the lighting/material language of GarmentScene3D but authors a
// distinct streetwear silhouette (hoodie/tee block, not the kurta cut).
// ---------------------------------------------------------------------------

interface HangerGarmentProps {
  product: RailProduct;
  /** 0 = centred, ±1 = one item away (drives the +15% centre scale). */
  distance: number;
  swayDeg: number;
  inspecting: boolean;
  onTap: (product: RailProduct) => void;
}

function HangerGarment({ product, distance, swayDeg, inspecting, onTap }: HangerGarmentProps) {
  const group = useRef<THREE.Group>(null);
  const rotY = useRef(0);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const targetScale = centerScale(distance);
    const s = THREE.MathUtils.damp(g.scale.x, targetScale, 8, delta);
    g.scale.setScalar(s);
    // Pendulum sway decays back to rest; inspection adds a slow 180° turn.
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, THREE.MathUtils.degToRad(swayDeg), 6, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, THREE.MathUtils.degToRad(swayDeg * 0.4), 6, delta);
    const targetRotY = inspecting ? Math.PI : 0;
    rotY.current = THREE.MathUtils.damp(rotY.current, targetRotY, 5, delta);
    g.rotation.y = rotY.current;
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onTap(product);
  };

  return (
    <group ref={group} onClick={handleClick}>
      {/* Hook */}
      <mesh position={[0, RAIL_Y + 0.32, 0]}>
        <torusGeometry args={[0.16, 0.028, 10, 24, Math.PI * 1.4]} />
        <meshStandardMaterial color="#C8C8CE" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, RAIL_Y + 0.12, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.28, 10]} />
        <meshStandardMaterial color="#C8C8CE" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* Hanger triangle bar */}
      <mesh position={[0, RAIL_Y - 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.028, 0.028, 1.34, 10]} />
        <meshStandardMaterial color="#3A3A40" metalness={0.75} roughness={0.35} />
      </mesh>
      {/* Garment body — heavyweight block silhouette */}
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.52, 0.66, 1.72, 24, 3]} />
        <meshStandardMaterial color={product.colorHex} roughness={0.88} metalness={0.04} />
      </mesh>
      {/* Shoulders / dropped sleeves */}
      <mesh position={[-0.62, 1.18, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.17, 0.14, 0.85, 14]} />
        <meshStandardMaterial color={product.colorHex} roughness={0.88} metalness={0.04} />
      </mesh>
      <mesh position={[0.62, 1.18, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.17, 0.14, 0.85, 14]} />
        <meshStandardMaterial color={product.colorHex} roughness={0.88} metalness={0.04} />
      </mesh>
      {/* Front chest accent stripe */}
      <mesh position={[0, 1.02, 0.56]}>
        <boxGeometry args={[0.34, 0.09, 0.02]} />
        <meshStandardMaterial color={product.accentColor} roughness={0.45} metalness={0.2} />
      </mesh>
      {/* Back print panel — revealed by the 180° inspection turn */}
      <mesh position={[0, 0.78, -0.6]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.72, 0.5]} />
        <meshStandardMaterial color={product.accentColor} roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Hem band */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.665, 0.665, 0.1, 24, 1, true]} />
        <meshStandardMaterial color={product.accentColor} roughness={0.7} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Rail scene: bar, mounts, lazy window of hangers, camera glide.
// ---------------------------------------------------------------------------

interface RailSceneProps {
  activeIndex: number;
  inspecting: boolean;
  swayDeg: number;
  onTapProduct: (product: RailProduct) => void;
  onBackgroundTap: () => void;
}

function RailScene({ activeIndex, inspecting, swayDeg, onTapProduct, onBackgroundTap }: RailSceneProps) {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const camTarget = useRef(new THREE.Vector3(0, 0.3, 6.4));
  const window_ = useMemo(() => visibleIndices(activeIndex, RAIL_PRODUCTS.length), [activeIndex]);

  useFrame((_, delta) => {
    if (group.current) {
      const targetX = -activeIndex * ITEM_SPACING;
      group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 7, delta);
    }
    const goal = inspecting
      ? new THREE.Vector3(0, 0.45, 3.6)
      : new THREE.Vector3(0, 0.3, 6.4);
    camTarget.current.lerp(goal, 1 - Math.exp(-4 * delta));
    camera.position.copy(camTarget.current);
    camera.lookAt(0, 0.55, 0);
  });

  return (
    <>
      {/* AinA dark-luxury lighting rig */}
      <ambientLight intensity={0.45} color="#15151B" />
      <spotLight position={[0, 6.5, 2.5]} angle={0.55} penumbra={1} intensity={160} color="#FFFFFF" />
      <pointLight position={[0, 3.4, -4]} intensity={30} color="#FF2D95" distance={14} />
      <directionalLight position={[-5, 2, 3]} intensity={1.4} color="#007BA7" />
      <pointLight position={[0, -2.2, 1.5]} intensity={6} color="#3FB6E0" distance={9} />

      {/* Reflective dark floor */}
      <mesh position={[0, -1.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 16]} />
        <meshStandardMaterial color="#08080A" roughness={0.25} metalness={0.7} />
      </mesh>

      {/* The Rail — continuous metallic bar + ceiling mounts */}
      <group ref={group}>
        <mesh position={[(RAIL_PRODUCTS.length - 1) * ITEM_SPACING * 0.5, RAIL_Y + 0.42, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, RAIL_PRODUCTS.length * ITEM_SPACING + 2.5, 16]} />
          <meshStandardMaterial color="#9A9AA2" metalness={0.95} roughness={0.18} />
        </mesh>
        {[-1.2, (RAIL_PRODUCTS.length - 1) * ITEM_SPACING + 1.2].map((x) => (
          <mesh key={x} position={[x, RAIL_Y + 0.42, 0]}>
            <sphereGeometry args={[0.11, 16, 12]} />
            <meshStandardMaterial color="#3A3A40" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {RAIL_PRODUCTS.map((product, i) => {
          if (!window_.includes(i)) return null; // lazy: only i−1, i, i+1 mount geometry
          return (
            <group key={product.id} position={[i * ITEM_SPACING, 0, 0]}>
              <HangerGarment
                product={product}
                distance={i - activeIndex}
                swayDeg={i === activeIndex ? swayDeg : swayDeg * 0.5}
                inspecting={inspecting && i === activeIndex}
                onTap={onTapProduct}
              />
            </group>
          );
        })}
      </group>

      {/* Invisible backdrop: tapping empty space exits inspection */}
      <mesh position={[0, 0.6, -2.5]} onClick={(e) => { e.stopPropagation(); onBackgroundTap(); }}>
        <planeGeometry args={[40, 14]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

// ---------------------------------------------------------------------------
// CSS 3D fallback track (no WebGL / reduced motion)
// ---------------------------------------------------------------------------

function RailFallbackTrack({
  activeIndex,
  onSelect,
  onInspect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
  onInspect: (product: RailProduct) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const card = track?.children[activeIndex] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeIndex]);

  return (
    <div
      ref={trackRef}
      data-testid="rail-fallback-track"
      className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 py-8 [perspective:900px]"
      role="list"
      aria-label="Rail products (2D mode)"
    >
      {RAIL_PRODUCTS.map((product, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={product.id}
            type="button"
            role="listitem"
            onClick={() => (isActive ? onInspect(product) : onSelect(i))}
            aria-label={`${product.title}, ${product.priceBDT} BDT${product.inStock ? "" : ", out of stock"}`}
            className="w-44 shrink-0 snap-center rounded-3xl border border-white/10 bg-aina-graphite p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
            style={{
              transform: `rotateY(${(i - activeIndex) * -14}deg) scale(${isActive ? 1.06 : 0.94})`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* hanger silhouette */}
            <svg viewBox="0 0 100 26" className="mx-auto h-6 w-20 text-neutral-500" aria-hidden="true">
              <path d="M50 2 a5 5 0 1 1 5 5 M50 12 L8 24 M50 12 L92 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            {/* Real garment photograph */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt="" className="mx-auto aspect-square w-full rounded-2xl border border-white/10 object-cover" />
            <p className="mt-2 line-clamp-2 min-h-[2rem] text-xs font-bold text-white">{product.title}</p>
            <p className="mt-1 text-xs font-black text-aina-rose">{formatRailBdt(product.priceBDT)}</p>
            {!product.inStock && (
              <span className="mt-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                Out of Stock
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick PDP modal (Tap 2 destination)
// ---------------------------------------------------------------------------

function RailQuickView({
  product,
  onClose,
}: {
  product: RailProduct;
  onClose: () => void;
}) {
  const { addItem, openBag } = useRoutineBag();
  const [size, setSize] = useState<string>(product.availableSizes[Math.min(1, product.availableSizes.length - 1)]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label={`Quick view: ${product.title}`}>
      <div className="w-full max-w-md rounded-t-[28px] border border-white/10 bg-aina-graphite p-6 shadow-2xl sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-aina-light-cerulean">{product.brand}</p>
            <h3 className="mt-1 font-display text-xl font-black text-white">{product.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick view"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image} alt="" className="h-28 w-28 shrink-0 rounded-2xl border border-white/10 object-cover" />
          <div>
            <p className="font-display text-2xl font-black text-aina-rose">{formatRailBdt(product.priceBDT)}</p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400">{product.microDescription}</p>
            <p className="mt-1 font-bengali text-xs text-neutral-500">{product.microBn}</p>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
              Back print: {product.backLabel}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">Size</p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Choose a size">
            {product.availableSizes.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={size === s}
                onClick={() => setSize(s)}
                className={`min-h-[44px] min-w-[52px] rounded-xl px-3 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose ${
                  size === s ? "bg-aina-rose text-white shadow-glow-rose" : "border border-white/10 bg-white/5 text-neutral-300 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={!product.inStock}
          onClick={() => {
            addItem({
              productId: product.id,
              title: product.title,
              brand: product.brand,
              priceBDT: product.priceBDT,
              size,
            });
            onClose();
            openBag();
          }}
          className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-aina-rose font-display text-sm font-black uppercase tracking-wide text-white shadow-glow-rose transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-500 disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ShoppingBag className="h-4 w-4" />
          {product.inStock ? `Add to Bag · ${formatRailBdt(product.priceBDT)}` : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main exported section
// ---------------------------------------------------------------------------

export function RailHangerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [inspecting, setInspecting] = useState(false);
  const [quickView, setQuickView] = useState<RailProduct | null>(null);
  // `false` until the client probe confirms WebGL — the R3F canvas must
  // never mount optimistically (SSR/hydration + GPU-blocklisted devices).
  const [use3D, setUse3D] = useState(false);
  const [swayDeg, setSwayDeg] = useState(0);
  const dragState = useRef({ offset: 0, velocity: 0, dragging: false });
  const { toast, dismissToast } = useRoutineBag();

  const total = RAIL_PRODUCTS.length;
  const active = RAIL_PRODUCTS[activeIndex];

  // WebGL + reduced-motion gate (same contract as Interactive3DLookbook).
  // Guarded shared probe — returns false instead of throwing when context
  // creation fails, so the CSS fallback below always wins on bad GPUs.
  useEffect(() => {
    setUse3D(canRender3D());
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setInspecting(false);
      setActiveIndex(clampRailIndex(index, total));
    },
    [total]
  );

  // Flow 2 — two-tap inspection.
  const handleTapProduct = useCallback(
    (product: RailProduct) => {
      const idx = RAIL_PRODUCTS.findIndex((p) => p.id === product.id);
      if (idx !== activeIndex) {
        goTo(idx);
        return;
      }
      if (!product.inStock) return; // OOS: inspection zoom disabled
      if (!inspecting) {
        setInspecting(true); // Tap 1: glide + 180° turn
      } else {
        setQuickView(product); // Tap 2: Quick PDP
      }
    },
    [activeIndex, inspecting, goTo]
  );

  // Flow 1 — drag with inertia, rubber-banding, snap-to-centre.
  const bindDrag = useDrag(
    ({ active: dragging, movement: [mx], velocity: [vx], direction: [dx], last }) => {
      const state = dragState.current;
      state.dragging = dragging;
      const itemsDelta = -mx / 180; // px → item units
      const raw = activeIndex + itemsDelta;
      const banded = rubberBandOffset(raw, 0, total - 1);
      state.offset = banded;
      state.velocity = -vx * dx;
      setSwayDeg(pendulumSwayDeg(-vx * dx * 2.2));
      if (dragging) setInspecting(false);
      if (last) {
        const snapped = snapIndexFromOffset(state.offset, state.velocity, total);
        goTo(snapped);
        setSwayDeg(0);
      }
    },
    { axis: "x", filterTaps: true, pointer: { touch: true } }
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(activeIndex + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(activeIndex - 1);
    } else if (e.key === "Escape") {
      setInspecting(false);
      setQuickView(null);
    }
  };

  return (
    <section
      aria-label="RAIL — 3D virtual hanger carousel"
      data-testid="rail-carousel"
      className="overflow-hidden rounded-[28px] border border-white/10 bg-aina-graphite/60 shadow-2xl"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-6 pt-6 sm:px-8">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-aina-cerulean/30 bg-aina-cerulean/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-aina-light-cerulean">
            RAIL · Virtual Hanger Carousel
          </p>
          <h2 className="mt-3 font-display text-2xl font-black text-white sm:text-3xl">
            Slide the rail. <span className="text-aina-rose">Tap twice to own it.</span>
          </h2>
          <p className="mt-1 max-w-xl text-sm text-neutral-400">
            Drag the rail, tap a hanger once to spin it and read the back print, tap again for sizes.
            <span className="font-bengali text-neutral-300"> রেল ধরে টানুন, দুইবার ট্যাপ করুন।</span>
          </p>
        </div>
        <p className="rounded-full bg-white/5 px-3 py-1.5 font-mono text-xs font-bold text-neutral-300" aria-hidden="true">
          {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </div>

      {/* Stage */}
      <div
        {...(use3D ? bindDrag() : {})}
        tabIndex={0}
        role="region"
        aria-label="Rail product browser. Use left and right arrow keys to browse."
        aria-roledescription="carousel"
        onKeyDown={handleKeyDown}
        className="relative mt-2 h-[430px] touch-pan-y select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aina-rose sm:h-[470px]"
        style={{ background: "radial-gradient(ellipse 90% 65% at 50% 0%, #1A1A1D 0%, #0A0A0A 70%)" }}
      >
        {use3D ? (
          <WebGLBoundary
            label="RAIL 3D carousel"
            fallback={
              <RailFallbackTrack
                activeIndex={activeIndex}
                onSelect={goTo}
                onInspect={(p) => p.inStock && setQuickView(p)}
              />
            }
          >
            <Canvas
              dpr={[1, 1.75]}
              camera={{ position: [0, 0.3, 6.4], fov: 42 }}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              onCreated={({ gl }) => {
                gl.domElement.addEventListener("webglcontextlost", (event) => {
                  event.preventDefault();
                  setUse3D(false);
                });
              }}
            >
              <RailScene
                activeIndex={activeIndex}
                inspecting={inspecting}
                swayDeg={swayDeg}
                onTapProduct={handleTapProduct}
                onBackgroundTap={() => setInspecting(false)}
              />
            </Canvas>
          </WebGLBoundary>
        ) : (
          <RailFallbackTrack
            activeIndex={activeIndex}
            onSelect={goTo}
            onInspect={(p) => p.inStock && setQuickView(p)}
          />
        )}

        {/* Mode badge */}
        <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-mono text-neutral-300 backdrop-blur-md">
          <span className={`h-2 w-2 rounded-full ${use3D ? "bg-aina-rose animate-pulse" : "bg-aina-light-cerulean"}`} />
          {use3D ? "3D Rail · drag to slide" : "2D Rail · swipe to slide"}
        </span>

        {inspecting && use3D && (
          <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-aina-rose px-3 py-1 text-[11px] font-bold text-white shadow-glow-rose">
            <Eye className="h-3.5 w-3.5" /> Back print: {active.backLabel}
          </span>
        )}
      </div>

      {/* HUD overlay */}
      <div className="border-t border-white/10 bg-aina-black/60 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 max-w-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-aina-light-cerulean">{active.brand}</p>
            <h3 className="mt-0.5 truncate font-display text-lg font-black text-white">{active.title}</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-400">{active.microDescription}</p>
            <p className="font-bengali text-xs text-neutral-500">{active.microBn}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-black text-aina-rose">{formatRailBdt(active.priceBDT)}</p>
            {active.inStock ? (
              <span className="mt-1 inline-block rounded-full bg-aina-cerulean/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-aina-light-cerulean">
                In Stock · Dhaka delivery
              </span>
            ) : (
              <span className="mt-1 inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Previous product"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            disabled={activeIndex === total - 1}
            aria-label="Next product"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {use3D && active.inStock && (
            <button
              type="button"
              onClick={() => setInspecting((v) => !v)}
              aria-pressed={inspecting}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose ${
                inspecting ? "bg-white text-black" : "border border-aina-rose/40 bg-aina-rose/10 text-aina-rose hover:bg-aina-rose/20"
              }`}
            >
              {inspecting ? <RotateCcw className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {inspecting ? "Show front" : "Inspect back print"}
            </button>
          )}

          <button
            type="button"
            data-testid="rail-add-to-bag"
            onClick={() => active.inStock && setQuickView(active)}
            disabled={!active.inStock}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-aina-rose px-5 text-xs font-black uppercase tracking-wide text-white shadow-glow-rose transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-500 disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ShoppingBag className="h-4 w-4" />
            {active.inStock ? "Quick view · Add to Bag" : "Out of Stock"}
          </button>

          {/* Rail position dots */}
          <div className="ml-auto flex items-center gap-1.5" role="tablist" aria-label="Rail position">
            {RAIL_PRODUCTS.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Go to ${p.title}`}
                onClick={() => goTo(i)}
                className={`h-2.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose ${
                  i === activeIndex ? "w-7 bg-aina-rose" : "w-2.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Screen-reader announcement (exact spec format) */}
      <div aria-live="polite" role="status" className="sr-only">
        {railAnnouncement(active, activeIndex, total)}
      </div>

      {/* Routine Bag toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-[80] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border border-aina-rose/40 bg-aina-graphite px-4 py-3 shadow-2xl md:bottom-8"
        >
          <ShoppingBag className="h-5 w-5 shrink-0 text-aina-rose" />
          <p className="flex-1 text-xs font-bold text-white">{toast.message}</p>
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Dismiss notification"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-neutral-300 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {quickView && <RailQuickView product={quickView} onClose={() => setQuickView(null)} />}
    </section>
  );
}

export default RailHangerCarousel;
