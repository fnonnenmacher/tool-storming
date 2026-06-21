import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import type { OnNodesChange, OnEdgesChange, OnConnect } from '@xyflow/react';
import type { ADCNode, ADCEdge, ToolNodeData, PromptNodeData, PersonaGroupData, ADCPersonaNode, ADCPromptNode } from '@/types';
import { parseCanvas } from '@/utils/yamlIO';
import { sampleYaml } from '@/utils/sampleData';
import { pixelXToColumn, columnToPixelX } from '@/utils/snapToColumn';
import { HEADER_HEIGHT, PROMPT_ROW_HEIGHT, BOTTOM_BUTTON_ZONE, MIN_GROUP_HEIGHT, GROUP_WIDTH, GROUP_X, PROMPT_X, PROMPT_WIDTH } from '@/utils/personaLayout';

// Recalculate all persona Y positions as a stacked list and enforce current GROUP_WIDTH / PROMPT_WIDTH
function relaidPersonaNodes(nodes: ADCNode[]): ADCNode[] {
  const personas = nodes.filter((n) => n.type === 'persona');
  let y = 50;
  const yMap = new Map<string, number>();
  for (const p of personas) {
    yMap.set(p.id, y);
    const height = (p.style?.height as number | undefined) ?? MIN_GROUP_HEIGHT;
    y += height + 16;
  }
  return nodes.map((n) => {
    if (n.type === 'persona' && yMap.has(n.id)) {
      return { ...n, position: { x: GROUP_X, y: yMap.get(n.id)! }, draggable: false, style: { ...n.style, width: GROUP_WIDTH } };
    }
    if (n.type === 'prompt' && n.parentId && yMap.has(n.parentId)) {
      return { ...n, style: { ...n.style, width: PROMPT_WIDTH } };
    }
    return n;
  }) as ADCNode[];
}

interface ADCStore {
  nodes: ADCNode[];
  edges: ADCEdge[];
  onNodesChange: OnNodesChange<ADCNode>;
  onEdgesChange: OnEdgesChange<ADCEdge>;
  onConnect: OnConnect;
  activeNodeId: string | null;
  drawerNodeId: string | null;
  requestFitToNodeId: string | null;
  showWelcome: boolean;
  setActiveNodeId: (id: string | null) => void;
  setDrawerNodeId: (id: string | null) => void;
  setRequestFitToNodeId: (id: string | null) => void;
  setShowWelcome: (show: boolean) => void;
  addNode: (node: ADCNode) => void;
  addPersonaNode: (label: string) => void;
  addPromptToPersona: (personaId: string, label: string) => void;
  reorderPersonaPrompts: (personaId: string) => void;
  updatePersonaData: (id: string, patch: Partial<PersonaGroupData>) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  updateToolData: (id: string, patch: Partial<ToolNodeData>) => void;
  updatePromptData: (id: string, patch: Partial<PromptNodeData>) => void;
  snapNodeToColumn: (id: string, pixelX: number) => void;
  loadFromYaml: (yamlStr: string) => void;
  resetCanvas: () => void;
}

export const useStore = create<ADCStore>()(persist((set, get) => ({
  nodes: [],
  edges: [],

  onNodesChange: (changes) => {
    const removeIds = new Set(
      changes.filter((c) => c.type === 'remove').map((c) => c.id),
    );

    set((s) => {
      const orphanIds = removeIds.size > 0
        ? s.nodes.filter((n) => n.parentId && removeIds.has(n.parentId)).map((n) => n.id)
        : [];

      const allRemovedIds = new Set([...removeIds, ...orphanIds]);

      const augmentedChanges = orphanIds.length > 0
        ? [...changes, ...orphanIds.map((id) => ({ type: 'remove' as const, id }))]
        : changes;

      const updatedNodes = applyNodeChanges(augmentedChanges, s.nodes) as unknown as ADCNode[];

      const updatedEdges = allRemovedIds.size > 0
        ? s.edges.filter((e) => !allRemovedIds.has(e.source) && !allRemovedIds.has(e.target))
        : s.edges;

      return {
        nodes: removeIds.size > 0 ? relaidPersonaNodes(updatedNodes) : updatedNodes,
        edges: updatedEdges,
      };
    });
  },

  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) as unknown as ADCEdge[] })),

  onConnect: (connection) => {
    const { nodes } = get();
    const source = nodes.find((n) => n.id === connection.source);
    const target = nodes.find((n) => n.id === connection.target);
    if (!source || !target) return;

    const isPromptToTool = source.type === 'prompt' && target.type === 'tool';
    const isToolToTool = source.type === 'tool' && target.type === 'tool';

    if (isPromptToTool) {
      set((s) => ({
        edges: addEdge(
          { ...connection, type: 'custom', data: { kind: 'execution' } },
          s.edges,
        ) as ADCEdge[],
      }));
    } else if (isToolToTool) {
      const srcSpec = (source as { data: ToolNodeData }).data.specificity;
      const tgtSpec = (target as { data: ToolNodeData }).data.specificity;
      const [finalSrc, finalTgt] =
        srcSpec <= tgtSpec ? [connection.source, connection.target] : [connection.target, connection.source];
      set((s) => ({
        edges: addEdge(
          { ...connection, source: finalSrc, target: finalTgt, type: 'custom', data: { kind: 'specialization' } },
          s.edges,
        ) as ADCEdge[],
      }));
    }
  },

  activeNodeId: null,
  drawerNodeId: null,
  requestFitToNodeId: null,
  showWelcome: false,

  setActiveNodeId: (id) => set({ activeNodeId: id }),
  setDrawerNodeId: (id) => set({ drawerNodeId: id }),
  setRequestFitToNodeId: (id) => set({ requestFitToNodeId: id }),
  setShowWelcome: (show) => set({ showWelcome: show }),

  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),

  addPersonaNode: (label) => {
    const newPersonaId = `persona-${Date.now()}`;
    const newNode: ADCPersonaNode = {
      id: newPersonaId,
      type: 'persona',
      position: { x: GROUP_X, y: 0 },
      data: { kind: 'persona', label },
      style: { width: GROUP_WIDTH, height: MIN_GROUP_HEIGHT },
      draggable: false,
    };
    set((s) => ({
      nodes: relaidPersonaNodes([...s.nodes, newNode]),
      drawerNodeId: newPersonaId,
      activeNodeId: newPersonaId,
    }));
  },

  addPromptToPersona: (personaId, label) => {
    const { nodes } = get();
    const children = nodes.filter((n) => n.parentId === personaId && n.type === 'prompt');
    const childIndex = children.length;

    const newGroupHeight = Math.max(
      MIN_GROUP_HEIGHT,
      HEADER_HEIGHT + (childIndex + 1) * PROMPT_ROW_HEIGHT + BOTTOM_BUTTON_ZONE,
    );

    const newPromptId = `prompt-${Date.now()}`;

    const newPromptNode: ADCPromptNode = {
      id: newPromptId,
      type: 'prompt',
      position: { x: PROMPT_X, y: HEADER_HEIGHT + childIndex * PROMPT_ROW_HEIGHT },
      parentId: personaId,
      extent: 'parent',
      style: { width: PROMPT_WIDTH },
      data: { kind: 'prompt', label },
    };

    set((s) => ({
      nodes: relaidPersonaNodes([
        ...s.nodes.map((n) =>
          n.id === personaId
            ? { ...n, style: { ...n.style, width: GROUP_WIDTH, height: newGroupHeight } }
            : n,
        ),
        newPromptNode,
      ] as ADCNode[]),
      drawerNodeId: newPromptId,
      activeNodeId: newPromptId,
    }));
  },

  reorderPersonaPrompts: (personaId) => {
    const { nodes } = get();
    const children = nodes
      .filter((n) => n.parentId === personaId && n.type === 'prompt')
      .sort((a, b) => a.position.y - b.position.y);

    if (children.length === 0) return;

    set((s) => ({
      nodes: s.nodes.map((n) => {
        const idx = children.findIndex((c) => c.id === n.id);
        if (idx === -1) return n;
        return { ...n, position: { x: PROMPT_X, y: HEADER_HEIGHT + idx * PROMPT_ROW_HEIGHT } };
      }) as ADCNode[],
    }));
  },

  updatePersonaData: (id, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id && n.type === 'persona'
          ? { ...n, data: { ...n.data, ...patch } }
          : n,
      ) as ADCNode[],
    })),

  deleteNode: (id) => {
    set((s) => {
      const nodeToDelete = s.nodes.find((n) => n.id === id);
      const toDelete = new Set([id]);
      for (const n of s.nodes) {
        if (n.parentId === id) toDelete.add(n.id);
      }
      const filteredNodes = s.nodes.filter((n) => !toDelete.has(n.id));

      // Shrink persona and re-stack siblings when a prompt is deleted
      let nodesAfterResize = filteredNodes;
      if (nodeToDelete?.type === 'prompt' && nodeToDelete.parentId) {
        const parentId = nodeToDelete.parentId;
        // Sort remaining siblings by y to preserve visual order
        const remaining = filteredNodes
          .filter((n) => n.parentId === parentId && n.type === 'prompt')
          .sort((a, b) => a.position.y - b.position.y);
        const newHeight = Math.max(
          MIN_GROUP_HEIGHT,
          HEADER_HEIGHT + remaining.length * PROMPT_ROW_HEIGHT + BOTTOM_BUTTON_ZONE,
        );
        const reStackedY = new Map(remaining.map((r, idx) => [r.id, HEADER_HEIGHT + idx * PROMPT_ROW_HEIGHT]));
        nodesAfterResize = filteredNodes.map((n) => {
          if (n.id === parentId) return { ...n, style: { ...n.style, height: newHeight } };
          const newY = reStackedY.get(n.id);
          if (newY !== undefined) return { ...n, position: { x: PROMPT_X, y: newY } };
          return n;
        }) as ADCNode[];
      }

      return {
        nodes: relaidPersonaNodes(nodesAfterResize),
        edges: s.edges.filter((e) => !toDelete.has(e.source) && !toDelete.has(e.target)),
        activeNodeId: s.activeNodeId && toDelete.has(s.activeNodeId) ? null : s.activeNodeId,
        drawerNodeId: s.drawerNodeId && toDelete.has(s.drawerNodeId) ? null : s.drawerNodeId,
      };
    });
  },

  deleteEdge: (id) => set((s) => ({ edges: s.edges.filter((e) => e.id !== id) })),

  updateToolData: (id, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id && n.type === 'tool'
          ? { ...n, data: { ...n.data, ...patch } }
          : n,
      ) as ADCNode[],
    })),

  updatePromptData: (id, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id && n.type === 'prompt'
          ? { ...n, data: { ...n.data, ...patch } }
          : n,
      ) as ADCNode[],
    })),

  snapNodeToColumn: (id, pixelX) => {
    const col = pixelXToColumn(pixelX);
    const snappedX = columnToPixelX(col);
    set((s) => {
      const updatedNodes = s.nodes.map((n) =>
        n.id === id && n.type === 'tool'
          ? { ...n, position: { ...n.position, x: snappedX }, data: { ...n.data, specificity: col } }
          : n,
      ) as ADCNode[];

      const fixedEdges = s.edges.map((e) => {
        if (e.data?.kind !== 'specialization') return e;
        if (e.source !== id && e.target !== id) return e;
        const src = updatedNodes.find((n) => n.id === e.source);
        const tgt = updatedNodes.find((n) => n.id === e.target);
        if (!src || !tgt || src.type !== 'tool' || tgt.type !== 'tool') return e;
        const srcSpec = (src.data as ToolNodeData).specificity;
        const tgtSpec = (tgt.data as ToolNodeData).specificity;
        if (srcSpec > tgtSpec) {
          return { ...e, source: e.target, target: e.source, sourceHandle: e.targetHandle, targetHandle: e.sourceHandle };
        }
        return e;
      });

      return { nodes: updatedNodes, edges: fixedEdges };
    });
  },

  loadFromYaml: (yamlStr) => {
    const { nodes, edges } = parseCanvas(yamlStr);
    set({ nodes: relaidPersonaNodes(nodes), edges, activeNodeId: null, drawerNodeId: null });
  },

  resetCanvas: () => {
    const { nodes, edges } = parseCanvas(sampleYaml);
    set({ nodes: relaidPersonaNodes(nodes), edges, activeNodeId: null, drawerNodeId: null, showWelcome: true });
  },
}), {
  name: 'tool-storming-v1',
  partialize: (s) => ({ nodes: s.nodes, edges: s.edges }),
  onRehydrateStorage: () => (state) => {
    if (state) {
      state.nodes = relaidPersonaNodes(state.nodes);
      state.showWelcome = state.nodes.length === 0;
    }
  },
}));
