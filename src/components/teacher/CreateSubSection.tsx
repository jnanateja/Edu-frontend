import { useEffect, useState } from "react";
import { createMuxUpload, createSubSection, syncMuxUpload, uploadFileToMux } from "../../api/api";
import { Lock } from "lucide-react";

interface CreateSubSectionProps {
  sectionId: number;
  onCreated: () => void;
  canModify?: boolean;
  nextOrder?: number;
}

const CreateSubSection = ({
  sectionId,
  onCreated,
  canModify = true,
  nextOrder,
}: CreateSubSectionProps) => {
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState<number>(nextOrder ?? 1);
  const [type, setType] = useState<"video" | "pdf" | "file">("video");
  const [videoFile, setVideoFile] = useState<File | undefined>(undefined);
  const [pdfFile, setPdfFile] = useState<File | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusText, setStatusText] = useState("");
  const [uploadPct, setUploadPct] = useState(0);

  useEffect(() => {
    if (typeof nextOrder === "number") setOrder(nextOrder);
  }, [nextOrder]);

  if (!canModify) {
    return (
      <div className="mt-2 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded">
          <Lock className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Permission Required</h3>
            <p className="text-xs text-yellow-700 mt-0.5">
              You need to be assigned to this course to add lectures
            </p>
          </div>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError("Lecture title is required");
      return false;
    }

    if (type === "video" && !videoFile) {
      setError("Video file is required");
      return false;
    }

    if ((type === "pdf" || type === "file") && !pdfFile) {
      setError("Document file is required");
      return false;
    }

    if ((type === "pdf" || type === "file") && pdfFile && pdfFile.size > 10 * 1024 * 1024) {
      setError("Document file must be less than 10MB");
      return false;
    }

    return true;
  };

  const pollMuxUntilReady = async (token: string, subsectionId: number) => {
    const maxAttempts = 20;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const synced = await syncMuxUpload(token, subsectionId);
      if (synced?.video_status === "ready" && synced?.mux_playback_id) {
        return synced;
      }
      setStatusText(
        synced?.video_status === "processing"
          ? "Mux is processing the video…"
          : "Waiting for Mux to create the video asset…"
      );
      await new Promise((resolve) => window.setTimeout(resolve, 3000));
    }

    throw new Error("Video uploaded, but Mux is still processing it. Refresh in a few moments.");
  };

  const resetForm = () => {
    setTitle("");
    setVideoFile(undefined);
    setPdfFile(undefined);
    setUploadPct(0);
    setStatusText("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatusText("");

    const token = localStorage.getItem("access");
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setUploadPct(0);

    try {
      const subsection = await createSubSection(
        token,
        {
          section: sectionId,
          title: title.trim(),
          order: Number(order) || 1,
          content_type: type,
          pdf_file: type === "video" ? undefined : pdfFile,
        },
        (pct) => setUploadPct(pct)
      );

      if (type === "video" && videoFile) {
        setStatusText("Creating secure Mux upload…");
        const muxUpload = await createMuxUpload(token, subsection.id);

        setStatusText("Uploading video to Mux…");
        await uploadFileToMux(muxUpload.upload_url, videoFile, (pct) => setUploadPct(pct));

        setStatusText("Finalizing Mux video…");
        await pollMuxUntilReady(token, subsection.id);
      }

      resetForm();
      onCreated();
    } catch (err: any) {
      console.error("Failed to create lecture:", err);
      const data = err?.data;
      if (data && typeof data === "object") {
        const parts: string[] = [];
        for (const [k, v] of Object.entries(data)) {
          if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
          else if (typeof v === "string") parts.push(`${k}: ${v}`);
        }
        if (parts.length) {
          setError(parts.join(" • "));
        } else {
          setError(err.message || "Failed to create lecture. Please try again.");
        }
      } else {
        setError(err.message || "Failed to create lecture. Please try again.");
      }
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  const baseId = `subsection-${sectionId}`;
  const fileProgressLabel = type === "video" ? "Uploading video…" : "Uploading document…";

  return (
    <div className="mt-2 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Lecture</h3>

      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200" role="alert">
          {error}
        </div>
      )}

      {loading && uploadPct > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>{statusText || fileProgressLabel}</span>
            <span>{uploadPct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2 bg-blue-600" style={{ width: `${uploadPct}%` }} />
          </div>
        </div>
      )}

      {loading && statusText && uploadPct === 0 && (
        <div className="mb-3 text-xs text-gray-600">{statusText}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div>
          <label htmlFor={`${baseId}-title`} className="block text-sm font-medium mb-1">
            Lecture Title *
          </label>
          <input
            id={`${baseId}-title`}
            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter lecture title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError("");
            }}
            disabled={loading}
            maxLength={200}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${baseId}-type`} className="block text-sm font-medium mb-1">
              Content Type
            </label>
            <select
              id={`${baseId}-type`}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={type}
              onChange={(e) => {
                setType(e.target.value as "video" | "pdf" | "file");
                setVideoFile(undefined);
                setPdfFile(undefined);
                setError("");
              }}
              disabled={loading}
            >
              <option value="video">Video</option>
              <option value="pdf">PDF Document</option>
              <option value="file">Document</option>
            </select>
          </div>

          <div>
            <label htmlFor={`${baseId}-order`} className="block text-sm font-medium mb-1">
              Order Number
            </label>
            <input
              id={`${baseId}-order`}
              type="number"
              min="1"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              disabled={loading}
            />
          </div>
        </div>

        {type === "video" && (
          <div>
            <label htmlFor={`${baseId}-video`} className="block text-sm font-medium mb-1">
              Video File *
            </label>
            <input
              id={`${baseId}-video`}
              type="file"
              accept="video/*"
              className="w-full border border-gray-300 px-3 py-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
              onChange={(e) => setVideoFile(e.target.files?.[0])}
              disabled={loading}
            />
            {videoFile && (
              <div className="mt-2 text-sm text-gray-700">
                <span className="text-green-600 mr-2">✓</span>
                <span className="truncate">{videoFile.name}</span>
              </div>
            )}
          </div>
        )}

        {(type === "pdf" || type === "file") && (
          <div>
            <label htmlFor={`${baseId}-pdf`} className="block text-sm font-medium mb-1">
              {type === "pdf" ? "PDF File *" : "Document File *"}
            </label>
            <input
              id={`${baseId}-pdf`}
              type="file"
              accept={type === "pdf" ? ".pdf,application/pdf" : ".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar"}
              className="w-full border border-gray-300 px-3 py-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
              onChange={(e) => setPdfFile(e.target.files?.[0])}
              disabled={loading}
            />
            {pdfFile && (
              <div className="mt-2 text-sm text-gray-700">
                <span className="text-green-600 mr-2">✓</span>
                <span className="truncate">{pdfFile.name}</span>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Add Lecture"}
        </button>
      </form>
    </div>
  );
};

export default CreateSubSection;
