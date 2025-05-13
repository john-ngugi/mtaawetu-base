// NotebookList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Notebook {
  id: number;
  title: string;
  file: string;
  created_at: string;
  notebook_html: string;
}

interface Props {
  onSelect: (notebook: Notebook) => void;
}

const NotebookList: React.FC<Props> = ({ onSelect }) => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://127.0.0.1:8000/data/api/notebooks/")
      .then((res) => {
        setNotebooks(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch notebooks:", err);
        setError("Failed to load notebooks. Please try again later.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="py-4">Loading notebooks...</div>;
  if (error) return <div className="py-4 text-red-500">{error}</div>;

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-4">Available Notebooks</h2>
      {notebooks.length === 0 ? (
        <p>No notebooks found.</p>
      ) : (
        <ul className="space-y-2">
          {notebooks.map((notebook) => (
            <li
              key={notebook.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onSelect(notebook)}
            >
              <div className="font-medium text-blue-600">{notebook.title}</div>
              <div className="text-sm text-gray-500 mt-1">
                Created: {new Date(notebook.created_at).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotebookList;
