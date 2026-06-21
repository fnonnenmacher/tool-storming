import type { PromptNodeData, ComplexityLevel, ValueLevel } from '@/types';
import { useStore } from '@/store/useStore';

const LEVELS: Array<{ value: ComplexityLevel; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const complexityColors: Record<ComplexityLevel, string> = {
  low: 'border-green-400 bg-green-500 text-white',
  medium: 'border-amber-400 bg-amber-500 text-white',
  high: 'border-red-400 bg-red-500 text-white',
};

const valueColors: Record<ValueLevel, string> = {
  low: 'border-slate-300 bg-slate-500 text-white',
  medium: 'border-blue-400 bg-blue-500 text-white',
  high: 'border-emerald-400 bg-emerald-500 text-white',
};

const inactive = 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50';

interface Props {
  nodeId: string;
  data: PromptNodeData;
}

export function DrawerPromptFields({ nodeId, data }: Props) {
  const updatePromptData = useStore((s) => s.updatePromptData);
  const update = (patch: Partial<PromptNodeData>) => updatePromptData(nodeId, patch);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="field-label">Prompt text</label>
        <textarea
          className="field-input h-28 resize-none"
          autoFocus
          value={data.label}
          onChange={(e) => update({ label: e.target.value })}
        />
      </div>

      <div>
        <label className="field-label">Complexity</label>
        <div className="mt-1 flex gap-1.5">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => update({ complexity: l.value })}
              className={`flex-1 rounded-md border py-1 text-xs font-medium transition-colors ${
                data.complexity === l.value ? complexityColors[l.value] : inactive
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="field-label">Business Value</label>
        <div className="mt-1 flex gap-1.5">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => update({ value: l.value as ValueLevel })}
              className={`flex-1 rounded-md border py-1 text-xs font-medium transition-colors ${
                data.value === l.value ? valueColors[l.value as ValueLevel] : inactive
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
