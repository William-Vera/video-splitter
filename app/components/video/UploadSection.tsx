"use client";

import { useState, useRef } from "react";

import { VideoUploader } from "./VideoUploader";
import { VideoPreview } from "./VideoPreview";
import { PresetSelector } from "./PresetSelector";
import { ExportButton } from "./ExportButton";
import { TrimSlider } from "./TrimSlider";

import { useVideoProcessor } from "@/app/hooks/useVideoProcessor";
import { downloadZip } from "@/app/utils/download";

import { AlertCircle, Scissors, Layers } from "lucide-react";

export function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"split" | "trim">("split");

  const [splitDuration, setSplitDuration] = useState(59);
  const [videoDuration, setVideoDuration] = useState(0);

  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { splitVideo, trimVideo, isProcessing } = useVideoProcessor();

  const MAX_FILE_SIZE_GB = 2;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_GB * 1024 * 1024 * 1024;

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError(
        `El archivo supera el límite de ${MAX_FILE_SIZE_GB} GB. Por favor, selecciona un video de menor tamaño (tu archivo pesa ${(
          selectedFile.size /
          1024 /
          1024 /
          1024
        ).toFixed(2)} GB).`
      );
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setVideoDuration(0);
    setTrimStart(0);
    setTrimEnd(0);
  };

  const handleDurationLoad = (duration: number) => {
    setVideoDuration(duration);
    setTrimEnd(duration);
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      if (!videoRef.current.paused) {
        videoRef.current.pause();
      }
    }
  };

  async function handleSplit() {
    if (!file) return;

    try {
      setError(null);
      let results;

      if (mode === "split") {
        results = await splitVideo(file, splitDuration);
      } else {
        results = await trimVideo(file, trimStart, trimEnd);
      }

      const zipName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      await downloadZip(results, zipName);
    } catch (err: any) {
      setError(err.message || "Error al procesar el video.");
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-4xl px-4">
      <VideoUploader onFileSelect={handleFileSelect} />

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 shadow-md">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-300">Error</h4>
            <p className="mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {file && (
        <>
          <VideoPreview
            file={file}
            onDurationLoad={handleDurationLoad}
            videoRef={videoRef}
          />

          <div className="mt-6 rounded-2xl bg-zinc-900 p-6 border border-zinc-800 shadow-lg">
            <p className="font-medium text-zinc-100">{file.name}</p>
            <p className="mt-1 text-sm text-zinc-400">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-8 flex rounded-2xl bg-zinc-900/60 p-1 border border-zinc-800/80 shadow-inner">
            <button
              onClick={() => setMode("split")}
              className={`flex-grow flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium transition-all duration-200 ${
                mode === "split"
                  ? "bg-zinc-800 text-white shadow border border-zinc-700/35"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Layers className="h-4 w-4" />
              Dividir por partes
            </button>
            <button
              onClick={() => setMode("trim")}
              className={`flex-grow flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium transition-all duration-200 ${
                mode === "trim"
                  ? "bg-zinc-800 text-white shadow border border-zinc-700/35"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Scissors className="h-4 w-4" />
              Recorte Único
            </button>
          </div>

          {/* Mode Contents */}
          {mode === "split" ? (
            <div className="mt-6 space-y-6">
              <PresetSelector
                selected={splitDuration}
                onChange={setSplitDuration}
              />

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                <h3 className="text-sm font-medium text-zinc-300">
                  Duración personalizada de cada parte
                </h3>
                <div className="mt-4 flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max={Math.max(10, Math.floor(videoDuration) || 300)}
                    value={splitDuration}
                    onChange={(e) => setSplitDuration(Number(e.target.value))}
                    className="h-2 flex-1 cursor-pointer rounded-lg bg-zinc-800 accent-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={Math.max(10, Math.floor(videoDuration) || 300)}
                      value={splitDuration}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val > 0) setSplitDuration(val);
                      }}
                      className="w-20 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-center text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-sm text-zinc-400 font-medium">
                      seg
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <h3 className="text-sm font-medium text-zinc-300">
                Selecciona el rango de recorte
              </h3>

              {videoDuration > 0 && (
                <>
                  <TrimSlider
                    duration={videoDuration}
                    start={trimStart}
                    end={trimEnd}
                    onStartChange={setTrimStart}
                    onEndChange={setTrimEnd}
                    onSeek={handleSeek}
                  />

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1 font-medium">
                        Inicio (segundos)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={trimEnd - 0.1}
                        step="0.1"
                        value={Number(trimStart.toFixed(1))}
                        onChange={(e) => {
                          const val = Math.max(
                            0,
                            Math.min(Number(e.target.value), trimEnd - 0.1)
                          );
                          setTrimStart(val);
                          handleSeek(val);
                        }}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1 font-medium">
                        Fin (segundos)
                      </label>
                      <input
                        type="number"
                        min={trimStart + 0.1}
                        max={videoDuration}
                        step="0.1"
                        value={Number(trimEnd.toFixed(1))}
                        onChange={(e) => {
                          const val = Math.max(
                            trimStart + 0.1,
                            Math.min(Number(e.target.value), videoDuration)
                          );
                          setTrimEnd(val);
                          handleSeek(val);
                        }}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <ExportButton loading={isProcessing} onClick={handleSplit} />
          </div>
        </>
      )}
    </div>
  );
}