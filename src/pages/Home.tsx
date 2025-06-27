import { useState } from "react";
import CanvasEditor from "../components/CanvasEditor";
import CanvasList from "../components/CanvasList";
import Topbar from "../components/Topbar";
import SaveModal from "../components/SaveModal";
import ImageUploadModal from "../components/ImageUploadModal";
import axios from "axios";
import type { CanvasElement } from "../types";
import { Square, Circle, Type, Image, Download, RotateCcw, Save } from 'lucide-react';

// const API = "http://localhost:5000/api/canvas";
const API = "https://rocketium-backend.vercel.app/api/canvas"

function Home() {
  const [canvasId, setCanvasId] = useState("");
  const [width, setWidth] = useState("600");
  const [height, setHeight] = useState("400");
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [canvasName, setCanvasName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [defaultCanvasName, setDefaultCanvasName] = useState("Canvas 1");
  const [selectedElementIndex, setSelectedElementIndex] = useState<number | null>(null);
  const [showImageUploader, setShowImageUploader] = useState(false);

  const saveCanvas = async (name: string) => {
    const parsedWidth = parseInt(width);
    const parsedHeight = parseInt(height);

    if (!parsedWidth || !parsedHeight) {
      alert("Enter valid canvas size");
      return;
    }

    if (canvasId) {
      const res = await axios.put(`${API}/${canvasId}`, {
        width: parsedWidth,
        height: parsedHeight,
        name,
        elements,
      });
      setCanvasName(res.data.name);
    } else {
      const res = await axios.post(API, {
        width: parsedWidth,
        height: parsedHeight,
        name,
        elements,
      });
      setCanvasId(res.data._id);
      setCanvasName(res.data.name);
    }

    setShowSaveModal(false);
  };

  const openSaveModal = async () => {
    if (canvasId) {
      await saveCanvas(canvasName);
    } else {
      try {
        const res = await axios.get(`${API}/count`);
        const nextName = `Canvas ${res.data.count + 1}`;
        setDefaultCanvasName(nextName);
      } catch {
        setDefaultCanvasName("Canvas 1");
      }
      setShowSaveModal(true);
    }
  };

  const resetForm = () => {
    setCanvasId("");
    setCanvasName("");
    setWidth("600");
    setHeight("400");
    setElements([]);
  };

  const addElement = (el: any) => {
    setElements((prev) => [...prev, el]);
  };

  const exportPDF = async () => {
    if (!canvasId) {
      alert("Please save the canvas before exporting.");
      return;
    }

    const res = await axios.get(`${API}/${canvasId}/export`, {
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "canvas.pdf";
    link.click();
  };

  const loadCanvas = async (id: any) => {
    if (!id) return;
    const res = await axios.get(`${API}/${id}`);
    setCanvasId(res.data._id);
    setWidth(res.data.width.toString());
    setHeight(res.data.height.toString());
    setElements(res.data.elements);
    setCanvasName(res.data.name);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-700 tracking-tight">
        Canvas Builder
      </h1>

      <CanvasList onSelect={loadCanvas} />

      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
            Width
          </label>
          <input
            id="width"
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="Width"
            className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
            Height
          </label>
          <input
            id="height"
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Height"
            className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={exportPDF}
          className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center w-50 h-11"
        >
          <Download size={20} className="mr-2" />
          Export PDF
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-3 bg-gray-100 p-3 rounded-lg shadow-sm">
        <button
          onClick={() =>
            addElement({
              type: "rectangle",
              properties: { x: 50, y: 50, width: 100, height: 60, color: "#e74c3c" },
            })
          }
          className="bg-red-100 hover:bg-red-200 p-3 rounded-lg transition shadow-sm"
          aria-label="Add Rectangle"
        >
          <Square size={24} />
        </button>
        <button
          onClick={() =>
            addElement({
              type: "circle",
              properties: { x: 150, y: 100, radius: 40, color: "#3498db" },
            })
          }
          className="bg-blue-100 hover:bg-blue-200 p-3 rounded-lg transition shadow-sm"
          aria-label="Add Circle"
        >
          <Circle size={24} />
        </button>
        <button
          onClick={() =>
            addElement({
              type: "text",
              properties: { text: "Hello", x: 100, y: 200, fontSize: 20, color: "#2c3e50" },
            })
          }
          className="bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition shadow-sm"
          aria-label="Add Text"
        >
          <Type size={24} />
        </button> 
        <button
          onClick={() => setShowImageUploader(true)}
          className="bg-green-100 hover:bg-green-200 p-3 rounded-lg transition shadow-sm"
          aria-label="Add Image"
        >
          <Image size={24} />
        </button>
        {showImageUploader && (
          <ImageUploadModal
          isOpen={showImageUploader}
          onClose={() => setShowImageUploader(false)}
          onInsert={(url: string) => {
            addElement({
              type: "image",
              properties: {
                src: url,
                x: 200,
                y: 150,
                width: 100,
                height: 100,
              },
            });
            setShowImageUploader(false);
          }}
        />
        )}
      </div>

      <Topbar
        onAdd={addElement}
        selectedElement={elements[selectedElementIndex ?? -1]}
        onUpdate={(updated) => {
          if (selectedElementIndex !== null) {
            const newElements = [...elements];
            newElements[selectedElementIndex] = updated;
            setElements(newElements);
          }
        }}
        onDelete={() => {
          if (selectedElementIndex !== null) {
            const newElements = elements.filter((_, i) => i !== selectedElementIndex);
            setElements(newElements);
            setSelectedElementIndex(null);
          }
        }}
      />

      <div className="mt-8 border rounded-lg shadow-lg overflow-auto bg-white p-4">
        <CanvasEditor
          width={parseInt(width)}
          height={parseInt(height)}
          elements={elements}
          setElements={setElements}
          selectedIndex={selectedElementIndex}
          onSelect={setSelectedElementIndex}
        />
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={resetForm}
          className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition flex items-center shadow-sm"
        >
          <RotateCcw size={20} className="mr-2" />
          Reset
        </button>
        <button
          onClick={openSaveModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center shadow-sm"
        >
          <Save size={20} className="mr-2" />
          {canvasId ? "Save Changes" : "Save Canvas"}
        </button>
      </div>

      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={saveCanvas}
        defaultName={defaultCanvasName}
      />
    </div>
  );
}

export default Home;