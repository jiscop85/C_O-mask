import { useLanguage } from '@/contexts/AuthContext';
import { Github, Linkedin, Mail, Heart, Phone, Send } from 'lucide-react';

export function Footer() {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-border/50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 neural-grid opacity-10" />

      <div className="container relative z-10 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="text-center md:text-start">
            <a href="#home" className="font-mono text-xl font-bold gradient-text">
              {language === 'fa' ? 'آرش.AI' : 'Arash.AI'}
            </a>
            <p className="text-sm text-muted-foreground mt-2">
              © {currentYear} {language === 'fa' ? 'آرش جوادی‌فر' : 'Arash Javadifar'}. {t('footer.rights')}
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/jiscop85"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/arash-javadifar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://t.me/Jisc_op"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Telegram"
            >
              <Send className="w-5 h-5" />
            </a>
            <a
              href="mailto:arash.javadyfar@gmail.com"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
            <a
              href="tel:+989392880601"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Phone"
            >
              <Phone className="w-5 h-5" />
            </a>
          </div>

          {/* Built With */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {t('footer.built')}
            <Heart className="w-4 h-4 text-destructive fill-destructive" />
            <span className="gradient-text font-medium">& AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
