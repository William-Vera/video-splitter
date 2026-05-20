"use client";

import { useEffect } from "react";

interface Props {
  file: File;
  onDurationLoad: (duration: number) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function VideoPreview({
  file,
  onDurationLoad,
  videoRef,
}: Props) {
  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (videoRef.current) {
      videoRef.current.src = url;
    }
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, videoRef]);

  return (
    <video
      ref={videoRef}
      controls
      onLoadedMetadata={(e) => {
        onDurationLoad(e.currentTarget.duration);
      }}
      className="
        mt-6
        w-full
        rounded-2xl
        border border-zinc-800
        shadow-2xl
      "
    />
  );
}