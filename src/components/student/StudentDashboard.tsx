import { useEffect, useState } from "react";
import { getStudentCourses } from "../../api/api";

interface Course {
  id: number;
  title: string;
  description: string;
  exam_target: string;
  student_class: string;
  teacher_name: string;
  enrolled: boolean;
  progress_percentage: number;
}

const StudentDashboard = () => {
  const token = localStorage.getItem("access");
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "enrolled" | "available">("all");

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) throw new Error("Authentication required");
      const data = await getStudentCourses(token);
      setCourses(data);
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

  const filteredCourses = courses.filter(course => {
    if (filter === "enrolled") return course.enrolled;
    if (filter === "available") return !course.enrolled;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Learning</h1>
            <p className="text-gray-600 mt-1">Continue your learning journey</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {courses.filter(c => c.enrolled).length} Enrolled
            </span>
          </div>
        </div>
      </header>

      {/* Error Message */}
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

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "all"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Courses
          </button>
          <button
            onClick={() => setFilter("enrolled")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "enrolled"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            My Courses
          </button>
          <button
            onClick={() => setFilter("available")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "available"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Available
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {filter === "all" ? "All Courses" : filter === "enrolled" ? "My Courses" : "Available Courses"}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredCourses.length} courses
          </span>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {filter === "enrolled" 
                ? "You haven't enrolled in any courses yet" 
                : filter === "available" 
                ? "No available courses at the moment" 
                : "No courses available"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {filter === "enrolled" 
                ? "Browse available courses and start learning" 
                : "Check back later for new courses"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mt-2">
                        {course.description || "No description provided"}
                      </p>
                    </div>
                    {course.enrolled && (
                      <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full shrink-0">
                        Enrolled
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {course.exam_target.toUpperCase()}
                    </span>
                    <span>Class {course.student_class}</span>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Teacher:</span> {course.teacher_name}
                  </div>

                  {course.enrolled && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${course.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t">
                  {course.enrolled ? (
                    <button
                      className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      onClick={() => {
                        // Navigate to course learning page
                        // navigate(`/student/courses/${course.id}`);
                      }}
                    >
                      Continue Learning
                    </button>
                  ) : (
                    <button
                      className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      onClick={() => {
                        // Enroll in course
                        // enrollInCourse(course.id);
                      }}
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;