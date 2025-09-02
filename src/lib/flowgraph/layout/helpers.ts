import type { Edge, Node } from "./types";
import _ from "lodash";

export const DEFAULT_OPTIONS = {
  direction: "TB" as const,
  nodeWidth: 250,
  nodeHeight: 200,
  rankSep: 150,
  nodeSep: 150,
  edgeAware: false,
  barycentricIterations: 2,
};

export function groupByRank(nodes: Node[], ranks: Map<string, number>) {
  return _.groupBy(
    nodes.map((n) => ({ node: n, rank: ranks.get(n.id) || 0 })),
    "rank"
  );
}

export function averageIndex(
  ids: string[],
  indexMap: Map<string, number>
): number {
  if (!ids.length) return Number.POSITIVE_INFINITY;
  let sum = 0;
  let count = 0;
  for (const id of ids) {
    const idx = indexMap.get(id);
    if (idx !== undefined) {
      sum += idx;
      count++;
    }
  }
  if (count === 0) return Number.POSITIVE_INFINITY;
  return sum / count;
}

export function computeIncoming(nodes: Node[], edges: Edge[]) {
  const incoming = new Map<string, string[]>();
  for (const n of nodes) incoming.set(n.id, []);
  for (const e of edges) {
    const arr = incoming.get(e.target) || [];
    incoming.set(e.target, [...arr, e.source]);
  }
  return incoming;
}

export function computeOutgoing(nodes: Node[], edges: Edge[]) {
  const outgoing = new Map<string, string[]>();
  for (const n of nodes) outgoing.set(n.id, []);
  for (const e of edges) {
    const arr = outgoing.get(e.source) || [];
    outgoing.set(e.source, [...arr, e.target]);
  }
  return outgoing;
}

export function calculateNodeRanks(
  nodes: Node[],
  incomingEdges: Map<string, string[]>
): Map<string, number> {
  const ranks = new Map<string, number>();
  const processed = new Set<string>();

  const roots = nodes.filter(
    (node) => (incomingEdges.get(node.id) || []).length === 0
  );
  if (roots.length === 0) {
    for (let i = 0; i < nodes.length; i++) {
      ranks.set(nodes[i].id, i % 3);
    }
    return ranks;
  }

  const queue: Array<{ id: string; rank: number }> = roots.map((node) => ({
    id: node.id,
    rank: 0,
  }));

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || processed.has(current.id)) continue;
    processed.add(current.id);
    ranks.set(current.id, current.rank);
    const children = nodes.filter((node) =>
      (incomingEdges.get(node.id) || []).includes(current.id)
    );
    for (const child of children) {
      if (!processed.has(child.id))
        queue.push({ id: child.id, rank: current.rank + 1 });
    }
  }

  for (const node of nodes) {
    if (!processed.has(node.id)) ranks.set(node.id, 0);
  }

  return ranks;
}
