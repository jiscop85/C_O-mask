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

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-6xl md:text-8xl lg:text-9xl tracking-wider mb-4"
            >
              <span className="text-foreground">C_O</span>{' '}
              <span className="text-primary glow-text">MASK</span>
            </motion.h1>

            {/* Persian Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-accent gold-glow font-medium mb-4"
              dir="rtl"
            >
              تبدیل سینمایی چهره و صدا
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            >
              Experience the future of digital transformation. Real-time face swap and voice changing 
              with cinema-quality results. Powered by cutting-edge AI.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/face-swap">
                <motion.button
                  className="cinema-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Transforming
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  className="px-8 py-4 rounded-lg font-display tracking-widest text-lg uppercase border border-border text-foreground hover:bg-secondary transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="font-display text-3xl text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              className="w-1 h-2 bg-primary rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              POWERFUL <span className="text-primary">FEATURES</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto" dir="rtl">
              ویژگی‌های قدرتمند برای تبدیل دیجیتال شما
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              HOW IT <span className="text-accent">WORKS</span>
            </h2>
            <p className="text-muted-foreground">Simple steps to transform your digital presence</p>
          </motion.div>

     
