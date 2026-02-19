import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAssignedCourseDetail,
  getCourseDetail,
  togglePublishCourse,
  deleteCourse,
  assignTeacherToCourse,
  removeTeacherFromCourse,
  getAllTeachers,
  getCourseTeachers,
  canModifyCourse,
} from "../../api/api";
import CreateSection from "./CreateSection";
import CreateSubSection from "./CreateSubSection";
import TeacherQuizManager from "./TeacherQuizManager";
import {
  ChevronLeft,
  Edit2,
  Eye,
  Download,
  Trash2,
  Users,
  UserPlus,
  UserMinus,
  Lock,
  CheckCircle,
  XCircle,
  Plus,
  FileText,
  Video,
  BookOpen,
  Settings,
} from "lucide-react";

interface SubSection {
  created_at: string | number | Date;
  id: number;
  title: string;
  content_type: "video" | "pdf";
  video_url?: string;
  pdf_file?: string;
  order: number;
}

interface Section {
  id: number;
  title: string;
  order: number;
  subsections: SubSection[];
}

interface Teacher {
  id: number;
  email: string;
  full_name: string;
  organization: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  exam_target: string;
  student_class: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  sections: Section[];
  created_by?: {
    id: number;
    email: string;
    full_name: string;
  };
  assigned_teachers?: Teacher[];
  is_assigned?: boolean;
}

const API_BASE =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_BASE_URL || ""
    : "http://127.0.0.1:8000";

const makeAbsolute = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // typical DRF: "/media/..."
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
};

const toEmbedUrl = (url: string): string => {
  if (!url?.trim()) return "";
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtube.com")) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      if (url.includes("/embed/")) return url;
    }
    return url;
  } catch {
    return url;
  }
};

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  const isAdmin = localStorage.getItem("is_admin") === "true";
  const userRole = localStorage.getItem("user_role");

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"content" | "quizzes" | "settings" | "teachers">("content");

  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [assignedTeachers, setAssignedTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const idNum = useMemo(() => Number(courseId), [courseId]);
  const canModify = course ? canModifyCourse(course) : false;

  // ✅ Guard: this component is for teacher/admin only
  useEffect(() => {
    if (!token) return; // ProtectedRoute should handle
    if (userRole === "student" && !isAdmin) {
      navigate(`/student/courses/${idNum}`, { replace: true });
    }
  }, [token, userRole, isAdmin, idNum]);

  const loadAllTeachers = async () => {
    if (!token) return;
    try {
      setLoadingTeachers(true);
      const data = await getAllTeachers(token);
      setAllTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load teachers:", err);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const loadAssignedTeachers = async () => {
    if (!token || !courseId) return;
    try {
      const data = await getCourseTeachers(token, Number(courseId));
      setAssignedTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load assigned teachers:", err);
      setAssignedTeachers([]);
    }
  };

  const fetchCourseDetail = async () => {
    if (!courseId) return;

    setLoading(true);
    setError("");

    try {
      if (!token) {
        navigate(`/login?redirect=/teacher/courses/${idNum}`);
        return;
      }

      let data: Course;

      // teacher (non-admin) uses assigned endpoint
      if (userRole === "teacher" && !isAdmin) {
        data = await getAssignedCourseDetail(token, idNum);
      } else {
        // admin uses normal endpoint
        data = await getCourseDetail(token, idNum);
      }

      setCourse(data);
      setExpandedSections((data.sections || []).map((s) => s.id));

      if (isAdmin) {
        await loadAssignedTeachers();
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load course details");
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetail();
    if (isAdmin) loadAllTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleAssignTeacher = async () => {
    if (!course || !token || !selectedTeacher) return;
    try {
      await assignTeacherToCourse(token, course.id, Number(selectedTeacher));
      setSelectedTeacher("");
      await loadAssignedTeachers();
      await fetchCourseDetail();
    } catch (err: any) {
      alert("Failed to assign teacher: " + (err?.message || "Unknown error"));
    }
  };

  const handleRemoveTeacher = async (teacherId: number) => {
    if (!course || !token) return;
    if (!confirm("Remove this teacher from the course?")) return;

    try {
      await removeTeacherFromCourse(token, course.id, teacherId);
      await loadAssignedTeachers();
      await fetchCourseDetail();
    } catch (err: any) {
      alert("Failed to remove teacher: " + (err?.message || "Unknown error"));
    }
  };

  const handleTogglePublish = async () => {
    if (!course || !token) return;
    if (!isAdmin && !canModify) {
      alert("You don't have permission to modify this course");
      return;
    }
    try {
      await togglePublishCourse(token, course.id, !course.is_published);
      setCourse((prev) => (prev ? { ...prev, is_published: !prev.is_published } : prev));
    } catch {
      alert("Failed to update course status");
    }
  };

  const handleDeleteCourse = async () => {
    if (!course || !token) return;
    if (!isAdmin) {
      alert("Only administrators can delete courses");
      return;
    }
    if (!confirm("Delete this course permanently?")) return;

    try {
      await deleteCourse(token, course.id);
      navigate("/teacher/dashboard");
    } catch {
      alert("Failed to delete course");
    }
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const getTotalLectures = () => {
    if (!course?.sections) return 0;
    return course.sections.reduce((acc, section) => acc + (section.subsections?.length || 0), 0);
  };

  const renderPermissionBadge = () => {
    if (isAdmin) {
      return (
        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
          Administrator
        </span>
      );
    }

    if (canModify) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          Assigned Teacher
        </span>
      );
    }

    return (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
        <XCircle className="w-4 h-4" />
        View Only
      </span>
    );
  };

  const handleDownloadPdf = (pdfUrl: string, title: string) => {
    const absolute = makeAbsolute(pdfUrl);
    const link = document.createElement("a");
    link.href = absolute;
    link.download = `${title.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreviewContent = (sub: SubSection) => {
    if (sub.content_type === "video" && sub.video_url) {
      window.open(sub.video_url, "_blank");
    } else if (sub.content_type === "pdf" && sub.pdf_file) {
      window.open(makeAbsolute(sub.pdf_file), "_blank");
    }
  };

  const goBack = () => {
    // teacher/admin only component
    navigate("/teacher/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={goBack} className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <p className="text-gray-600 mb-6">{error || "You may not have access to this course."}</p>
          <button onClick={goBack} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b rounded-lg mb-8">
        <div className="px-6 py-6">
          <button onClick={goBack} className="flex items-center text-blue-600 hover:text-blue-800 mb-4 group">
            <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{course.title}</h1>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.is_published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {course.is_published ? "Published" : "Draft"}
                </span>

                {renderPermissionBadge()}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                {course.created_by && (
                  <>
                    <span>Created by: {course.created_by.full_name}</span>
                    <span>•</span>
                  </>
                )}
                <span>Last updated: {new Date(course.updated_at).toLocaleDateString()}</span>
              </div>

              <p className="text-gray-600 mb-4 max-w-3xl">{course.description || "No description provided"}</p>

              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full">
                  {course.exam_target.toUpperCase()}
                </span>
                <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full">
                  Class {course.student_class}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full">
                  {course.sections?.length || 0} Sections
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full">
                  {getTotalLectures()} Lectures
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(isAdmin || canModify) && (
                <button
                  onClick={handleTogglePublish}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    course.is_published
                      ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {course.is_published ? "Unpublish" : "Publish Course"}
                </button>
              )}

              {(isAdmin || canModify) && (
                <button
                  onClick={() => alert("Edit course form not wired yet")}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={handleDeleteCourse}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 border-b">
            <div className="flex space-x-8">
              <button
                className={`pb-3 px-1 font-medium flex items-center gap-2 ${
                  activeTab === "content" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("content")}
              >
                <BookOpen className="w-4 h-4" />
                Course Content
              </button>

              {(isAdmin || canModify) && (
                <button
                  className={`pb-3 px-1 font-medium flex items-center gap-2 ${
                    activeTab === "settings"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              )}

              {isAdmin && (
                <button
                  className={`pb-3 px-1 font-medium flex items-center gap-2 ${
                    activeTab === "teachers"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("teachers")}
                >
                  <Users className="w-4 h-4" />
                  Teacher Assignments
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600">{error}</span>
            <button
              onClick={fetchCourseDetail}
              className="ml-auto text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === "content" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* left */}
          <div className="lg:col-span-2">
            {(isAdmin || canModify) ? (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Add New Section</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Organize your course into sections. Each section can contain multiple lectures (videos/PDFs).
                      </p>
                      <div className="mt-4">
                        <CreateSection courseId={course.id} onCreated={fetchCourseDetail} canModify={canModify} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h3 className="font-medium text-yellow-800">View Only Mode</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      You are viewing this course in read-only mode. Contact an administrator to edit content.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* sections */}
            <div className="space-y-6">
              {course.sections?.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
                  <p className="text-gray-600 mb-4">
                    {canModify ? "Create your first section to start adding lectures" : "This course has no content yet"}
                  </p>
                </div>
              ) : (
                course.sections.map((section) => (
                  <div key={section.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div
                      className="p-6 border-b flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
                          {section.order}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{section.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {section.subsections?.length || 0} lectures
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {section.subsections?.filter((s) => s.content_type === "video").length || 0}
                              <Video className="w-4 h-4 text-red-500" />
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {section.subsections?.filter((s) => s.content_type === "pdf").length || 0}
                              <FileText className="w-4 h-4 text-blue-500" />
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 text-2xl">
                        {expandedSections.includes(section.id) ? "−" : "+"}
                      </button>
                    </div>

                    {expandedSections.includes(section.id) && (
                      <div className="p-6">
                        {(isAdmin || canModify) && (
                          <div className="mb-8">
                            <CreateSubSection sectionId={section.id} onCreated={fetchCourseDetail} canModify={canModify} />
                          </div>
                        )}

                        {section.subsections?.length > 0 ? (
                          <div className="space-y-4">
                            {section.subsections.map((sub) => (
                              <div key={sub.id} className="p-4 border rounded-xl">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                      <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                          sub.content_type === "video" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                                        }`}
                                      >
                                        {sub.content_type === "video" ? <Video className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                      </div>

                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-medium text-gray-900">{sub.title}</h4>
                                          <span
                                            className={`text-xs px-2 py-1 rounded-full ${
                                              sub.content_type === "video" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                                            }`}
                                          >
                                            {sub.content_type.toUpperCase()}
                                          </span>
                                        </div>

                                        <div className="text-sm text-gray-500">
                                          Lecture #{sub.order} • Added {new Date(sub.created_at).toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>

                                    {sub.content_type === "video" && sub.video_url && (
                                      <div className="mt-6">
                                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                                          <iframe
                                            src={toEmbedUrl(sub.video_url)}
                                            className="absolute inset-0 w-full h-full"
                                            title={sub.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          />
                                          <div className="absolute inset-0" onContextMenu={(e) => e.preventDefault()} />
                                        </div>
                                      </div>
                                    )}

                                    {sub.content_type === "pdf" && sub.pdf_file && (
                                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                          <FileText className="w-8 h-8 text-blue-600" />
                                          <div className="flex-1">
                                            <p className="font-medium text-gray-900">PDF Document</p>
                                            <p className="text-sm text-gray-500 break-all">{makeAbsolute(sub.pdf_file)}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handlePreviewContent(sub)}
                                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Preview"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>

                                    {sub.content_type === "pdf" && sub.pdf_file && (
                                      <button
                                        onClick={() => handleDownloadPdf(sub.pdf_file!, sub.title)}
                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Download PDF"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                            <div className="text-4xl mb-3">📝</div>
                            <h4 className="font-medium text-gray-900 mb-2">No lectures yet</h4>
                            <p className="text-gray-600">
                              {canModify ? "Add your first lecture to this section" : "This section has no lectures yet"}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* right */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border shadow-sm p-6 sticky top-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Course Overview
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className={`font-semibold ${course.is_published ? "text-green-600" : "text-yellow-600"}`}>
                    {course.is_published ? "Published" : "Draft"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Sections</p>
                    <p className="font-semibold text-2xl">{course.sections?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Lectures</p>
                    <p className="font-semibold text-2xl">{getTotalLectures()}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Created</p>
                  <p className="font-semibold">{new Date(course.created_at).toLocaleDateString()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <p className="font-semibold">{new Date(course.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "quizzes" ? (
        <TeacherQuizManager courseId={course.id} />
      ) : activeTab === "settings" ? (
        <div className="bg-white rounded-xl border shadow-sm p-6 max-w-3xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Course Settings
          </h2>
          <p className="text-gray-500">Settings UI can go here next.</p>
        </div>
      ) : (
        // teachers tab (admin only)
        <div className="bg-white rounded-xl border shadow-sm p-6 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Teacher Assignments</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Assign Teacher</h3>
              <div className="flex gap-3 mb-4">
                <select
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  disabled={loadingTeachers || allTeachers.length === 0}
                >
                  <option value="">Select teacher</option>
                  {allTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} ({t.email}) - {t.organization}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAssignTeacher}
                  disabled={!selectedTeacher || loadingTeachers}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Assign
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Assigned Teachers</h3>
              {assignedTeachers.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No teachers assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedTeachers.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div>
                        <div className="font-medium">{t.full_name}</div>
                        <div className="text-sm text-gray-500">{t.email}</div>
                        {t.organization && <div className="text-xs text-gray-400">Org: {t.organization}</div>}
                      </div>
                      <button
                        onClick={() => handleRemoveTeacher(t.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 flex items-center gap-2"
                      >
                        <UserMinus className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
