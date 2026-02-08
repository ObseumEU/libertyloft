import { Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Events = () => {
  const { t } = useLanguage();

  return (
    <section id="events" className="section-padding">
      <div className="container-narrow">
        <h2 className="text-3xl md:text-4xl font-display font-semibold mb-12">
          {t('events.title')}
        </h2>

        {/* Google Calendar Agenda Embed */}
        <div className="relative overflow-hidden rounded border border-border bg-card">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-card z-10" />
          <iframe
            src="https://calendar.google.com/calendar/embed?height=400&wkst=1&ctz=Europe%2FPrague&mode=AGENDA&showTitle=0&showNav=0&showPrint=0&showTabs=0&showCalendars=0&src=bGliZXJ0eWxvZnRAcHJvdG9uLm1l&color=%23ffffff"
            style={{ 
              border: 0, 
              filter: 'invert(93%) hue-rotate(180deg)',
              minHeight: '400px'
            }}
            width="100%"
            height="400"
            frameBorder="0"
            scrolling="no"
            title="LibertyLoft Events"
            className="w-full"
          />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <a
            href="https://calendar.google.com/calendar/embed?src=libertyloft%40proton.me&ctz=Europe%2FPrague"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <Calendar size={14} />
            {t('events.upcoming')}
          </a>
        </p>
      </div>
    </section>
  );
};

export default Events;
