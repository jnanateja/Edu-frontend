import { useEffect, useMemo, useState } from "react";

type PdfPreviewProps = {
  /** Absolute URL to the PDF (ex: http://127.0.0.1:8000/media/...pdf) */
  url: string;
  /** Optional bearer token if your media endpoint is protected */
  token?: string | null;
  /** iframe title */
  title?: string;
  /** Height for the viewer */
  height?: string | number;
  /** Optional extra classes for iframe */
  className?: string;
};

export default function PdfPreview({
  url,
  token = null,
  height = "75vh",
  className = "",
}: PdfPreviewProps) {
  const [blobUrl, setBlobUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const headers = useMemo(() => {
    const h: Record<string, string> = {};
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  useEffect(() => {
    let active = true;
    let currentObjectUrl = "";

    async function load() {
      try {
        setError("");
        setBlobUrl("");

        if (!url) return;

        // ✅ In dev, prefer same-origin (/media/...) so Vite proxy can serve Django media
        // This avoids CORS issues that can block `fetch()` for PDFs.
        // Always fetch the provided URL. Do not strip API_BASE_URL; that breaks in production.
        const fetchUrl = url;

        // Some filenames contain spaces or special chars; browsers handle this in a new-tab
        // navigation, but `fetch()` needs a properly encoded URL.
        const safeFetchUrl = encodeURI(fetchUrl);

        const res = await fetch(safeFetchUrl, {
          method: "GET",
          headers,
        });

        if (!res.ok) {
          throw new Error(`Failed to load PDF (${res.status})`);
        }

        let blob = await res.blob();
        // Some servers may not send a PDF content-type; force it so browsers render inline.
        if (blob && blob.type !== "application/pdf") {
          blob = new Blob([blob], { type: "application/pdf" });
        }
        currentObjectUrl = URL.createObjectURL(blob);

        if (!active) return;
        setBlobUrl(currentObjectUrl);
      } catch (e: any) {
        console.error("PDF load error:", e);
        if (!active) return;
        setError(e?.message || "Failed to load PDF");
      }
    }

    load();

    return () => {
      active = false;
      if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    };
  }, [url, headers]);

  if (!url) return null;

  if (error) {
    return (
      <div className="p-4">
        <div className="text-sm text-red-600 font-medium">PDF viewer failed</div>
        <div className="text-sm text-gray-700 mt-1">{error}</div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-3 text-sm underline"
        >
          Open PDF in new tab
        </a>
      </div>
    );
  }

  if (!blobUrl) {
    return <div className="p-4 text-sm text-gray-600">Loading PDF…</div>;
  }

  return (
    <div className={`w-full ${className}`.trim()} style={{ height }}>
      {/*
        Some browsers/extensions render `blob:` PDFs as blank inside <iframe>.
        <object>/<embed> is more reliable for inline PDF viewing.
      */}
      <object data={blobUrl} type="application/pdf" width="100%" height="100%">
        <embed src={blobUrl} type="application/pdf" width="100%" height="100%" />

        {/* Fallback */}
        <div className="p-4 text-sm">
          Your browser can’t display this PDF inline.
          <a href={url} target="_blank" rel="noreferrer" className="ml-2 underline">
            Open PDF
          </a>
        </div>
      </object>
    </div>
  );
}
