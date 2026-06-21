import type { ToolNodeData, ToolCategory } from '@/types';
import { useStore } from '@/store/useStore';
import { columnToPixelX } from '@/utils/snapToColumn';

const categories: { value: ToolCategory; label: string; color: string }[] = [
  { value: 'data', label: 'Data Product', color: 'bg-green-500' },
  { value: 'knowledge', label: 'Knowledge Base', color: 'bg-blue-500' },
  { value: 'operational', label: 'Operational', color: 'bg-yellow-500' },
  { value: 'ui', label: 'User Interface', color: 'bg-purple-500' },
];

interface Props {
  nodeId: string;
  data: ToolNodeData;
}

export function DrawerFields({ nodeId, data }: Props) {
  const updateToolData = useStore((s) => s.updateToolData);
  const snapNodeToColumn = useStore((s) => s.snapNodeToColumn);
  const update = (patch: Partial<ToolNodeData>) => updateToolData(nodeId, patch);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="field-label">Name</label>
        <input
          className="field-input"
          autoFocus
          value={data.label}
          onChange={(e) => update({ label: e.target.value })}
        />
      </div>

      <div>
        <label className="field-label">Category</label>
        <div className="mt-1 flex flex-col gap-1.5">
          {categories.map((c) => (
            <label key={c.value} className="flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="radio"
                name={`category-${nodeId}`}
                value={c.value}
                checked={data.category === c.value}
                onChange={() => update({ category: c.value })}
                className="accent-slate-600"
              />
              <span className={`h-2.5 w-2.5 rounded-full ${c.color}`} />
              {c.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="field-label">X-Axis (Specificity)</label>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={data.specificity}
          onChange={(e) => snapNodeToColumn(nodeId, columnToPixelX(parseInt(e.target.value)))}
          className="mt-1 w-full accent-slate-600"
        />
        <div className="mt-0.5 flex justify-between text-[10px] text-slate-400">
          <span>Generic</span>
          <span className="font-medium text-slate-600">{data.specificity} / 10</span>
          <span>Specific</span>
        </div>
      </div>

      <div>
        <label className="field-label">LLM System Instruction</label>
        <textarea
          className="field-input h-24 resize-none"
          value={data.systemInstruction}
          onChange={(e) => update({ systemInstruction: e.target.value })}
        />
      </div>

      <div>
        <label className="field-label">Input Schema</label>
        <input
          className="field-input"
          value={data.inputSchema}
          onChange={(e) => update({ inputSchema: e.target.value })}
        />
      </div>

      <div>
        <label className="field-label">Output Schema</label>
        <input
          className="field-input"
          value={data.outputSchema}
          onChange={(e) => update({ outputSchema: e.target.value })}
        />
      </div>

      <div>
        <label className="field-label">Est. Latency</label>
        <input
          className="field-input"
          value={data.latencyProfile}
          onChange={(e) => update({ latencyProfile: e.target.value })}
        />
      </div>
    </div>
  );
}
