import { useLanguage } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageCircle, Send, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';


export function ContactSection() {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(t('contact.success'));
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const socialLinks = [
    {
      name: 'LinkedIn',
      icon: <MessageCircle className="w-5 h-5" />,
      href: 'https://www.linkedin.com/in/arash-javadifar/',
      color: 'hover:bg-blue-600/20 hover:text-blue-400',
    },
    {
      name: 'GitHub',
      icon: <Send className="w-5 h-5" />,
      href: 'https://github.com/jiscop85',
      color: 'hover:bg-gray-500/20 hover:text-gray-300',
    },
    {
      name: 'Telegram',
      icon: <Send className="w-5 h-5" />,
      href: 'https://t.me/Jisc_op',
      color: 'hover:bg-sky-500/20 hover:text-sky-400',
    },
    {
      name: 'Email',
      icon: <Mail className="w-5 h-5" />,
      href: 'mailto:arash.javadyfar@gmail.com',
      color: 'hover:bg-primary/20 hover:text-primary',
    },
    {
      name: language === 'fa' ? 'تماس' : 'Phone',
      icon: <Phone className="w-5 h-5" />,
      href: 'tel:+989392880601',
      color: 'hover:bg-green-500/20 hover:text-green-400',
    },
  ];

  return (
    <section id="contact" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container relative z-10 px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mt-4" />
        </div>
      <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <div className="glass rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  {t('contact.name')}
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                  placeholder={language === 'fa' ? 'نام شما' : 'John Doe'}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  {t('contact.email')}
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                  placeholder={language === 'fa' ? 'ایمیل شما' : 'john@example.com'}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  {t('contact.message')}
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="bg-secondary/50 border-border/50 focus:border-primary resize-none"
                  placeholder={language === 'fa' ? 'پیام شما...' : 'Your message...'}
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {language === 'fa' ? 'در حال ارسال...' : 'Sending...'}
                  </span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {t('contact.send')}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-center">
            <div className="space-y-8">
              {/* Direct Contact */}
              <div>
                <h3 className="text-xl font-bold mb-6">{t('contact.or')}</h3>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 px-6 py-4 glass rounded-xl transition-all duration-300 ${link.color}`}
                    >
                      {link.icon}
                      <span className="font-medium">{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">
                      {language === 'fa' ? 'موقعیت' : 'Location'}
                    </h4>
                    <p className="text-muted-foreground">
                      {language === 'fa' 
                        ? 'تهران، ایران • در دسترس برای کار ریموت در سراسر جهان'
                        : 'Tehran, Iran • Available for remote work worldwide'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Terminal Style Message */}
              <div className="glass rounded-xl p-6 font-mono text-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <p><span className="text-primary">$</span> whoami</p>
                  <p className="text-foreground">Arash Javadifar - AI Engineer</p>
                  <p><span className="text-primary">$</span> echo $AVAILABILITY</p>
                  <p className="text-green-400">Open to new opportunities_</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

  
