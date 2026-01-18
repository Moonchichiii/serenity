import { useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, Circle } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
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

  // Mobile: expand while in view (> 50%), collapse when scrolled past
  useEffect(() => {
    if (!isMobile || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const shouldExpand =
            entry.isIntersecting && entry.intersectionRatio > 0.5;
          setIsExpanded(shouldExpand);
        });
      },
      { threshold: [0, 0.5, 1] }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  const heightClass = isExpanded
  ? "h-[500px]"
  : isMobile
    ? "h-[180px]"
    : "h-[220px]";

  return (
    <div className="space-y-3 pt-2">
      {/* Header */}
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">
        <MapPin className="w-4 h-4" aria-hidden="true" />
        <span>
          {t('about.mapTitle', {
            defaultValue: 'Studio Area – 5 Avenues, 13004 Marseille',
          })}
        </span>
      </div>

      {/* Map card – height animates, no zooming */}
      <div
  ref={sectionRef}
  className={[
    "relative w-full overflow-hidden rounded-2xl border border-primary/15 shadow-soft",
    "transition-[height] duration-700 ease-out",
    heightClass,
  ].join(" ")}
  onMouseEnter={() => !isMobile && setIsExpanded(true)}
  onMouseLeave={() => !isMobile && setIsExpanded(false)}
>
        {isLoaded ? (
          <GoogleMap
            mapContainerClassName="w-full h-full"
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
          <div className="w-full h-full flex items-center justify-center text-xs text-foreground/60">
            {t('about.mapLoading', { defaultValue: 'Loading map…' })}
          </div>
        )}
      </div>
    </div>
  );
}
