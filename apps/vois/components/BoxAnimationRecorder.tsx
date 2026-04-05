import React, { useEffect, useRef, useState, useCallback } from "react";
import { BoxAnimation } from "@li/shared/components/BoxAnimation";

const SIZE = 1080;
const DURATION = 34;
const FPS = 30;
const TOTAL_FRAMES = Math.ceil(DURATION * FPS);
const FRAME_DT = 1 / FPS;

export const BoxAnimationRecorder: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("Ready. Click Record — captures one frame at a time (no dropped frames).");
  const [framesDone, setFramesDone] = useState(0);
  const [key, setKey] = useState(0);
  const dirHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
  const manualTimeRef = useRef(0);
  const recordingRef = useRef(false);

  const handleRecord = useCallback(async () => {
    try {
      const dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      dirHandleRef.current = dirHandle;
    } catch {
      setStatus("Directory selection cancelled.");
      return;
    }

    manualTimeRef.current = 0;
    setFramesDone(0);
    setKey(k => k + 1);
    recordingRef.current = true;
    setRecording(true);
    setStatus("Capturing — waiting for canvas...");

    // Wait for canvas to mount then start stepping
    const waitForCanvas = () => {
      const canvas = containerRef.current?.querySelector("canvas") as HTMLCanvasElement;
      if (!canvas) {
        requestAnimationFrame(waitForCanvas);
        return;
      }
      setStatus("Capturing frames...");
      stepAndCapture(canvas, 0);
    };
    requestAnimationFrame(() => requestAnimationFrame(waitForCanvas));
  }, []);

  const stepAndCapture = useCallback((canvas: HTMLCanvasElement, frameIdx: number) => {
    if (frameIdx >= TOTAL_FRAMES || !recordingRef.current || !dirHandleRef.current) {
      recordingRef.current = false;
      setRecording(false);
      setStatus(`Done! ${frameIdx} frames saved.\nStitch with:\nffmpeg -framerate ${FPS} -i frame_%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 4M -auto-alt-ref 0 box-animation.webm`);
      return;
    }

    // Set time for this frame
    manualTimeRef.current = frameIdx * FRAME_DT;

    // Wait one animation frame for Three.js to render with the new time
    requestAnimationFrame(() => {
      // Wait one more frame to ensure the render is flushed
      requestAnimationFrame(() => {
        canvas.toBlob(async (blob) => {
          if (!blob || !dirHandleRef.current) return;

          const name = `frame_${String(frameIdx).padStart(4, "0")}.png`;
          try {
            const fileHandle = await dirHandleRef.current!.getFileHandle(name, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
          } catch (e) {
            console.error("Failed to write frame", name, e);
          }

          setFramesDone(frameIdx + 1);

          // Next frame
          stepAndCapture(canvas, frameIdx + 1);
        }, "image/png");
      });
    });
  }, []);

  return (
    <div style={{ padding: 40, background: "#111", minHeight: "100vh", color: "#fff" }}>
      <h1 style={{ marginBottom: 20 }}>Box Animation Recorder</h1>
      <p style={{ marginBottom: 10, whiteSpace: "pre-wrap" }}>{status}</p>
      {recording && (
        <div style={{ marginBottom: 10 }}>
          <p>Frame {framesDone} / {TOTAL_FRAMES} ({(framesDone / TOTAL_FRAMES * 100).toFixed(1)}%)</p>
          <div style={{ width: 400, height: 8, background: "#333", borderRadius: 4 }}>
            <div style={{ width: `${(framesDone / TOTAL_FRAMES) * 100}%`, height: "100%", background: "#2563eb", borderRadius: 4 }} />
          </div>
        </div>
      )}
      <button
        onClick={handleRecord}
        disabled={recording}
        style={{
          padding: "12px 24px", fontSize: 16, cursor: recording ? "not-allowed" : "pointer",
          background: recording ? "#555" : "#2563eb", color: "#fff", border: "none", borderRadius: 8,
          marginBottom: 20,
        }}
      >
        {recording ? "Recording..." : "Record"}
      </button>

      <div
        ref={containerRef}
        style={{
          width: SIZE, height: SIZE,
          background: "repeating-conic-gradient(#808080 0% 25%, #c0c0c0 0% 50%) 0 0 / 20px 20px",
          borderRadius: 8, overflow: "hidden",
        }}
      >
        <BoxAnimation
          key={key}
          style={{ width: SIZE, height: SIZE }}
          onTimeUpdate={() => {}}
          preserveDrawingBuffer
          manualTimeRef={manualTimeRef}
        />
      </div>
    </div>
  );
};

export default BoxAnimationRecorder;
