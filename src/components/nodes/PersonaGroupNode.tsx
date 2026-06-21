import type { NodeProps } from '@xyflow/react';
import type { ADCPersonaNode } from '@/types';
import { useStore } from '@/store/useStore';
import { Users } from 'lucide-react';

export function PersonaGroupNode({ id, data }: NodeProps<ADCPersonaNode>) {
  const addPromptToPersona = useStore((s) => s.addPromptToPersona);
  const activeNodeId = useStore((s) => s.activeNodeId);
  const isActive = activeNodeId === id;

  return (
    <div
      className={`
        h-full w-full rounded-xl border-2 border-dashed bg-slate-50/60
        transition-colors duration-150
        ${isActive ? 'border-slate-500 bg-slate-100/70' : 'border-slate-300'}
      `}
    >
      <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1">
        <Users size={11} className="flex-shrink-0 text-slate-400" />
        <span className="truncate text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {data.label as string}
        </span>
      </div>

      <button
        className="nodrag nopan absolute bottom-2 left-3 right-3 rounded-md border border-dashed border-slate-300 py-1 text-xs text-slate-400 transition-colors hover:border-slate-400 hover:bg-white hover:text-slate-600"
        onClick={(e) => {
          e.stopPropagation();
          addPromptToPersona(id, 'New Prompt');
        }}
      >
        + Add prompt
      </button>
    </div>
  );
}
