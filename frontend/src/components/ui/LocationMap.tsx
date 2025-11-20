// src/components/LocationMap.tsx

import { useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, Circle } from '@react-google-maps/api';
import { MapPin, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CENTER_5_AVENUES = {
  lat: 43.30135,
  lng: 5.39362,
};

const ZOOM_LEVEL = 14;
const AREA_RADIUS_METERS = 300;

export function LocationMap() {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'location-map',
    googleMapsApiKey: import.meta.env['VITE_GOOGLE_MAPS_API_KEY'] as string,
  });

  // Detect mobile vs desktop
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile: expand when scrolled into view (> 50% visible)
  useEffect(() => {
    if (!isMobile || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setIsExpanded(true); // stays expanded (same behaviour as your original)
          }
        });
      },
      { threshold: [0.5] }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  return (
    <div className="space-y-3 pt-2">
      {/* Small text block above the interactive card */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">
          <MapPin className="w-4 h-4" aria-hidden="true" />
          <span>
            {t('about.mapTitle', {
              defaultValue: 'Studio Area – 5 Avenues, 13004 Marseille',
            })}
          </span>
        </div>

        <p className="text-xs text-foreground/65 max-w-md">
          {t('about.mapDescription', {
            defaultValue:
              'For privacy and security, the map shows only the general 5 Avenues area. The exact address is shared after confirmation of your appointment.',
          })}
        </p>

        <p className="flex items-center gap-1 text-[11px] text-foreground/60">
          <Lock className="w-3 h-3" aria-hidden="true" />
          <span>
            {t('about.mapPrivacy', {
              defaultValue: 'Client privacy and discretion are always respected.',
            })}
          </span>
        </p>
      </div>

      {/* Interactive expanding section (same behaviour as original MapSection) */}
      <div
        ref={sectionRef}
        className="relative w-full overflow-hidden transition-all duration-700 ease-out"
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
        style={{
          height: isExpanded ? '500px' : '120px',
        }}
      >
        {/* Collapsed state – info card */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
            isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="text-center p-6 bg-background rounded-2xl border border-primary/15 shadow-soft max-w-md mx-4">
            <MapPin className="w-8 h-8 mx-auto text-primary mb-3" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {t('about.mapCollapsedTitle', {
                defaultValue: 'Private Studio Location',
              })}
            </h3>
            <p className="text-sm text-foreground/70">
              {t('about.mapCollapsedSubtitle', {
                defaultValue: 'By Appointment Only',
              })}
            </p>
            <p className="text-xs text-primary mt-2 font-medium">
              {isMobile
                ? t('about.mapHintScroll', {
                    defaultValue: 'Scroll to view the map',
                  })
                : t('about.mapHintHover', {
                    defaultValue: 'Hover to enlarge the map',
                  })}
            </p>
          </div>
        </div>

        {/* Expanded state – Google Map */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isExpanded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="w-full h-full rounded-2xl border border-primary/15 shadow-elevated bg-background"
            aria-label={t('about.mapTitle')}
          >
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={CENTER_5_AVENUES}
                zoom={ZOOM_LEVEL}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                  gestureHandling: 'cooperative',
                }}
              >
                <Circle
                  center={CENTER_5_AVENUES}
                  radius={AREA_RADIUS_METERS}
                  options={{
                    strokeOpacity: 0.7,
                    strokeWeight: 1,
                    fillOpacity: 0.16,
                    clickable: false,
                    draggable: false,
                    editable: false,
                  }}
                />
              </GoogleMap>
            ) : (
              // Fallback while Google Maps is loading
              <div className="w-full h-full flex items-center justify-center text-xs text-foreground/60">
                {t('about.mapLoading', { defaultValue: 'Loading map…' })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
