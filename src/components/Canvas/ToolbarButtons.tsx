import { useRef, useState } from 'react';
import { Download, Upload, Image, FileImage, Link } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { serializeCanvas } from '@/utils/yamlIO';
import { exportPng, exportSvg } from '@/utils/exportPng';

function encodeForUrl(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))));
}

export function ToolbarButtons() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const loadFromYaml = useStore((s) => s.loadFromYaml);
  const [copied, setCopied] = useState(false);

  function handleSaveYaml() {
    const raw = window.prompt('Save as:', 'canvas.yaml');
    if (!raw) return;
    const filename = raw.endsWith('.yaml') || raw.endsWith('.yml') ? raw : `${raw}.yaml`;
    const yamlStr = serializeCanvas(nodes, edges);
    const blob = new Blob([yamlStr], { type: 'text/yaml' });
    const a = document.createElement('a');
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleLoadYaml(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      loadFromYaml(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function handleExportPng() {
    const raw = window.prompt('Export as:', 'tool-storming.png');
    if (!raw) return;
    const filename = raw.endsWith('.png') ? raw : `${raw}.png`;
    await exportPng(filename);
  }

  async function handleExportSvg() {
    const raw = window.prompt('Export as:', 'tool-storming.svg');
    if (!raw) return;
    const filename = raw.endsWith('.svg') ? raw : `${raw}.svg`;
    await exportSvg(filename);
  }

  function handleShare() {
    const yamlStr = serializeCanvas(nodes, edges);
    const encoded = encodeForUrl(yamlStr);
    const url = `${window.location.origin}${window.location.pathname}#canvas=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50"
      >
        <Upload size={13} />
        Load YAML
      </button>
      <button
        onClick={handleSaveYaml}
        className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50"
      >
        <Download size={13} />
        Save YAML
      </button>
      <button
        onClick={handleExportPng}
        className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50"
      >
        <Image size={13} />
        PNG
      </button>
      <button
        onClick={handleExportSvg}
        className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50"
      >
        <FileImage size={13} />
        SVG
      </button>
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50"
      >
        <Link size={13} />
        {copied ? 'Copied!' : 'Share'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".yaml,.yml"
        className="hidden"
        onChange={handleLoadYaml}
      />
    </div>
  );
}
