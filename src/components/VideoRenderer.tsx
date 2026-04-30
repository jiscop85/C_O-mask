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

    
