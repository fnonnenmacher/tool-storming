import type { Node, Edge } from '@xyflow/react';

export type ToolCategory = 'data' | 'knowledge' | 'operational' | 'ui';
export type EdgeKind = 'execution' | 'specialization';

export type ComplexityLevel = 'low' | 'medium' | 'high';
export type ValueLevel = 'low' | 'medium' | 'high';

export interface PromptNodeData extends Record<string, unknown> {
  kind: 'prompt';
  label: string;
  complexity?: ComplexityLevel;
  value?: ValueLevel;
}

export interface ToolNodeData extends Record<string, unknown> {
  kind: 'tool';
  label: string;
  category: ToolCategory;
  specificity: number;
  systemInstruction: string;
  inputSchema: string;
  outputSchema: string;
  latencyProfile: string;
}

export interface PersonaGroupData extends Record<string, unknown> {
  kind: 'persona';
  label: string;
}

export type ADCPromptNode = Node<PromptNodeData, 'prompt'>;
export type ADCToolNode = Node<ToolNodeData, 'tool'>;
export type ADCPersonaNode = Node<PersonaGroupData, 'persona'>;
export type ADCNode = ADCPromptNode | ADCToolNode | ADCPersonaNode;
export type ADCEdge = Edge<{ kind: EdgeKind }>;
