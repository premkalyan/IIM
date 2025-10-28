import React, { useEffect, useRef, useState } from "react";

interface Props {
  chart: string;
  theme?: "default" | "dark" | "forest" | "neutral";
}

export default function MermaidRenderer({ chart, theme = "default" }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAndRender() {
      if (!(window as any).mermaid) {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
        s.async = true;
        document.head.appendChild(s);
        await new Promise((res) => {
          s.onload = res;
          s.onerror = res;
        });
      }

      const mermaid = (window as any).mermaid;
      if (!mermaid) return;

      try {
        if (mermaid.initialize) {
          mermaid.initialize({ startOnLoad: false, theme });
        }

        // v10 uses mermaid.mermaidAPI.render which returns a promise
        const renderId = `mmd-${Math.random().toString(36).slice(2, 9)}`;
        let out = null;
        if (mermaid.mermaidAPI && mermaid.mermaidAPI.render) {
          out = await mermaid.mermaidAPI.render(renderId, chart);
          // mermaidAPI.render returns svg string in v10
        } else if (mermaid.render) {
          // older API: mermaid.render(id, txt, cb)
          await new Promise<void>((res, rej) => {
            try {
              mermaid.render(renderId, chart, (svgCode: string) => {
                out = svgCode;
                res();
              });
            } catch (e) {
              res();
            }
          });
        }

        if (!cancelled) {
          if (out && typeof out === "string") setSvg(out as string);
          else if (out && out.svg) setSvg(out.svg as string);
        }
      } catch (err) {
        console.error("Mermaid render error", err);
      }
    }

    loadAndRender();

    return () => {
      cancelled = true;
    };
  }, [chart, theme]);

  useEffect(() => {
    if (containerRef.current && svg) {
      containerRef.current.innerHTML = svg;
    }
  }, [svg]);

  const downloadSVG = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "architecture.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = async () => {
    if (!svg) return;
    const svgStr = svg;
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const png = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = png;
      a.download = "architecture.png";
      a.click();
      URL.revokeObjectURL(url);
    };
    img.onerror = (e) => {
      console.error("Image load error", e);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(chart);
      // quick visual feedback could be added
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <button onClick={downloadSVG} className="rounded-md bg-muted px-3 py-1 text-sm">Download SVG</button>
        <button onClick={downloadPNG} className="rounded-md bg-muted px-3 py-1 text-sm">Download PNG</button>
        <button onClick={copyToClipboard} className="rounded-md bg-muted px-3 py-1 text-sm">Copy Mermaid</button>
      </div>
      <div ref={containerRef} />
      {!svg && <div className="text-sm text-muted-foreground">Rendering diagram...</div>}
    </div>
  );
}
