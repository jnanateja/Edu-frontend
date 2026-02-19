import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAssignedCourses,
  getCourses,
  deleteCourse,
  togglePublishCourse,
  canModifyCourse,
  canCreateCourses,
} from "../../api/api";
import CreateCourse from "./CreateCourse";
import AdminPackagesPanel from "./AdminPackagesPanel";
import { RefreshCw, BookOpen, Eye, Package } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  exam_target: string;
  student_class: string;
  is_published: boolean;
  created_at: string;
  sections_count?: number;
  subsections_count?: number;
  created_by?: {
    id: number;
    email: string;
    full_name: string;
  };
  assigned_teachers?: Array<{
    id: number;
    email: string;
    full_name: string;
  }>;
  is_assigned?: boolean;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");
  const userRole = localStorage.getItem("user_role");
  const isAdmin = localStorage.getItem("is_admin") === "true";

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"courses" | "packages">("courses");

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) throw new Error("Authentication required");

      let data: Course[];
      if (userRole === "teacher" && !isAdmin) {
        data = await getAssignedCourses(token);
      } else {
        data = await getCourses(token);
      }
      setCourses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    try {
      if (!token) throw new Error("Authentication required");
      await deleteCourse(token, courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err: any) {
      alert(err?.message || "Failed to delete course");
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      if (!token) throw new Error("Authentication required");
      const updated = await togglePublishCourse(token, course.id);
      setCourses((prev) => prev.map((c) => (c.id === course.id ? updated : c)));
    } catch (err: any) {
      alert(err?.message || "Failed to update course");
    }
  };

  const canCreate = canCreateCourses();

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? "Admin Dashboard" : "Teacher Dashboard"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isAdmin
              ? "Create courses, curate packages, publish products, and manage learning content."
              : "Manage your assigned courses, add content, and create quizzes."}
          </p>
        </div>

        <button
          onClick={fetchCourses}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-sm font-medium hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {isAdmin && (
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              activeTab === "courses" ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Courses
            </span>
          </button>
          <button
            onClick={() => setActiveTab("packages")}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              activeTab === "packages" ? "bg-green-600 text-white border-green-600" : "bg-white hover:bg-gray-50"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Package className="w-4 h-4" /> Packages
            </span>
          </button>
        </div>
      )}

      {activeTab === "packages" && isAdmin ? (
        <AdminPackagesPanel />
      ) : (
        <>
          {canCreate && <CreateCourse onCreated={fetchCourses} />}

          <div className="mt-6 bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Courses</h2>
              <p className="text-sm text-gray-600">Courses are content containers (no pricing).</p>
            </div>

            {loading && <div className="p-6 text-gray-700">Loading…</div>}

            {!loading && error && (
              <div className="p-6 bg-red-50 border-t border-red-200 text-red-700">{error}</div>
            )}

            {!loading && !error && courses.length === 0 && (
              <div className="p-6 text-gray-600">No courses found.</div>
            )}

            {!loading && !error && courses.length > 0 && (
              <div className="divide-y">
                {courses.map((course) => {
                  const canModify = canModifyCourse(course);
                  return (
                    <div key={course.id} className="p-6 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              course.is_published
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {course.is_published ? "Published" : "Draft"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {course.description || "No description provided."}
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          {course.exam_target?.toUpperCase()} • Class {course.student_class} •{" "}
                          {course.sections_count || 0} sections • {course.subsections_count || 0} lessons
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => navigate(`/teacher/courses/${course.id}`)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4" />
                          Open
                        </button>

                        {canModify && (
                          <button
                            onClick={() => handleTogglePublish(course)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                              course.is_published
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                          >
                            {course.is_published ? "Unpublish" : "Publish"}
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="px-3 py-2 rounded-lg text-sm font-medium border text-red-700 border-red-200 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherDashboard;
