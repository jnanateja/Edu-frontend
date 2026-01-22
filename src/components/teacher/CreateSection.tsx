import { useState } from "react";
import { createSection } from "../../api/api";

interface CreateSectionProps {
  courseId: number;
  onCreated: () => void;
  initialOrder?: number;
}

const CreateSection = ({ 
  courseId, 
  onCreated,
  initialOrder = 1 
}: CreateSectionProps) => {
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const token = localStorage.getItem("access");
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }
    
    if (!title.trim()) {
      setError("Section title is required");
      return;
    }
    
    setLoading(true);

    try {
      await createSection(token, {
        course: courseId,
        title: title.trim(),
        order,
      });

      // Reset and prepare for next section
      setTitle("");
      setOrder(prev => prev + 1);
      onCreated();
    } catch (err: any) {
      console.error("Failed to create section:", err);
      setError(
        err.message || 
        "Failed to create section. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Add New Section</h3>
      
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
          <label htmlFor={`section-title-${courseId}`} className="sr-only">
            Section Title
          </label>
          <input
            id={`section-title-${courseId}`}
            name="title"
            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter section title"
            value={title}
            onChange={handleTitleChange}
            disabled={loading}
            maxLength={200}
            aria-required="true"
          />
          <div className="text-xs text-gray-500 mt-1">
            Order: {order} • Max 200 characters
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            This will be section #{order} in the course
          </div>
          
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              loading || !title.trim() 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {loading ? "Adding..." : "Add Section"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSection;