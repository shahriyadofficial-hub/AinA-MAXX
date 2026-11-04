import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SCENES } from "./lib/tokens";
import { ProgressHairline } from "./components/fx";
import { ColdOpen } from "./scenes/S01ColdOpen";
import { Problem } from "./scenes/S02Problem";
import { MirrorReveal } from "./scenes/S03Mirror";
import { BuildForWorld } from "./scenes/S04World";
import { SolutionOverview } from "./scenes/S05Solution";
import { FeatureRoadmap } from "./scenes/S06Roadmap";
import { FeatureCoded } from "./scenes/S07Coded";
import { FeatureLookbook } from "./scenes/S08Lookbook";
import { FeatureCoachShop } from "./scenes/S09CoachShop";
import { Competitors } from "./scenes/S10Competitors";
import { Market } from "./scenes/S11Market";
import { BusinessGtm } from "./scenes/S12Business";
import { RisksFuture } from "./scenes/S13RisksFuture";
import { Finale } from "./scenes/S14Finale";

const SCENE_COMPONENTS: Record<string, React.FC> = {
  "cold-open": ColdOpen,
  problem: Problem,
  mirror: MirrorReveal,
  world: BuildForWorld,
  solution: SolutionOverview,
  roadmap: FeatureRoadmap,
  coded: FeatureCoded,
  lookbook: FeatureLookbook,
  coach: FeatureCoachShop,
  competitors: Competitors,
  market: Market,
  business: BusinessGtm,
  "risks-future": RisksFuture,
  finale: Finale,
};

export const AinAMaxxDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0A" }}>
      {/* cinematic synth score (procedurally generated, see scripts) */}
      <Audio src={staticFile("audio/score.wav")} />

      {SCENES.map((s) => {
        const Comp = SCENE_COMPONENTS[s.id];
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.duration} name={s.id}>
            <Comp />
          </Sequence>
        );
      })}

      {/* global progress hairline */}
      <Sequence from={0} durationInFrames={5400}>
        <ProgressTracker />
      </Sequence>
    </AbsoluteFill>
  );
};

const ProgressTracker: React.FC = () => {
  const frame = useCurrentFrame();
  return <ProgressHairline progress={frame / 5400} />;
};
