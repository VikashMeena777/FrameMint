'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Type,
  Square,
  Circle,
  Download,
  Undo2,
  Redo2,
  Trash2,
  Palette,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  Layers,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Move,
  MousePointer,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThumbnailEditorProps {
  imageUrl?: string;
  width?: number;
  height?: number;
  onSave?: (dataUrl: string) => void;
}

type ToolType = 'select' | 'text' | 'rect' | 'circle' | 'move';

export function ThumbnailEditor({
  imageUrl,
  width = 1280,
  height = 720,
  onSave,
}: ThumbnailEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [fillColor, setFillColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#8b5cf6');
  const [fontSize, setFontSize] = useState(48);
  const [zoom, setZoom] = useState(0.5);
  const [canUndo, setCanUndo] = useState(false);
  const [selectedObj, setSelectedObj] = useState<any>(null);

  // History for undo/redo
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  const saveHistory = useCallback(() => {
    if (!fabricRef.current) return;
    const json = JSON.stringify(fabricRef.current.toJSON());
    const idx = historyIndexRef.current;
    historyRef.current = historyRef.current.slice(0, idx + 1);
    historyRef.current.push(json);
    historyIndexRef.current = historyRef.current.length - 1;
    setCanUndo(historyIndexRef.current > 0);
  }, []);

  // Initialize Fabric canvas
  useEffect(() => {
    let mounted = true;

    const initCanvas = async () => {
      const fabric = await import('fabric');
      if (!mounted || !canvasRef.current) return;

      const canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: '#1a1a2e',
        selection: true,
      });

      fabricRef.current = canvas;

      // Set zoom
      canvas.setZoom(zoom);
      const scaledWidth = width * zoom;
      const scaledHeight = height * zoom;
      canvas.setDimensions({ width: scaledWidth, height: scaledHeight });

      // Load background image if provided
      if (imageUrl) {
        try {
          const img = await fabric.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
          img.scaleToWidth(width);
          img.scaleToHeight(height);
          canvas.backgroundImage = img;
          canvas.renderAll();
        } catch (err) {
          console.error('Failed to load background image:', err);
        }
      }

      // Track selection
      canvas.on('selection:created', (e: any) => setSelectedObj(e.selected?.[0]));
      canvas.on('selection:updated', (e: any) => setSelectedObj(e.selected?.[0]));
      canvas.on('selection:cleared', () => setSelectedObj(null));
      canvas.on('object:modified', () => saveHistory());

      saveHistory();
    };

    initCanvas();

    return () => {
      mounted = false;
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  // Update zoom
  useEffect(() => {
    if (!fabricRef.current) return;
    fabricRef.current.setZoom(zoom);
    fabricRef.current.setDimensions({
      width: width * zoom,
      height: height * zoom,
    });
    fabricRef.current.renderAll();
  }, [zoom, width, height]);

  /* ---------- tool actions ---------- */

  const addText = useCallback(async () => {
    const fabric = await import('fabric');
    const canvas = fabricRef.current;
    if (!canvas) return;

    const text = new fabric.IText('Your Text', {
      left: width / 2 - 100,
      top: height / 2 - 30,
      fontFamily: 'Outfit, sans-serif',
      fontSize,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: 2,
      fontWeight: 'bold',
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.5)',
        blur: 8,
        offsetX: 2,
        offsetY: 2,
      }),
      textAlign: 'center',
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveHistory();
  }, [fillColor, strokeColor, fontSize, width, height, saveHistory]);

  const addRect = useCallback(async () => {
    const fabric = await import('fabric');
    const canvas = fabricRef.current;
    if (!canvas) return;

    const rect = new fabric.Rect({
      left: width / 2 - 75,
      top: height / 2 - 50,
      width: 150,
      height: 100,
      fill: 'rgba(139, 92, 246, 0.3)',
      stroke: strokeColor,
      strokeWidth: 2,
      rx: 12,
      ry: 12,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    saveHistory();
  }, [strokeColor, width, height, saveHistory]);

  const addCircle = useCallback(async () => {
    const fabric = await import('fabric');
    const canvas = fabricRef.current;
    if (!canvas) return;

    const circle = new fabric.Circle({
      left: width / 2 - 50,
      top: height / 2 - 50,
      radius: 50,
      fill: 'rgba(236, 72, 153, 0.3)',
      stroke: strokeColor,
      strokeWidth: 2,
    });

    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
    saveHistory();
  }, [strokeColor, width, height, saveHistory]);

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length) {
      active.forEach((obj: any) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
      saveHistory();
    }
  }, [saveHistory]);

  const undo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx <= 0) return;
    historyIndexRef.current = idx - 1;
    const json = historyRef.current[historyIndexRef.current];
    fabricRef.current?.loadFromJSON(json).then(() => {
      fabricRef.current?.renderAll();
      setCanUndo(historyIndexRef.current > 0);
    });
  }, []);

  const redo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx >= historyRef.current.length - 1) return;
    historyIndexRef.current = idx + 1;
    const json = historyRef.current[historyIndexRef.current];
    fabricRef.current?.loadFromJSON(json).then(() => {
      fabricRef.current?.renderAll();
      setCanUndo(historyIndexRef.current > 0);
    });
  }, []);

  const exportImage = useCallback(
    (format: 'png' | 'jpeg' = 'png') => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      // Reset zoom for full-res export
      canvas.setZoom(1);
      canvas.setDimensions({ width, height });

      const dataUrl = canvas.toDataURL({
        format,
        quality: format === 'jpeg' ? 0.95 : 1,
        multiplier: 1,
      });

      // Download
      const link = document.createElement('a');
      link.download = `framemint-thumbnail.${format}`;
      link.href = dataUrl;
      link.click();

      // Restore zoom
      canvas.setZoom(zoom);
      canvas.setDimensions({ width: width * zoom, height: height * zoom });
      canvas.renderAll();

      onSave?.(dataUrl);
    },
    [width, height, zoom, onSave]
  );

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool);
    if (tool === 'text') addText();
    if (tool === 'rect') addRect();
    if (tool === 'circle') addCircle();
  };

  /* ---------- toolbar button ---------- */

  const ToolBtn = ({
    icon: Icon,
    label,
    active,
    onClick,
    disabled,
  }: {
    icon: any;
    label: string;
    active?: boolean;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'p-2 rounded-lg transition-all duration-200',
        active
          ? 'bg-[var(--fm-primary)] text-white shadow-lg shadow-purple-500/20'
          : 'text-[var(--fm-text-secondary)] hover:bg-white/10 hover:text-[var(--fm-text)]',
        disabled && 'opacity-30 cursor-not-allowed'
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Top toolbar */}
      <div className="glass-card-static rounded-xl px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        {/* Tools */}
        <div className="flex items-center gap-1">
          <ToolBtn icon={MousePointer} label="Select" active={activeTool === 'select'} onClick={() => setActiveTool('select')} />
          <ToolBtn icon={Move} label="Pan" active={activeTool === 'move'} onClick={() => setActiveTool('move')} />
          <div className="w-px h-6 bg-white/10 mx-1" />
          <ToolBtn icon={Type} label="Add Text" active={activeTool === 'text'} onClick={() => handleToolClick('text')} />
          <ToolBtn icon={Square} label="Add Rectangle" active={activeTool === 'rect'} onClick={() => handleToolClick('rect')} />
          <ToolBtn icon={Circle} label="Add Circle" active={activeTool === 'circle'} onClick={() => handleToolClick('circle')} />
          <div className="w-px h-6 bg-white/10 mx-1" />
          <ToolBtn icon={Undo2} label="Undo" onClick={undo} disabled={!canUndo} />
          <ToolBtn icon={Redo2} label="Redo" onClick={redo} />
          <ToolBtn icon={Trash2} label="Delete" onClick={deleteSelected} disabled={!selectedObj} />
        </div>

        {/* Colors & font */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-[var(--fm-text-secondary)]" />
            <input
              type="color"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              title="Fill color"
            />
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              title="Stroke color"
            />
          </div>

          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="bg-white/5 text-[var(--fm-text)] border border-white/10 rounded-lg px-2 py-1 text-xs"
          >
            {[24, 32, 40, 48, 56, 64, 72, 96, 128].map((s) => (
              <option key={s} value={s}>
                {s}px
              </option>
            ))}
          </select>
        </div>

        {/* Zoom & export */}
        <div className="flex items-center gap-1">
          <ToolBtn icon={ZoomOut} label="Zoom Out" onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))} />
          <span className="text-xs text-[var(--fm-text-secondary)] w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <ToolBtn icon={ZoomIn} label="Zoom In" onClick={() => setZoom((z) => Math.min(2, z + 0.1))} />
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button
            onClick={() => exportImage('png')}
            className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export PNG
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="glass-card-static rounded-xl p-4 overflow-auto flex items-center justify-center min-h-[400px]">
        <div
          className="rounded-lg overflow-hidden shadow-2xl shadow-purple-500/10"
          style={{ width: width * zoom, height: height * zoom }}
        >
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Layers info */}
      <div className="glass-card-static rounded-xl px-4 py-2 flex items-center gap-2 text-xs text-[var(--fm-text-secondary)]">
        <Layers className="h-3.5 w-3.5" />
        <span>{width} × {height}px</span>
        <span>•</span>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
        {selectedObj && (
          <>
            <span>•</span>
            <span className="text-[var(--fm-primary)]">Object selected</span>
          </>
        )}
      </div>
    </div>
  );
}
