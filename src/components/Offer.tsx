import { Home, Users, Lightbulb, Rocket } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Offer = () => {
  const { t } = useLanguage();

  const offers = [
    { icon: Home, titleKey: 'offer.space', descKey: 'offer.space.desc' },
    { icon: Users, titleKey: 'offer.community', descKey: 'offer.community.desc' },
    { icon: Lightbulb, titleKey: 'offer.ideas', descKey: 'offer.ideas.desc' },
    { icon: Rocket, titleKey: 'offer.opportunity', descKey: 'offer.opportunity.desc' },
  ];

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">
          {t('offer.title')}
        </h2>
        
        <p className="text-muted-foreground mb-12 max-w-2xl">
          {t('looking.description')}
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {offers.map(({ icon: Icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="p-6 border border-border rounded hover:border-ghost transition-colors group hover-lift"
            >
              <Icon 
                size={24} 
                className="text-ghost mb-4 group-hover:text-ghost-bright transition-colors" 
              />
              <h3 className="text-lg font-display font-medium mb-2">
                {t(titleKey)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Offer;
