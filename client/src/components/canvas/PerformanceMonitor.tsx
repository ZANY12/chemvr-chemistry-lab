import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export function PerformanceMonitor() {
  const lastTime = useRef(performance.now());
  const frames = useRef(0);
  const fpsDisplay = useRef<HTMLDivElement | null>(null);

  useFrame(() => {
    frames.current++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime.current;

    if (elapsed >= 1000) {
      const fps = Math.round((frames.current * 1000) / elapsed);
      
      if (!fpsDisplay.current) {
        fpsDisplay.current = document.getElementById('fps-display') as HTMLDivElement;
        if (!fpsDisplay.current) {
          const div = document.createElement('div');
          div.id = 'fps-display';
          div.style.cssText = 'position:fixed;top:10px;right:10px;background:rgba(0,0,0,0.7);color:#0f0;padding:8px 12px;border-radius:4px;font-family:monospace;font-size:14px;z-index:1000;';
          document.body.appendChild(div);
          fpsDisplay.current = div;
        }
      }

      if (fpsDisplay.current) {
        const color = fps >= 50 ? '#0f0' : fps >= 30 ? '#ff0' : '#f00';
        fpsDisplay.current.style.color = color;
        fpsDisplay.current.textContent = `FPS: ${fps}`;
      }

      frames.current = 0;
      lastTime.current = currentTime;
    }
  });

  return null;
}
