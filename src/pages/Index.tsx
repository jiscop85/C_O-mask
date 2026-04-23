import { motion } from 'framer-motion';
import { Film, Mic2, Calendar, Sparkles, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import FeatureCard from '@/components/FeatureCard';

const Index = () => {
  const features = [
    {
      icon: Film,
      title: 'Real-Time Face Swap',
      titlePersian: 'تعویض چهره زنده',
      description: 'Transform your face in real-time with AI-powered technology. Lightning-fast processing with ONNX optimization.',
      descriptionPersian: 'چهره خود را در لحظه با فناوری هوش مصنوعی تغییر دهید. پردازش فوق سریع با بهینه‌سازی ONNX.',
      link: '/face-swap',
      gradient: 'from-primary to-cinema-crimson',
    },
    {
      icon: Mic2,
      title: 'Voice Transformation',
      titlePersian: 'تبدیل صدا',
      description: 'Morph your voice into any character. Real-time voice changing with RVC models for stunning results.',
      descriptionPersian: 'صدای خود را به هر شخصیتی تبدیل کنید. تغییر صدای زنده با مدل‌های RVC برای نتایج خیره‌کننده.',
      link: '/voice-changer',
      gradient: 'from-accent to-cinema-gold',
    },
    {
      icon: Calendar,
      title: 'Book Live Sessions',
      titlePersian: 'رزرو جلسات زنده',
      description: 'Schedule virtual meetings with your avatar. Professional video calls with full face and voice transformation.',
      descriptionPersian: 'جلسات مجازی با آواتار خود برنامه‌ریزی کنید. تماس‌های ویدیویی حرفه‌ای با تبدیل کامل چهره و صدا.',
      link: '/booking',
      gradient: 'from-emerald-500 to-teal-600',
    },
  ];

  const stats = [
    { label: 'FPS Processing', value: '30+', icon: Zap },
    { label: 'AI Models', value: '100+', icon: Sparkles },
    { label: 'Privacy First', value: '100%', icon: Shield },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="lens-flare top-20 right-40" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Overline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered • Real-Time • Cinematic</span>
              </span>
            </motion.div>

      
