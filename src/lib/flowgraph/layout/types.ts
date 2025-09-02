import type { Edge, Node } from "@xyflow/react";

export interface LayoutOptions {
  direction?: "TB" | "BT" | "LR" | "RL";
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number;
  nodeSep?: number;
  getNodeSize?: (node: Node) => { width: number; height: number };
  edgeAware?: boolean;
  barycentricIterations?: number;
}

export type DefaultLayoutOptions = Required<
  Omit<LayoutOptions, "getNodeSize" | "edgeAware" | "barycentricIterations">
> & {
  edgeAware: boolean;
  barycentricIterations: number;
};

export interface SplitLayoutOptions {
  groupId?: string;
  groupPadding?: number;
  gapBetweenGroupAndRest?: number;
  groupPosition?: { x: number; y: number };
  childNodeWidth?: number;
  childNodeHeight?: number;
  getChildNodeSize?: (node: Node) => { width: number; height: number };
  getOutsideNodeSize?: (node: Node) => { width: number; height: number };
  edgeClearance?: number;
  autoResizeGroup?: boolean;
  groupLayoutOptions?: LayoutOptions;
  outsideLayoutOptions?: LayoutOptions;
}

export type { Edge, Node };
