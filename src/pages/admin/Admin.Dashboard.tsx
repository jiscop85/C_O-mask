import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Stats {
  totalUsers: number;
  totalTransformations: number;
  totalBookings: number;
  avgProcessingTime: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(180,80%,50%)', 'hsl(340,70%,50%)'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalTransformations: 0, totalBookings: 0, avgProcessingTime: 0 });
  const [transformationData, setTransformationData] = useState<any[]>([]);
  const [typeBreakdown, setTypeBreakdown] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchStats = useCallback(async () => {
    const [profilesRes, transformRes, bookingsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('transformation_history').select('*'),
      supabase.from('booking_sessions').select('id', { count: 'exact', head: true }),
    ]);

    const transforms = transformRes.data || [];
    const avgTime = transforms.length > 0
      ? Math.round(transforms.reduce((a, t) => a + (t.processing_time_ms || 0), 0) / transforms.length)
      : 0;

    setStats({
      totalUsers: profilesRes.count || 0,
      totalTransformations: transforms.length,
      totalBookings: bookingsRes.count || 0,
      avgProcessingTime: avgTime,
    });

    const days: Record<string, number> = {};
    const types: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toLocaleDateString('en', { weekday: 'short' })] = 0;
    }
    transforms.forEach((t) => {
      const d = new Date(t.created_at).toLocaleDateString('en', { weekday: 'short' });
      if (d in days) days[d]++;
      types[t.transformation_type] = (types[t.transformation_type] || 0) + 1;
    });

    setTransformationData(Object.entries(days).map(([name, count]) => ({ name, count })));
    setTypeBreakdown(Object.entries(types).map(([name, value]) => ({ name, value })));
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    fetchStats();


