import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';

export default function ScanPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!scanning) return;

    let stream: MediaStream | null = null;
    let rafId: number;
    let active = true;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        rafId = requestAnimationFrame(tick);
      } catch {
        if (active) setError('Kamera konnte nicht gestartet werden.');
      }
    }

    function tick() {
      if (!active) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code?.data) {
        const match = code.data.match(/\/controller\/([^/?#]+)/);
        if (match) {
          active = false;
          stream?.getTracks().forEach((t) => t.stop());
          navigate(`/controller/${match[1]}`);
          return;
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    start();
    return () => {
      active = false;
      cancelAnimationFrame(rafId);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [scanning, navigate]);

  return (
    <div className="flex flex-col h-full bg-base">
      <div className="flex items-center justify-center px-6 py-8">
        <h1 className="text-2xl font-bold text-primary">Omahaus Dart-Zähler</h1>
      </div>
      <div className="flex-1 relative overflow-hidden rounded-2xl mx-4 mb-4">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-danger text-center px-4">{error}</span>
          </div>
        ) : scanning ? (
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        ) : (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={() => setScanning(true)}
              className="px-12 py-5 rounded-2xl bg-action text-primary font-bold text-2xl active:opacity-80"
            >
              Scan
            </button>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
