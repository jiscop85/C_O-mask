import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X } from 'lucide-react';

const themes = [
  {
    name: 'Cinematic Red',
    key: 'cinematic-red',
    preview: ['#0a0c14', '#dc2626', '#d97706', '#6366f1'],
    vars: {
      '--background': '220 20% 4%',
      '--foreground': '0 0% 95%',
      '--card': '220 15% 7%',
      '--card-foreground': '0 0% 95%',
      '--primary': '0 72% 51%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '220 15% 12%',
      '--secondary-foreground': '0 0% 95%',
      '--muted': '220 10% 15%',
      '--muted-foreground': '220 10% 60%',
      '--accent': '38 92% 50%',
      '--accent-foreground': '0 0% 5%',
      '--border': '220 15% 18%',
      '--input': '220 15% 12%',
      '--ring': '0 72% 51%',
      '--cinema-red': '0 72% 51%',
      '--cinema-crimson': '348 83% 47%',
      '--cinema-gold': '38 92% 50%',
      '--cinema-blue': '220 80% 55%',
      '--cinema-purple': '280 70% 50%',
    },
  },
  {
    name: 'Ocean Deep',
    key: 'ocean-deep',
    preview: ['#0c1929', '#0ea5e9', '#06b6d4', '#8b5cf6'],
    vars: {
      '--background': '215 40% 7%',
      '--foreground': '200 20% 95%',
      '--card': '215 35% 10%',
      '--card-foreground': '200 20% 95%',
      '--primary': '199 89% 48%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '215 30% 14%',
      '--secondary-foreground': '200 20% 95%',
      '--muted': '215 25% 17%',
      '--muted-foreground': '200 15% 55%',
      '--accent': '186 80% 42%',
      '--accent-foreground': '0 0% 5%',
      '--border': '215 25% 20%',
      '--input': '215 30% 14%',
      '--ring': '199 89% 48%',
      '--cinema-red': '199 89% 48%',
      '--cinema-crimson': '186 80% 42%',
      '--cinema-gold': '45 93% 47%',
      '--cinema-blue': '210 90% 55%',
      '--cinema-purple': '263 70% 50%',
    },
  },
  {
    name: 'Emerald Night',
    key: 'emerald-night',
    preview: ['#0a1612', '#10b981', '#34d399', '#f59e0b'],
    vars: {
      '--background': '160 25% 5%',
      '--foreground': '140 15% 95%',
      '--card': '160 20% 8%',
      '--card-foreground': '140 15% 95%',
      '--primary': '160 64% 40%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '160 20% 12%',
      '--secondary-foreground': '140 15% 95%',
      '--muted': '160 15% 15%',
      '--muted-foreground': '160 10% 55%',
      '--accent': '43 96% 56%',
      '--accent-foreground': '0 0% 5%',
      '--border': '160 15% 18%',
      '--input': '160 20% 12%',
      '--ring': '160 64% 40%',
      '--cinema-red': '160 64% 40%',
      '--cinema-crimson': '152 69% 46%',
      '--cinema-gold': '43 96% 56%',
      '--cinema-blue': '173 80% 40%',
      '--cinema-purple': '262 60% 50%',
    },
  },
  {
    name: 'Royal Purple',
    key: 'royal-purple',
    preview: ['#120a1e', '#a855f7', '#d946ef', '#ec4899'],
    vars: {
      '--background': '270 30% 5%',
      '--foreground': '280 15% 95%',
      '--card': '270 25% 8%',
      '--card-foreground': '280 15% 95%',
      '--primary': '271 91% 65%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '270 20% 13%',
      '--secondary-foreground': '280 15% 95%',
      '--muted': '270 15% 16%',
      '--muted-foreground': '270 10% 55%',
      '--accent': '322 80% 58%',
      '--accent-foreground': '0 0% 100%',
      '--border': '270 18% 20%',
      '--input': '270 20% 13%',
      '--ring': '271 91% 65%',
      '--cinema-red': '271 91% 65%',
      '--cinema-crimson': '322 80% 58%',
      '--cinema-gold': '45 93% 47%',
      '--cinema-blue': '250 80% 60%',
      '--cinema-purple': '290 75% 55%',
    },
  },
  {
    name: 'Amber Glow',
    key: 'amber-glow',
    preview: ['#1a1206', '#f59e0b', '#ef4444', '#eab308'],
    vars: {
      '--background': '35 40% 5%',
      '--foreground': '40 20% 95%',
      '--card': '35 30% 8%',
      '--card-foreground': '40 20% 95%',
      '--primary': '38 92% 50%',
      '--primary-foreground': '0 0% 5%',
      '--secondary': '35 25% 13%',
      '--secondary-foreground': '40 20% 95%',
      '--muted': '35 20% 15%',
      '--muted-foreground': '35 15% 55%',
      '--accent': '0 84% 60%',
      '--accent-foreground': '0 0% 100%',
      '--border': '35 20% 18%',
      '--input': '35 25% 13%',
      '--ring': '38 92% 50%',
      '--cinema-red': '38 92% 50%',
      '--cinema-crimson': '0 84% 60%',
      '--cinema-gold': '48 96% 53%',
      '--cinema-blue': '220 80% 55%',
      '--cinema-purple': '280 70% 50%',
    },
  },
  {
    name: 'Cyberpunk Neon',
    key: 'cyberpunk-neon',
    preview: ['#0a0a0f', '#00ff87', '#f0f', '#0ff'],
    vars: {
      '--background': '240 20% 3%',
      '--foreground': '160 100% 90%',
      '--card': '240 15% 6%',
      '--card-foreground': '160 100% 90%',
      '--primary': '155 100% 55%',
      '--primary-foreground': '240 20% 3%',
      '--secondary': '240 15% 10%',
      '--secondary-foreground': '160 100% 90%',
      '--muted': '240 12% 13%',
      '--muted-foreground': '240 10% 50%',
      '--accent': '300 100% 50%',
      '--accent-foreground': '0 0% 100%',
      '--border': '260 30% 18%',
      '--input': '240 15% 10%',
      '--ring': '155 100% 55%',
      '--cinema-red': '155 100% 55%',
      '--cinema-crimson': '300 100% 50%',
      '--cinema-gold': '180 100% 50%',
      '--cinema-blue': '200 100% 60%',
      '--cinema-purple': '270 100% 65%',
    },
  },
  {
    name: 'Light Elegant',
    key: 'light-elegant',
    preview: ['#f8f7f4', '#1a1a2e', '#6366f1', '#ec4899'],
    vars: {
      '--background': '40 20% 97%',
      '--foreground': '240 20% 10%',
      '--card': '0 0% 100%',
      '--card-foreground': '240 20% 10%',
      '--primary': '239 84% 67%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '240 10% 92%',
      '--secondary-foreground': '240 20% 15%',
      '--muted': '240 10% 90%',
      '--muted-foreground': '240 5% 46%',
      '--accent': '330 80% 60%',
      '--accent-foreground': '0 0% 100%',
      '--border': '240 6% 83%',
      '--input': '240 10% 92%',
      '--ring': '239 84% 67%',
      '--cinema-red': '239 84% 67%',
      '--cinema-crimson': '330 80% 60%',
      '--cinema-gold': '38 92% 50%',
      '--cinema-blue': '220 80% 55%',
      '--cinema-purple': '280 70% 50%',
    },
  },
];


export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('cinematic-red');

  useEffect(() => {
    const saved = localStorage.getItem('co-mask-theme');
    if (saved) {
      setCurrent(saved);
      applyTheme(saved);
    }
  }, []);

  const applyTheme = useCallback((key: string) => {
    const theme = themes.find((t) => t.key === key);
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([prop, val]) => {
      root.style.setProperty(prop, val);
    });
  }, []);

  const selectTheme = (key: string) => {
    setCurrent(key);
    localStorage.setItem('co-mask-theme', key);
    applyTheme(key);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[10001] w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{ boxShadow: '0 0 30px hsl(var(--primary) / 0.5)' }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="p" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Palette className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Theme panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-24 right-6 z-[10001] w-64 rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-4 shadow-2xl"
          >
            <p className="text-sm font-display tracking-wider text-foreground mb-3">THEME</p>
            <div className="space-y-2">
              {themes.map((t) => (
                <button
                  key={t.key}
                  onClick={() => selectTheme(t.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    current === t.key
                      ? 'bg-primary/15 ring-1 ring-primary/50'
                      : 'hover:bg-secondary/60'
                  }`}
                >
                  <div className="flex -space-x-1">
                    {t.preview.map((c, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border-2 border-card"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-foreground font-medium">{t.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


