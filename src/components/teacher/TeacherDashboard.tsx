import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCourses, deleteCourse, togglePublishCourse } from "../../api/api";
import CreateCourse from "./CreateCourse";

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
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) throw new Error("Authentication required");
      const data = await getCourses(token);
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

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteCourse(token!, courseId);
      setCourses(prev => prev.filter(course => course.id !== courseId));
    } catch (err) {
      alert("Failed to delete course");
    }
  };

  const handleTogglePublish = async (courseId: number, currentStatus: boolean) => {
    try {
      await togglePublishCourse(token!, courseId, !currentStatus);
      setCourses(prev => 
        prev.map(course => 
          course.id === courseId 
            ? { ...course, is_published: !currentStatus }
            : course
        )
      );
    } catch (err) {
      alert("Failed to update course status");
    }
  };

  const handleCourseClick = (courseId: number) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-1">Create and manage your teaching content</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {courses.length} Course{courses.length !== 1 ? 's' : ''}
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

      {/* Create Course Section */}
      <div className="mb-10" id="create-course-section">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Create New Course</h2>
        <CreateCourse onCreated={fetchCourses} />
      </div>

      {/* Courses Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Your Courses</h2>
          <span className="text-sm text-gray-500">
            {courses.filter(c => c.is_published).length} published • {courses.filter(c => !c.is_published).length} draft
          </span>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first course to start organizing your teaching content
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
              >
                {/* Course Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                        {!course.is_published && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full shrink-0">
                            Draft
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {course.description || "No description provided"}
                      </p>

                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {course.exam_target.toUpperCase()}
                        </span>
                        <span>Class {course.student_class}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePublish(course.id, course.is_published);
                      }}
                      className={`ml-2 px-3 py-1 text-xs rounded-full ${
                        course.is_published
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                      title={course.is_published ? "Unpublish" : "Publish"}
                    >
                      {course.is_published ? "Published" : "Draft"}
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">📁</span>
                        {course.sections_count || 0} sections
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">📝</span>
                        {course.subsections_count || 0} lectures
                      </span>
                    </div>
                    <span className="text-xs">
                      {formatDate(course.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                  <button
                    onClick={() => handleCourseClick(course.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                  >
                    <span>Manage Course</span>
                    <span>→</span>
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(course.id);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm px-3 py-1 hover:bg-red-50 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === course.id && (
                  <div className="px-6 py-4 bg-red-50 border-t">
                    <p className="text-sm text-red-800 mb-3">
                      Are you sure you want to delete this course?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Yes, delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;