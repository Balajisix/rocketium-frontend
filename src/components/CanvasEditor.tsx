import { useRef, useEffect, useState } from "react";
import type { CanvasElement } from "../types";

interface Props {
  width: number;
  height: number;
  elements: CanvasElement[];
  setElements: (els: CanvasElement[]) => void;
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
}

const handleSize = 8;

const CanvasEditor: React.FC<Props> = ({
  width,
  height,
  elements,
  setElements,
  selectedIndex,
  onSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [resizing, setResizing] = useState<{ corner: string } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const drawGuidelines = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    const centerX = x + w / 2;
    const centerY = y + h / 2;

    const canvasCenterX = width / 2;
    const canvasCenterY = height / 2;

    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;

    if (Math.abs(centerX - canvasCenterX) < 5) {
      ctx.beginPath();
      ctx.moveTo(canvasCenterX, 0);
      ctx.lineTo(canvasCenterX, height);
      ctx.stroke();
    }

    if (Math.abs(centerY - canvasCenterY) < 5) {
      ctx.beginPath();
      ctx.moveTo(0, canvasCenterY);
      ctx.lineTo(width, canvasCenterY);
      ctx.stroke();
    }
  };

  const drawHandles = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    const handles = [
      [x, y], 
      [x + w / 2, y], 
      [x + w, y], 
      [x + w, y + h / 2], 
      [x + w, y + h],
      [x + w / 2, y + h], 
      [x, y + h], 
      [x, y + h / 2], 
    ];

    ctx.fillStyle = "blue";
    for (const [hx, hy] of handles) {
      ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, width, height);

    elements.forEach((el, index) => {
      const { type, properties } = el;
      const { x, y, width: w, height: h, radius, text, fontSize, color, src } = properties;

      ctx.fillStyle = color || "#000";

      if (type === "rectangle") {
        ctx.fillRect(x, y, w, h);
      } else if (type === "circle") {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      } else if (type === "text") {
        ctx.font = `${fontSize || 16}px sans-serif`;
        ctx.fillText(text, x, y);
      } else if (type === "image") {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          ctx.drawImage(img, x, y, w, h);
        };
      }

      if (index === selectedIndex && (type === "rectangle" || type === "image" || type === "text")) {
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);

        drawHandles(ctx, x, y, w, h);
        drawGuidelines(ctx, x, y, w, h);
      }
    });
  }, [elements, width, height, selectedIndex]);

  const getElementAtPosition = (x: number, y: number): number | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      const { type, properties } = el;
      const px = properties.x;
      const py = properties.y;

      if (type === "rectangle" || type === "image" || type === "text") {
        const w = properties.width;
        const h = properties.height;
        if (x >= px && x <= px + w && y >= py && y <= py + h) return i;
      } else if (type === "circle") {
        const dx = x - px;
        const dy = y - py;
        if (dx * dx + dy * dy <= properties.radius * properties.radius) return i;
      }
    }
    return null;
  };

  const getResizeHandle = (x: number, y: number, el: CanvasElement): string | null => {
    const { x: ex, y: ey, width: w, height: h } = el.properties;
    const handles = {
      "tl": [ex, ey],
      "tr": [ex + w, ey],
      "bl": [ex, ey + h],
      "br": [ex + w, ey + h],
    };

    for (const [corner, [hx, hy]] of Object.entries(handles)) {
      if (
        x >= hx - handleSize &&
        x <= hx + handleSize &&
        y >= hy - handleSize &&
        y <= hy + handleSize
      ) {
        return corner;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const index = getElementAtPosition(x, y);
    if (index !== null) {
      const el = elements[index];

      const resizeCorner = getResizeHandle(x, y, el);
      if (resizeCorner) {
        setResizing({ corner: resizeCorner });
      } else {
        setDraggingIndex(index);
        setOffset({ x: x - el.properties.x, y: y - el.properties.y });
      }

      onSelect(index);
    } else {
      onSelect(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingIndex === null && !resizing) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updated = [...elements];

    if (resizing && selectedIndex !== null) {
      const el = updated[selectedIndex];
      const { x: px, y: py, width: w, height: h } = el.properties;

      let newWidth = w;
      let newHeight = h;
      let newX = px;
      let newY = py;

      if (resizing.corner === "br") {
        newWidth = x - px;
        newHeight = y - py;
      } else if (resizing.corner === "tl") {
        newWidth = w + (px - x);
        newHeight = h + (py - y);
        newX = x;
        newY = y;
      } else if (resizing.corner === "tr") {
        newWidth = x - px;
        newHeight = h + (py - y);
        newY = y;
      } else if (resizing.corner === "bl") {
        newWidth = w + (px - x);
        newHeight = y - py;
        newX = x;
      }

      el.properties.x = newX;
      el.properties.y = newY;
      el.properties.width = Math.max(10, newWidth);
      el.properties.height = Math.max(10, newHeight);

      setElements(updated);
      return;
    }

    if (draggingIndex !== null) {
      const el = updated[draggingIndex];
      el.properties.x = x - offset.x;
      el.properties.y = y - offset.y;
      setElements(updated);
    }
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
    setResizing(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-gray-400 bg-white"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
};

export default CanvasEditor;
