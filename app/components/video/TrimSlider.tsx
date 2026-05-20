"use client";

import { useRef } from "react";

interface Props {
  duration: number;
  start: number;
  end: number;
  onStartChange: (val: number) => void;
  onEndChange: (val: number) => void;
  onSeek: (val: number) => void;
}

export function TrimSlider({
  duration,
  start,
  end,
  onStartChange,
  onEndChange,
  onSeek,
}: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00.0";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
  };

  const handleDrag = (type: "start" | "end") => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;

    const getNewValue = (clientX: number) => {
      const rect = track.getBoundingClientRect();
      let percentage = (clientX - rect.left) / rect.width;
      percentage = Math.max(0, Math.min(1, percentage));
      return percentage * duration;
    };

    const updateValue = (clientX: number) => {
      const newValue = getNewValue(clientX);
      if (type === "start") {
        const val = Math.min(newValue, end - 0.1);
        onStartChange(val);
        onSeek(val);
      } else {
        const val = Math.max(newValue, start + 0.1);
        onEndChange(val);
        onSeek(val);
      }
    };

    const getClientX = (event: MouseEvent | TouchEvent) => {
      if ("touches" in event) {
        return event.touches[0].clientX;
      }
      return (event as MouseEvent).clientX;
    };

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      updateValue(getClientX(moveEvent));
    };

    const handleEnd = () => {
      window.removeEventListener("mousemove", handleMove as any);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove as any);
      window.removeEventListener("touchend", handleEnd);
    };

    window.addEventListener("mousemove", handleMove as any);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove as any, { passive: true });
    window.addEventListener("touchend", handleEnd);
  };

  const leftPercent = duration > 0 ? (start / duration) * 100 : 0;
  const rightPercent = duration > 0 ? (end / duration) * 100 : 100;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-between text-sm text-zinc-400 font-mono">
        <span>Inicio: <strong className="text-blue-400">{formatTime(start)}</strong></span>
        <span>Fin: <strong className="text-blue-400">{formatTime(end)}</strong></span>
      </div>

      <div className="relative py-4 select-none">
        {/* Track Container */}
        <div
          ref={trackRef}
          className="relative h-3 w-full rounded-full bg-zinc-800 border border-zinc-700/50 cursor-pointer"
        >
          {/* Active portion */}
          <div
            className="absolute h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.3)]"
            style={{
              left: `${leftPercent}%`,
              width: `${rightPercent - leftPercent}%`,
            }}
          />

          {/* Left Handle */}
          <div
            onMouseDown={handleDrag("start")}
            onTouchStart={handleDrag("start")}
            className="absolute top-1/2 -translate-y-1/2 -ml-2.5 h-6 w-5 rounded-md bg-white hover:bg-blue-50 border border-zinc-300 shadow-md cursor-ew-resize flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            style={{ left: `${leftPercent}%` }}
          >
            <div className="flex gap-0.5">
              <div className="w-[1.5px] h-3 bg-zinc-400" />
              <div className="w-[1.5px] h-3 bg-zinc-400" />
            </div>
          </div>

          {/* Right Handle */}
          <div
            onMouseDown={handleDrag("end")}
            onTouchStart={handleDrag("end")}
            className="absolute top-1/2 -translate-y-1/2 -ml-2.5 h-6 w-5 rounded-md bg-white hover:bg-blue-50 border border-zinc-300 shadow-md cursor-ew-resize flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            style={{ left: `${rightPercent}%` }}
          >
            <div className="flex gap-0.5">
              <div className="w-[1.5px] h-3 bg-zinc-400" />
              <div className="w-[1.5px] h-3 bg-zinc-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-zinc-500 font-mono">
        <span>00:00.0</span>
        <span>Duración total: {formatTime(duration)}</span>
      </div>
    </div>
  );
}
