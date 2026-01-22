export function toEmbedUrl(url: string) {
  if (!url) return "";

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