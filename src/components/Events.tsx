import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  location?: string;
}

const Events = () => {
  const { t } = useLanguage();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch public ICS calendar
        const response = await fetch(
          'https://calendar.google.com/calendar/ical/libertyloft%40proton.me/public/basic.ics'
        );
        const icsText = await response.text();
        const parsedEvents = parseICS(icsText);
        
        // Filter only upcoming events and sort by date
        const now = new Date();
        const upcomingEvents = parsedEvents
          .filter(event => event.date >= now)
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(0, 5);
        
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
    const lines = icsText.split('\n');
    
    let currentEvent: Partial<CalendarEvent> | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === 'BEGIN:VEVENT') {
        currentEvent = { id: crypto.randomUUID() };
      } else if (line === 'END:VEVENT' && currentEvent) {
        if (currentEvent.title && currentEvent.date) {
          events.push(currentEvent as CalendarEvent);
        }
        currentEvent = null;
      } else if (currentEvent) {
        if (line.startsWith('SUMMARY:')) {
          currentEvent.title = line.substring(8);
        } else if (line.startsWith('DTSTART')) {
          const dateMatch = line.match(/(\d{8})(T(\d{6}))?/);
          if (dateMatch) {
            const dateStr = dateMatch[1];
            const timeStr = dateMatch[3] || '000000';
            currentEvent.date = new Date(
              parseInt(dateStr.substring(0, 4)),
              parseInt(dateStr.substring(4, 6)) - 1,
              parseInt(dateStr.substring(6, 8)),
              parseInt(timeStr.substring(0, 2)),
              parseInt(timeStr.substring(2, 4))
            );
          }
        } else if (line.startsWith('LOCATION:')) {
          currentEvent.location = line.substring(9);
        }
      }
    }
    
    return events;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <section id="events" className="section-padding">
      <div className="container-narrow">
        <h2 className="text-3xl md:text-4xl font-display font-semibold mb-12">
          {t('events.title')}
        </h2>

        {loading && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="w-8 h-8 border-2 border-ghost border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            {t('events.loading')}
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border border-border rounded">
            <Calendar size={32} className="mx-auto mb-4 opacity-50" />
            {t('events.noEvents')}
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-6 border border-border rounded hover:border-ghost transition-colors hover-lift"
              >
                <h3 className="text-lg font-display font-medium mb-3">
                  {event.title}
                </h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-ghost" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-ghost" />
                    {formatTime(event.date)}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-ghost" />
                      {event.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Unable to load events. Check our calendar directly:
            </p>
            <a
              href="https://calendar.google.com/calendar/embed?src=libertyloft%40proton.me&ctz=Europe%2FPrague"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-ghost-bright transition-colors"
            >
              Google Calendar
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default Events;
