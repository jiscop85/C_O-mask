import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Film, Mic2, Calendar, TrendingUp, Clock, Zap, 
  ArrowRight, Activity, BarChart3, PieChart, Users,
  Image, Wand2, Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTransformationHistory } from '@/hooks/useTransformationHistory';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts';


const Dashboard = () => {
  const { user, profile } = useAuth();
  const { history, loading } = useTransformationHistory();
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    faceSwaps: 0,
    voiceChanges: 0,
    avgTime: 0,
  });

  // Calculate stats
  const faceSwaps = history.filter(h => h.transformation_type === 'face_swap');
  const voiceChanges = history.filter(h => h.transformation_type === 'voice_change');
  const avgProcessingTime = history.length > 0 
    ? Math.round(history.reduce((acc, h) => acc + (h.processing_time_ms || 0), 0) / history.length)
    : 0;

  // Animate stats on load
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedStats({
        total: Math.round(history.length * eased),
        faceSwaps: Math.round(faceSwaps.length * eased),
        voiceChanges: Math.round(voiceChanges.length * eased),
        avgTime: Math.round(avgProcessingTime * eased),
      });
      
      if (step >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, [history.length, faceSwaps.length, voiceChanges.length, avgProcessingTime]);

  // Generate chart data from history
  const generateChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        faceSwaps: 0,
        voiceChanges: 0,
        total: 0,
      };
    });

    history.forEach(record => {
      const recordDate = new Date(record.created_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) {
        const index = 6 - diffDays;
        if (index >= 0 && index < 7) {
          last7Days[index].total++;
          if (record.transformation_type === 'face_swap') {
            last7Days[index].faceSwaps++;
          } else {
            last7Days[index].voiceChanges++;
          }
        }
      }
    });

    return last7Days;
  };

  const chartData = generateChartData();
  
  const pieData = [
    { name: 'Face Swaps', value: faceSwaps.length, color: 'hsl(38, 92%, 50%)' },
    { name: 'Voice Changes', value: voiceChanges.length, color: 'hsl(280, 70%, 50%)' },
  ];

  const quickActions = [
    { 
      title: 'Face Swap', 
      titlePersian: 'تغییر چهره',
      icon: Film, 
      path: '/face-swap', 
      gradient: 'from-primary to-cinema-crimson',
      description: 'Transform faces with AI'
    },
    { 
      title: 'Voice Changer', 
      titlePersian: 'تغییر صدا',
      icon: Mic2, 
      path: '/voice-changer', 
      gradient: 'from-accent to-amber-600',
      description: 'Real-time voice transformation'
    },
    { 
      title: 'Book Session', 
      titlePersian: 'رزرو جلسه',
      icon: Calendar, 
      path: '/booking', 
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Schedule a consultation'
    },
  ];

  const recentTransformations = history.slice(0, 5);

  return (
    <div className="min-h-screen pt-24 pb-12 relative">
      {/* Animated Background */}
      <div className="mesh-gradient" />
      <div className="grid-overlay" />
      
      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb orb-1" style={{ background: 'radial-gradient(circle, hsl(38 92% 50% / 0.3) 0%, transparent 70%)' }} />
        <div className="floating-orb orb-2" style={{ background: 'radial-gradient(circle, hsl(280 70% 50% / 0.25) 0%, transparent 70%)' }} />
        <div className="floating-orb orb-3" style={{ background: 'radial-gradient(circle, hsl(180 80% 50% / 0.2) 0%, transparent 70%)' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Activity className="w-4 h-4 text-accent" />
            <span className="text-sm tech-text text-muted-foreground">ANALYTICS DASHBOARD</span>
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4">
            WELCOME <span className="text-accent gold-glow">{profile?.display_name || 'CREATOR'}</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Track your transformations, monitor performance, and access all features in one place.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2" dir="rtl">
            تبدیل‌های خود را پیگیری کنید، عملکرد را مانیتور کنید
          </p>
        </motion.div>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Transformations', labelPersian: 'کل تبدیل‌ها', value: animatedStats.total, icon: Sparkles, color: 'text-accent' },
            { label: 'Face Swaps', labelPersian: 'تغییر چهره', value: animatedStats.faceSwaps, icon: Image, color: 'text-primary' },
            { label: 'Voice Changes', labelPersian: 'تغییر صدا', value: animatedStats.voiceChanges, icon: Wand2, color: 'text-purple-400' },
            { label: 'Avg. Processing (ms)', labelPersian: 'زمان پردازش', value: animatedStats.avgTime, icon: Clock, color: 'text-emerald-400' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="neon-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className={`text-4xl font-display ${stat.color} mb-2`}>{stat.value.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground/70" dir="rtl">{stat.labelPersian}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 neon-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  ACTIVITY OVERVIEW
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Last 7 days performance</p>
              </div>
            </div>

 ashboard;

