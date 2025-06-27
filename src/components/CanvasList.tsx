import { useEffect, useState } from "react";
import axios from "axios";
// const API = "http://localhost:5000/api/canvas";
const API = "https://rocketium-backend.vercel.app/api/canvas"

interface Canvas {
  _id: string;
  name?: string;
}

interface Props {
  onSelect: (id: string) => void;
}

const CanvasList: React.FC<Props> = ({ onSelect }) => {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    const fetchCanvases = async () => {
      try {
        const res = await axios.get(`${API}`);
        setCanvases(res.data);
      } catch (error) {
        console.error("Failed to fetch canvas list:", error);
      }
    };
    fetchCanvases();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    onSelect(id); // trigger canvas loading in Home.tsx
  };

  return (
    <div className="mb-4">
      <label className="mr-2 font-semibold">Select Canvas:</label>
      <select
        value={selectedId}
        onChange={handleChange}
        className="border px-3 py-2 rounded w-64"
      >
        <option value="">-- Choose a canvas --</option>
        {canvases.map((canvas, index) => (
          <option key={canvas._id} value={canvas._id}>
            {canvas.name || `Canvas ${index + 1}`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CanvasList;
