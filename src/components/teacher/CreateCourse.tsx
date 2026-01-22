import { useState } from "react";
import { createCourse } from "../../api/api";

interface CreateCourseProps {
  onCreated: () => void;
}

const CreateCourse = ({ onCreated }: CreateCourseProps) => {
  const token = localStorage.getItem("access");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examTarget, setExamTarget] = useState<"jee" | "neet" | "eamcet">("jee");
  const [studentClass, setStudentClass] = useState<"11" | "12">("11");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!title.trim()) {
      setError("Course title is required");
      return;
    }
    
    setLoading(true);

    try {
      if (!token) throw new Error("Authentication required");
      
      await createCourse(token, {
        title: title.trim(),
        description: description.trim(),
        exam_target: examTarget,
        student_class: studentClass,
        is_published: false,
      });

      setTitle("");
      setDescription("");
      onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-xl p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Create New Course</h2>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Course Title *
          </label>
          <input
            id="title"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter course title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter course description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="examTarget" className="block text-sm font-medium text-gray-700 mb-1">
              Exam Target
            </label>
            <select
              id="examTarget"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={examTarget}
              onChange={(e) => setExamTarget(e.target.value as any)}
              disabled={loading}
            >
              <option value="jee">JEE</option>
              <option value="neet">NEET</option>
              <option value="eamcet">EAMCET</option>
            </select>
          </div>

          <div>
            <label htmlFor="studentClass" className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              id="studentClass"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value as any)}
              disabled={loading}
            >
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim()}
          className={`w-full py-2.5 px-4 rounded-lg font-medium ${
            loading || !title.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } transition-colors`}
        >
          {loading ? "Creating Course..." : "Create Course"}
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;