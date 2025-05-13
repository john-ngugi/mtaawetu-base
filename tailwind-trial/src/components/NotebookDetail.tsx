// NotebookDetail.tsx
import React from "react";
import DOMPurify from "dompurify";
import { ArrowLeft } from "lucide-react";
// import { NotebookRender } from "react-notebook";

interface Notebook {
  id: number;
  title: string;
  file: string;
  created_at: string;
  notebook_html: string;
}

interface Props {
  notebook: Notebook;
  onBack: () => void;
}

const NotebookDetail: React.FC<Props> = ({ notebook, onBack }) => {
  // Sanitize the HTML content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(notebook.notebook_html);

  return (
    <div className="mt-4">
      <button
        onClick={onBack}
        className="mb-4 flex items-center text-blue-600 hover:underline"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to list
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start mb-4">
        <h3 className="text-2xl font-bold">{notebook.title}</h3>
        <div className="text-sm text-gray-500 mt-2 md:mt-0">
          Created: {new Date(notebook.created_at).toLocaleDateString()}
        </div>
      </div>

      {notebook.file && (
        <div className="mb-4">
          <a
            href={notebook.file}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Download Original Notebook
          </a>
        </div>
      )}

      <div
        className="notebook-content prose max-w-none border-t pt-4"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </div>
  );
};

export default NotebookDetail;
