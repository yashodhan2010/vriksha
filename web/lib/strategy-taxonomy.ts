import type { Strategy } from "./types";

export type StrategyFamily = "Bamboo" | "Banyan" | "Mahogany";
export type StrategyEdition = "Root" | "Trunk" | "Canopy";

export const strategyFamilies: Array<{
  id: StrategyFamily;
  label: string;
  summary: string;
  signal: string;
}> = [
  {
    id: "Bamboo",
    label: "Bamboo",
    summary: "Fast-growth systems built for trend participation and decisive portfolio refreshes.",
    signal: "Fast growth"
  },
  {
    id: "Banyan",
    label: "Banyan",
    summary: "Robust systems designed around breadth, resilience, and steady participation.",
    signal: "Robust"
  },
  {
    id: "Mahogany",
    label: "Mahogany",
    summary: "Timeless allocation systems shaped for durability, balance, and long-horizon use.",
    signal: "Timeless"
  }
];

export const strategyEditions: Array<{
  id: StrategyEdition;
  label: string;
  summary: string;
}> = [
  { id: "Root", label: "Root", summary: "Grounded edition" },
  { id: "Trunk", label: "Trunk", summary: "Core edition" },
  { id: "Canopy", label: "Canopy", summary: "High-reach edition" }
];

export function getStrategyFamily(strategy: Pick<Strategy, "name" | "labels">): StrategyFamily {
  const source = `${strategy.name} ${strategy.labels.join(" ")}`;
  if (/mahogany|asset allocation|multi asset|fixed allocation/i.test(source)) return "Mahogany";
  if (/banyan|robust/i.test(source)) return "Banyan";
  return "Bamboo";
}

export function getStrategyEdition(strategy: Pick<Strategy, "name" | "labels" | "slug">): StrategyEdition {
  const source = `${strategy.name} ${strategy.labels.join(" ")} ${strategy.slug}`;
  if (/canopy|dual-momentum\b/i.test(source) && !/low-drawdown|conservative/i.test(source)) return "Canopy";
  if (/trunk|conservative/i.test(source)) return "Trunk";
  return "Root";
}

export function getFamilyMeta(family: StrategyFamily) {
  return strategyFamilies.find((item) => item.id === family) ?? strategyFamilies[0];
}

export function getEditionMeta(edition: StrategyEdition) {
  return strategyEditions.find((item) => item.id === edition) ?? strategyEditions[0];
}

