import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { ADCToolNode } from '@/types';
import { useStore } from '@/store/useStore';
import { useHighlight } from '@/hooks/useHighlight';

const categoryStyles: Record<string, string> = {
  data: 'bg-green-100 border-green-500 text-green-900',
  knowledge: 'bg-blue-100 border-blue-500 text-blue-900',
  operational: 'bg-yellow-100 border-yellow-500 text-yellow-900',
  ui: 'bg-purple-100 border-purple-500 text-purple-900',
};

const categoryLabel: Record<string, string> = {
  data: 'Data Product',
  knowledge: 'Knowledge Base',
  operational: 'Operational',
  ui: 'User Interface',
};

const handleStyle = { width: 14, height: 14 };

export function ToolNode({ id, data }: NodeProps<ADCToolNode>) {
  const activeNodeId = useStore((s) => s.activeNodeId);
  const { nodeIds } = useHighlight();

  const dimmed = activeNodeId !== null && nodeIds !== null && !nodeIds.has(id);
  const category = data.category as string;
  const specificity = data.specificity as number;

  return (
    <div
      className={`
        w-56 rounded-xl border-2 p-3 shadow-sm
        transition-opacity duration-200
        ${categoryStyles[category] ?? categoryStyles.data}
        ${dimmed ? 'opacity-20' : 'opacity-100'}
        ${activeNodeId === id ? 'ring-2 ring-offset-1 ring-black' : ''}
      `}
    >
      <Handle type="target" position={Position.Left} className="!bg-current" style={handleStyle} />
      <p className="font-semibold text-sm leading-tight">{data.label as string}</p>
      <span className="mt-1 block text-xs opacity-60">
        &laquo;{categoryLabel[category]}&raquo;
      </span>
      <div className="mt-1.5 flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full bg-current ${i < specificity ? 'opacity-70' : 'opacity-15'}`}
          />
        ))}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-current" style={handleStyle} />
    </div>
  );
}
