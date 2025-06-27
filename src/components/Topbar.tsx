import { useState, useEffect } from "react";
import type { CanvasElement, ElementType } from "../types";
import ImageUploadModal from "./ImageUploadModal";

interface Props {
  onAdd: (el: CanvasElement) => void;
  selectedElement?: CanvasElement;
  onUpdate: (el: CanvasElement) => void;
  onDelete: () => void;
}

const Topbar: React.FC<Props> = ({ onAdd, selectedElement, onUpdate, onDelete }) => {
  const [type, setType] = useState<ElementType>("rectangle");
  const [properties, setProperties] = useState<any>({
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    radius: 50,
    text: "",
    fontSize: 20,
    color: "#000000",
    src: "",
  });
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (selectedElement) {
      setType(selectedElement.type);
      setProperties({ ...properties, ...selectedElement.properties });
    }
  }, [selectedElement]);

  useEffect(() => {
    if (type === "image") setShowImageModal(true);
  }, [type]);

  const handleChange = (key: string, value: any) => {
    const updated = { ...properties, [key]: value };
    setProperties(updated);
    if (selectedElement) onUpdate({ type, properties: updated });
  };

  const handleAdd = () => {
    const newProps = { ...properties };
    if (type !== "text") delete newProps.text;
    if (type !== "image") delete newProps.src;
    if (type !== "circle") delete newProps.radius;

    onAdd({ type, properties: newProps });

    setProperties({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      radius: 50,
      text: "",
      fontSize: 20,
      color: "#000000",
      src: "",
    });
    setType("rectangle");
  };

  return (
    <div className="bg-white border-b p-3 flex flex-wrap gap-3 items-center shadow-md sticky top-0 z-30">
      <select
        value={type}
        onChange={(e) => setType(e.target.value as ElementType)}
        className="border p-2 rounded"
      >
        <option value="rectangle">Rectangle</option>
        <option value="circle">Circle</option>
        <option value="text">Text</option>
        <option value="image">Image</option>
      </select>

      <input
        type="number"
        placeholder="X"
        value={properties.x ?? ""}
        onChange={(e) => handleChange("x", e.target.value)}
        className="w-20 border p-2 rounded"
      />
      <input
        type="number"
        placeholder="Y"
        value={properties.y ?? ""}
        onChange={(e) => handleChange("y", e.target.value)}
        className="w-20 border p-2 rounded"
      />

      {(type === "rectangle" || type === "image") && (
        <>
          <input
            type="number"
            placeholder="Width"
            value={properties.width ?? ""}
            onChange={(e) => handleChange("width", e.target.value)}
            className="w-20 border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Height"
            value={properties.height ?? ""}
            onChange={(e) => handleChange("height", e.target.value)}
            className="w-20 border p-2 rounded"
          />
        </>
      )}

      {type === "circle" && (
        <input
          type="number"
          placeholder="Radius"
          value={properties.radius ?? ""}
          onChange={(e) => handleChange("radius", e.target.value)}
          className="w-24 border p-2 rounded"
        />
      )}

      {type === "text" && (
        <>
          <input
            type="text"
            placeholder="Text"
            value={properties.text ?? ""}
            onChange={(e) => handleChange("text", e.target.value)}
            className="border p-2 rounded w-40"
          />
          <input
            type="number"
            placeholder="Font Size"
            value={properties.fontSize ?? ""}
            onChange={(e) => handleChange("fontSize", e.target.value)}
            className="w-24 border p-2 rounded"
          />
        </>
      )}

      <input
        type="color"
        value={properties.color}
        onChange={(e) => handleChange("color", e.target.value)}
        className="w-10 h-10 p-0 border"
      />

      {selectedElement ? (
        <button
          onClick={onDelete}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete
        </button>
      ) : (
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      )}

      {type === "image" && (
        <ImageUploadModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          onInsert={(src: string) => {
            setProperties({ ...properties, src });
            setShowImageModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Topbar;
