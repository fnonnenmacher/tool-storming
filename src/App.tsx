import { useEffect } from 'react';
import { CanvasArea } from '@/components/Canvas/CanvasArea';
import { Drawer } from '@/components/Drawer/Drawer';
import { ToolbarButtons } from '@/components/Canvas/ToolbarButtons';
import { WelcomeOverlay } from '@/components/WelcomeOverlay';
import { useStore } from '@/store/useStore';
import { sampleYaml } from '@/utils/sampleData';
import logo from '@/assets/logo.png';

function decodeFromUrl(b64: string): string {
  return decodeURIComponent(
    atob(b64).split('').map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
  );
}

export function App() {
  const loadFromYaml = useStore((s) => s.loadFromYaml);
  const setShowWelcome = useStore((s) => s.setShowWelcome);
  const openWelcome = () => setShowWelcome(true);

  useEffect(() => {
    // URL-shared canvas takes priority over everything
    const hash = window.location.hash;
    if (hash.startsWith('#canvas=')) {
      try {
        const decoded = decodeFromUrl(hash.slice('#canvas='.length));
        loadFromYaml(decoded);
        setShowWelcome(true);
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        return;
      } catch {
        // Invalid hash — fall through to normal loading
      }
    }
    // Skip sample if canvas was restored from localStorage
    if (useStore.getState().nodes.length > 0) return;
    loadFromYaml(sampleYaml);
  }, [loadFromYaml, setShowWelcome]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 shadow-sm">
        <button onClick={openWelcome} className="flex items-center gap-2.5 rounded hover:opacity-75 transition-opacity">
          <img src={logo} alt="Tool Storming" className="h-8 w-auto" />
          <div className="text-left">
            <h1 className="text-sm font-bold text-slate-800 tracking-tight">Tool Storming</h1>
            <p className="text-xs text-slate-400">V1</p>
          </div>
        </button>
        <ToolbarButtons />
      </header>
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-hidden">
          <CanvasArea />
        </main>
        <Drawer />
      </div>
      <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-1.5 text-center text-[11px] text-slate-400">
        © 2026{' '}
        <a href="https://nonnenmacher.dev" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-slate-600">
          Fabian Nonnenmacher
        </a>
        {' · '}
        <a href="https://github.com/fnonnenmacher/tool-storming/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-slate-600">
          Source on GitHub
        </a>
      </footer>
      <WelcomeOverlay />
    </div>
  );
}
