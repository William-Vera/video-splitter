"use client";

import { useState } from "react";
import { getFFmpeg } from "@/app/lib/ffmpeg";

type SplitResult = {
  name: string;
  blob: Blob;
};

export function useVideoProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading-ffmpeg" | "reading-file" | "processing" | "saving" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  async function splitVideo(
    file: File,
    duration: number
  ): Promise<SplitResult[]> {
    setIsProcessing(true);
    setProgress(0);
    setStatus("loading-ffmpeg");
    setStatusMessage("Inicializando...");

    let ffmpeg;
    const handleProgress = ({ progress }: { progress: number }) => {
      const pct = Math.min(100, Math.max(0, Math.round(progress * 100)));
      setProgress(pct);
      setStatusMessage(`Procesando partes: ${pct}%`);
    };

    const inputName = "input.mp4";

    try {
      ffmpeg = await getFFmpeg();

      setStatus("reading-file");
      setStatusMessage("Cargando video...");

      // limpiar archivos viejos
      const existingFiles = await ffmpeg.listDir("/");

      for (const file of existingFiles) {
        try {
          await ffmpeg.deleteFile(file.name);
        } catch {
          // ignorar errores
        }
      }

      // escribir video
      await ffmpeg.writeFile(
        inputName,
        new Uint8Array(await file.arrayBuffer())
      );

      // registrar listener de progreso
      ffmpeg.on("progress", handleProgress);
      setStatus("processing");
      setStatusMessage("Dividiendo video: 0%");

      // dividir video
      await ffmpeg.exec([
        "-i",
        inputName,
        "-c",
        "copy",
        "-map",
        "0",
        "-segment_time",
        `${duration}`,
        "-f",
        "segment",
        "-segment_start_number",
        "1",
        "-reset_timestamps",
        "1",
        "part_%03d.mp4",
      ]);

      setStatus("saving");
      setStatusMessage("Preparando y guardando archivos generados...");

      // obtener archivos generados
      const files = await ffmpeg.listDir("/");

      const outputs = files
        .filter(
          (f) =>
            f.name.endsWith(".mp4") &&
            f.name !== inputName
        )
        .sort((a, b) => a.name.localeCompare(b.name));

      const result: SplitResult[] = [];

      for (const output of outputs) {
        const data = await ffmpeg.readFile(output.name);

        const buffer = data instanceof Uint8Array
          ? (data.buffer.slice(0) as ArrayBuffer)
          : (data as string);

        const blob = new Blob([buffer], { type: "video/mp4" });

        result.push({
          name: output.name,
          blob,
        });
      }

      setStatus("idle");
      setStatusMessage("");
      return result;
    } catch (error) {
      console.error("Error processing video:", error);
      setStatus("error");
      setStatusMessage("Error al procesar el video.");
      throw new Error("No se pudo procesar el video");
    } finally {
      if (ffmpeg) {
        try {
          ffmpeg.off("progress", handleProgress);
        } catch {
          // ignore
        }
      }
      setIsProcessing(false);
    }
  }

  async function trimVideo(
    file: File,
    startTime: number,
    endTime: number
  ): Promise<SplitResult[]> {
    setIsProcessing(true);
    setProgress(0);
    setStatus("loading-ffmpeg");
    setStatusMessage("Inicializando...");

    let ffmpeg;
    const handleProgress = ({ progress }: { progress: number }) => {
      const pct = Math.min(100, Math.max(0, Math.round(progress * 100)));
      setProgress(pct);
      setStatusMessage(`Recortando video: ${pct}%`);
    };

    const inputName = "input.mp4";
    const outputName = "part_001.mp4";

    try {
      ffmpeg = await getFFmpeg();

      setStatus("reading-file");
      setStatusMessage("Cargando video...");

      // limpiar archivos viejos
      const existingFiles = await ffmpeg.listDir("/");

      for (const file of existingFiles) {
        try {
          await ffmpeg.deleteFile(file.name);
        } catch {
          // ignorar errores
        }
      }

      // escribir video
      await ffmpeg.writeFile(
        inputName,
        new Uint8Array(await file.arrayBuffer())
      );

      // registrar listener de progreso
      ffmpeg.on("progress", handleProgress);
      setStatus("processing");
      setStatusMessage("Recortando video: 0%");

      // recortar video
      await ffmpeg.exec([
        "-i",
        inputName,
        "-ss",
        `${startTime}`,
        "-to",
        `${endTime}`,
        "-c",
        "copy",
        outputName,
      ]);

      setStatus("saving");
      setStatusMessage("Preparando descarga...");

      // obtener archivo generado
      const data = await ffmpeg.readFile(outputName);

      const buffer = data instanceof Uint8Array
        ? (data.buffer.slice(0) as ArrayBuffer)
        : (data as string);

      const blob = new Blob([buffer], { type: "video/mp4" });

      setStatus("idle");
      setStatusMessage("");
      return [
        {
          name: outputName,
          blob,
        },
      ];
    } catch (error) {
      console.error("Error trimming video:", error);
      setStatus("error");
      setStatusMessage("Error al recortar el video.");
      throw new Error("No se pudo recortar el video");
    } finally {
      if (ffmpeg) {
        try {
          ffmpeg.off("progress", handleProgress);
        } catch {
          // ignore
        }
      }
      setIsProcessing(false);
    }
  }

  return {
    splitVideo,
    trimVideo,
    isProcessing,
    progress,
    status,
    statusMessage,
  };
}