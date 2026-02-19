import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentCourseDetail, getCourseQuizzes } from "../../api/api";
import { Lock, ArrowLeft, HelpCircle } from "lucide-react";

type Course = {
  id: number;
  title: string;
  description: string;
  exam_target: string;
  student_class: string;
  sections: Array<{
    id: number;
    title: string;
    order: number;
    subsections: Array<{
      id: number;
      title: string;
      order: number;
      content_type: "video" | "pdf";
      video_url?: string | null;
      pdf_file?: string | null;
    }>;
  }>;
};

export default function StudentCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          navigate(`/login?redirect=/student/courses/${courseId}`);
          return;
        }

        const data = await getStudentCourseDetail(token, Number(courseId));
        setCourse(data);
        try {
          setQuizLoading(true);
          const q = await getCourseQuizzes(token!, data.id);
          setQuizzes(Array.isArray(q) ? q : []);
        } catch (e) {
          setQuizzes([]);
        } finally {
          setQuizLoading(false);
        }
      } catch (e: any) {
        console.error(e);
        setCourse(null);

        // 403 means locked (not purchased)
        if (e?.status === 403) {
          setError(e?.message || "This course is locked. Purchase a package to unlock.");
        } else {
          setError(e?.message || "Failed to load course");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  if (loading) return <div className="p-10 text-center">Loading course...</div>;

  if (!course) {
    return (
      <div className="p-10 max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <Lock className="w-5 h-5" />
            <span className="font-semibold">Access restricted</span>
          </div>
          <div className="text-gray-700">{error || "Course not available"}</div>

          <button
            onClick={() => navigate("/packages")}
            className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-lg"
          >
            View Packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white border rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-6">{course.description}</p>

        <div className="space-y-4">
          {course.sections?.map((s) => (
            <div key={s.id} className="border rounded-xl p-5 bg-gray-50">
              <div className="font-semibold mb-2">
                {s.order}. {s.title}
              </div>

              <div className="space-y-2">
                {s.subsections?.map((ss) => (
                  <div key={ss.id} className="bg-white border rounded-lg p-3">
                    <div className="text-sm font-medium">
                      {ss.order}. {ss.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {ss.content_type === "video" ? "Video" : "PDF"}
                    </div>
                  </div>
                ))}

                {(!s.subsections || s.subsections.length === 0) && (
                  <div className="text-sm text-gray-500">No lectures added yet.</div>
                )}
              </div>
            </div>
          ))}

          {(!course.sections || course.sections.length === 0) && (
            <div className="text-gray-600">No sections added yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
