import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileAudio, X, Play, Pause, Download, Trash2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AudioFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  processedBlob?: Blob;
  error?: string;
}

interface BatchSettings {
  pitch: number;
  speed: number;
  reverb: number;
  voiceModel: string;
}

interface BatchAudioProcessorProps {
  settings: BatchSettings;
  processAudioFn: (blob: Blob, settings: any) => Promise<Blob | null>;
}

export default function BatchAudioProcessor({ settings, processAudioFn }: BatchAudioProcessorProps) {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const validExtensions = /\.(mp3|wav|ogg|webm|m4a|aac|flac|wma)$/i;
    const maxSize = 50 * 1024 * 1024; // 50MB

    const newFiles: AudioFile[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (!validExtensions.test(file.name)) {
        toast.error(`Invalid file type: ${file.name}`);
        return;
      }
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name} (max 50MB)`);
        return;
      }

      newFiles.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        status: 'pending',
        progress: 0,
      });
    });

    setFiles(prev => [...prev, ...newFiles]);
    
    if (newFiles.length > 0) {
      toast.success(`Added ${newFiles.length} file(s) to batch`);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setOverallProgress(0);
  }, []);

  const processAllFiles = async () => {
    if (files.length === 0) {
      toast.error('No files to process');
      return;
    }

    setIsProcessing(true);
    setOverallProgress(0);

    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'failed');
    const totalFiles = pendingFiles.length;
    let completedCount = 0;

    // Notify backend about batch job start
    try {
      await supabase.functions.invoke('batch-audio', {
        body: {
          action: 'start',
          files: pendingFiles.map(f => ({ id: f.id, name: f.name })),
          settings,
        },
      });
    } catch (error) {
      console.log('Batch tracking not available, processing locally');
    }

    for (const audioFile of pendingFiles) {
      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === audioFile.id ? { ...f, status: 'processing', progress: 0 } : f
      ));

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.id === audioFile.id && f.status === 'processing'
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          ));
        }, 200);

        // Process the audio
        const processedBlob = await processAudioFn(audioFile.file, {
          pitch: settings.pitch,
          speed: settings.speed,
          reverb: settings.reverb,
          voiceModel: settings.voiceModel,
        });

        clearInterval(progressInterval);

        if (processedBlob) {
          setFiles(prev => prev.map(f => 
            f.id === audioFile.id 
              ? { ...f, status: 'completed', progress: 100, processedBlob }
              : f
          ));
          completedCount++;
        } else {
          throw new Error('Processing returned no result');
        }
      } catch (error: any) {
        setFiles(prev => prev.map(f => 
          f.id === audioFile.id 
            ? { ...f, status: 'failed', progress: 0, error: error.message || 'Processing failed' }
            : f
        ));
      }

      setOverallProgress(Math.round(((completedCount + 1) / totalFiles) * 100));
    }

    setIsProcessing(false);
    
    const successCount = files.filter(f => f.status === 'completed').length + completedCount;
    const failCount = files.filter(f => f.status === 'failed').length;
    
    if (failCount === 0) {
      toast.success(`Batch complete! ${successCount} files processed.`);
    } else {
      toast.warning(`Processed ${successCount} files. ${failCount} failed.`);
    }
  };

  const downloadFile = (audioFile: AudioFile) => {
    if (!audioFile.processedBlob) return;
    
    const url = URL.createObjectURL(audioFile.processedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processed-${audioFile.name.replace(/\.[^/.]+$/, '')}.wav`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded: ${audioFile.name}`);
  };

  const downloadAll = () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.processedBlob);
    completedFiles.forEach(f => downloadFile(f));
    toast.success(`Downloaded ${completedFiles.length} files`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };


