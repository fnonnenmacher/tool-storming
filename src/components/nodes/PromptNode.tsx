import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { ADCPromptNode, ComplexityLevel, ValueLevel } from '@/types';
import { useStore } from '@/store/useStore';
import { useHighlight } from '@/hooks/useHighlight';
import { Zap, Star } from 'lucide-react';

const complexityColor: Record<ComplexityLevel, string> = {
  low: 'text-green-500',
  medium: 'text-amber-500',
  high: 'text-red-500',
};

const valueColor: Record<ValueLevel, string> = {
  low: 'text-slate-400',
  medium: 'text-blue-500',
  high: 'text-emerald-600',
};

const levelLabel: Record<ComplexityLevel, string> = {
  low: 'L',
  medium: 'M',
  high: 'H',
};

export function PromptNode({ id, data }: NodeProps<ADCPromptNode>) {
  const activeNodeId = useStore((s) => s.activeNodeId);
  const { nodeIds } = useHighlight();

  const dimmed = activeNodeId !== null && nodeIds !== null && !nodeIds.has(id);
  const complexity = data.complexity as ComplexityLevel | undefined;
  const value = data.value as ValueLevel | undefined;

  return (
    <div
      className={`
        w-full h-[70px] rounded-md border bg-white px-3 pt-2 pb-2
        flex flex-col overflow-hidden
        transition-opacity duration-200
        ${dimmed ? 'opacity-20' : 'opacity-100'}
        ${activeNodeId === id ? 'border-slate-500 ring-1 ring-slate-400' : 'border-slate-200'}
      `}
    >
      <p className="text-xs font-medium leading-snug text-slate-700 pr-3 line-clamp-2 flex-1">{data.label as string}</p>
      {(complexity || value) && (
        <div className="flex items-center gap-2.5 mt-auto">
          {complexity && (
            <span className={`flex items-center gap-0.5 text-[10px] font-medium ${complexityColor[complexity]}`} title={`Complexity: ${complexity}`}>
              <Zap size={9} />
              {levelLabel[complexity]}
            </span>
          )}
          {value && (
            <span className={`flex items-center gap-0.5 text-[10px] font-medium ${valueColor[value]}`} title={`Value: ${value}`}>
              <Star size={9} />
              {levelLabel[value]}
            </span>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="!bg-slate-400" style={{ width: 14, height: 14 }} />
    </div>
  );
}
