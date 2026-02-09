import { MapPin, Mail, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Contact = () => {
  const { t } = useLanguage();

  const address = "LibertyLoft, Papírenská 120/12, 160 00 Praha 6-Bubeneč";
  const googleMapsUrl = "https://maps.app.goo.gl/bW7NzqNAi2ezyweJ6";
  const embedUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2559.6571727153414!2d14.400103149724785!3d50.111274410771!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b95c1edc71c1f%3A0x7559ac62925875eb!2sLibertyLoft!5e0!3m2!1sen!2scz!4v1770644920847!5m2!1sen!2scz";

  return (
    <section id="contact" className="section-padding bg-card">
      <div className="container-narrow">
        <h2 className="text-3xl md:text-4xl font-display font-semibold mb-12">
          {t('contact.title')}
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin size={20} className="text-ghost flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium mb-1">{t('contact.address')}</h3>
                <p className="text-muted-foreground">{address}</p>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-ghost-bright hover:text-foreground transition-colors mt-2"
                >
                  {t('contact.directions')}
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail size={20} className="text-ghost flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium mb-1">{t('contact.email')}</h3>
                <a
                  href="mailto:libertyloft@proton.me"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  libertyloft@proton.me
                </a>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="relative overflow-hidden rounded border border-border">
            <iframe
              src={embedUrl}
              width="100%"
              height="300"
              style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(90%)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="LibertyLoft location"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
