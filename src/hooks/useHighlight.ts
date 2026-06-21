import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { collectHighlightedIds } from '@/utils/graphTraversal';

export function useHighlight() {
  const activeNodeId = useStore((s) => s.activeNodeId);
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);

  return useMemo(() => {
    if (!activeNodeId) return { nodeIds: null, edgeIds: null };
    return collectHighlightedIds(activeNodeId, nodes, edges);
  }, [activeNodeId, nodes, edges]);
}
