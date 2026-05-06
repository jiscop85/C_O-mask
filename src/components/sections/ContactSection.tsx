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

  
