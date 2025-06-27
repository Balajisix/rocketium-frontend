import React, { useEffect, useRef } from "react";
import type { CanvasElement } from "../types";

interface Props {
  width: number;
  height: number;
  elements: CanvasElement[];
}

const CanvasEditor: React.FC<Props> = ({ width, height, elements }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Render elements
    elements.forEach((el) => {
      const props = el.properties;
      switch (el.type) {
        case "rectangle":
          ctx.fillStyle = props.color || "black";
          ctx.fillRect(props.x, props.y, props.width, props.height);
          break;
        case "circle":
          ctx.fillStyle = props.color || "black";
          ctx.beginPath();
          ctx.arc(props.x, props.y, props.radius, 0, 2 * Math.PI);
          ctx.fill();
          break;
        case "text":
          ctx.fillStyle = props.color || "black";
          ctx.font = `${props.fontSize || 16}px sans-serif`;
          ctx.fillText(props.text, props.x, props.y);
          break;
        case "image":
          const img = new Image();
          img.src = props.src;
          img.onload = () => {
            ctx.drawImage(img, props.x, props.y, props.width, props.height);
          };
          break;
      }
    });
  }, [width, height, elements]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-gray-300"
    />
  );
};

export default CanvasEditor;
