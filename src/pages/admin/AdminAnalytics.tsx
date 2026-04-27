import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Cpu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';




export default function AdminAnalytics() {
  const [period, setPeriod] = useState('7d');
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [modelData, setModelData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  useEffect(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const fetchAnalytics = async () => {
      const { data } = await supabase
        .from('transformation_history')
        .select('*')
        .gte('created_at', since.toISOString())
        .order('created_at');

      const transforms = data || [];

      // Daily counts
      const daily: Record<string, { face_swap: number; voice_change: number; video: number }> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
        daily[key] = { face_swap: 0, voice_change: 0, video: 0 };
      }
      transforms.forEach((t) => {
        const key = new Date(t.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' });
        if (daily[key]) {
          const type = t.transformation_type as keyof typeof daily[typeof key];
          if (type in daily[key]) daily[key][type]++;
        }
      });
      setDailyData(Object.entries(daily).map(([date, v]) => ({ date, ...v })));

      // Model usage
      const models: Record<string, number> = {};
      transforms.forEach((t) => {
        const meta = t.metadata as Record<string, any> | null;
        const model = (meta?.model as string) || t.transformation_type;
        models[model] = (models[model] || 0) + 1;
      });
      setModelData(Object.entries(models).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count));
