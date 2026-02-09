import { useState } from 'react';
import { Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Newsletter = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter integration would go here
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <div className="max-w-lg mx-auto text-center">
          <span className="inline-block px-3 py-1 text-xs font-medium text-ghost border border-ghost rounded-full mb-6">
            {t('newsletter.coming')}
          </span>
          
          <h2 className="text-2xl md:text-3xl font-display font-semibold mb-4">
            {t('newsletter.title')}
          </h2>

          <form onSubmit={handleSubmit} className="flex gap-3 mt-8">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletter.placeholder')}
              className="flex-1 px-4 py-3 bg-card border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ghost transition-colors"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-foreground text-background font-medium rounded hover-lift flex items-center gap-2"
            >
              <Send size={16} />
              <span className="hidden sm:inline">{t('newsletter.button')}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
