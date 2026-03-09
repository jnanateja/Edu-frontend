import MuxPlayer from "@mux/mux-player-react";

interface MuxVideoPlayerProps {
  playbackId: string;
  token: string;
  title?: string;
  className?: string;
}

export default function MuxVideoPlayer({
  playbackId,
  token,
  title = "Video lesson",
  className = "",
}: MuxVideoPlayerProps) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      tokens={{ playback: token }}
      streamType="on-demand"
      metadata={{ video_title: title }}
      className={`w-full ${className}`.trim()}
    />
  );
}
