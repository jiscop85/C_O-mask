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

        // Subscribe to realtime changes
    const channel = supabase
      .channel('admin-dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transformation_history' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_sessions' }, () => fetchStats())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
    { label: 'Transformations', value: stats.totalTransformations, icon: Activity, color: 'text-accent' },
    { label: 'Bookings', value: stats.totalBookings, icon: Clock, color: 'text-green-400' },
    { label: 'Avg Process (ms)', value: stats.avgProcessingTime, icon: TrendingUp, color: 'text-purple-400' },
  ];

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-foreground tracking-wider">ADMIN OVERVIEW</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Live — updated {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <button onClick={fetchStats} className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-foreground">Activity (7 Days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={transformationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-foreground">By Type</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {typeBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {typeBreakdown.map((t, i) => (
                <div key={t.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground capitalize">{t.name.replace('_', ' ')}</span>
                  </div>
                  <span className="text-foreground font-medium">{t.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

