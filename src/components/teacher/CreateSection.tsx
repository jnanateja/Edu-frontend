import { useEffect, useMemo, useState } from "react";
import { createSection } from "../../api/api";
import { Lock } from "lucide-react";

interface CreateSectionProps {
  courseId: number;
  onCreated: () => void;
  canModify?: boolean;

  // OPTIONAL: pass this from parent for auto-order
  nextOrder?: number;
}

const CreateSection = ({
  courseId,
  onCreated,
  canModify = true,
  nextOrder,
}: CreateSectionProps) => {
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState<number>(nextOrder ?? 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Keep order in sync when parent recomputes it (optional)
  useEffect(() => {
    if (typeof nextOrder === "number") setOrder(nextOrder);
  }, [nextOrder]);

  if (!canModify) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded">
          <Lock className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Permission Required
            </h3>
            <p className="text-xs text-yellow-700 mt-0.5">
              You need to be assigned to this course to add sections
            </p>
          </div>
        </div>
      </div>
    );
  }

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
        order: Number(order) || 1,
      });

      setTitle("");
      // Don’t blindly increment; parent will recompute nextOrder after refresh
      onCreated();
    } catch (err: any) {
      console.error("Failed to create section:", err);
      setError(err.message || "Failed to create section. Please try again.");
    } finally {
      setLoading(false);
    }
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
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError("");
            }}
            disabled={loading}
            maxLength={200}
            aria-required="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div>
              <label
                htmlFor={`section-order-${courseId}`}
                className="block text-sm font-medium mb-1"
              >
                Order
              </label>
              <input
                id={`section-order-${courseId}`}
                type="number"
                min={1}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                disabled={loading}
              />
            </div>

            <div className="text-xs text-gray-500 flex items-end">
              Max 200 characters
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center">
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
