import { z } from "zod";

export const AinADemoSchema = z.object({
  accentRose: z.string(),
  accentCerulean: z.string(),
});

export type AinADemoProps = z.infer<typeof AinADemoSchema>;

export const defaultAinAProps: AinADemoProps = {
  accentRose: "#FF2D95",
  accentCerulean: "#3FB6E0",
};
