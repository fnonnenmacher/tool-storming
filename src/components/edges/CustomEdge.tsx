import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import type { ADCEdge, EdgeKind } from '@/types';
import { useStore } from '@/store/useStore';
import { useHighlight } from '@/hooks/useHighlight';

const kindColor: Record<EdgeKind, string> = {
  execution: '#f59e0b',
  specialization: '#6366f1',
};

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<ADCEdge>) {
  const activeNodeId = useStore((s) => s.activeNodeId);
  const deleteEdge = useStore((s) => s.deleteEdge);
  const { edgeIds } = useHighlight();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const highlighted = edgeIds !== null && edgeIds.has(id);
  const dimmed = activeNodeId !== null && !highlighted;

  const kind = (data?.kind ?? 'execution') as EdgeKind;
  const color = (highlighted || selected) ? kindColor[kind] : '#94a3b8';
  const strokeWidth = selected ? 4 : highlighted ? 3 : 1;
  const opacity = dimmed ? 0.15 : 1;

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{ stroke: color, strokeWidth, opacity, transition: 'opacity 0.2s, stroke 0.2s' }}
      />
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              position: 'absolute',
              pointerEvents: 'all',
              zIndex: 10,
            }}
            className="nodrag nopan"
          >
            <button
              onClick={() => deleteEdge(id)}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-xs text-slate-500 shadow-sm hover:border-red-300 hover:bg-red-50 hover:text-red-500"
            >
              ×
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
