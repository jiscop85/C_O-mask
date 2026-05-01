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
