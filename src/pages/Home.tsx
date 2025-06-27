// src/routes/Home.tsx
import { useState } from "react";
import CanvasEditor from "../components/CanvasEditor";
import axios from "axios";
import type { CanvasElement } from "../types";

const API = "http://localhost:5000/api/canvas";

function Home() {
  const [canvasId, setCanvasId] = useState<string>("");
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  const [elements, setElements] = useState<CanvasElement[]>([]);

  const createCanvas = async () => {
    const res = await axios.post(API, { width, height });
    setCanvasId(res.data._id);
    setElements([]);
  };

  const addElement = async (el: CanvasElement) => {
    if (!canvasId) return;
    await axios.post(`${API}/${canvasId}/elements`, el);
    setElements([...elements, el]);
  };

  const exportPDF = async () => {
    const res = await axios.get(`${API}/${canvasId}/export`, {
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "canvas.pdf";
    link.click();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Canvas Builder</h1>

      <div className="mb-4 flex gap-2">
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          placeholder="Width"
          className="border p-2 w-24"
        />
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          placeholder="Height"
          className="border p-2 w-24"
        />
        <button onClick={createCanvas} className="bg-blue-500 text-white px-4 py-2">
          Init Canvas
        </button>
        <button onClick={exportPDF} className="bg-green-600 text-white px-4 py-2 ml-2">
          Export PDF
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() =>
            addElement({
              type: "rectangle",
              properties: { x: 50, y: 50, width: 100, height: 60, color: "#e74c3c" },
            })
          }
          className="bg-gray-200 px-3 py-2"
        >
          + Rectangle
        </button>
        <button
          onClick={() =>
            addElement({
              type: "circle",
              properties: { x: 150, y: 100, radius: 40, color: "#3498db" },
            })
          }
          className="bg-gray-200 px-3 py-2"
        >
          + Circle
        </button>
        <button
          onClick={() =>
            addElement({
              type: "text",
              properties: { text: "Hello", x: 100, y: 200, fontSize: 20, color: "#2c3e50" },
            })
          }
          className="bg-gray-200 px-3 py-2"
        >
          + Text
        </button>
        <button
          onClick={() =>
            addElement({
              type: "image",
              properties: {
                src: "https://via.placeholder.com/100",
                x: 200,
                y: 150,
                width: 100,
                height: 100,
              },
            })
          }
          className="bg-gray-200 px-3 py-2"
        >
          + Image
        </button>
      </div>

      <CanvasEditor width={width} height={height} elements={elements} />
    </div>
  );
}

export default Home;
