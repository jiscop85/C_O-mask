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

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 mesh-gradient opacity-30" />
      <div className="fixed top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-1/4 -right-32 w-64 h-64 bg-cinema-crimson/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-display tracking-wider text-foreground mb-2">
            Profile <span className="text-primary">Settings</span>
          </h1>
          <p className="text-muted-foreground">Customize your experience</p>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="neon-card bg-card/50 backdrop-blur-xl border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <User className="w-5 h-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-cinema-crimson p-0.5">
                      <div className="w-full h-full rounded-full bg-card overflow-hidden flex items-center justify-center">
                        {profile?.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="displayName" className="text-foreground">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      className="mt-1 bg-background/50 border-border/50 focus:border-primary"
                    />
                  </div>
                </div>

  
