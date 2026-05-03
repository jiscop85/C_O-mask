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

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const processingCount = files.filter(f => f.status === 'processing').length;
  const completedCount = files.filter(f => f.status === 'completed').length;
  const failedCount = files.filter(f => f.status === 'failed').length;

  return (
    <div className="neon-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-foreground flex items-center gap-2">
          <FileAudio className="w-5 h-5 text-accent" />
          BATCH PROCESSING
        </h3>
        {files.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} disabled={isProcessing} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-1" />Clear All
          </Button>
        )}
      </div>

      {/* Upload Area */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="batch-audio-upload"
        />
        <motion.label
          htmlFor="batch-audio-upload"
          className="block p-8 rounded-xl border-2 border-dashed border-border hover:border-accent/50 transition-all cursor-pointer group"
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Upload className="w-8 h-8 text-accent" />
            </div>
            <div>
              <p className="text-foreground font-medium">Drop audio files here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
              <p className="text-xs text-muted-foreground/70 mt-1">MP3, WAV, OGG, M4A, AAC, FLAC (max 50MB each)</p>
            </div>
          </div>
        </motion.label>
      </div>

      {/* Stats Bar */}
      {files.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">{files.length} files</span>
            {pendingCount > 0 && <span className="text-muted-foreground">⏳ {pendingCount} pending</span>}
            {processingCount > 0 && <span className="text-blue-400">🔄 {processingCount} processing</span>}
            {completedCount > 0 && <span className="text-green-400">✓ {completedCount} done</span>}
            {failedCount > 0 && <span className="text-destructive">✕ {failedCount} failed</span>}
          </div>
        </div>
      )}

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 max-h-64 overflow-y-auto"
          >
            {files.map((audioFile) => (
              <motion.div
                key={audioFile.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-3 rounded-lg border flex items-center gap-3 ${
                  audioFile.status === 'completed' ? 'bg-green-500/10 border-green-500/30' :
                  audioFile.status === 'failed' ? 'bg-destructive/10 border-destructive/30' :
                  audioFile.status === 'processing' ? 'bg-blue-500/10 border-blue-500/30' :
                  'bg-secondary/30 border-border/50'
                }`}
              >

                {/* Status Icon */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                  {audioFile.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {audioFile.status === 'failed' && <AlertCircle className="w-5 h-5 text-destructive" />}
                  {audioFile.status === 'processing' && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
                  {audioFile.status === 'pending' && <FileAudio className="w-5 h-5 text-muted-foreground" />}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{audioFile.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatFileSize(audioFile.size)}</span>
                    {audioFile.error && <span className="text-xs text-destructive">{audioFile.error}</span>}
                  </div>
                  {audioFile.status === 'processing' && (
                    <Progress value={audioFile.progress} className="h-1 mt-1" />
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {audioFile.status === 'completed' && audioFile.processedBlob && (
                    <Button size="icon" variant="ghost" onClick={() => downloadFile(audioFile)} className="text-green-500 hover:text-green-400">
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => removeFile(audioFile.id)} disabled={audioFile.status === 'processing'} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overall Progress */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="text-accent font-mono">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      )}

      {/* Action Buttons */}
      {files.length > 0 && (
        <div className="flex gap-3">
          <Button
            className="flex-1 cinema-button"
            onClick={processAllFiles}
            disabled={isProcessing || pendingCount === 0}
          >
            {isProcessing ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</>
            ) : (
              <><Play className="w-5 h-5 mr-2" />Process All ({pendingCount})</>
            )}
          </Button>
          
          {completedCount > 0 && (
            <Button variant="outline" onClick={downloadAll} disabled={isProcessing} className="border-green-500/30 text-green-500 hover:bg-green-500/10">
              <Download className="w-4 h-4 mr-2" />Download All ({completedCount})
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
