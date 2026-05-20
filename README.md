# Video Splitter (ClipSlice)

Una aplicación web diseñada para **recortar y dividir videos** de manera instantánea directamente en el navegador, optimizada para redes sociales como WhatsApp, Instagram Stories, TikTok y YouTube Shorts.

El procesamiento se realiza completamente del lado del cliente utilizando **FFmpeg ensamblado en WebAssembly (FFmpeg.wasm)**, garantizando privacidad absoluta al no subir tus archivos a ningún servidor externo.

---

## Características principales

*   **Privacidad total (Client-Side):** Los videos no se suben a ningún servidor. Todo el procesamiento se realiza localmente en tu navegador.
*   **Ajustes preestablecidos (Presets):**
    *   **Estados de WhatsApp:** Segmentos de 59 segundos.
    *   **Instagram Stories:** Segmentos de 15 segundos.
    *   **YouTube Shorts / TikTok:** Segmentos de 60 segundos.
*   **Recorte Personalizado (Trim):** Deslizador visual interactivo para seleccionar un rango de tiempo exacto y extraer esa parte.
*   **Descarga:** Descarga los segmentos divididos de manera individual o agrupados en un archivo comprimido `.zip` generado al instante.
*   **Interfaz de las GOD:** Diseño responsivo con un tema oscuro elegante, animaciones fluidas con Framer Motion, y soporte interactivo de arrastrar y soltar (Drag and Drop).

---

## Tecnologías utilizadas

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
*   **Librería UI:** [React 19](https://react.dev/)
*   **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Procesamiento de Video:** [@ffmpeg/ffmpeg (FFmpeg.wasm)](https://ffmpegwasm.netlify.app/)
*   **Compresión de Archivos:** [JSZip](https://stuk.github.io/jszip/)
*   **Carga de Archivos:** [React Dropzone](https://react-dropzone.js.org/)
*   **Animaciones:** [Framer Motion](https://www.framer.com/motion/)
*   **Iconos:** [Lucide React](https://lucide.dev/)

---

## Instalación y desarrollo local

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/William-Vera/video-splitter.git
    cd video-splitter
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

4.  **Abrir en el navegador:**
    Navega a [http://localhost:3000](http://localhost:3000) para ver la aplicación.


---

## Despliegue en Vercel

El proyecto está optimizado para desplegarse fácilmente en **Vercel**:

Puedes visitar la versión desplegada oficial aquí: [https://video-splitter-blue.vercel.app/](https://video-splitter-blue.vercel.app/)
