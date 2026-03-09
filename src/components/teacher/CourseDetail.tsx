import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useUnsavedChangesWarning } from "../../utils/useUnsavedChangesWarning";
import {
  getAssignedCourseDetail,
  getCourseDetail,
  deleteCourse,
  assignTeacherToCourse,
  removeTeacherFromCourse,
  getAllTeachers,
  getCourseTeachers,
  canModifyCourse,
  updateSection,
  deleteSection,
  updateSubSection,
  deleteSubSection,
  getCourseSchedules,
  createCourseSchedule,
  updateSchedule,
  deleteSchedule,
  getCourseAnnouncements,
  createCourseAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../api/api";
import CreateSection from "./CreateSection";
import CreateSubSection from "./CreateSubSection";
import TeacherQuizManager from "./TeacherQuizManager";
import MuxVideoPlayer from "../student/MuxVideoPlayer";
import { normalizeVideoInput } from "../../utils/video";
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
  GripVertical,
  Settings,
  HelpCircle,
  Calendar,
  Megaphone,
} from "lucide-react";

interface SubSection {
  created_at: string | number | Date;
  id: number;
  title: string;
  content_type: "video" | "pdf" | "file";
  video_url?: string;
  pdf_file?: string;
  mux_playback_id?: string | null;
  mux_playback_token?: string | null;
  video_status?: string | null;
  order: number;
}

interface Schedule {
  id: number;
  course: number;
  title: string;
  description?: string;
  start_at: string;
  end_at?: string | null;
  live_link?: string | null;
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
  const location = useLocation();

  const token = localStorage.getItem("access");
  const isAdmin = localStorage.getItem("is_admin") === "true";
  const userRole = localStorage.getItem("user_role");

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // COURSE EDIT (Teachers/Admin can update course anytime)
  // =====================================================
  const [editMode, setEditMode] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    exam_target: "jee",
    student_class: "11",
    estimated_duration: "",
  });

  const courseDirty = useMemo(() => {
    if (!editMode || !course) return false;
    return (
      courseForm.title !== (course.title || "") ||
      courseForm.description !== (course.description || "") ||
      courseForm.exam_target !== (course.exam_target as any) ||
      courseForm.student_class !== (course.student_class as any) ||
      courseForm.estimated_duration !== ((course as any).estimated_duration || "")
    );
  }, [editMode, course, courseForm]);


  const [expandedSections, setExpandedSections] = useState<number[]>([]);

  const [dragSectionId, setDragSectionId] = useState<number | null>(null);
  const [dragLectureId, setDragLectureId] = useState<number | null>(null);
  const [dragLectureSectionId, setDragLectureSectionId] = useState<number | null>(null);

  // Quick edit helpers for sections/lectures
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [sectionTitleDraft, setSectionTitleDraft] = useState<string>("");

  const [editingLectureId, setEditingLectureId] = useState<number | null>(null);
  const [lectureDraft, setLectureDraft] = useState<{
    title: string;
    content_type: "video" | "pdf" | "file";
    video_url: string;
    pdf_file: File | null;
  }>({ title: "", content_type: "video", video_url: "", pdf_file: null });
  const [lectureUploadPct, setLectureUploadPct] = useState(0);
  const initialTab = (() => {
    const sp = new URLSearchParams(location.search);
    const t = sp.get("tab");
    return (t === "quizzes" || t === "schedules" || t === "settings" || t === "teachers") ? (t as any) : "content";
  })();
  const [activeTab, setActiveTab] = useState<"content" | "quizzes" | "schedules" | "settings" | "teachers">(
    (initialTab as any) || "content"
  );

  // Schedules
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    description: "",
    start_at: "",
    end_at: "",
    live_link: "",
  });
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);

  // Announcements
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    link: "",
  });
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null);

  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [assignedTeachers, setAssignedTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const idNum = useMemo(() => Number(courseId), [courseId]);
  const canModify = course ? canModifyCourse(course) : false;

  // Warn user before refresh/close if they have unsaved changes.
  useUnsavedChangesWarning(courseDirty || editingLectureId !== null);

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

  const loadSchedules = async () => {
    if (!token || !courseId) return;
    try {
      setLoadingSchedules(true);
      const data = await getCourseSchedules(Number(courseId), token);
      setSchedules(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load schedules", e);
      setSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const loadAnnouncements = async () => {
    if (!token || !courseId) return;
    try {
      setLoadingAnnouncements(true);
      const data = await getCourseAnnouncements(Number(courseId), token);
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load announcements", e);
      setAnnouncements([]);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    if (activeTab === "schedules") {
      loadSchedules();
      loadAnnouncements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, courseId]);

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

  const startEditSection = (section: Section) => {
    setEditingSectionId(section.id);
    setSectionTitleDraft(section.title);
  };

  const saveSectionTitle = async () => {
    if (!token || !editingSectionId) return;
    try {
      await updateSection(token, editingSectionId, { title: sectionTitleDraft });
      setEditingSectionId(null);
      setSectionTitleDraft("");
      await fetchCourseDetail();
    } catch (err: any) {
      alert(err?.message || "Failed to update section");
    }
  };

  const removeSection = async (sectionId: number) => {
    if (!token) return;
    if (!confirm("Delete this section and all its lectures?")) return;
    try {
      await deleteSection(token, sectionId);
      await fetchCourseDetail();
    } catch (err: any) {
      alert(err?.message || "Failed to delete section");
    }
  };

  const startEditLecture = (sub: SubSection) => {
    setEditingLectureId(sub.id);
    setLectureUploadPct(0);
    setLectureDraft({
      title: sub.title,
      content_type: sub.content_type,
      video_url: sub.video_url || "",
      pdf_file: null,
    });
  };

  const saveLecture = async () => {
    if (!token || !editingLectureId) return;
    try {
      setLectureUploadPct(0);
      if (!lectureDraft.title.trim()) {
        alert("Lecture title is required");
        return;
      }
      if (lectureDraft.content_type === "video" && !normalizeVideoInput(lectureDraft.video_url).trim()) {
        alert("Video URL is required");
        return;
      }

      // If PDF is selected in edit mode, send multipart with pdf_file field.
      // If no new file, still include pdf_file: null so backend keeps existing.
      await updateSubSection(
        token,
        editingLectureId,
        {
          title: lectureDraft.title.trim(),
          content_type: lectureDraft.content_type,
          video_url: lectureDraft.content_type === "video" ? normalizeVideoInput(lectureDraft.video_url).trim() : "",
          pdf_file: lectureDraft.content_type === "pdf" ? lectureDraft.pdf_file : null,
        },
        (pct) => setLectureUploadPct(pct)
      );

      setEditingLectureId(null);
      setLectureDraft({ title: "", content_type: "video", video_url: "", pdf_file: null });
      await fetchCourseDetail();
    } catch (err: any) {
      alert(err?.message || "Failed to update lecture");
    }
  };

  const removeLecture = async (lectureId: number) => {
    if (!token) return;
    if (!confirm("Delete this lecture?")) return;
    try {
      await deleteSubSection(token, lectureId);
      await fetchCourseDetail();
    } catch (err: any) {
      alert(err?.message || "Failed to delete lecture");
    }
  };

  // ===========================================================
  // Drag & Drop Reordering (Sections + Lectures)
  // ===========================================================

  const reorder = <T,>(arr: T[], fromIdx: number, toIdx: number) => {
    const next = [...arr];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    return next;
  };

  const persistSectionOrders = async (sections: Section[]) => {
    if (!token) return;
    // Persist only changed orders
    await Promise.all(
      sections.map((s, idx) => {
        const newOrder = idx + 1;
        if (s.order === newOrder) return Promise.resolve(null);
        return updateSection(token, s.id, { order: newOrder });
      })
    );
  };

  const persistLectureOrders = async (subsections: SubSection[]) => {
    if (!token) return;
    await Promise.all(
      subsections.map((ss, idx) => {
        const newOrder = idx + 1;
        if (ss.order === newOrder) return Promise.resolve(null);
        return updateSubSection(token, ss.id, { order: newOrder });
      })
    );
  };

  // NOTE: Courses are treated as published once created/assigned.
  // Storefront visibility is controlled by Learning Paths.

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
  const handleSaveCourse = async () => {
    if (!token || !course) return;
    await saveCourseInternal(true);
  };

  const saveCourseInternal = async (exitEditMode: boolean) => {
    if (!token || !course) return;
    setSavingCourse(true);
    setError("");

    try {
      const payload: any = {
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        exam_target: courseForm.exam_target,
        student_class: courseForm.student_class,
        estimated_duration: courseForm.estimated_duration.trim(),
        is_published: true,
      };

      if (!payload.title) {
        setError("Course title is required");
        return;
      }

      const { updateCourse } = await import("../../api/api");
      await updateCourse(token, course.id, payload);

      // Update baseline (course state) so dirty tracking resets without forcing a refetch.
      setCourse((prev) => (prev ? ({ ...prev, ...payload } as any) : prev));
      setLastSavedAt(Date.now());

      if (exitEditMode) {
        setEditMode(false);
        await fetchCourseDetail();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update course");
    } finally {
      setSavingCourse(false);
    }
  };

  // Autosave course settings while editing (debounced)
  useEffect(() => {
    if (!editMode) return;
    if (!courseDirty) return;
    if (savingCourse) return;

    const t = window.setTimeout(() => {
      // Save but stay in edit mode
      saveCourseInternal(false);
    }, 1200);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, courseDirty, courseForm]);



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
    if ((sub.content_type === "pdf" || sub.content_type === "file") && sub.pdf_file) {
      window.open(makeAbsolute(sub.pdf_file), "_blank");
      return;
    }

    if (sub.content_type === "video" && sub.video_url) {
      window.open(sub.video_url, "_blank");
      return;
    }

    if (sub.content_type === "video" && sub.mux_playback_id) {
      const el = document.getElementById(`lecture-${sub.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
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

                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Active
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
                  onClick={() => { setActiveTab("settings"); setEditMode(true); }}
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
                    activeTab === "quizzes" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("quizzes")}
                >
                  <HelpCircle className="w-4 h-4" />
                  Quizzes
                </button>
              )}

              {(isAdmin || canModify) && (
                <button
                  className={`pb-3 px-1 font-medium flex items-center gap-2 ${
                    activeTab === "schedules" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("schedules")}
                >
                  <Calendar className="w-4 h-4" />
                  Schedules
                </button>
              )}

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
                  <div
                    key={section.id}
                    className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                      (isAdmin || canModify) && dragSectionId === section.id ? "ring-2 ring-blue-300" : ""
                    }`}
                    onDragOver={(e) => {
                      if (!(isAdmin || canModify) || dragSectionId === null) return;
                      e.preventDefault();
                    }}
                    onDrop={async (e) => {
                      if (!(isAdmin || canModify)) return;
                      e.preventDefault();
                      if (dragSectionId === null || !course) return;
                      const fromIdx = course.sections.findIndex((s) => s.id === dragSectionId);
                      const toIdx = course.sections.findIndex((s) => s.id === section.id);
                      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) {
                        setDragSectionId(null);
                        return;
                      }
                      const nextSections = reorder(course.sections, fromIdx, toIdx).map((s, idx) => ({
                        ...s,
                        order: idx + 1,
                      }));
                      setCourse({ ...course, sections: nextSections });
                      setDragSectionId(null);
                      try {
                        await persistSectionOrders(nextSections);
                        await fetchCourseDetail();
                      } catch (err: any) {
                        alert(err?.message || "Failed to reorder sections");
                        await fetchCourseDetail();
                      }
                    }}
                  >
                    <div
                      className="p-6 border-b flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center gap-4">
                        {(isAdmin || canModify) && (
                          <button
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-grab"
                            title="Drag to reorder sections"
                            draggable
                            onClick={(e) => e.stopPropagation()}
                            onDragStart={(e) => {
                              e.stopPropagation();
                              setDragSectionId(section.id);
                              try {
                                e.dataTransfer.setData("text/plain", String(section.id));
                              } catch {}
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragEnd={() => setDragSectionId(null)}
                          >
                            <GripVertical className="w-5 h-5" />
                          </button>
                        )}
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
                          {section.order}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {editingSectionId === section.id ? (
                              <input
                                className="border rounded px-2 py-1 text-sm"
                                value={sectionTitleDraft}
                                onChange={(e) => setSectionTitleDraft(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <h3 className="font-semibold text-lg text-gray-900">{section.title}</h3>
                            )}

                            {(isAdmin || canModify) && (
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                {editingSectionId === section.id ? (
                                  <>
                                    <button
                                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                                      onClick={saveSectionTitle}
                                      title="Save section title"
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                      onClick={() => {
                                        setEditingSectionId(null);
                                        setSectionTitleDraft("");
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                      onClick={() => startEditSection(section)}
                                      title="Edit section"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                      onClick={() => removeSection(section.id)}
                                      title="Delete section"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
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
                            {/* Admins should always be able to add lectures even if not assigned */}
                            <CreateSubSection
                              sectionId={section.id}
                              onCreated={fetchCourseDetail}
                              canModify={isAdmin || canModify}
                            />
                          </div>
                        )}

                        {section.subsections?.length > 0 ? (
                          <div className="space-y-4">
                            {section.subsections.map((sub) => (
                              <div
                                key={sub.id}
                                className={`p-4 border rounded-xl ${
                                  (isAdmin || canModify) && dragLectureId === sub.id ? "ring-2 ring-blue-200" : ""
                                }`}
                                onDragOver={(e) => {
                                  if (!(isAdmin || canModify)) return;
                                  if (dragLectureId === null || dragLectureSectionId !== section.id) return;
                                  e.preventDefault();
                                }}
                                onDrop={async (e) => {
                                  if (!(isAdmin || canModify)) return;
                                  e.preventDefault();
                                  if (!course) return;
                                  if (dragLectureId === null || dragLectureSectionId !== section.id) return;

                                  const secIdx = course.sections.findIndex((s) => s.id === section.id);
                                  if (secIdx < 0) return;
                                  const current = course.sections[secIdx];
                                  const fromIdx = current.subsections.findIndex((x) => x.id === dragLectureId);
                                  const toIdx = current.subsections.findIndex((x) => x.id === sub.id);
                                  if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) {
                                    setDragLectureId(null);
                                    setDragLectureSectionId(null);
                                    return;
                                  }

                                  const nextSubs = reorder(current.subsections, fromIdx, toIdx).map((x, idx) => ({
                                    ...x,
                                    order: idx + 1,
                                  }));
                                  const nextSections = [...course.sections];
                                  nextSections[secIdx] = { ...current, subsections: nextSubs };
                                  setCourse({ ...course, sections: nextSections });

                                  setDragLectureId(null);
                                  setDragLectureSectionId(null);

                                  try {
                                    await persistLectureOrders(nextSubs);
                                    await fetchCourseDetail();
                                  } catch (err: any) {
                                    alert(err?.message || "Failed to reorder lectures");
                                    await fetchCourseDetail();
                                  }
                                }}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                      {(isAdmin || canModify) && (
                                        <button
                                          className="p-2 -ml-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-grab"
                                          title="Drag to reorder lectures"
                                          draggable
                                          onDragStart={(e) => {
                                            setDragLectureId(sub.id);
                                            setDragLectureSectionId(section.id);
                                            e.dataTransfer.effectAllowed = "move";
                                          }}
                                          onDragEnd={() => {
                                            setDragLectureId(null);
                                            setDragLectureSectionId(null);
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <GripVertical className="w-5 h-5" />
                                        </button>
                                      )}
                                      <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                          sub.content_type === "video" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                                        }`}
                                      >
                                        {sub.content_type === "video" ? <Video className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                      </div>

                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          {editingLectureId === sub.id ? (
                                            <input
                                              className="border rounded px-2 py-1 text-sm w-full"
                                              value={lectureDraft.title}
                                              onChange={(e) => setLectureDraft((p) => ({ ...p, title: e.target.value }))}
                                            />
                                          ) : (
                                            <h4 className="font-medium text-gray-900">{sub.title}</h4>
                                          )}
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

                                    {editingLectureId === sub.id ? (
                                      <div className="mt-4 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-sm font-medium mb-1">Type</label>
                                            <select
                                              className="w-full border rounded px-3 py-2"
                                              value={lectureDraft.content_type}
                                              onChange={(e) =>
                                                setLectureDraft((p) => ({
                                                  ...p,
                                                  content_type: e.target.value as any,
                                                }))
                                              }
                                            >
                                              <option value="video">Video</option>
                                              <option value="pdf">PDF</option>
                                            </select>
                                          </div>
                                          {lectureDraft.content_type === "video" ? (
                                            <div>
                                              <label className="block text-sm font-medium mb-1">Video URL</label>
                                              <input
                                                className="w-full border rounded px-3 py-2"
                                                value={lectureDraft.video_url}
                                                onChange={(e) =>
                                                  setLectureDraft((p) => ({ ...p, video_url: e.target.value }))
                                                }
                                                placeholder="https://www.youtube.com/watch?v=..."
                                              />
                                            </div>
                                          ) : (
                                            <div>
                                              <label className="block text-sm font-medium mb-1">Replace PDF (optional)</label>
                                              <input
                                                type="file"
                                                accept=".pdf,application/pdf"
                                                className="w-full border rounded px-3 py-2"
                                                onChange={(e) =>
                                                  setLectureDraft((p) => ({
                                                    ...p,
                                                    pdf_file: e.target.files?.[0] || null,
                                                  }))
                                                }
                                              />

                                              {lectureUploadPct > 0 && (
                                                <div className="mt-2">
                                                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                    <span>Uploading…</span>
                                                    <span>{lectureUploadPct}%</span>
                                                  </div>
                                                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-2 bg-blue-600" style={{ width: `${lectureUploadPct}%` }} />
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                          <button
                                            className="px-3 py-2 text-sm bg-blue-600 text-white rounded"
                                            onClick={saveLecture}
                                          >
                                            Save
                                          </button>
                                          <button
                                            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded"
                                            onClick={() => {
                                              setEditingLectureId(null);
                                              setLectureDraft({ title: "", content_type: "video", video_url: "", pdf_file: null });
                                            }}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        {sub.content_type === "video" && sub.mux_playback_id && sub.mux_playback_token && (
                                      <div className="mt-6">
                                        <MuxVideoPlayer
                                          playbackId={sub.mux_playback_id}
                                          token={sub.mux_playback_token}
                                          title={sub.title}
                                          className="aspect-video rounded-xl overflow-hidden"
                                        />
                                      </div>
                                        )}

                                        {sub.content_type === "video" && !sub.mux_playback_id && sub.video_status && sub.video_status !== "ready" && (
                                      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800">
                                        Video upload status: {sub.video_status}. Refresh in a few moments to preview it here.
                                      </div>
                                        )}

                                        {sub.content_type === "video" && !sub.mux_playback_id && sub.video_url && (
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

                                        {(sub.content_type === "pdf" || sub.content_type === "file") && sub.pdf_file && (
                                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                          <FileText className="w-8 h-8 text-blue-600" />
                                          <div className="flex-1">
                                            <p className="font-medium text-gray-900">Document</p>
                                            <p className="text-sm text-gray-500 break-all">{makeAbsolute(sub.pdf_file)}</p>
                                          </div>
                                        </div>
                                      </div>
                                        )}
                                      </>
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

                                    {(isAdmin || canModify) && (
                                      <button
                                        onClick={() => startEditLecture(sub)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Edit lecture"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                    )}

                                    {sub.content_type === "pdf" && sub.pdf_file && (
                                      <button
                                        onClick={() => handleDownloadPdf(sub.pdf_file!, sub.title)}
                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Download PDF"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    )}

                                    {(isAdmin || canModify) && (
                                      <button
                                        onClick={() => removeLecture(sub.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete lecture"
                                      >
                                        <Trash2 className="w-4 h-4" />
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
                  <p className="font-semibold text-green-700">Active</p>
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
      ) : activeTab === "schedules" ? (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Class Schedules
            </h2>
            <button
              onClick={loadSchedules}
              className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border rounded-xl p-4">
              <div className="font-medium mb-3">
                {editingScheduleId ? "Edit schedule" : "Add schedule"}
              </div>

              <div className="space-y-3">
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Title"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                />
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Description (optional)"
                  rows={3}
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Start</div>
                    <input
                      type="datetime-local"
                      className="w-full border rounded-lg px-3 py-2"
                      value={scheduleForm.start_at}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, start_at: e.target.value })}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">End (optional)</div>
                    <input
                      type="datetime-local"
                      className="w-full border rounded-lg px-3 py-2"
                      value={scheduleForm.end_at}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, end_at: e.target.value })}
                    />
                  </div>
                </div>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Live class link (optional)"
                  value={scheduleForm.live_link}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, live_link: e.target.value })}
                />

                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!token) return;
                      if (!scheduleForm.title.trim() || !scheduleForm.start_at) {
                        alert("Title and start time are required");
                        return;
                      }
                      try {
                        if (editingScheduleId) {
                          await updateSchedule(editingScheduleId, token, {
                            title: scheduleForm.title,
                            description: scheduleForm.description,
                            start_at: new Date(scheduleForm.start_at).toISOString(),
                            end_at: scheduleForm.end_at ? new Date(scheduleForm.end_at).toISOString() : null,
                            live_link: scheduleForm.live_link || null,
                          });
                        } else {
                          await createCourseSchedule(course.id, token, {
                            title: scheduleForm.title,
                            description: scheduleForm.description,
                            start_at: new Date(scheduleForm.start_at).toISOString(),
                            end_at: scheduleForm.end_at ? new Date(scheduleForm.end_at).toISOString() : undefined,
                            live_link: scheduleForm.live_link || undefined,
                          });
                        }
                        setScheduleForm({ title: "", description: "", start_at: "", end_at: "", live_link: "" });
                        setEditingScheduleId(null);
                        await loadSchedules();
                        alert("Saved!");
                      } catch (e: any) {
                        alert(e?.message || "Failed to save schedule");
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {editingScheduleId ? "Update" : "Create"}
                  </button>
                  <button
                    onClick={() => {
                      setScheduleForm({ title: "", description: "", start_at: "", end_at: "", live_link: "" });
                      setEditingScheduleId(null);
                    }}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <div className="border rounded-xl p-4">
              <div className="font-medium mb-3">Upcoming</div>

              {loadingSchedules ? (
                <div className="text-sm text-gray-500">Loading…</div>
              ) : schedules.length === 0 ? (
                <div className="text-sm text-gray-500">No schedules yet.</div>
              ) : (
                <div className="space-y-3">
                  {schedules.map((s) => (
                    <div key={s.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{s.title}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(s.start_at).toLocaleString()}
                            {s.end_at ? ` – ${new Date(s.end_at).toLocaleString()}` : ""}
                          </div>
                          {s.live_link && (
                            <a
                              href={s.live_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Live link
                            </a>
                          )}
                          {s.description ? (
                            <div className="text-sm text-gray-600 mt-1">{s.description}</div>
                          ) : null}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingScheduleId(s.id);
                              setScheduleForm({
                                title: s.title || "",
                                description: s.description || "",
                                start_at: s.start_at ? new Date(s.start_at).toISOString().slice(0, 16) : "",
                                end_at: s.end_at ? new Date(s.end_at).toISOString().slice(0, 16) : "",
                                live_link: s.live_link || "",
                              });
                            }}
                            className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (!token) return;
                              if (!confirm("Delete this schedule?") ) return;
                              try {
                                await deleteSchedule(s.id, token);
                                await loadSchedules();
                              } catch (e: any) {
                                alert(e?.message || "Failed to delete");
                              }
                            }}
                            className="px-3 py-1.5 text-sm rounded-lg border text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                Announcements
              </h3>
              <button
                onClick={loadAnnouncements}
                className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border rounded-xl p-4">
                <div className="font-medium mb-3">
                  {editingAnnouncementId ? "Edit announcement" : "New announcement"}
                </div>

                <div className="space-y-3">
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Title"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  />
                  <textarea
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Message"
                    rows={4}
                    value={announcementForm.message}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  />
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Optional link (live class / notes / etc.)"
                    value={announcementForm.link}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, link: e.target.value })}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!token) return;
                        if (!announcementForm.title.trim()) {
                          alert("Title is required");
                          return;
                        }
                        try {
                          if (editingAnnouncementId) {
                            await updateAnnouncement(editingAnnouncementId, token, {
                              title: announcementForm.title,
                              message: announcementForm.message,
                              link: announcementForm.link || null,
                            });
                          } else {
                            await createCourseAnnouncement(course.id, token, {
                              title: announcementForm.title,
                              message: announcementForm.message,
                              link: announcementForm.link || undefined,
                            });
                          }
                          setAnnouncementForm({ title: "", message: "", link: "" });
                          setEditingAnnouncementId(null);
                          await loadAnnouncements();
                          alert("Sent!");
                        } catch (e: any) {
                          alert(e?.message || "Failed to send announcement");
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {editingAnnouncementId ? "Update" : "Send"}
                    </button>
                    <button
                      onClick={() => {
                        setAnnouncementForm({ title: "", message: "", link: "" });
                        setEditingAnnouncementId(null);
                      }}
                      className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="text-xs text-gray-500">
                    Students enrolled in this course will receive this as a notification.
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-4">
                <div className="font-medium mb-3">Recent</div>

                {loadingAnnouncements ? (
                  <div className="text-sm text-gray-500">Loading…</div>
                ) : announcements.length === 0 ? (
                  <div className="text-sm text-gray-500">No announcements yet.</div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((a: any) => (
                      <div key={a.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium">{a.title}</div>
                            <div className="text-xs text-gray-500">
                              {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
                            </div>
                            {a.message ? <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{a.message}</div> : null}
                            {a.link ? (
                              <a
                                href={a.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                Link
                              </a>
                            ) : null}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingAnnouncementId(a.id);
                                setAnnouncementForm({
                                  title: a.title || "",
                                  message: a.message || "",
                                  link: a.link || "",
                                });
                              }}
                              className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (!token) return;
                                if (!confirm("Delete this announcement?") ) return;
                                try {
                                  await deleteAnnouncement(a.id, token);
                                  await loadAnnouncements();
                                } catch (e: any) {
                                  alert(e?.message || "Failed to delete");
                                }
                              }}
                              className="px-3 py-1.5 text-sm rounded-lg border text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "settings" ? (
        <div className="bg-white rounded-xl border shadow-sm p-6 max-w-3xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Course Settings
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Course information</div>
                <div className="text-xs text-gray-400">
                  Teachers can update course details anytime. Student access and storefront visibility are controlled by learning paths.
                </div>
              </div>

              {(isAdmin || canModify) && (
                <div className="flex items-center gap-2">
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit details
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          // reset form to current course data
                          setCourseForm({
                            title: course.title || "",
                            description: course.description || "",
                            exam_target: (course.exam_target as any) || "jee",
                            student_class: (course.student_class as any) || "11",
                            estimated_duration: (course as any).estimated_duration || "",
                          });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveCourse}
                        disabled={savingCourse}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {savingCourse ? "Saving..." : "Save"}
                      </button>
                      <div className="ml-2 text-xs text-gray-500">
                        {savingCourse
                          ? "Autosaving…"
                          : courseDirty
                          ? "Unsaved changes"
                          : lastSavedAt
                          ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}`
                          : ""}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  value={editMode ? courseForm.title : course.title}
                  onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
                  disabled={!editMode}
                  className={`mt-1 w-full border rounded-lg px-3 py-2 ${editMode ? "bg-white" : "bg-gray-50 text-gray-600"}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Estimated duration</label>
                <input
                  value={editMode ? courseForm.estimated_duration : ((course as any).estimated_duration || "")}
                  onChange={(e) => setCourseForm((p) => ({ ...p, estimated_duration: e.target.value }))}
                  disabled={!editMode}
                  className={`mt-1 w-full border rounded-lg px-3 py-2 ${editMode ? "bg-white" : "bg-gray-50 text-gray-600"}`}
                  placeholder="e.g., 12 weeks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Exam target</label>
                <select
                  value={editMode ? (courseForm.exam_target as any) : (course.exam_target as any)}
                  onChange={(e) => setCourseForm((p) => ({ ...p, exam_target: e.target.value }))}
                  disabled={!editMode}
                  className={`mt-1 w-full border rounded-lg px-3 py-2 ${editMode ? "bg-white" : "bg-gray-50 text-gray-600"}`}
                >
                  <option value="jee">JEE</option>
                  <option value="neet">NEET</option>
                  <option value="eamcet">EAMCET</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Class</label>
                <select
                  value={editMode ? (courseForm.student_class as any) : (course.student_class as any)}
                  onChange={(e) => setCourseForm((p) => ({ ...p, student_class: e.target.value }))}
                  disabled={!editMode}
                  className={`mt-1 w-full border rounded-lg px-3 py-2 ${editMode ? "bg-white" : "bg-gray-50 text-gray-600"}`}
                >
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={editMode ? courseForm.description : (course.description || "")}
                onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))}
                disabled={!editMode}
                rows={5}
                className={`mt-1 w-full border rounded-lg px-3 py-2 ${editMode ? "bg-white" : "bg-gray-50 text-gray-600"}`}
                placeholder="What will students learn?"
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
              <div className="font-medium mb-1">How visibility works</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Teachers can edit courses anytime and add weekly content.</li>
                <li>Students can access courses only after enrolling in a learning path that includes the course.</li>
                <li>Admins control which courses appear in the store by adding them to learning paths.</li>
              </ul>
            </div>
          </div>

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
