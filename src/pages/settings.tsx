import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Globe, Cpu, Bell, Camera, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, profile, preferences, updateProfile, updatePreferences, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [language, setLanguage] = useState<'en' | 'fa'>(profile?.preferred_language || 'en');
  const [processingMode, setProcessingMode] = useState<'client' | 'server' | 'auto'>(profile?.preferred_processing_mode || 'auto');
  const [notificationsEnabled, setNotificationsEnabled] = useState(preferences?.notifications_enabled ?? true);
  const [emailConfirmations, setEmailConfirmations] = useState(preferences?.email_confirmations ?? true);
  const [calendarSync, setCalendarSync] = useState(preferences?.calendar_sync_enabled ?? false);
  const [qualityPreset, setQualityPreset] = useState<'performance' | 'balanced' | 'quality'>(preferences?.quality_preset || 'balanced');
  
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      // For now, we'll use a placeholder approach since storage isn't set up
      // In production, you'd upload to Supabase Storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await updateProfile({ avatar_url: base64 });
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Could not upload avatar. Please try again.',
      });
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Update profile
    await updateProfile({
      display_name: displayName,
      preferred_language: language,
      preferred_processing_mode: processingMode,
    });

    // Update preferences
    await updatePreferences({
      notifications_enabled: notificationsEnabled,
      email_confirmations: emailConfirmations,
      calendar_sync_enabled: calendarSync,
      quality_preset: qualityPreset,
    });

    await refreshProfile();
    setSaving(false);
  };

