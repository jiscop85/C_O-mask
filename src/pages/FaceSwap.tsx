import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Upload, Play, Pause, RefreshCw, Download, Settings, Zap, 
  Cpu, Server, AlertCircle, CheckCircle2, Loader2, History, Trash2,
  Sparkles, MonitorPlay, Gauge
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTransformationHistory } from '@/hooks/useTransformationHistory';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceStats {
  fps: number;
  latency: number;
  framesProcessed: number;
}

const FaceSwap = () => {
  const { user, profile } = useAuth();
  const { history, addRecord, deleteRecord } = useTransformationHistory();
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [processingMode, setProcessingMode] = useState<'client' | 'server'>(
    profile?.preferred_processing_mode === 'server' ? 'server' : 'client'
  );
  const [webGPUSupported, setWebGPUSupported] = useState<boolean | null>(null);
  const [stats, setStats] = useState<PerformanceStats>({ fps: 0, latency: 0, framesProcessed: 0 });
  const [showHistory, setShowHistory] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);
  const frameCount = useRef<number>(0);

  // Check WebGPU support
  useEffect(() => {
    const checkWebGPU = async () => {
      if ('gpu' in navigator) {
        try {
          const gpu = (navigator as any).gpu;
          const adapter = await gpu.requestAdapter();
          setWebGPUSupported(!!adapter);
        } catch {
          setWebGPUSupported(false);
        }
      } else {
        setWebGPUSupported(false);
      }
    };
    checkWebGPU();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        toast.success('Camera started - Ready for face swap');
      }
    } catch (error) {
      toast.error('Failed to access camera. Please check permissions.');
      console.error('Camera error:', error);
    }
  };

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      setIsProcessing(false);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTargetImage(event.target?.result as string);
        toast.success('Target face uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

