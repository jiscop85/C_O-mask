import { useLanguage } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowDown, Github, Linkedin, Mail, Phone, Send } from 'lucide-react';
import { useEffect, useRef } from 'react';

    {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      {/* Content */}
      <div className="container relative z-10 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Greeting */}
          <p className="text-muted-foreground text-lg md:text-xl mb-4 fade-in-up opacity-0 stagger-1">
            {t('hero.greeting')}
          </p>

          {/* Name */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4 fade-in-up opacity-0 stagger-2">
            <span className="gradient-text glow-text">{t('hero.name')}</span>
          </h1>

          {/* Title */}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-mono text-primary mb-6 fade-in-up opacity-0 stagger-3">
            {`<${t('hero.title')} />`}
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 fade-in-up opacity-0 stagger-4">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 fade-in-up opacity-0 stagger-5">
            <Button variant="hero" size="xl" asChild>
              <a href="#projects">{t('hero.cta.projects')}</a>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <a href="#contact">{t('hero.cta.contact')}</a>
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-6 fade-in-up opacity-0" style={{ animationDelay: '0.6s' }}>
            <a
              href="https://github.com/jiscop85"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-300"
              aria-label="GitHub"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/arash-javadifar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a
              href="https://t.me/Jisc_op"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-300"
              aria-label="Telegram"
            >
              <Send className="w-6 h-6" />
            </a>
            <a
              href="mailto:arash.javadyfar@gmail.com"
              className="text-muted-foreground hover:text-primary transition-colors duration-300"
              aria-label="Email"
            >
              <Mail className="w-6 h-6" />
            </a>
            <a
              href="tel:+989392880601"
              className="text-muted-foreground hover:text-primary transition-colors duration-300"
              aria-label="Phone"
            >
              <Phone className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowDown className="w-6 h-6" />
          </a>
        </div>
      </div>
    </section>
  );
}
