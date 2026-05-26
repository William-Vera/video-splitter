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

  const { splitVideo, trimVideo, isProcessing, progress, statusMessage } = useVideoProcessor();
  const [showSuccess, setShowSuccess] = useState(false);

  const MAX_FILE_SIZE_MB = 500;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError(
        `El archivo supera el límite de ${MAX_FILE_SIZE_MB} MB. Por favor, selecciona un video de menor tamaño (tu archivo pesa ${(
          selectedFile.size /
          1024 /
          1024
        ).toFixed(1)} MB).`
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

      setShowSuccess(true);
      const zipName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      await downloadZip(results, zipName);

      // Mantener la pantalla de éxito por 2.5 segundos
      await new Promise((resolve) => setTimeout(resolve, 2500));
      setShowSuccess(false);
    } catch (err: any) {
      setError(err.message || "Error al procesar el video.");
      setShowSuccess(false);
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

      {(isProcessing || showSuccess) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/95 p-8 shadow-2xl backdrop-blur-md text-center">
            {showSuccess ? (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-bounce">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-zinc-100">
                  ¡Procesamiento Completado!
                </h3>
                <p className="mt-2 text-sm text-zinc-400 animate-pulse">
                  Iniciando descarga automáticamente...
                </p>
              </>
            ) : (
              <>
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center animate-pulse">
                  <div className="absolute h-full w-full rounded-full border-4 border-zinc-800/80"></div>
                  <div className="absolute h-full w-full rounded-full border-4 border-t-blue-500 animate-spin"></div>
                  <div className="text-xs font-semibold text-blue-400">FFmpeg</div>
                </div>

                <h3 className="mt-6 text-lg font-semibold text-zinc-100">
                  Procesando Video
                </h3>
                <p className="mt-2 text-sm text-zinc-400 h-10 flex items-center justify-center font-medium">
                  {statusMessage || "Esto puede tomar unos momentos..."}
                </p>

                <div className="mt-6">
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-zinc-500 font-medium">
                    <span>Progreso</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}