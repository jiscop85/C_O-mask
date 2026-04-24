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

