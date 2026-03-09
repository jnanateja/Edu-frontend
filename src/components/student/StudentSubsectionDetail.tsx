import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PlayCircle, ExternalLink, Lock } from "lucide-react";
import { API_BASE_URL, getStudentSubsectionDetail } from "../../api/api";
import PdfPreview from "./PdfPreview";
import VideoPlayer from "./VideoPlayer";
import MuxVideoPlayer from "./MuxVideoPlayer";

type Subsection = {
  id: number;
  title: string;
  content_type: "video" | "pdf" | "file";
  video_url?: string | null;
  pdf_file?: string | null;
  mux_playback_id?: string | null;
  mux_playback_token?: string | null;
  video_status?: string | null;
  section?: number;
};

function absoluteUrl(maybeRelative: string | null | undefined) {
  if (!maybeRelative) return "";
  if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
  // ensure exactly one slash between base + path
  if (maybeRelative.startsWith("/")) return `${API_BASE_URL}${maybeRelative}`;
  return `${API_BASE_URL}/${maybeRelative}`;
}

export default function StudentSubsectionDetail() {
  const { subsectionId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [data, setData] = useState<Subsection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        if (!token) {
          navigate(`/login?redirect=/student/subsections/${subsectionId}`);
          return;
        }
        const res = await getStudentSubsectionDetail(token, Number(subsectionId));
        setData(res);
      } catch (e: any) {
        console.error(e);
        if (e?.status === 403) {
          setError(e?.message || "This content is locked. Enroll in a learning path that includes this course.");
        } else {
          setError(e?.message || "Failed to load content");
        }
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [subsectionId]);

  const pdfUrl = useMemo(() => absoluteUrl(data?.pdf_file), [data?.pdf_file]);
  const videoUrl = useMemo(() => absoluteUrl(data?.video_url), [data?.video_url]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!data) {
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
          <div className="text-gray-700">{error || "Content not available"}</div>

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
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white border rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
            <div className="mt-1 text-sm text-gray-600">
              {data.content_type === "video" ? "Video lesson" : "PDF lesson"}
            </div>
          </div>

          {(data.content_type === "pdf" || data.content_type === "file") && pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-sm font-medium hover:bg-gray-50"
            >
              <ExternalLink className="w-4 h-4" />
              Open PDF
            </a>
          ) : null}
        </div>

        <div className="mt-6">
          {data.content_type === "video" ? (
            <div className="border rounded-2xl overflow-hidden bg-black">
              {data.mux_playback_id && data.mux_playback_token ? (
                <MuxVideoPlayer
                  playbackId={data.mux_playback_id}
                  token={data.mux_playback_token}
                  title={data.title}
                  className="h-[70vh]"
                />
              ) : videoUrl ? (
                <VideoPlayer url={videoUrl} title={data.title} className="h-[70vh] object-contain" />
              ) : (
                <div className="p-6 text-white/80 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  {data.video_status && data.video_status !== "ready"
                    ? `Video is ${data.video_status}. Please check back soon.`
                    : "No video available yet."}
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-2xl overflow-hidden">
              <PdfPreview url={pdfUrl} title={data.title} height="75vh" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
