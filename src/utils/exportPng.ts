import { toPng, toSvg } from 'html-to-image';

export async function exportPng(filename = 'tool-storming.png'): Promise<void> {
  const viewport = document.querySelector<HTMLElement>('.react-flow__viewport');
  if (!viewport) return;
  const dataUrl = await toPng(viewport, { cacheBust: true, pixelRatio: 3 });
  const a = document.createElement('a');
  a.download = filename;
  a.href = dataUrl;
  a.click();
}

export async function exportSvg(filename = 'tool-storming.svg'): Promise<void> {
  const viewport = document.querySelector<HTMLElement>('.react-flow__viewport');
  if (!viewport) return;
  const dataUrl = await toSvg(viewport, { cacheBust: true });
  const a = document.createElement('a');
  a.download = filename;
  a.href = dataUrl;
  a.click();
}
