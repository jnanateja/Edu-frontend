import { useEffect, useState } from "react";
import { createCourse, getAllTeachers, canCreateCourses } from "../../api/api";

interface CreateCourseProps {
  onCreated: () => void;
}

interface Teacher {
  id: number;
  email: string;
  full_name: string;
}

const CreateCourse = ({ onCreated }: CreateCourseProps) => {
  const token = localStorage.getItem("access");
  const canCreate = canCreateCourses();
  const isAdmin = localStorage.getItem("is_admin") === "true";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examTarget, setExamTarget] = useState<"jee" | "neet" | "eamcet">("jee");
  const [studentClass, setStudentClass] = useState<"11" | "12">("11");
  const [estimatedDuration, setEstimatedDuration] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoadingTeachers(true);
        if (!token) return;
        const data = await getAllTeachers(token);
        setTeachers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load teachers:", err);
      } finally {
        setLoadingTeachers(false);
      }
    };

    if (isAdmin) loadTeachers();
  }, [isAdmin, token]);

  if (!canCreate) {
    return (
      <div className="border rounded-xl p-6 bg-white shadow-sm">
        <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl">🔒</div>
          <div>
            <h3 className="font-medium text-gray-900">Course Creation Restricted</h3>
            <p className="text-sm text-gray-600 mt-1">
              Only administrators can create new courses. Please contact an admin to create courses and assign them to you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleTeacherSelection = (teacherId: number) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(teacherId) ? prev.filter((id) => id !== teacherId) : [...prev, teacherId]
    );
  };

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

      const courseData: any = {
        title: title.trim(),
        description: description.trim(),
        exam_target: examTarget,
        student_class: studentClass,
        is_published: true,
        estimated_duration: estimatedDuration.trim(),
      };

      if (selectedTeacherIds.length > 0) {
        courseData.assigned_teacher_ids = selectedTeacherIds;
      }

      await createCourse(token, courseData);

      setTitle("");
      setDescription("");
      setEstimatedDuration("");
      setSelectedTeacherIds([]);

      onCreated();
    } catch (err: any) {
      setError(err?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-xl p-6 bg-white shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Create a Course</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Course title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What will students learn?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Exam Target</label>
            <select
              value={examTarget}
              onChange={(e) => setExamTarget(e.target.value as any)}
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-white"
            >
              <option value="jee">JEE</option>
              <option value="neet">NEET</option>
              <option value="eamcet">EAMCET</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <select
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value as any)}
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-white"
            >
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Estimated Duration</label>
          <input
            value={estimatedDuration}
            onChange={(e) => setEstimatedDuration(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2"
            placeholder="e.g., 12 weeks"
          />
        </div>

        {isAdmin && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Assign Teachers</label>
              {loadingTeachers && <span className="text-xs text-gray-500">Loading…</span>}
            </div>

            {teachers.length === 0 ? (
              <div className="text-sm text-gray-600">No teachers found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {teachers.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedTeacherIds.includes(t.id)}
                      onChange={() => handleTeacherSelection(t.id)}
                    />
                    <span className="truncate">{t.full_name || t.email}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !title.trim()}
          className={`w-full py-2.5 px-4 rounded-lg font-medium ${
            loading || !title.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } transition-colors`}
        >
          {loading ? "Creating…" : "Create Course"}
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;
