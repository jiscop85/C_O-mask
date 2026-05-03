import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, BarChart3, Shield, Settings, ArrowLeft,
  Activity, FileWarning, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const adminNavItems = [
  { path: '/admin', label: 'Overview', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/moderation', label: 'Moderation', icon: FileWarning },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`sticky top-0 h-screen border-r border-border/50 bg-card/50 backdrop-blur-xl flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-display text-lg text-foreground tracking-wider">ADMIN</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {adminNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Back to site */}
      <div className="p-4 border-t border-border/50">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Back to Site</span>}
        </Link>
      </div>
    </motion.aside>
  );
}
const AnimatedCharacter = ({ emailFocused, passwordFocused, passwordVisible }: AnimatedCharacterProps) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const relX = ((e.clientX - centerX) / (dimensions.width / 2)) * 15;
        const relY = ((e.clientY - centerY) / (dimensions.height / 2)) * 10;
        
        mouseX.set(Math.max(-15, Math.min(15, relX)));
        mouseY.set(Math.max(-10, Math.min(10, relY)));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [dimensions.width, dimensions.height, mouseX, mouseY]);

  const leftEyeX = useTransform(smoothMouseX, [-15, 15], [-8, 8]);
  const leftEyeY = useTransform(smoothMouseY, [-10, 10], [-5, 5]);
  const rightEyeX = useTransform(smoothMouseX, [-15, 15], [-8, 8]);
  const rightEyeY = useTransform(smoothMouseY, [-10, 10], [-5, 5]);

  const headRotate = useTransform(smoothMouseX, [-15, 15], [-5, 5]);

  const getEyeState = () => {
    if (passwordFocused && !passwordVisible) return 'closed';
    if (passwordVisible && passwordFocused) return 'peek';
    return 'open';
  };

  const eyeState = getEyeState();

  const getMouthPath = () => {
    if (emailFocused) return "M70 145 Q100 170 130 145"; // Big smile
    if (passwordFocused && !passwordVisible) return "M75 150 L125 150"; // Neutral line
    if (passwordVisible) return "M75 145 Q100 155 125 145"; // Slight smirk
    return "M75 148 Q100 158 125 148"; // Gentle smile
  };

  return (
    <motion.svg
      ref={containerRef}
      width="220"
      height="220"
      viewBox="0 0 200 200"
      className="drop-shadow-2xl"
      style={{ rotate: headRotate }}
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Glow effect behind head */}
      <defs>
        <radialGradient id="headGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(0 72% 51% / 0.3)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="hatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        <linearGradient id="faceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5dcc4" />
          <stop offset="100%" stopColor="#e8c9a8" />
        </linearGradient>
      </defs>

      {/* Background glow */}
      <circle cx="100" cy="105" r="95" fill="url(#headGlow)" />

      {/* Film Director Hat (Beret style) */}
      <motion.g
        animate={{ rotate: emailFocused ? [0, -3, 3, 0] : 0 }}
        transition={{ duration: 0.5 }}
        style={{ originX: '100px', originY: '50px' }}
      >
        <ellipse cx="100" cy="55" rx="55" ry="25" fill="url(#hatGradient)" />
        <path d="M45 55 Q45 35 100 30 Q155 35 155 55" fill="url(#hatGradient)" />
        <ellipse cx="100" cy="55" rx="45" ry="15" fill="#333" />
        {/* Hat detail - film reel decoration */}
        <circle cx="135" cy="45" r="8" fill="#444" stroke="#555" strokeWidth="1" />
        <circle cx="135" cy="45" r="3" fill="#333" />
      </motion.g>

      {/* Face */}
      <ellipse cx="100" cy="110" rx="60" ry="65" fill="url(#faceGradient)" />
      
      {/* Ears */}
      <ellipse cx="42" cy="105" rx="10" ry="15" fill="#e8c9a8" />
      <ellipse cx="158" cy="105" rx="10" ry="15" fill="#e8c9a8" />

      {/* Eyebrows */}
      <motion.path
        d="M55 78 Q70 70 85 78"
        stroke="#5a4a3a"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        animate={{
          d: emailFocused 
            ? "M55 72 Q70 65 85 72" 
            : passwordFocused && !passwordVisible 
              ? "M55 82 Q70 82 85 82" 
              : "M55 78 Q70 70 85 78"
        }}
        transition={{ duration: 0.3 }}
      />
      <motion.path
        d="M115 78 Q130 70 145 78"
        stroke="#5a4a3a"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        animate={{
          d: emailFocused 
            ? "M115 72 Q130 65 145 72" 
            : passwordFocused && !passwordVisible 
              ? "M115 82 Q130 82 145 82" 
              : "M115 78 Q130 70 145 78"
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Left Eye */}
      <g transform="translate(70, 95)">
        <ellipse cx="0" cy="0" rx="18" ry="15" fill="white" />
        <motion.g
          animate={{
            scaleY: eyeState === 'closed' ? 0.1 : eyeState === 'peek' ? 0.4 : 1,
            y: eyeState === 'peek' ? 5 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.circle
            cx="0"
            cy="0"
            r="10"
            fill="#3a2a1a"
            style={{ x: leftEyeX, y: leftEyeY }}
          />
          <motion.circle
            cx="-3"
            cy="-3"
            r="4"
            fill="white"
            style={{ x: leftEyeX, y: leftEyeY }}
            animate={{ opacity: eyeState === 'closed' ? 0 : 1 }}
          />
        </motion.g>
dCharacter;
        {/* Eyelid for closed/peek state */}
        <motion.path
          d="M-18 0 Q0 0 18 0"
          stroke="#e8c9a8"
          strokeWidth="4"
          fill="none"
          animate={{
            d: eyeState === 'closed' 
              ? "M-18 0 Q0 0 18 0" 
              : eyeState === 'peek'
                ? "M-18 -5 Q0 5 18 -5"
                : "M-18 -15 Q0 -15 18 -15"
          }}
          transition={{ duration: 0.3 }}
        />
      </g>

      {/* Right Eye */}
      <g transform="translate(130, 95)">
        <ellipse cx="0" cy="0" rx="18" ry="15" fill="white" />
        <motion.g
          animate={{
            scaleY: eyeState === 'closed' ? 0.1 : eyeState === 'peek' ? 0.4 : 1,
            y: eyeState === 'peek' ? 5 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.circle
            cx="0"
            cy="0"
            r="10"
            fill="#3a2a1a"
            style={{ x: rightEyeX, y: rightEyeY }}
          />
          <motion.circle
            cx="-3"
            cy="-3"
            r="4"
            fill="white"
            style={{ x: rightEyeX, y: rightEyeY }}
            animate={{ opacity: eyeState === 'closed' ? 0 : 1 }}
          />
        </motion.g>
        {/* Right eyelid */}
        <motion.path
          d="M-18 0 Q0 0 18 0"
          stroke="#e8c9a8"
          strokeWidth="4"
          fill="none"
          animate={{
            d: eyeState === 'closed' 
              ? "M-18 0 Q0 0 18 0" 
              : eyeState === 'peek'
                ? "M-18 -5 Q0 5 18 -5"
                : "M-18 -15 Q0 -15 18 -15"
          }}
          transition={{ duration: 0.3 }}
        />
        {/* Wink for email focus */}
        {emailFocused && (
          <motion.path
            d="M-15 0 Q0 5 15 0"
            stroke="#3a2a1a"
            strokeWidth="2"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        )}
      </g>

      {/* Nose */}
      <path d="M95 115 Q100 130 105 115" stroke="#d4b896" strokeWidth="2" fill="none" />

      {/* Mouth */}
      <motion.path
        d={getMouthPath()}
        stroke="#8b6b5a"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        animate={{ d: getMouthPath() }}
        transition={{ duration: 0.3 }}
      />

      {/* Blush when happy */}
      <motion.ellipse
        cx="55"
        cy="125"
        rx="12"
        ry="6"
        fill="hsl(0 60% 70% / 0.4)"
        animate={{ opacity: emailFocused ? 0.6 : 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.ellipse
        cx="145"
        cy="125"
        rx="12"
        ry="6"
        fill="hsl(0 60% 70% / 0.4)"
        animate={{ opacity: emailFocused ? 0.6 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.svg>
  );
};

export default Animate
