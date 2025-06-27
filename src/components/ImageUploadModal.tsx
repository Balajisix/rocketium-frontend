import React, { useState } from "react";
import axios from "axios";
// const API = "http://localhost:5000/api/canvas";
const API = "https://rocketium-backend.vercel.app/api/canvas"

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (src: string) => void;
}

const ImageUploadModal: React.FC<Props> = ({ isOpen, onClose, onInsert }) => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");

  const handleInsert = async () => {
    try {
      if (file) {
        const formData = new FormData();
        formData.append("image", file);

        const res = await axios.post(`${API}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        onInsert(res.data.url);
      } else if (url.trim()) {
        onInsert(url.trim());
      }
      onClose();
    } catch (err) {
      alert("Image upload failed.");
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative z-50 bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload or Insert Image</h2>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-3"
        />

        <div className="text-center text-gray-500 mb-3">or</div>

        <input
          type="text"
          placeholder="Paste image URL here"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
