import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Film, Mic2, Calendar, LogIn, LogOut, Settings, LayoutDashboard, Video, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, profile } = useAuth();
  const { isAdmin } = useAdminRole();

  const navItems = [
    { path: '/', label: 'Home', icon: Film },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/face-swap', label: 'Face Swap', icon: Film },
    { path: '/voice-changer', label: 'Voice Changer', icon: Mic2 },
    { path: '/video-templates', label: 'Templates', icon: Video },
    { path: '/booking', label: 'Book Session', icon: Calendar },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-transparent" />
      
      <div className="relative container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cinema-crimson flex items-center justify-center">
                <Film className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute -inset-1 bg-primary/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            <div>
              <h1 className="font-display text-2xl tracking-wider text-foreground">
                C_O <span className="text-primary">MASK</span>
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
                Cinematic Transformation
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-4 py-2 group"
                >
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    <span className={`font-medium text-sm transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      {item.label}
                    </span>
                  </motion.div>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

