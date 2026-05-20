"use client";

import { useState } from "react";
import { getFFmpeg } from "@/app/lib/ffmpeg";

type SplitResult = {
  name: string;
  blob: Blob;
};

export function useVideoProcessor() {
  const [isProcessing, setIsProcessing] =
    useState(false);

  async function splitVideo(
    file: File,
    duration: number
  ): Promise<SplitResult[]> {
    setIsProcessing(true);

    const ffmpeg = await getFFmpeg();

    const inputName = "input.mp4";

    try {
      // limpiar archivos viejos
      const existingFiles =
        await ffmpeg.listDir("/");

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
        new Uint8Array(
          await file.arrayBuffer()
        )
      );

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

      // obtener archivos generados
      const files = await ffmpeg.listDir("/");

      const outputs = files
        .filter(
          (f) =>
            f.name.endsWith(".mp4") &&
            f.name !== inputName
        )
        .sort((a, b) =>
          a.name.localeCompare(b.name)
        );

      const result: SplitResult[] = [];

      for (const output of outputs) {
        const data = await ffmpeg.readFile(
          output.name
        );

        const buffer = data instanceof Uint8Array
        ? data.buffer.slice(0) as ArrayBuffer
        : (data as string);

    const blob = new Blob([buffer], { type: "video/mp4" });

        result.push({
          name: output.name,
          blob,
        });
      }

      return result;
    } catch (error) {
      console.error(
        "Error processing video:",
        error
      );

      throw new Error(
        "No se pudo procesar el video"
      );
    } finally {
      setIsProcessing(false);
    }
  }

  async function trimVideo(
    file: File,
    startTime: number,
    endTime: number
  ): Promise<SplitResult[]> {
    setIsProcessing(true);

    const ffmpeg = await getFFmpeg();

    const inputName = "input.mp4";
    const outputName = "part_001.mp4";

    try {
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

      // obtener archivo generado
      const data = await ffmpeg.readFile(outputName);

      const buffer = data instanceof Uint8Array
        ? (data.buffer.slice(0) as ArrayBuffer)
        : (data as string);

      const blob = new Blob([buffer], { type: "video/mp4" });

      return [
        {
          name: outputName,
          blob,
        },
      ];
    } catch (error) {
      console.error("Error trimming video:", error);
      throw new Error("No se pudo recortar el video");
    } finally {
      setIsProcessing(false);
    }
  }

  return {
    splitVideo,
    trimVideo,
    isProcessing,
  };
}