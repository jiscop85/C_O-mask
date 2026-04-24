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

  // Process frame - client-side placeholder (would use ONNX/WebGPU in real implementation)
  const processFrameClient = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !targetImage) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const startTime = performance.now();
    
    // Draw current video frame
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    // Placeholder for WebGPU/ONNX face swap processing
    // In real implementation, this would:
    // 1. Detect faces using InsightFace
    // 2. Extract face embeddings
    // 3. Swap faces using inswapper model
    // 4. Apply result to output canvas

    const endTime = performance.now();
    const latency = endTime - startTime;
    
    frameCount.current++;
    const now = performance.now();
    if (now - lastFrameTime.current >= 1000) {
      setStats(prev => ({
        ...prev,
        fps: frameCount.current,
        latency: Math.round(latency),
        framesProcessed: prev.framesProcessed + frameCount.current
      }));
      frameCount.current = 0;
      lastFrameTime.current = now;
    }
  }, [targetImage]);

  // Process frame via server
  const processFrameServer = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !targetImage) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    const sourceImage = canvasRef.current.toDataURL('image/jpeg', 0.8);

    try {
      const { data, error } = await supabase.functions.invoke('face-swap', {
        body: {
          sourceImage,
          targetImage,
          processingMode: 'server'
        }
      });

      if (error) throw error;

      if (data.fallbackToClient) {
        toast.info('Server unavailable, using client-side processing');
        setProcessingMode('client');
        return;
      }

      if (data.success && data.resultImage && outputCanvasRef.current) {
        const img = new Image();
        img.onload = () => {
          const outCtx = outputCanvasRef.current?.getContext('2d');
          if (outCtx) {
            outCtx.drawImage(img, 0, 0);
          }
        };
        img.src = data.resultImage;
        
        setStats(prev => ({
          ...prev,
          latency: data.processingTimeMs || prev.latency,
          framesProcessed: prev.framesProcessed + 1
        }));
      }
    } catch (error) {
      console.error('Server processing error:', error);
    }
  }, [targetImage]);

  
  // Animation loop
  const startProcessing = useCallback(() => {
    if (!isStreaming || !targetImage) {
      toast.error('Please start camera and upload a target face first');
      return;
    }

    setIsProcessing(true);
    lastFrameTime.current = performance.now();
    frameCount.current = 0;

    const processLoop = async () => {
      if (processingMode === 'client') {
        await processFrameClient();
      } else {
        await processFrameServer();
      }
      
      if (isProcessing) {
        animationRef.current = requestAnimationFrame(processLoop);
      }
    };

    processLoop();
    toast.success('Face swap processing started!');
  }, [isStreaming, targetImage, processingMode, processFrameClient, processFrameServer, isProcessing]);

  const stopProcessing = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsProcessing(false);
    toast.info('Processing stopped');
  }, []);

  const saveSnapshot = async () => {
    if (!canvasRef.current) return;
    
    const dataUrl = canvasRef.current.toDataURL('image/png');
    
    // Save to history
    await addRecord({
      transformation_type: 'face_swap',
      source_image_url: null,
      target_image_url: targetImage,
      result_url: dataUrl,
      processing_time_ms: stats.latency,
      processing_mode: processingMode,
      metadata: { fps: stats.fps, framesProcessed: stats.framesProcessed }
    });

    // Download
    const link = document.createElement('a');
    link.download = `face-swap-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    
    toast.success('Snapshot saved!');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="min-h-screen pt-24 pb-12 relative">
      {/* Animated Background */}
      <div className="mesh-gradient" />
      <div className="grid-overlay" />
      
      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
        <div className="floating-orb orb-3" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm tech-text text-muted-foreground">AI-POWERED TRANSFORMATION</span>
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4 glow-text">
            REAL-TIME <span className="text-primary">FACE SWAP</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Transform your face in real-time with cutting-edge AI technology.
            {webGPUSupported ? ' WebGPU acceleration enabled!' : ''}
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2" dir="rtl">
            تعویض چهره در لحظه با فناوری هوش مصنوعی پیشرفته
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
   
       {/* Control Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Main Controls */}
            <div className="neon-card p-6">
              <h2 className="font-display text-xl text-foreground flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-primary" />
                CONTROLS
              </h2>

              {/* Target Face Upload */}
              <div className="mb-6">
                <label className="block text-sm text-muted-foreground mb-3 tech-text">TARGET FACE</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center gap-3 overflow-hidden group relative"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {targetImage ? (
                    <>
                      <img src={targetImage} alt="Target" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">Upload target face</span>
                      <span className="text-xs text-muted-foreground/70" dir="rtl">آپلود چهره مورد نظر</span>
                    </>
                  )}
                </motion.button>
                {targetImage && (
                  <button
                    onClick={() => setTargetImage(null)}
                    className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove target
                  </button>
                )}
              </div>

              {/* Processing Mode */}
              <div className="mb-6">
                <label className="block text-sm text-muted-foreground mb-3 tech-text">PROCESSING MODE</label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    onClick={() => setProcessingMode('client')}
                    className={`p-4 rounded-xl text-sm font-medium transition-all relative overflow-hidden ${
                      processingMode === 'client'
                        ? 'bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/50'
                        : 'bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Cpu className="w-5 h-5 mx-auto mb-2" />
                    <span className="block tech-text text-xs">CLIENT</span>
                    {processingMode === 'client' && (
                      <motion.div
                        layoutId="mode-indicator"
                        className="absolute inset-0 border-2 border-primary rounded-xl"
                      />
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => setProcessingMode('server')}
                    className={`p-4 rounded-xl text-sm font-medium transition-all relative overflow-hidden ${
                      processingMode === 'server'
                        ? 'bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/50'
                        : 'bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Server className="w-5 h-5 mx-auto mb-2" />
                    <span className="block tech-text text-xs">SERVER</span>
                    {processingMode === 'server' && (
                      <motion.div
                        layoutId="mode-indicator"
                        className="absolute inset-0 border-2 border-primary rounded-xl"
                      />
                    )}
                  </motion.button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {processingMode === 'client' 
                    ? '🔒 Privacy-first: All processing in your browser'
                    : '⚡ High quality: Uses server GPU for best results'}
                </p>
              </div>
          

 
