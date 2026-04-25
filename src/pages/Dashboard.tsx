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

