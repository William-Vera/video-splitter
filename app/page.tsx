import { UploadSection } from "@/app/components/video/UploadSection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-20">

        <div className="text-center">

          <h1 className="text-5xl font-bold leading-tight">
            Recorta videos al instante
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Recorta/Divide videos para WhatsApp,
            Instagram Stories, TikTok y
            YouTube Shorts directamente en tu navegador.
          </p>

        </div>

        <UploadSection />

      </section>
    </main>
  );
}