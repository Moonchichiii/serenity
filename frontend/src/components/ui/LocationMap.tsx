import { useEffect, useRef, useState, memo } from 'react';
import { GoogleMap, useJsApiLoader, Circle } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CENTER_5_AVENUES = { lat: 43.30135, lng: 5.39362 };
const ZOOM_LEVEL = 14;
const AREA_RADIUS_METERS = 300;

const MapLoader = memo(() => {
  const { isLoaded } = useJsApiLoader({
    id: 'location-map',
    googleMapsApiKey: import.meta.env['VITE_GOOGLE_MAPS_API_KEY'] as string,
    preventGoogleFontsLoading: true,
  });

  if (!isLoaded) return null;

  return (
    <GoogleMap
      mapContainerClassName="w-full h-full rounded-2xl"
      center={CENTER_5_AVENUES}
      zoom={ZOOM_LEVEL}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'cooperative',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      }}
    >
      <Circle
        center={CENTER_5_AVENUES}
        radius={AREA_RADIUS_METERS}
        options={{
          strokeColor: '#788476',
          strokeOpacity: 0.8,
          strokeWeight: 1,
          fillColor: '#788476',
          fillOpacity: 0.15,
          clickable: false,
          draggable: false,
          editable: false,
        }}
      />
    </GoogleMap>
  );
});

MapLoader.displayName = 'MapLoader';

export function LocationMap() {
  const { t } = useTranslation();
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const current = sectionRef.current;
    if (!current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.length > 0 && entries[0]?.isIntersecting) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(current);
    return () => observer.disconnect();
  }, []);

  const containerClasses = [
    'relative w-full overflow-hidden rounded-2xl border border-stone-200/60 shadow-sm',
    'bg-stone-100 transition-[height] duration-500 ease-out',
    'touch-pan-y',
    isHovered ? 'h-[200px] lg:h-[320px]' : 'h-[200px] lg:h-[240px]',
  ].join(' ');

  return (
    <div className="space-y-3 pt-2">
      <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-sage-700/80">
        <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
        <span>
          {t('about.mapTitle', { defaultValue: 'Studio Area – 5 Avenues' })}
        </span>
      </div>

      <div
        ref={sectionRef}
        className={containerClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {shouldLoadMap ? (
          <MapLoader />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400">
            <MapPin className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">{t('loading', { defaultValue: 'Loading map...' })}</p>
          </div>
        )}
      </div>
    </div>
  );
}
