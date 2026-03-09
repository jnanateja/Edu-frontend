import { useMemo, useState } from "react";
import { API_BASE_URL } from "../../api/api";
import YouTubePlayer from "./YouTubePlayer";

type VideoPlayerProps = {
  /** Absolute or relative URL to the video (mp4/webm/etc.) */
  url: string;
  title?: string;
  className?: string;
  /** Optional poster image */
  poster?: string;
};

/**
 * Simple HTML5 video player.
 *
 * In dev, it rewrites Django absolute URLs (API_BASE_URL + /media/...) into
 * same-origin (/media/...) so Vite proxy can serve the media without CORS issues.
 */
export default function VideoPlayer({
  url,
  title = "Video",
  className = "",
  poster,
}: VideoPlayerProps) {
  const [error, setError] = useState<string>("");

  // Normalize common "schemeless" URLs users paste (e.g., "www.youtube.com/..." or "youtu.be/..." )
  // so URL() parsing and embeds work reliably.
  const normalizedUrl = useMemo(() => {
    if (!url) return "";
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;
    // If it looks like a hostname (www., youtube.com, youtu.be, etc.), assume https.
    if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }, [url]);

  const isYouTube = useMemo(() => {
    if (!normalizedUrl) return false;
    try {
      const u = new URL(normalizedUrl);
      const host = u.hostname.toLowerCase();
      return (
        host.includes("youtube.com") ||
        host.includes("youtu.be") ||
        host.includes("m.youtube.com")
      );
    } catch {
      // If it's not a valid URL, it's definitely not YouTube.
      return false;
    }
  }, [normalizedUrl]);

  const playUrl = useMemo(() => {
    if (!normalizedUrl) return "";
    return normalizedUrl.startsWith(API_BASE_URL)
      ? normalizedUrl.replace(API_BASE_URL, "")
      : normalizedUrl;
  }, [normalizedUrl]);

  if (!normalizedUrl) return null;

  // ✅ YouTube links: render an embedded YouTube player.
  if (isYouTube) {
    return <YouTubePlayer url={normalizedUrl} title={title} className={className} />;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-sm text-red-600 font-medium">Video player failed</div>
        <div className="text-sm text-gray-700 mt-1">{error}</div>
        <a
          href={normalizedUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-3 text-sm underline"
        >
          Open video in new tab
        </a>
      </div>
    );
  }

  return (
    <video
      aria-label={title}
      className={`w-full rounded-lg border bg-black ${className}`.trim()}
      controls
      preload="metadata"
      playsInline
      poster={poster}
      onError={() => setError("Failed to load video. Check the URL or permissions.")}
    >
      <source src={playUrl} />
      Your browser does not support the video tag.
    </video>
  );
}
