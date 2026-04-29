import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, RefreshCw, Globe, Shield, Bell, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';


export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'C_O Mask',
    maintenanceMode: false,
    maxUploadSize: '50',
    defaultLanguage: 'en',
    allowSignups: true,
    emailNotifications: true,
    maxProcessingTime: '120',
    defaultQuality: 'balanced',
  });

  const handleSave = () => {
    localStorage.setItem('admin_settings', JSON.stringify(settings));
    toast.success('Settings saved successfully');
  };

  useEffect(() => {
    const saved = localStorage.getItem('admin_settings');
    if (saved) {
      try { setSettings(JSON.parse(saved)); } catch {}
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-foreground tracking-wider">SYSTEM SETTINGS</h1>
          <p className="text-muted-foreground">Configure platform-wide settings</p>
        </div>
        <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-accent border-0 text-primary-foreground">
          <Save className="w-4 h-4 mr-2" />Save All
        </Button>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* General */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-foreground flex items-center gap-2"><Globe className="w-5 h-5 text-primary" />General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Site Name</Label>
              <Input value={settings.siteName} onChange={(e) => setSettings(s => ({ ...s, siteName: e.target.value }))} />
            </div>
            <div>
              <Label>Default Language</Label>
              <Select value={settings.defaultLanguage} onValueChange={(v) => setSettings(s => ({ ...s, defaultLanguage: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fa">Persian (فارسی)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Maintenance Mode</Label>
              <Switch checked={settings.maintenanceMode} onCheckedChange={(c) => setSettings(s => ({ ...s, maintenanceMode: c }))} />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-foreground flex items-center gap-2"><Shield className="w-5 h-5 text-accent" />Security</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Allow New Signups</Label>
              <Switch checked={settings.allowSignups} onCheckedChange={(c) => setSettings(s => ({ ...s, allowSignups: c }))} />
            </div>
            <div>
              <Label>Max Upload Size (MB)</Label>
              <Input type="number" value={settings.maxUploadSize} onChange={(e) => setSettings(s => ({ ...s, maxUploadSize: e.target.value }))} />
            </div>
            <div>
              <Label>Max Processing Time (seconds)</Label>
              <Input type="number" value={settings.maxProcessingTime} onChange={(e) => setSettings(s => ({ ...s, maxProcessingTime: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-foreground flex items-center gap-2"><Bell className="w-5 h-5 text-green-400" />Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Email Notifications</Label>
              <Switch checked={settings.emailNotifications} onCheckedChange={(c) => setSettings(s => ({ ...s, emailNotifications: c }))} />
            </div>
          </CardContent>
        </Card>

        {/* Processing */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-foreground flex items-center gap-2"><Palette className="w-5 h-5 text-purple-400" />Processing</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Default Quality Preset</Label>
              <Select value={settings.defaultQuality} onValueChange={(v) => setSettings(s => ({ ...s, defaultQuality: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
