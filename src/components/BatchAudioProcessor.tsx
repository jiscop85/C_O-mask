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

