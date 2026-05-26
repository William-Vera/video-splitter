"use client";

import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface Props {
  onFileSelect: (file: File) => void;
}

export function VideoUploader({
  onFileSelect,
}: Props) {

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({
      accept: {
        "video/mp4": [".mp4"],
        "video/webm": [".webm"],
        "video/quicktime": [".mov"],
        "video/x-msvideo": [".avi"],
      },
      multiple: false,
      onDrop(files) {
        if (files[0]) {
          onFileSelect(files[0]);
        }
      },
    });

  return (
    <div
      {...getRootProps()}
      className={`
        group
        mt-12
        rounded-3xl
        border-2
        border-dashed
        p-16
        text-center
        cursor-pointer
        transition-all
        duration-300
        ${
          isDragActive
            ? "border-blue-500 bg-blue-500/5 scale-[0.99]"
            : "border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40"
        }
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center gap-3">
        <div className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-zinc-900
          text-zinc-400
          border
          border-zinc-800
          group-hover:border-blue-500/30
          group-hover:text-blue-400
          group-hover:bg-blue-950/10
          transition-all
          duration-300
        ">
          <Upload className="h-6 w-6" />
        </div>

        <p className="text-xl font-medium text-zinc-200">
          Sube tu video
        </p>

        <p className="text-sm text-zinc-400">
          Arrastra y suelta o haz clic aquí para buscar en tu dispositivo
        </p>

        <div className="mt-3 flex flex-wrap gap-2 justify-center text-xs">
          <span className="rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-zinc-400">
            MP4, WebM, MOV, AVI
          </span>
          <span className="rounded-full border border-zinc-850 bg-blue-950/20 px-3 py-1 text-blue-400 font-medium">
            Máximo 500 MB
          </span>
        </div>
      </div>
    </div>
  );
}