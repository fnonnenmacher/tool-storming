import { useCallback } from 'react';
import { X, Trash2, Plus, Users, RotateCcw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { DrawerFields } from './DrawerFields';
import { DrawerPromptFields } from './DrawerPromptFields';
import { DrawerPersonaFields } from './DrawerPersonaFields';
import { columnToPixelX } from '@/utils/snapToColumn';
import type { ADCToolNode, ADCPromptNode, ADCPersonaNode, ADCNode } from '@/types';

export function Drawer() {
  const drawerNodeId = useStore((s) => s.drawerNodeId);
  const nodes = useStore((s) => s.nodes);
  const setDrawerNodeId = useStore((s) => s.setDrawerNodeId);
  const setActiveNodeId = useStore((s) => s.setActiveNodeId);
  const deleteNode = useStore((s) => s.deleteNode);
  const addPersonaNode = useStore((s) => s.addPersonaNode);
  const addNode = useStore((s) => s.addNode);
  const resetCanvas = useStore((s) => s.resetCanvas);

  const node = nodes.find((n) => n.id === drawerNodeId);
  const toolNode = node?.type === 'tool' ? (node as ADCToolNode) : undefined;
  const promptNode = node?.type === 'prompt' ? (node as ADCPromptNode) : undefined;
  const personaNode = node?.type === 'persona' ? (node as ADCPersonaNode) : undefined;
  const nodeSelected = !!(toolNode || promptNode || personaNode);
  const title = toolNode ? 'Tool' : promptNode ? 'Prompt' : 'Persona';

  function handleClose() {
    setDrawerNodeId(null);
    setActiveNodeId(null);
  }

  function handleDelete() {
    if (drawerNodeId) deleteNode(drawerNodeId);
  }

  const handleAddTool = useCallback(() => {
    const newNode: ADCNode = {
      id: `tool-${Date.now()}`,
      type: 'tool',
      position: { x: columnToPixelX(5), y: 200 },
      data: {
        kind: 'tool',
        label: 'New Tool',
        category: 'data',
        specificity: 5,
        systemInstruction: '',
        inputSchema: '',
        outputSchema: '',
        latencyProfile: '',
      },
    };
    addNode(newNode);
    setDrawerNodeId(newNode.id);
    setActiveNodeId(newNode.id);
  }, [addNode, setDrawerNodeId, setActiveNodeId]);

  function handleReset() {
    if (!window.confirm('Reset canvas to the sample? All unsaved changes will be lost.')) return;
    resetCanvas();
  }

  return (
    <aside className="flex h-full w-72 flex-shrink-0 flex-col border-l border-slate-200 bg-white">
      {/* Action buttons */}
      <div className="space-y-1.5 p-3">
        <button
          onClick={() => addPersonaNode('New Persona')}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Users size={13} />
          New Persona
        </button>
        <button
          onClick={handleAddTool}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-800 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-700"
        >
          <Plus size={13} />
          New Tool
        </button>
        <button
          onClick={handleReset}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-100 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
        >
          <RotateCcw size={11} />
          Reset canvas
        </button>
      </div>

      <div className="border-t border-slate-100" />

      {nodeSelected ? (
        <>
          <div className="flex items-center justify-between px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</p>
            <button
              onClick={handleClose}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {toolNode && <DrawerFields key={toolNode.id} nodeId={toolNode.id} data={toolNode.data} />}
            {promptNode && <DrawerPromptFields key={promptNode.id} nodeId={promptNode.id} data={promptNode.data} />}
            {personaNode && <DrawerPersonaFields key={personaNode.id} nodeId={personaNode.id} data={personaNode.data} />}
          </div>
          <div className="border-t border-slate-100 px-4 py-3">
            <button
              onClick={handleDelete}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-red-200 py-2 text-xs font-medium text-red-500 transition-colors hover:border-red-300 hover:bg-red-50"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-slate-300">Select a node to edit</p>
        </div>
      )}
    </aside>
  );
}
