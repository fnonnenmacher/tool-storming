# Tool Storming ⚡

A visual, web-based workspace for AI architects. Map user prompts by persona, connect them to the exact tools they need, and model the generic-to-specific lineage of those tools on a 1–10 axis — before writing a single line of code.

This is a **design artifact**, not an execution engine. Use it to communicate architecture decisions, surface tool reuse opportunities, and share a self-contained HTML snapshot with stakeholders — no server required.

## Try It

| Option | How |
|--------|-----|
| **Live app** | Open [toolstorming.nonnenmacher.dev](https://toolstorming.nonnenmacher.dev/) in any modern browser |
| **Offline / shareable file** | Download `index.html` from the [latest release](https://github.com/fnonnenmacher/tool-storming/releases/latest) and open it by double-clicking — no install, no server |

---

## Key Concepts

- **Personas** — groups of related prompts (e.g. "Product Manager", "Customer Support Agent"). Displayed as a stacked list on the left of the canvas.
- **Prompt nodes** — user requests inside a persona (e.g. "Who are my top-selling customers this month?"). Each prompt connects directly to every tool it needs.
- **Tool nodes** — capabilities available to an agent, snapped to a 1–10 specificity axis. Four categories:
  - **Data Products** (green) — SQL databases, data warehouses
  - **Knowledge Products** (blue) — search engines, document indices
  - **Operational Products** (yellow) — business logic APIs, ERP integrations
  - **User Interfaces** (purple) — table renderers, chart generators, dashboards
- **Execution edges** (amber) — a prompt pointing to a tool it directly requires.
- **Specialization edges** (indigo) — a generic tool pointing to a more specific variant. Direction is always left → right on the 1–10 axis.
- **1–10 X-axis** — tools snap to columns. Column 1 = maximally generic (e.g. `SQL Query Tool`). Column 10 = maximally specific (e.g. `get_top_customers_monthly`).

Click any node to highlight its full connected sub-graph. Everything else dims. Click the canvas background to reset.

---

## Getting Started

**Requires Node 18+**

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The canvas loads `public/sample.yaml` on first launch; subsequent launches restore the last session from `localStorage`.

---

## How to Use

| Action | How |
|--------|-----|
| Add a persona | Click **New Persona** in the right panel |
| Add a prompt | Click **+ Add prompt** inside a persona box |
| Add a tool | Click **New Tool** in the right panel |
| Edit a node | Click any persona, prompt, or tool — the right panel shows its fields. Start typing immediately; the first keypress updates the name without clicking into the field. |
| Delete a node | Select it, then press **Delete/Backspace** (before typing), or use the **Delete** button at the bottom of the right panel |
| Connect a prompt to a tool | Drag from the prompt's right handle to a tool node |
| Connect tool specialization | Drag between two tool nodes (direction auto-corrects left → right) |
| Delete a connection | Click the edge to select it, then press **×** or **Delete/Backspace** |
| Reorder prompts | Drag a prompt up or down within its persona box |
| Move a tool | Drag it; it snaps to the nearest column and updates its specificity score |
| Highlight sub-graph | Click any node |
| Reset highlighting | Click the canvas background |
| Fit canvas to screen | Click the minimap (bottom-right) |
| Save canvas | Click **Save YAML** — prompts for a filename |
| Load canvas | Click **Load YAML** — opens a file picker |
| Export image | Click **PNG** (3× resolution) or **SVG** in the toolbar — both prompt for a filename |
| Share canvas | Click **Share** — encodes the canvas as a URL and copies it to the clipboard |
| Reset to sample | Click **Reset canvas** in the right panel (asks for confirmation) |

Canvas state is saved to `localStorage` automatically on every change.

---

## Building a Self-Contained HTML File

The app can be compiled into a **single `index.html`** file (~520 KB) that runs directly in any modern browser — no web server, no install.

```bash
npm run build
```

This produces `dist/index.html`. Open it by double-clicking or dragging into a browser window. The file is fully self-contained: all JS, CSS, and the sample canvas data are inlined.

**Notes:**
- `localStorage` works under `file://` but is scoped to the file's path. Moving the file to a different location starts a fresh session.
- The sample canvas (`public/sample.yaml`) is embedded at build time. To ship a different default canvas, edit `public/sample.yaml` before building.
- Export PNG / SVG continue to work from the standalone file.
- The **Share** button encodes the canvas as base64 in the URL hash. The resulting URL works from a hosted deployment; for `file://` use, share the HTML file directly instead.

---

## Project Structure

| Path | Responsibility |
|------|---------------|
| `public/sample.yaml` | Default canvas loaded on first launch; also the target of **Reset canvas** |
| `src/types/index.ts` | TypeScript interfaces (`ADCNode`, `ADCEdge`, `PromptNodeData`, `ToolNodeData`, `PersonaGroupData`, …) |
| `src/store/useStore.ts` | Zustand store with `persist` middleware: all graph mutations, persona layout, YAML load/save |
| `src/utils/personaLayout.ts` | Shared layout constants (`GROUP_WIDTH`, `PROMPT_ROW_HEIGHT`, `HEADER_HEIGHT`, …) |
| `src/utils/yamlIO.ts` | `parseCanvas` / `serializeCanvas` — YAML ↔ ReactFlow state, with legacy schema support |
| `src/utils/snapToColumn.ts` | `pixelXToColumn` / `columnToPixelX` — column snapping math |
| `src/utils/graphTraversal.ts` | BFS to compute the highlighted sub-graph for a selected node |
| `src/utils/exportPng.ts` | PNG (3× pixel ratio) and SVG export via `html-to-image` |
| `src/utils/sampleData.ts` | Inlines `public/sample.yaml` as a string at build time (enables standalone HTML) |
| `src/components/Canvas/` | `CanvasArea`, `ToolbarButtons` |
| `src/components/nodes/` | `PromptNode`, `ToolNode`, `PersonaGroupNode` — custom ReactFlow node renderers |
| `src/components/edges/` | `CustomEdge` — execution / specialization edge styling |
| `src/components/Drawer/` | Always-visible right panel: action buttons + node editor fields |
| `src/components/WelcomeOverlay.tsx` | Intro overlay shown on first launch and after reset |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vite + React + TypeScript |
| Canvas | `@xyflow/react` v12 |
| State | `zustand` v5 (with `persist` middleware) |
| Styling | Tailwind CSS v4 |
| YAML | `js-yaml` |
| Export | `html-to-image` v1.11.11 |
| Single-file build | `vite-plugin-singlefile` |

---

## Development Notes

**YAML schema** — see `public/sample.yaml` for the full format. Personas carry only `id` and `label`; positions are derived from array order at load time. Prompts reference their persona via `parentId` and tools via `toolIds`. Tools reference their generic parent via `specializesId`. X position is derived from `specificity`; Y is stored explicitly.

**Legacy YAML** — files without a `personas:` section (prompts have a `persona:` string instead of `parentId`) are auto-migrated on load: persona group nodes are generated from unique persona names and prompts are assigned as children.

**Persona layout** — all persona nodes are non-draggable and automatically stacked top-to-bottom. Adding or deleting a prompt resizes its parent and re-stacks all personas. Layout constants live in `src/utils/personaLayout.ts`; changing `GROUP_WIDTH` there propagates to all nodes on the next relayout.

**Edge direction rules**
- Prompt → Tool: always valid
- Tool → Tool: only valid; direction auto-corrects so `specificity(source) ≤ specificity(target)` (left → right)
- All other combinations: blocked

**Adding a tool category** — add a value to `ToolCategory` in `src/types/index.ts`, then add matching entries to the category maps in `src/components/nodes/ToolNode.tsx` and `src/components/Drawer/DrawerFields.tsx`.
