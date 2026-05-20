import JSZip from "jszip";

export async function downloadZip(
  files: {
    name: string;
    blob: Blob;
  }[],
  zipName: string = "clipslice-videos"
) {

  const zip = new JSZip();

  files.forEach((file) => {
    zip.file(file.name, file.blob);
  });

  const content = await zip.generateAsync({
    type: "blob",
  });

  const url = URL.createObjectURL(content);

  const a = document.createElement("a");

  a.href = url;

  a.download = zipName.endsWith(".zip") ? zipName : `${zipName}.zip`;

  a.click();

  URL.revokeObjectURL(url);
}