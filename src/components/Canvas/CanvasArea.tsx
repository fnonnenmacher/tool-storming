import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { NodeMouseHandler, OnNodeDrag, EdgeMouseHandler } from '@xyflow/react';
import { useStore } from '@/store/useStore';
import { PromptNode } from '@/components/nodes/PromptNode';
import { ToolNode } from '@/components/nodes/ToolNode';
import { PersonaGroupNode } from '@/components/nodes/PersonaGroupNode';
import { CustomEdge } from '@/components/edges/CustomEdge';
import type { ADCNode } from '@/types';

const nodeTypes = { prompt: PromptNode, tool: ToolNode, persona: PersonaGroupNode };
const edgeTypes = { custom: CustomEdge };

// Renders the MiniMap (needs useReactFlow) and handles fit-to-node requests
function CanvasInternals() {
  const { setCenter, getNode, fitView } = useReactFlow();
  const requestId = useStore((s) => s.requestFitToNodeId);
  const clearRequest = useStore((s) => s.setRequestFitToNodeId);

  useEffect(() => {
    if (!requestId) return;
    const node = getNode(requestId);
    if (node) {
      const w = node.measured?.width ?? 192;
      const h = node.measured?.height ?? 50;
      setCenter(node.position.x + w / 2, node.position.y + h / 2, { zoom: 1.2, duration: 400 });
    }
    clearRequest(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  return (
    <MiniMap
      nodeStrokeWidth={3}
      pannable
      onClick={() => fitView({ duration: 450, padding: 0.12 })}
      style={{ cursor: 'pointer' }}
    />
  );
}

export function CanvasArea() {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const onNodesChange = useStore((s) => s.onNodesChange);
  const onEdgesChange = useStore((s) => s.onEdgesChange);
  const onConnect = useStore((s) => s.onConnect);
  const setActiveNodeId = useStore((s) => s.setActiveNodeId);
  const setDrawerNodeId = useStore((s) => s.setDrawerNodeId);
  const snapNodeToColumn = useStore((s) => s.snapNodeToColumn);
  const reorderPersonaPrompts = useStore((s) => s.reorderPersonaPrompts);
  const onNodeClick: NodeMouseHandler<ADCNode> = useCallback(
    (_, node) => {
      setActiveNodeId(node.id);
      setDrawerNodeId(node.id);
    },
    [setActiveNodeId, setDrawerNodeId],
  );

  const onPaneClick = useCallback(() => {
    setActiveNodeId(null);
    setDrawerNodeId(null);
  }, [setActiveNodeId, setDrawerNodeId]);

  const onEdgeClick: EdgeMouseHandler = useCallback(() => {
    setActiveNodeId(null);
    setDrawerNodeId(null);
  }, [setActiveNodeId, setDrawerNodeId]);

  const onNodeDragStop: OnNodeDrag<ADCNode> = useCallback(
    (_, node) => {
      if (node.type === 'tool') {
        snapNodeToColumn(node.id, node.position.x);
      } else if (node.type === 'prompt' && node.parentId) {
        reorderPersonaPrompts(node.parentId);
      }
    },
    [snapNodeToColumn, reorderPersonaPrompts],
  );

  return (
    <div className="relative h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        connectionRadius={80}
        deleteKeyCode={null}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        <Controls />
        <CanvasInternals />
      </ReactFlow>
    </div>
  );
}
