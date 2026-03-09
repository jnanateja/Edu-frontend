import { useMemo } from "react";

function extractYouTubeId(rawUrl: string): string | null {
  if (!rawUrl) return null;

  const trimmed = rawUrl.trim();
  const normalized = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : trimmed.startsWith("//")
      ? `https:${trimmed}`
      : /^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(trimmed)
        ? `https://${trimmed}`
        : trimmed;

  try {
    const u = new URL(normalized);
    const host = u.hostname.toLowerCase();

    // youtu.be/VIDEO_ID
    if (host.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    // youtube.com/watch?v=VIDEO_ID
    const v = u.searchParams.get("v");
    if (v) return v;

    // youtube.com/embed/VIDEO_ID
    const parts = u.pathname.split("/").filter(Boolean);
    const embedIdx = parts.indexOf("embed");
    if (embedIdx !== -1 && parts[embedIdx + 1]) return parts[embedIdx + 1];

    // youtube.com/shorts/VIDEO_ID
    const shortsIdx = parts.indexOf("shorts");
    if (shortsIdx !== -1 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];

    return null;
  } catch {
    return null;
  }
}

type Props = {
  url: string;
  title?: string;
  className?: string;
  /** Height in px/vh, etc. */
  height?: string | number;
};

/**
 * Lightweight YouTube embed player (no extra dependencies).
 *
 * Note: Some YouTube videos cannot be embedded if the uploader disables embedding
 * or the video is private/restricted.
 */
export default function YouTubePlayer({
  url,
  title = "YouTube Video",
  className = "",
  height = "60vh",
}: Props) {
  const videoId = useMemo(() => extractYouTubeId(url), [url]);
  const normalizedUrl = useMemo(() => {
    if (!url) return "";
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;
    if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(trimmed)) return `https://${trimmed}`;
    return trimmed;
  }, [url]);
  const embedUrl = useMemo(() => {
    if (!videoId) return "";
    // rel=0 reduces related video noise; modestbranding is best-effort.
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }, [videoId]);

  if (!url) return null;

  if (!videoId) {
    return (
      <div className="p-4">
        <div className="text-sm text-red-600 font-medium">Invalid YouTube link</div>
        <a className="text-sm underline" href={normalizedUrl || url} target="_blank" rel="noreferrer">
          Open link
        </a>
      </div>
    );
  }

  return (
    <iframe
      title={title}
      src={embedUrl}
      className={`w-full rounded-lg border bg-black ${className}`.trim()}
      style={{ height }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
