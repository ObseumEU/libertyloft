import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CalendarApiEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  allDay: boolean;
}

interface CalendarEvent extends Omit<CalendarApiEvent, 'date'> {
  date: Date;
}

interface CalendarApiResponse {
  events: CalendarApiEvent[];
  error: string | null;
  stale: boolean;
}

const sanitizeDescription = (value: string) => {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
};

const Events = () => {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/calendar', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Calendar API returned ${response.status}`);
        }

        const payload: CalendarApiResponse = await response.json();
        const upcomingEvents = (payload.events ?? [])
          .map((event) => ({
            ...event,
            description: sanitizeDescription(event.description),
            date: new Date(event.date),
          }))
          .filter((event) => !Number.isNaN(event.date.getTime()))
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(0, 6);

        setEvents(upcomingEvents);
        setError(Boolean(payload.error) && upcomingEvents.length === 0);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        console.error('Failed to fetch calendar:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    return () => {
      controller.abort();
    };
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'cs' ? 'cs-CZ' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (event: CalendarEvent) => {
    if (event.allDay) {
      return language === 'cs' ? 'Celý den' : 'All day';
    }

    return new Intl.DateTimeFormat(language === 'cs' ? 'cs-CZ' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(event.date);
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
                      <span>{formatTime(event)}</span>
                    </div>
                  </div>

                  <div className="hidden md:block w-px bg-border group-hover:bg-ghost transition-colors self-stretch" />

                  <div className="flex-1">
                    <h3 className="text-xl font-display font-medium mb-2 group-hover:text-ghost-bright transition-colors">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
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
