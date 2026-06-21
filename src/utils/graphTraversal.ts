import type { ADCNode, ADCEdge } from '@/types';

interface Neighbor {
  nodeId: string;
  edgeId: string;
  edgeKind: string;
}

export function collectHighlightedIds(
  originId: string,
  nodes: ADCNode[],
  edges: ADCEdge[],
): { nodeIds: Set<string>; edgeIds: Set<string> } {
  const outMap = new Map<string, Neighbor[]>();
  const inMap = new Map<string, Neighbor[]>();

  for (const edge of edges) {
    const kind = edge.data?.kind ?? 'execution';
    if (!outMap.has(edge.source)) outMap.set(edge.source, []);
    outMap.get(edge.source)!.push({ nodeId: edge.target, edgeId: edge.id, edgeKind: kind });
    if (!inMap.has(edge.target)) inMap.set(edge.target, []);
    inMap.get(edge.target)!.push({ nodeId: edge.source, edgeId: edge.id, edgeKind: kind });
  }

  const nodeIds = new Set<string>([originId]);
  const edgeIds = new Set<string>();

  const origin = nodes.find((n) => n.id === originId);
  if (!origin) return { nodeIds, edgeIds };

  if (origin.type === 'persona') {
    // Highlight all child prompt nodes of this group
    for (const n of nodes) {
      if (n.parentId === originId) nodeIds.add(n.id);
    }
    return { nodeIds, edgeIds };
  }

  if (origin.type === 'prompt') {
    // Direct execution targets
    const directTools = outMap.get(originId) ?? [];
    for (const { nodeId, edgeId } of directTools) {
      nodeIds.add(nodeId);
      edgeIds.add(edgeId);
    }
    // BFS forward through specialization from those tools
    const queue = directTools.map((n) => n.nodeId);
    const visited = new Set<string>([originId, ...queue]);
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const { nodeId, edgeId, edgeKind } of outMap.get(current) ?? []) {
        if (edgeKind !== 'specialization') continue;
        nodeIds.add(nodeId);
        edgeIds.add(edgeId);
        if (!visited.has(nodeId)) {
          visited.add(nodeId);
          queue.push(nodeId);
        }
      }
    }
  } else {
    // BFS backward — all edge kinds
    const backQueue = [originId];
    const backVisited = new Set<string>([originId]);
    while (backQueue.length > 0) {
      const current = backQueue.shift()!;
      for (const { nodeId, edgeId } of inMap.get(current) ?? []) {
        nodeIds.add(nodeId);
        edgeIds.add(edgeId);
        if (!backVisited.has(nodeId)) {
          backVisited.add(nodeId);
          backQueue.push(nodeId);
        }
      }
    }
    // BFS forward — specialization only
    const fwdQueue = [originId];
    const fwdVisited = new Set<string>([originId]);
    while (fwdQueue.length > 0) {
      const current = fwdQueue.shift()!;
      for (const { nodeId, edgeId, edgeKind } of outMap.get(current) ?? []) {
        if (edgeKind !== 'specialization') continue;
        nodeIds.add(nodeId);
        edgeIds.add(edgeId);
        if (!fwdVisited.has(nodeId)) {
          fwdVisited.add(nodeId);
          fwdQueue.push(nodeId);
        }
      }
    }
  }

  return { nodeIds, edgeIds };
}
