import { useStore } from '@/store/useStore';
import type { PersonaGroupData } from '@/types';

interface Props {
  nodeId: string;
  data: PersonaGroupData;
}

export function DrawerPersonaFields({ nodeId, data }: Props) {
  const updatePersonaData = useStore((s) => s.updatePersonaData);

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Persona Name
        </label>
        <input
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
          autoFocus
          value={data.label as string}
          onChange={(e) => updatePersonaData(nodeId, { label: e.target.value })}
        />
      </div>
    </div>
  );
}
