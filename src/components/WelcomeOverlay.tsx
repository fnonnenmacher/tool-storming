import { X } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function WelcomeOverlay() {
  const showWelcome = useStore((s) => s.showWelcome);
  const setShowWelcome = useStore((s) => s.setShowWelcome);

  if (!showWelcome) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      onClick={() => setShowWelcome(false)}
    >
      <div
        className="relative mx-4 flex max-h-[88vh] max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowWelcome(false)}
          className="absolute right-3 top-3 z-10 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={16} />
        </button>

        <div className="overflow-y-auto px-8 py-8">
          <h1 className="mb-2 text-xl font-bold text-slate-800">Welcome to Tool Storming ⚡</h1>
          <p className="mb-6 text-sm leading-relaxed text-slate-500">
            <strong className="text-slate-700">Tool Storming</strong> is a visual design workspace for mapping AI
            agent architectures. It allows you to explore and balance your system's capabilities before writing code.
          </p>

          <hr className="mb-6 border-slate-100" />

          <h2 className="mb-2 text-sm font-bold text-slate-800">What is Tool Storming?</h2>
          <p className="mb-3 text-xs leading-relaxed text-slate-500">
            Unlike traditional flowchart tools that map sequential code logic, Tool Storming focuses entirely on the{' '}
            <strong className="text-slate-700">relationship between user intent and tool capabilities</strong>.
          </p>
          <ul className="mb-6 space-y-2.5">
            <li className="flex gap-2.5 text-xs leading-relaxed text-slate-500">
              <span className="mt-0.5 shrink-0 text-slate-300">•</span>
              <span>
                <strong className="text-slate-700">Map User Intent:</strong> Define user personas and the exact
                prompts you expect the agent to handle.
              </span>
            </li>
            <li className="flex gap-2.5 text-xs leading-relaxed text-slate-500">
              <span className="mt-0.5 shrink-0 text-slate-300">•</span>
              <span>
                <strong className="text-slate-700">Multi-Tool Implementation:</strong> A single user request rarely
                relies on just one tool. The canvas allows you to connect a single prompt to multiple tools
                simultaneously (e.g., a data retriever <em>and</em> a UI layout component).
              </span>
            </li>
            <li className="flex gap-2.5 text-xs leading-relaxed text-slate-500">
              <span className="mt-0.5 shrink-0 text-slate-300">•</span>
              <span>
                <strong className="text-slate-700">Explore the Design Space:</strong> Visualize your entire backend
                layout to determine exactly where to rely on generic LLM orchestration versus hardcoded service
                endpoints.
              </span>
            </li>
          </ul>

          <hr className="mb-6 border-slate-100" />

          <h2 className="mb-2 text-sm font-bold text-slate-800">The Generic vs. Specific Challenge</h2>
          <p className="mb-3 text-xs leading-relaxed text-slate-500">
            A core challenge in agent design is navigating the trade-off between{' '}
            <strong className="text-slate-700">flexibility and reliability</strong>:
          </p>
          <ul className="mb-4 space-y-2.5">
            <li className="flex gap-2.5 text-xs leading-relaxed text-slate-500">
              <span className="mt-0.5 shrink-0 text-slate-300">•</span>
              <span>
                <strong className="text-slate-700">Generic Tools:</strong> Broad platform utilities (like a
                relational database explorer or an enterprise-wide vector search) offer massive flexibility. They
                allow your agent to solve a wide variety of unpredictable requests, but they require heavier LLM
                reasoning and carry a higher risk of unreliability or hallucination.
              </span>
            </li>
            <li className="flex gap-2.5 text-xs leading-relaxed text-slate-500">
              <span className="mt-0.5 shrink-0 text-slate-300">•</span>
              <span>
                <strong className="text-slate-700">Specific Tools:</strong> Hyper-targeted endpoints (like a
                dedicated credit card refund trigger or a custom fraud scoring service) offer absolute reliability.
                They execute narrow business logic with deterministic certainty, but they are rigid and cannot adapt
                to out-of-scope tasks.
              </span>
            </li>
          </ul>
          <p className="mb-6 text-xs leading-relaxed text-slate-500">
            Tool Storming visualizes this exact tension, giving your team a clear map to audit, discuss, and optimize
            the architectural boundaries of your agentic system.
          </p>

          <hr className="mb-6 border-slate-100" />

          <h2 className="mb-3 text-sm font-bold text-slate-800">Quick Start Guide</h2>
          <ol className="space-y-3">
            {[
              {
                label: 'Define Specificity:',
                text: 'Drag tool blocks horizontally from left to right to define how specific they are — placing broad platform utilities on the left and highly specialized APIs on the right.',
              },
              {
                label: 'Connect Tools to Prompts:',
                text: 'Draw arrows directly from a Prompt card on the left to every individual tool required to fulfill that specific user request.',
              },
              {
                label: 'Link Comparable Tools:',
                text: 'Draw arrows between tools that can be used for the same functional goal to map out structural relationships and show how a generic asset specializes into a targeted endpoint.',
              },
              {
                label: 'Click to Highlight:',
                text: 'Tap on any Prompt or Tool node. The rest of the canvas will dim, brightly highlighting the complete, isolated sub-graph of its execution requirements and structural lineage.',
              },
            ].map(({ label, text }, i) => (
              <li key={i} className="flex gap-3 text-xs leading-relaxed text-slate-500">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[9px] font-bold text-white">
                  {i + 1}
                </span>
                <span>
                  <strong className="text-slate-700">{label}</strong> {text}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="shrink-0 border-t border-slate-100 px-8 py-4">
          <button
            onClick={() => setShowWelcome(false)}
            className="w-full rounded-md bg-slate-800 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-700"
          >
            Start exploring
          </button>
        </div>
      </div>
    </div>
  );
}
