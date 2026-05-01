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
            {/* Auth Buttons */}
            <div className="flex items-center gap-1 ml-4 border-l border-border/50 pl-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="relative px-3 py-2 group">
                      <motion.div className="flex items-center gap-2" whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                        <Shield className="w-4 h-4 text-primary" />
                      </motion.div>
                    </Link>
                  )}
                  <Link to="/settings" className="relative px-3 py-2 group">
                    <motion.div
                      className="flex items-center gap-2"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </motion.div>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Link to="/login" className="relative px-4 py-2 group">
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogIn className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                    <span className="font-medium text-sm text-muted-foreground group-hover:text-foreground">
                      Sign In
                    </span>
                  </motion.div>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-2">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}

        
