import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Video, Clock, Users, Star, CheckCircle, Loader2, 
  Mail, CalendarCheck, Sparkles, ArrowRight, X, Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useBookingSessions, type BookingSession } from '@/hooks/useBookingSessions';
import { supabase } from '@/integrations/supabase/client';
