import { useState } from "react";
import { createSubSection } from "../../api/api";

interface CreateSubSectionProps {
  sectionId: number;
  onCreated: () => void;
}

const CreateSubSection = ({ sectionId, onCreated }: CreateSubSectionProps) => {
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(1);
  const [type, setType] = useState<"video" | "pdf">("video");
  const [videoUrl, setVideoUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError("Lecture title is required");
      return false;
    }
    
    if (type === "video") {
      if (!videoUrl.trim()) {
        setError("Video URL is required");
        return false;
      }
    }
    
    if (type === "pdf") {
      if (!pdfFile) {
        setError("PDF file is required");
        return false;
      }
      if (pdfFile.size > 10 * 1024 * 1024) { // 10MB
        setError("PDF file must be less than 10MB");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const token = localStorage.getItem("access");
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      await createSubSection(token, {
        section: sectionId,
        title: title.trim(),
        order,
        content_type: type,
        video_url: type === "video" ? videoUrl : undefined,
        pdf_file: type === "pdf" ? pdfFile : undefined,
      });

      // Reset form
      setTitle("");
      setVideoUrl("");
      setPdfFile(undefined);
      setOrder(prev => prev + 1);
      onCreated();
    } catch (err: any) {
      console.error("Failed to create lecture:", err);
      setError(
        err.message || 
        "Failed to create lecture. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value as "video" | "pdf");
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPdfFile(file);
    if (error && error.includes("PDF")) setError("");
  };

  return (
    <div className="mt-2 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Lecture</h3>
      
      {error && (
        <div 
          className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div>
          <label htmlFor="lecture-title" className="block text-sm font-medium mb-1">
            Lecture Title *
          </label>
          <input
            id="lecture-title"
            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter lecture title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError("");
            }}
            disabled={loading}
            required
            maxLength={200}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="content-type" className="block text-sm font-medium mb-1">
              Content Type
            </label>
            <select
              id="content-type"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={type}
              onChange={handleTypeChange}
              disabled={loading}
            >
              <option value="video">Video</option>
              <option value="pdf">PDF Document</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="order" className="block text-sm font-medium mb-1">
              Order Number
            </label>
            <input
              id="order"
              type="number"
              min="1"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              disabled={loading}
            />
          </div>
        </div>

        {type === "video" && (
          <div>
            <label htmlFor="video-url" className="block text-sm font-medium mb-1">
              Video URL *
            </label>
            <input
              id="video-url"
              type="url"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                if (error) setError("");
              }}
              disabled={loading}
              pattern="https?://.+"
            />
          </div>
        )}

        {type === "pdf" && (
          <div>
            <label htmlFor="pdf-file" className="block text-sm font-medium mb-1">
              PDF File *
            </label>
            <input
              id="pdf-file"
              type="file"
              accept=".pdf,application/pdf"
              className="w-full border border-gray-300 px-3 py-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
              onChange={handleFileChange}
              disabled={loading}
            />
            <div className="mt-2 text-sm">
              {pdfFile && (
                <div className="flex items-center text-gray-700">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="truncate">{pdfFile.name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className={`px-5 py-2.5 rounded font-medium transition-colors ${
              loading || !title.trim() 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Adding Lecture..." : "Add Lecture"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSubSection;
