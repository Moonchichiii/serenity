import { useEffect, useRef, useState, memo } from 'react';
import { GoogleMap, useJsApiLoader, Circle } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CENTER_5_AVENUES = { lat: 43.30135, lng: 5.39362 };
const ZOOM_LEVEL = 14;
const AREA_RADIUS_METERS = 300;

// Sub-component: Only loaded when user interacts
const MapLoader = memo(() => {
  const { isLoaded } = useJsApiLoader({
    id: 'location-map',
    googleMapsApiKey: import.meta.env['VITE_GOOGLE_MAPS_API_KEY'] as string,
    preventGoogleFontsLoading: true,
  });

  if (!isLoaded) return null;

  return (
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
  );
});

export function LocationMap() {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // FACADE: Default false. When true, we mount the heavy MapLoader.
  const [shouldLoadMap, setShouldLoadMap] = useState(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleInteraction = () => {
    setShouldLoadMap(true);
    if (!isMobile) setIsExpanded(true);
  };

  useEffect(() => {
    if (!isMobile || !sectionRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const shouldExpand = entry.isIntersecting && entry.intersectionRatio > 0.5;
          setIsExpanded(shouldExpand);
          if (shouldExpand) setShouldLoadMap(true);
        });
      },
      { threshold: [0, 0.5, 1] }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  const heightClass = isExpanded
    ? isMobile ? "h-[300px]" : "h-[500px]"
    : isMobile ? "h-[180px]" : "h-[220px]";

  return (
    <div className="space-y-3 pt-2">
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">
        <MapPin className="w-4 h-4" aria-hidden="true" />
        <span>
          {t('about.mapTitle', { defaultValue: 'Studio Area – 5 Avenues, 13004 Marseille' })}
        </span>
      </div>

      <div
        ref={sectionRef}
        className={[
          "relative w-full overflow-hidden rounded-2xl border border-primary/15 shadow-soft",
          "transition-[height] duration-700 ease-out bg-sage-50",
          heightClass,
        ].join(" ")}
        onMouseEnter={handleInteraction}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
        onTouchStart={handleInteraction}
        onClick={handleInteraction}
      >
        {shouldLoadMap ? (
          <MapLoader />
        ) : (
          /* Placeholder / Facade */
          <div className="w-full h-full flex flex-col items-center justify-center text-foreground/80 cursor-pointer">
            <MapPin className="w-8 h-8 mb-2 opacity-50 text-sage-600" />
            <p className="text-xs font-medium">
              {t('about.mapPreview', { defaultValue: 'View Map' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
