import React from "react";
import { Composition } from "remotion";
import { AinAMaxxDemo } from "./AinAMaxxDemo";
import { AinADemoSchema, defaultAinAProps } from "./lib/schema";
import { FPS, TOTAL_FRAMES } from "./lib/tokens";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AinAMaxxDemo"
      component={AinAMaxxDemo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
      schema={AinADemoSchema}
      defaultProps={defaultAinAProps}
    />
  );
};
