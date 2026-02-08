import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="section-padding bg-card">
      <div className="container-narrow">
        <h2 className="text-3xl md:text-4xl font-display font-semibold mb-8">
          {t('about.title')}
        </h2>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p className="text-lg">{t('about.p1')}</p>
          <p>{t('about.p2')}</p>
          <p>{t('about.p3')}</p>
          <p className="text-foreground font-medium">{t('about.p4')}</p>
        </div>
      </div>
    </section>
  );
};

export default About;
