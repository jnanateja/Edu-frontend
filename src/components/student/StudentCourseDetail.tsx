import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL, getStudentCourseDetail, getCourseQuizzes, getCourseSchedules, getCourseAnnouncements } from "../../api/api";
import { Lock, ArrowLeft, PlayCircle, ClipboardList, Megaphone } from "lucide-react";
import PdfPreview from "./PdfPreview";
import VideoPlayer from "./VideoPlayer";
import MuxVideoPlayer from "./MuxVideoPlayer";

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
      mux_playback_id?: string | null;
      mux_playback_token?: string | null;
      video_status?: string | null;
    }>;
  }>;
};

export default function StudentCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [course, setCourse] = useState<Course | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openSubId, setOpenSubId] = useState<number | null>(null);

  const resolveMediaUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE_URL}${url}`;
  };

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

        // schedules
        try {
          const s = await getCourseSchedules(data.id, token);
          setSchedules(Array.isArray(s) ? s : []);
        } catch {
          setSchedules([]);
        }

        // announcements
        try {
          const a = await getCourseAnnouncements(data.id, token);
          setAnnouncements(Array.isArray(a) ? a : []);
        } catch {
          setAnnouncements([]);
        }
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
          setError(e?.message || "This course is locked. Enroll in a learning path that includes this course.");
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
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={() => navigate("/student/dashboard")}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Return to Dashboard
          </button>
        </div>

        {/* =====================
            ANNOUNCEMENTS
        ===================== */}
        <div className="border rounded-2xl p-6 bg-white mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                Announcements
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Updates from your teacher for this course.
              </p>
            </div>
            <button
              onClick={async () => {
                if (!token) return;
                try {
                  const a = await getCourseAnnouncements(Number(courseId), token);
                  setAnnouncements(Array.isArray(a) ? a : []);
                } catch {}
              }}
              className="px-4 py-2 rounded-lg border bg-white text-sm font-medium hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="mt-4 text-sm text-gray-600">No announcements yet.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {announcements.slice(0, 10).map((a: any) => (
                <div key={a.id} className="border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{a.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
                      </div>
                      {a.message ? (
                        <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{a.message}</div>
                      ) : null}
                      {a.link ? (
                        <div className="mt-3">
                          <a
                            href={a.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Open Link
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <Lock className="w-5 h-5" />
            <span className="font-semibold">Access restricted</span>
          </div>
          <div className="text-gray-700">{error || "Course not available"}</div>

          <button
            onClick={() => navigate("/learning-paths")}
            className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-lg"
          >
            View Learning Paths
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={() => navigate("/student/dashboard")}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Return to Dashboard
        </button>
      </div>

      <div className="bg-white border rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-6">{course.description}</p>

        {/* =====================
            SCHEDULES
        ===================== */}
        <div className="border rounded-2xl p-6 bg-white mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Class Schedule</h2>
              <p className="text-sm text-gray-600 mt-1">
                Your teacher can add live/virtual class times here.
              </p>
            </div>
            <button
              onClick={async () => {
                if (!token) return;
                try {
                  const s = await getCourseSchedules(course.id, token);
                  setSchedules(Array.isArray(s) ? s : []);
                } catch {}
              }}
              className="px-4 py-2 rounded-lg border bg-white text-sm font-medium hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          {schedules.length === 0 ? (
            <div className="mt-4 text-sm text-gray-600">No schedules posted yet.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {schedules.slice(0, 8).map((s: any) => (
                <div key={s.id} className="border rounded-xl p-4">
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(s.start_at).toLocaleString()}
                    {s.end_at ? ` – ${new Date(s.end_at).toLocaleString()}` : ""}
                  </div>
                  {s.description ? (
                    <div className="text-sm text-gray-600 mt-2">{s.description}</div>
                  ) : null}
                  {s.live_link ? (
                    <div className="mt-3">
                      <a
                        href={s.live_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Join Live Class
                      </a>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =====================
            QUIZZES
        ===================== */}
        <div className="border rounded-2xl p-6 bg-gray-50 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Quizzes</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Your teacher may publish quizzes for this course. Published quizzes appear here.
              </p>
            </div>
            <button
              onClick={() => navigate("/student/grades")}
              className="px-4 py-2 rounded-lg border bg-white text-sm font-medium hover:bg-gray-50"
            >
              View Grades
            </button>
          </div>

          {quizLoading ? (
            <div className="mt-4 text-sm text-gray-600">Loading quizzes…</div>
          ) : quizzes.length === 0 ? (
            <div className="mt-4 text-sm text-gray-600">No quizzes published yet.</div>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map((q: any) => (
                <div key={q.id} className="bg-white border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{q.title}</div>
                      <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {q.description || "—"}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {(q.questions?.length ?? 0) > 0
                          ? `${q.questions.length} questions`
                          : "—"}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {q.due_at ? (
                          <span className="text-[11px] px-2 py-1 rounded-full border bg-gray-50 text-gray-700">
                            Due {new Date(q.due_at).toLocaleString()}
                          </span>
                        ) : null}
                        {q.time_limit_minutes ? (
                          <span className="text-[11px] px-2 py-1 rounded-full border bg-gray-50 text-gray-700">
                            {q.time_limit_minutes} min
                          </span>
                        ) : null}
                        {q.quiz_type === "pdf" ? (
                          <span className="text-[11px] px-2 py-1 rounded-full border bg-gray-50 text-gray-700">Manual grading</span>
                        ) : q.max_attempts !== undefined ? (
                          <span className="text-[11px] px-2 py-1 rounded-full border bg-gray-50 text-gray-700">
                            {q.allow_retakes === false
                              ? "No retakes"
                              : q.max_attempts === 0
                              ? "Unlimited attempts"
                              : `${q.max_attempts} attempt${q.max_attempts === 1 ? "" : "s"}`}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/student/quizzes/${q.id}`)}
                      className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                    >
                      <PlayCircle className="w-4 h-4" />
                      {q.quiz_type === "pdf" ? "Open" : "Start"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {course.sections?.map((s) => (
            <div key={s.id} className="border rounded-xl p-5 bg-gray-50">
              <div className="font-semibold mb-2">
                {s.order}. {s.title}
              </div>

              <div className="space-y-2">
                {s.subsections?.map((ss) => {
                  const isOpen = openSubId === ss.id;
                  const pdfUrl = resolveMediaUrl(ss.pdf_file || null);
                  const videoUrl = resolveMediaUrl(ss.video_url || null);

                  return (
                    <div key={ss.id} className="bg-white border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setOpenSubId((prev) => (prev === ss.id ? null : ss.id))}
                        className="w-full text-left p-3 hover:bg-gray-50"
                      >
                        <div className="text-sm font-medium">
                          {ss.order}. {ss.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {ss.content_type === "video" ? "Video" : "PDF"}
                          <span className="ml-2 text-gray-400">•</span>
                          <span className="ml-2 text-blue-600">{isOpen ? "Hide" : "Preview"}</span>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t bg-gray-50 p-3">
                          {ss.content_type === "pdf" ? (
                            <div>
                              <div className="flex items-center justify-between gap-3 mb-3">
                                <div className="text-sm text-gray-700">PDF Preview</div>
                                <div className="flex items-center gap-2">
                                  <a
                                    href={pdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg border bg-white text-xs font-medium hover:bg-gray-50"
                                  >
                                    Open
                                  </a>
                                  <a
                                    href={pdfUrl}
                                    download
                                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                                  >
                                    Download PDF
                                  </a>
                                </div>
                              </div>

                              {pdfUrl ? (
                                <PdfPreview
                                  url={pdfUrl}
                                  title={ss.title}
                                  className="rounded-lg border bg-white"
                                  height="520px"
                                />
                              ) : (
                                <div className="text-sm text-gray-600">No PDF uploaded for this lecture.</div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between gap-3 mb-3">
                                <div className="text-sm text-gray-700">Video</div>
                                {videoUrl && !ss.mux_playback_id ? (
                                  <a
                                    href={videoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg border bg-white text-xs font-medium hover:bg-gray-50"
                                  >
                                    Open
                                  </a>
                                ) : null}
                              </div>
                              {ss.mux_playback_id && ss.mux_playback_token ? (
                                <div className="rounded-lg overflow-hidden bg-black">
                                  <MuxVideoPlayer
                                    playbackId={ss.mux_playback_id}
                                    token={ss.mux_playback_token}
                                    title={ss.title}
                                    className="aspect-video"
                                  />
                                </div>
                              ) : videoUrl ? (
                                <VideoPlayer url={videoUrl} title={ss.title} className="aspect-video" />
                              ) : (
                                <div className="text-sm text-gray-500 flex items-center gap-2 py-2">
                                  <PlayCircle className="w-4 h-4" />
                                  {ss.video_status && ss.video_status !== "ready"
                                    ? `Video is ${ss.video_status} — check back soon.`
                                    : "Video not available yet."}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

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
