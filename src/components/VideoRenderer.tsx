import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Download, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Scene {
  sceneNumber: number;
  duration: number;
  description: string;
  cameraMovement: string;
  visualStyle?: string;
  textOverlay?: string;
  transition?: string;
}

interface Storyboard {
  title: string;
  duration: number;
  scenes: Scene[];
  audioSuggestion?: string;
  colorGrading?: string;
}

interface VideoRendererProps {
  storyboard: Storyboard;
  aspectRatio?: string;
  gradient?: string;
}

const SCENE_COLORS = [
  ['#6366f1', '#8b5cf6', '#0f172a'],
  ['#ec4899', '#f43f5e', '#1a0a14'],
  ['#f59e0b', '#f97316', '#1a1005'],
  ['#10b981', '#14b8a6', '#051a14'],
  ['#3b82f6', '#06b6d4', '#0a1628'],
  ['#a855f7', '#6366f1', '#140a28'],
];

export default function VideoRenderer({ storyboard, aspectRatio = '16:9', gradient }: VideoRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentScene, setCurrentScene] = useState(0);

  const totalDuration = storyboard.duration || storyboard.scenes.reduce((a, s) => a + s.duration, 0);
  
  const getCanvasSize = () => {
    const [w, h] = aspectRatio.split(':').map(Number);
    const maxW = 800;
    return { width: maxW, height: Math.round(maxW * (h / w)) };
  };

  const { width: cW, height: cH } = getCanvasSize();

  const getSceneAtTime = (t: number) => {
    let elapsed = 0;
    for (let i = 0; i < storyboard.scenes.length; i++) {
      if (t < elapsed + storyboard.scenes[i].duration) {
        return { index: i, localTime: t - elapsed, scene: storyboard.scenes[i] };
      }
      elapsed += storyboard.scenes[i].duration;
    }
    const last = storyboard.scenes.length - 1;
    return { index: last, localTime: storyboard.scenes[last].duration, scene: storyboard.scenes[last] };
  };

  const drawScene = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    const { index, localTime, scene } = getSceneAtTime(time);
    const colors = SCENE_COLORS[index % SCENE_COLORS.length];
    const p = scene.duration > 0 ? localTime / scene.duration : 0; // 0-1 progress within scene

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, cW, cH);
    bgGrad.addColorStop(0, colors[2]);
    bgGrad.addColorStop(1, colors[0] + '40');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, cW, cH);

    // Camera movement simulation
    ctx.save();
    const cam = scene.cameraMovement.toLowerCase();
    if (cam.includes('zoom')) {
      const s = 1 + p * 0.15;
      ctx.translate(cW / 2, cH / 2);
      ctx.scale(s, s);
      ctx.translate(-cW / 2, -cH / 2);
    } else if (cam.includes('pan') || cam.includes('tracking')) {
      ctx.translate(-p * 60, 0);
    } else if (cam.includes('dolly')) {
      const s = 1 + Math.sin(p * Math.PI) * 0.1;
      ctx.translate(cW / 2, cH / 2);
      ctx.scale(s, s);
      ctx.translate(-cW / 2, -cH / 2);
    } else if (cam.includes('orbit') || cam.includes('rotation') || cam.includes('360')) {
      ctx.translate(cW / 2, cH / 2);
      ctx.rotate(p * Math.PI * 0.05);
      ctx.translate(-cW / 2, -cH / 2);
    }

    // Animated geometric shapes
    const shapeCount = 5 + index * 2;
    for (let i = 0; i < shapeCount; i++) {
      const seed = i * 137.5 + index * 42;
      const x = ((Math.sin(seed) + 1) / 2) * cW;
      const y = ((Math.cos(seed * 1.3) + 1) / 2) * cH;
      const size = 20 + (seed % 80);
      const moveX = Math.sin(time * 0.5 + seed) * 30;
      const moveY = Math.cos(time * 0.7 + seed) * 20;
      const alpha = 0.08 + Math.sin(time + seed) * 0.04;

      ctx.fillStyle = colors[i % 2 === 0 ? 0 : 1] + Math.round(alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      if (i % 3 === 0) {
        ctx.arc(x + moveX, y + moveY, size, 0, Math.PI * 2);
      } else if (i % 3 === 1) {
        ctx.roundRect(x + moveX - size / 2, y + moveY - size / 2, size, size, size * 0.2);
      } else {
        ctx.moveTo(x + moveX, y + moveY - size);
        ctx.lineTo(x + moveX + size * 0.87, y + moveY + size * 0.5);
        ctx.lineTo(x + moveX - size * 0.87, y + moveY + size * 0.5);
        ctx.closePath();
      }
      ctx.fill();
    }

    // Particle system
    for (let i = 0; i < 30; i++) {
      const px = ((Math.sin(i * 73 + time * 0.3) + 1) / 2) * cW;
      const py = ((Math.cos(i * 91 + time * 0.2) + 1) / 2) * cH;
      const pSize = 1 + Math.sin(time * 2 + i) * 1.5;
      ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.sin(time + i) * 0.08})`;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.5, pSize), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Scene number badge
    const badgeW = 100, badgeH = 32;
    ctx.fillStyle = colors[0] + 'cc';
    ctx.beginPath();
    ctx.roundRect(20, 20, badgeW, badgeH, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Scene ${scene.sceneNumber}`, 20 + badgeW / 2, 20 + badgeH / 2 + 5);

    // Description text
    const textAlpha = Math.min(1, p * 4) * Math.min(1, (1 - p) * 4);
    ctx.globalAlpha = Math.max(0, textAlpha);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.min(28, cW * 0.035)}px sans-serif`;
    ctx.textAlign = 'center';
    const words = scene.description.split(' ');
    const lines: string[] = [];
    let line = '';
    const maxLineW = cW * 0.8;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxLineW) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    const lineH = 36;
    const textY = cH / 2 - (lines.length * lineH) / 2;
    lines.forEach((l, i) => {
      ctx.fillText(l, cW / 2, textY + i * lineH);
    });
    ctx.globalAlpha = 1;

    // Text overlay
    if (scene.textOverlay) {
      const overlayAlpha = Math.max(0, Math.min(1, (p - 0.3) * 5) * Math.min(1, (1 - p) * 3));
      ctx.globalAlpha = overlayAlpha;
      ctx.font = `italic ${Math.min(18, cW * 0.022)}px sans-serif`;
      ctx.fillStyle = colors[1];
      ctx.fillText(`"${scene.textOverlay}"`, cW / 2, cH * 0.75);
      ctx.globalAlpha = 1;
    }

    // Camera movement label
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`🎬 ${scene.cameraMovement}`, cW - 20, cH - 20);

    // Transition overlay
    if (scene.transition && p > 0.85) {
      const fadeP = (p - 0.85) / 0.15;
      const trans = scene.transition.toLowerCase();
      if (trans.includes('fade')) {
        ctx.fillStyle = `rgba(0,0,0,${fadeP * 0.7})`;
        ctx.fillRect(0, 0, cW, cH);
      } else if (trans.includes('wipe')) {
        ctx.fillStyle = `rgba(0,0,0,0.8)`;
        ctx.fillRect(0, 0, cW * fadeP, cH);
      }
    }


    // Timeline bar
    const totalP = time / totalDuration;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, cH - 4, cW, 4);
    const timeGrad = ctx.createLinearGradient(0, 0, cW * totalP, 0);
    timeGrad.addColorStop(0, colors[0]);
    timeGrad.addColorStop(1, colors[1]);
    ctx.fillStyle = timeGrad;
    ctx.fillRect(0, cH - 4, cW * totalP, 4);

    setCurrentScene(index);
    setProgress(totalP * 100);
  }, [storyboard, cW, cH, totalDuration]);

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = (timestamp - startTimeRef.current) / 1000;

    if (elapsed >= totalDuration) {
      setIsPlaying(false);
      setProgress(100);
      return;
    }

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawScene(ctx, elapsed);

    animFrameRef.current = requestAnimationFrame(animate);
  }, [drawScene, totalDuration]);

  const play = useCallback(() => {
    startTimeRef.current = 0;
    setIsPlaying(true);
    animFrameRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const pause = () => {
    cancelAnimationFrame(animFrameRef.current);
    setIsPlaying(false);
  };

  const restart = () => {
    cancelAnimationFrame(animFrameRef.current);
    startTimeRef.current = 0;
    setProgress(0);
    setCurrentScene(0);
    play();
  };

  useEffect(() => {
    // Draw first frame
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawScene(ctx, 0);
  }, [drawScene]);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const downloadVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsRendering(true);

    try {
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      const done = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });
      recorder.start(100);

      // Render all frames
      const fps = 30;
      const totalFrames = Math.ceil(totalDuration * fps);
      for (let f = 0; f < totalFrames; f++) {
        const t = f / fps;
        const ctx = canvas.getContext('2d');
        if (ctx) drawScene(ctx, t);
        await new Promise(r => setTimeout(r, 1000 / fps));
      }

      recorder.stop();
      await done;

    
