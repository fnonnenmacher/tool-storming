import * as yaml from 'js-yaml';
import type { ADCNode, ADCEdge, ADCPersonaNode, ADCPromptNode, ToolCategory, ComplexityLevel, ValueLevel } from '@/types';
import { columnToPixelX } from './snapToColumn';
import { HEADER_HEIGHT, PROMPT_ROW_HEIGHT, BOTTOM_BUTTON_ZONE, MIN_GROUP_HEIGHT, GROUP_WIDTH, GROUP_X, PROMPT_X, PROMPT_WIDTH } from './personaLayout';

interface YamlPersona {
  id: string;
  label: string;
}

interface YamlPrompt {
  id: string;
  label: string;
  parentId?: string;
  complexity?: ComplexityLevel;
  value?: ValueLevel;
  toolIds: string[];
}

interface YamlTool {
  id: string;
  label: string;
  category: ToolCategory;
  specificity: number;
  specializesId: string | null;
  systemInstruction: string;
  inputSchema: string;
  outputSchema: string;
  latencyProfile: string;
  y: number;
}

interface CanvasYaml {
  personas: YamlPersona[];
  prompts: YamlPrompt[];
  tools: YamlTool[];
}

export function parseCanvas(yamlStr: string): { nodes: ADCNode[]; edges: ADCEdge[] } {
  const doc = yaml.load(yamlStr) as CanvasYaml;
  const nodes: ADCNode[] = [];
  const edges: ADCEdge[] = [];

  const promptsPerPersona = new Map<string, number>();
  for (const p of doc.prompts ?? []) {
    if (p.parentId) promptsPerPersona.set(p.parentId, (promptsPerPersona.get(p.parentId) ?? 0) + 1);
  }

  for (const pg of doc.personas ?? []) {
    const count = promptsPerPersona.get(pg.id) ?? 0;
    const height = Math.max(MIN_GROUP_HEIGHT, HEADER_HEIGHT + count * PROMPT_ROW_HEIGHT + BOTTOM_BUTTON_ZONE);
    nodes.push({
      id: pg.id,
      type: 'persona',
      position: { x: GROUP_X, y: 0 },
      data: { kind: 'persona', label: pg.label },
      style: { width: GROUP_WIDTH, height },
    } as ADCPersonaNode);
  }

  const personaChildCount = new Map<string, number>();
  for (const p of doc.prompts ?? []) {
    const parentId = p.parentId;
    const childIndex = parentId ? (personaChildCount.get(parentId) ?? 0) : 0;
    if (parentId) personaChildCount.set(parentId, childIndex + 1);
    nodes.push({
      id: p.id,
      type: 'prompt',
      position: parentId ? { x: PROMPT_X, y: HEADER_HEIGHT + childIndex * PROMPT_ROW_HEIGHT } : { x: 40, y: 0 },
      ...(parentId ? { parentId, extent: 'parent' as const, style: { width: PROMPT_WIDTH } } : {}),
      data: { kind: 'prompt', label: p.label, complexity: p.complexity, value: p.value },
    } as ADCPromptNode);
    for (const toolId of p.toolIds ?? []) {
      edges.push({ id: `edge-${p.id}-${toolId}`, source: p.id, target: toolId, type: 'custom', data: { kind: 'execution' } });
    }
  }

  for (const t of doc.tools ?? []) {
    nodes.push({
      id: t.id,
      type: 'tool',
      position: { x: columnToPixelX(t.specificity), y: t.y },
      data: {
        kind: 'tool',
        label: t.label,
        category: t.category,
        specificity: t.specificity,
        systemInstruction: t.systemInstruction ?? '',
        inputSchema: t.inputSchema ?? '',
        outputSchema: t.outputSchema ?? '',
        latencyProfile: t.latencyProfile ?? '',
      },
    });
    if (t.specializesId) {
      edges.push({ id: `edge-${t.specializesId}-${t.id}`, source: t.specializesId, target: t.id, type: 'custom', data: { kind: 'specialization' } });
    }
  }

  return { nodes, edges };
}

export function serializeCanvas(nodes: ADCNode[], edges: ADCEdge[]): string {
  const personas: YamlPersona[] = [];
  const prompts: YamlPrompt[] = [];
  const tools: YamlTool[] = [];

  for (const node of nodes) {
    if (node.type === 'persona') {
      personas.push({
        id: node.id,
        label: node.data.label as string,
      });
    } else if (node.type === 'prompt') {
      const toolIds = edges
        .filter((e) => e.source === node.id && e.data?.kind === 'execution')
        .map((e) => e.target);
      prompts.push({
        id: node.id,
        label: node.data.label as string,
        parentId: node.parentId,
        complexity: node.data.complexity as ComplexityLevel | undefined,
        value: node.data.value as ValueLevel | undefined,
        toolIds,
      });
    } else if (node.type === 'tool') {
      const specializesEdge = edges.find((e) => e.target === node.id && e.data?.kind === 'specialization');
      tools.push({
        id: node.id,
        label: node.data.label as string,
        category: node.data.category as ToolCategory,
        specificity: node.data.specificity as number,
        specializesId: specializesEdge?.source ?? null,
        systemInstruction: node.data.systemInstruction as string,
        inputSchema: node.data.inputSchema as string,
        outputSchema: node.data.outputSchema as string,
        latencyProfile: node.data.latencyProfile as string,
        y: Math.round(node.position.y),
      });
    }
  }

  return yaml.dump({ personas, prompts, tools }, { lineWidth: 120 });
}
