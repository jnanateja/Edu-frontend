export function toEmbedUrl(url: string) {
  if (!url) return "";

  // If someone pasted a full iframe snippet, extract src.
  const m = url.match(/src\s*=\s*"([^"]+)"/i);
  if (m?.[1]) url = m[1];

  // Normalize schemeless URLs.
  const trimmed = url.trim();
  if (
    trimmed &&
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://") &&
    (trimmed.startsWith("www.") || trimmed.startsWith("youtube.com") || trimmed.startsWith("m.youtube.com") || trimmed.startsWith("youtu.be"))
  ) {
    url = `https://${trimmed}`;
  }

  let videoId = "";

  // youtu.be/VIDEO_ID
  if (url.includes("youtu.be")) {
    videoId = url.split("youtu.be/")[1];
  }
  // youtube.com/watch?v=VIDEO_ID
  else if (url.includes("watch?v=")) {
    videoId = url.split("watch?v=")[1].split("&")[0];
  }
  // already embed
  else if (url.includes("/embed/")) {
    return url;
  }

  if (!videoId) return "";

  // 🔒 Restrictive parameters to minimize UI
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&disablekb=1&fs=0&iv_load_policy=3`;
}

// Normalize user input for video URL fields.
// Accepts either a plain URL or a full <iframe ...> snippet and returns a URL.
export function normalizeVideoInput(input: string) {
  const raw = (input || "").trim();
  if (!raw) return "";

  // iframe pasted
  const m = raw.match(/src\s*=\s*"([^"]+)"/i);
  const url = (m?.[1] ? m[1] : raw).trim();

  // schemeless
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    if (url.startsWith("www.") || url.startsWith("youtube.com") || url.startsWith("m.youtube.com") || url.startsWith("youtu.be")) {
      return `https://${url}`;
    }
  }
  return url;
}