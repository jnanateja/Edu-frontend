import { useEffect, useState } from "react";
import { getStudentCourses } from "../../api/api";
import { useNavigate } from "react-router-dom";

interface Course {
  id: number;
  title: string;
  description: string;
  exam_target: "jee" | "neet" | "eamcet";
  student_class: "11" | "12";
  sections: any[];
}

const StudentDashboard = () => {
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) throw new Error("Authentication required");
      const data = await getStudentCourses(token);
      setCourses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              My Learning
            </h1>
            <p className="text-gray-600 mt-1">
              Your unlocked courses from subscribed packages
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {courses.length} Courses
            </span>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600">{error}</span>
            <button
              onClick={fetchCourses}
              className="ml-auto text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No unlocked courses yet
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Subscribe to a package to unlock full course content and quizzes.
          </p>
          <button
            onClick={() => navigate("/packages")}
            className="mt-6 inline-flex items-center justify-center px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Browse Packages
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-gray-600 text-sm line-clamp-3 mt-3">
                  {course.description || "No description provided"}
                </p>

                <div className="flex items-center gap-3 text-sm text-gray-500 mt-4">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {course.exam_target.toUpperCase()}
                  </span>
                  <span>Class {course.student_class}</span>
                </div>

                <div className="text-sm text-gray-600 mt-4">
                  <span className="font-medium">Sections:</span>{" "}
                  {course.sections?.length || 0}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t">
                <button
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  onClick={() => navigate(`/student/courses/${course.id}`)}
                >
                  View Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
