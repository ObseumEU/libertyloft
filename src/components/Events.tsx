import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
}

const Events = () => {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const icsUrl = 'https://calendar.google.com/calendar/ical/libertyloft%40proton.me/public/basic.ics';
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(icsUrl)}`;
        
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        
        const icsText = await response.text();
        if (!icsText.includes('BEGIN:VCALENDAR')) {
          throw new Error('Invalid calendar data');
        }
        
        const parsedEvents = parseICS(icsText);
        
        // Filter only upcoming events and sort by date
        const now = new Date();
        const upcomingEvents = parsedEvents
          .filter(event => event.date >= now)
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(0, 6);
        
        setEvents(upcomingEvents);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch calendar:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const parseICS = (icsText: string): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const eventBlocks = icsText.split('BEGIN:VEVENT');
    
    for (let i = 1; i < eventBlocks.length; i++) {
      const block = eventBlocks[i];
      const endIndex = block.indexOf('END:VEVENT');
      const eventData = block.substring(0, endIndex);
      
      // Handle line folding
      const unfoldedData = eventData.replace(/\r?\n[ \t]/g, '');
      const lines = unfoldedData.split(/\r?\n/);
      
      let title = '';
      let description = '';
      let dateStr = '';
      let uid = '';
      
      for (const line of lines) {
        if (line.startsWith('SUMMARY:')) {
          title = line.substring(8).trim();
        } else if (line.startsWith('DESCRIPTION:')) {
          description = line.substring(12).trim()
            .replace(/\\n/g, ' ')
            .replace(/\\,/g, ',')
            .replace(/\s+/g, ' ');
        } else if (line.startsWith('DTSTART')) {
          const match = line.match(/(\d{8})(T(\d{6}))?/);
          if (match) {
            dateStr = match[0];
          }
        } else if (line.startsWith('UID:')) {
          uid = line.substring(4).trim();
        }
      }
      
      if (title && dateStr) {
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1;
        const day = parseInt(dateStr.substring(6, 8));
        let hours = 0, minutes = 0;
        
        if (dateStr.length > 8) {
          hours = parseInt(dateStr.substring(9, 11));
          minutes = parseInt(dateStr.substring(11, 13));
        }
        
        events.push({
          id: uid || crypto.randomUUID(),
          title,
          description: description.substring(0, 200),
          date: new Date(year, month, day, hours, minutes),
        });
      }
    }
    
    return events;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'cs' ? 'cs-CZ' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    if (date.getHours() === 0 && date.getMinutes() === 0) {
      return language === 'cs' ? 'Celý den' : 'All day';
    }
    return new Intl.DateTimeFormat(language === 'cs' ? 'cs-CZ' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <section id="events" className="section-padding">
        <div className="container-narrow">
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-12">
            {t('events.title')}
          </h2>
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-ghost border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="section-padding">
      <div className="container-narrow">
        <h2 className="text-3xl md:text-4xl font-display font-semibold mb-12">
          {t('events.title')}
        </h2>

        {error && (
          <div className="text-center py-12 border border-border rounded">
            <Calendar size={32} className="mx-auto mb-4 text-ghost" />
            <p className="text-muted-foreground mb-4">
              {language === 'cs' ? 'Nepodařilo se načíst akce.' : 'Unable to load events.'}
            </p>
            <a
              href="https://calendar.google.com/calendar/embed?src=libertyloft%40proton.me&ctz=Europe%2FPrague"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ghost-bright hover:text-foreground transition-colors underline underline-offset-4"
            >
              {language === 'cs' ? 'Zobrazit kalendář' : 'View calendar'}
            </a>
          </div>
        )}

        {!error && events.length === 0 && (
          <div className="text-center py-12 border border-border rounded">
            <Calendar size={32} className="mx-auto mb-4 text-ghost" />
            <p className="text-muted-foreground">{t('events.noEvents')}</p>
          </div>
        )}

        {!error && events.length > 0 && (
          <div className="space-y-4">
            {events.map((event) => (
              <article
                key={event.id}
                className="group p-6 border border-border rounded hover:border-ghost transition-all duration-300 hover-lift"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Date block */}
                  <div className="flex-shrink-0 md:w-32 md:text-right">
                    <div className="flex items-center gap-2 md:justify-end text-ghost-bright text-sm">
                      <Calendar size={14} />
                      <span>{formatDate(event.date).split(',')[0]}</span>
                    </div>
                    <div className="text-lg font-display font-medium mt-1">
                      {formatDate(event.date).split(',').slice(1).join(',')}
                    </div>
                    <div className="flex items-center gap-2 md:justify-end text-muted-foreground text-sm mt-1">
                      <Clock size={12} />
                      <span>{formatTime(event.date)}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-px bg-border group-hover:bg-ghost transition-colors self-stretch" />

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-medium mb-2 group-hover:text-ghost-bright transition-colors">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Events;
