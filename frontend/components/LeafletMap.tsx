'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Award, Info, Globe } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

// Geographic Coordinates [lng, lat] for all IPL Venues (city-level)
const VENUE_COORDINATES: Record<string, [number, number]> = {
  // India
  'Mumbai': [72.8258, 18.9389],
  'Bengaluru': [77.5996, 12.9788],
  'Bangalore': [77.5996, 12.9788],
  'Chennai': [80.2793, 13.0628],
  'Kolkata': [88.3433, 22.5646],
  'Delhi': [77.2432, 28.6379],
  'New Delhi': [77.2432, 28.6379],
  'Hyderabad': [78.5505, 17.4065],
  'Chandigarh': [76.7374, 30.6909],
  'Mohali': [76.7374, 30.6909],
  'Mullanpur': [76.7200, 30.7850],
  'Ahmedabad': [72.5975, 23.0919],
  'Pune': [73.7058, 18.6749],
  'Jaipur': [75.8021, 26.8940],
  'Dharamsala': [76.3259, 32.1976],
  'Dharamshala': [76.3259, 32.1976],
  'Visakhapatnam': [83.3482, 17.7981],
  'Vizag': [83.3482, 17.7981],
  'Indore': [75.8778, 22.7258],
  'Cuttack': [85.8790, 20.4807],
  'Ranchi': [85.2750, 23.3101],
  'Raipur': [81.8213, 21.2505],
  'Lucknow': [81.0267, 26.8125],
  'Guwahati': [91.7378, 26.1368],
  'Kanpur': [80.3478, 26.4764],
  'Rajkot': [70.8022, 22.3039],
  'Nagpur': [79.0882, 21.1458],

  // Overseas
  'Abu Dhabi': [54.5333, 24.4000],
  'Dubai': [55.2186, 25.0478],
  'Sharjah': [55.4206, 25.3306],
  'Centurion': [28.1953, -25.8601],
  'Johannesburg': [28.0583, -26.1347],
  'Durban': [31.0314, -29.8517],
  'Port Elizabeth': [25.6022, -33.9650],
  'Gqeberha': [25.6022, -33.9650],
  'Cape Town': [18.4682, -33.9696],
  'East London': [27.9179, -33.0039],
  'Kimberley': [24.7828, -28.7369],
  'Bloemfontein': [26.2081, -29.1147]
};

// Exact Stadium coordinates overrides [lng, lat]
const STADIUM_OVERRIDES: Record<string, [number, number]> = {
  'Narendra Modi Stadium': [72.5950, 23.0909],
  'Sardar Patel Stadium': [72.5950, 23.0909],
  'Motera': [72.5950, 23.0909],
  'Wankhede Stadium': [72.8258, 18.9389],
  'Brabourne Stadium': [72.8240, 18.9370],
  'DY Patil Sports Academy': [73.0205, 19.0330],
  'Dr DY Patil Sports Academy': [73.0205, 19.0330],
  'Dr. DY Patil Sports Academy': [73.0205, 19.0330],
  'M. Chinnaswamy Stadium': [77.5996, 12.9788],
  'M Chinnaswamy Stadium': [77.5996, 12.9788],
  'MA Chidambaram Stadium': [80.2793, 13.0628],
  'M.A. Chidambaram Stadium': [80.2793, 13.0628],
  'Chepauk': [80.2793, 13.0628],
  'Eden Gardens': [88.3433, 22.5646],
  'Arun Jaitley Stadium': [77.2432, 28.6379],
  'Feroz Shah Kotla': [77.2432, 28.6379],
  'Rajiv Gandhi International Stadium': [78.5505, 17.4065],
  'Uppal': [78.5505, 17.4065],
  'Ekana Cricket Stadium': [81.0267, 26.8125],
  'BRSABV Ekana Cricket Stadium': [81.0267, 26.8125],
  'Sawai Mansingh Stadium': [75.8021, 26.8940],
  'Punjab Cricket Association IS Bindra Stadium': [76.7374, 30.6909],
  'PCA IS Bindra Stadium': [76.7374, 30.6909],
  'Maharaja Yadavindra Singh International Cricket Stadium': [76.7200, 30.7850],
  'Maharaja Yadavindra Singh Stadium': [76.7200, 30.7850],
  'Maharashtra Cricket Association Stadium': [73.7058, 18.6749],
  'Subrata Roy Sahara Stadium': [73.7058, 18.6749],
  'Himachal Pradesh Cricket Association Stadium': [76.3259, 32.1976],
  'HPCA Stadium': [76.3259, 32.1976],
  'Dr. Y.S. Rajasekhara Reddy ACA-VDCA Cricket Stadium': [83.3482, 17.7981],
  'ACA-VDCA Cricket Stadium': [83.3482, 17.7981],
  'Barsapara Cricket Stadium': [91.7378, 26.1368],
  'Assam Cricket Association Stadium': [91.7378, 26.1368],
  'Holkar Cricket Stadium': [75.8778, 22.7258],
  'Barabati Stadium': [85.8790, 20.4807],
  'JSCA International Stadium Complex': [85.2750, 23.3101],
  'Shaheed Veer Narayan Singh International Stadium': [81.8213, 21.2505],
  'Shaheed Veer Narayan Singh Stadium': [81.8213, 21.2505],
  'Saurashtra Cricket Association Stadium': [70.8022, 22.3039],
  'Green Park': [80.3478, 26.4764],
  'Vidarbha Cricket Association Stadium': [79.0882, 21.1458],
  'Dubai International Cricket Stadium': [55.2186, 25.0478],
  'Sheikh Zayed Cricket Stadium': [54.5333, 24.4000],
  'Sharjah Cricket Stadium': [55.4206, 25.3306],
  'SuperSport Park': [28.1953, -25.8601],
  'Wanderers Stadium': [28.0583, -26.1347],
  'Newlands': [18.4682, -33.9696],
  'Kingsmead': [31.0314, -29.8517],
  "St George's Park": [25.6022, -33.9650],
  'De Beers Diamond Oval': [24.7828, -28.7369],
  'Buffalo Park': [27.9179, -33.0039],
  'OUTsurance Oval': [26.2081, -29.1147]
};

interface LeafletMapProps {
  venues: any[];
  selectedVenue: any | null;
  onSelectVenue: (venue: any) => void;
  isTrending?: boolean;
}

export default function LeafletMap({
  venues,
  selectedVenue,
  onSelectVenue,
  isTrending = false,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const markersRef = useRef<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<'india' | 'uae' | 'sa'>('india');
  const [hoveredVenue, setHoveredVenue] = useState<any | null>(null);
  const [maplibre, setMaplibre] = useState<any | null>(null);

  // Helper: Classify a venue's region
  const getRegion = (venue: any): 'india' | 'uae' | 'sa' => {
    const city = venue?.city || '';
    if (['Dubai', 'Abu Dhabi', 'Sharjah'].includes(city)) return 'uae';
    if ([
      'Johannesburg', 'Cape Town', 'Durban', 'Centurion',
      'Port Elizabeth', 'Gqeberha', 'Kimberley', 'East London', 'Bloemfontein'
    ].includes(city)) return 'sa';
    return 'india';
  };

  // Helper: Get [lng, lat] coordinate
  const getCoords = (venue: any): [number, number] => {
    if (venue.lng !== undefined && venue.lat !== undefined) {
      return [venue.lng, venue.lat];
    }
    const name = venue.venue || venue.name || '';
    if (STADIUM_OVERRIDES[name]) return STADIUM_OVERRIDES[name];

    // Partial key match
    const overrideKey = Object.keys(STADIUM_OVERRIDES).find(key =>
      name && name.toLowerCase().includes(key.toLowerCase())
    );
    if (overrideKey) return STADIUM_OVERRIDES[overrideKey];

    const city = venue.city || '';
    return VENUE_COORDINATES[city] || VENUE_COORDINATES[name] || [78.9629, 20.5937];
  };

  // 1. Dynamic client-side import of maplibre-gl to prevent SSR "window is not defined" error
  useEffect(() => {
    import('maplibre-gl').then((mod) => {
      setMaplibre(mod.default);
    });
  }, []);

  // 2. Initialize MapLibre Map once
  useEffect(() => {
    if (!maplibre || !mapContainerRef.current || mapRef.current) return;

    const map = new maplibre.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [78.9629, 20.5937], // India center
      zoom: 4.0,
      pitch: 30, // 3D Camera tilt
      bearing: 0,
      scrollZoom: true, // Allow user to zoom using scroll wheel
      dragPan: true,    // Allow user to pan around by dragging
      dragRotate: true, // Allow user to tilt/rotate by right-click dragging
      doubleClickZoom: true,
      touchZoomRotate: true
    });

    map.addControl(new maplibre.NavigationControl({ showCompass: true }), 'top-right');

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [maplibre]);

  // 3. Render markers once when venues list loads or changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !maplibre || venues.length === 0) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    venues.forEach((venue) => {
      const coords = getCoords(venue);
      // Skip unknown coordinates
      if (coords[0] === 78.9629 && coords[1] === 20.5937 && venue.city !== 'India' && venue.city !== '') return;

      const isFirstRank = isTrending && venue.rank === 1;
      const isSecondRank = isTrending && venue.rank === 2;

      const venueName = venue.venue || venue.name || '';
      const isMainStadium = venueName.toLowerCase().includes('narendra modi');

      // Custom marker DOM creation
      const el = document.createElement('div');
      el.className = 'custom-map-marker-container';
      el.setAttribute('data-venue-name', venueName);

      const baseSize = isTrending ? Math.round(26 + (venue.activity / 100) * 16) : 14;
      const size = baseSize + (isMainStadium ? 6 : 0);
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';

      let markerInnerHtml = '';
      if (isTrending) {
        const rankClass = isMainStadium ? 'rank-main-stadium' : venue.rank === 1 ? 'rank-1' : venue.rank === 2 ? 'rank-2' : 'rank-other';
        const pulseClass = isMainStadium ? 'ring-main-stadium' : venue.rank === 1 ? 'ring-1' : venue.rank === 2 ? 'ring-2' : '';
        const rippleElement = pulseClass ? `<div class="pulsing-ring ${pulseClass}"></div>` : '';

        markerInnerHtml = `
          <div class="marker-wrapper" style="width: ${size}px; height: ${size}px; position: relative;">
            ${rippleElement}
            <div class="marker-circle ${rankClass}" style="width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; font-size: ${Math.round(size * 0.42)}px; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
              ${isMainStadium ? '👑' : venue.rank}
            </div>
          </div>
        `;
      } else {
        const dotColor = isMainStadium ? '#fbbf24' : '#38bdf8';
        const shadowColor = isMainStadium ? 'rgba(251,191,36,0.8)' : 'rgba(56,189,248,0.4)';

        markerInnerHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: ${size}px; height: ${size}px;">
            <div class="inner-dot-element" data-default-color="${dotColor}" data-default-shadow="${shadowColor}" style="background-color: ${dotColor}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 10px ${shadowColor}; transition: all 0.25s ease; display: flex; align-items: center; justify-content: center; font-size: ${Math.round(size * 0.55)}px;">
              ${isMainStadium ? '👑' : ''}
            </div>
          </div>
        `;
      }

      el.innerHTML = markerInnerHtml;

      // Click handler
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectVenue(venue);
      });

      // Hover handlers
      el.addEventListener('mouseenter', () => setHoveredVenue(venue));
      el.addEventListener('mouseleave', () => setHoveredVenue(null));

      const marker = new maplibre.Marker({ element: el })
        .setLngLat(coords)
        .addTo(map);

      const key = venue.venue || venue.name || String(venue.id);
      markersRef.current[key] = marker;
    });
  }, [venues, isTrending, maplibre, onSelectVenue]);

  // 3a. Update selection styling on markers dynamically without redrawing
  useEffect(() => {
    const markerElements = document.querySelectorAll('.custom-map-marker-container');
    markerElements.forEach((el) => {
      el.classList.remove('marker-selected');
      const ring = el.querySelector('.ring-selected-element');
      if (ring) {
        ring.remove();
      }
      const innerDot = el.querySelector('.inner-dot-element') as HTMLDivElement;
      if (innerDot) {
        innerDot.style.backgroundColor = innerDot.getAttribute('data-default-color') || '#38bdf8';
        innerDot.style.boxShadow = `0 0 10px ${innerDot.getAttribute('data-default-shadow') || 'rgba(56,189,248,0.4)'}`;
      }
    });

    if (!selectedVenue) return;

    const activeName = selectedVenue.venue || selectedVenue.name || '';
    const activeEl = Array.from(markerElements).find(
      (el) => el.getAttribute('data-venue-name') === activeName
    );

    if (activeEl) {
      activeEl.classList.add('marker-selected');
      
      const wrapper = activeEl.querySelector('.marker-wrapper') || activeEl.querySelector('div');
      if (wrapper && !wrapper.querySelector('.ring-selected-element')) {
        const ring = document.createElement('div');
        ring.className = 'pulsing-ring ring-selected ring-selected-element';
        wrapper.insertBefore(ring, wrapper.firstChild);
      }

      const innerDot = activeEl.querySelector('.inner-dot-element') as HTMLDivElement;
      if (innerDot) {
        innerDot.style.backgroundColor = '#f59e0b';
        innerDot.style.boxShadow = '0 0 12px rgba(245,158,11,0.6)';
      }
    }
  }, [selectedVenue]);

  // 4. Smoothly fly camera to selected venue and adjust camera pitch/zoom
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedVenue) return;

    const coords = getCoords(selectedVenue);
    const region = getRegion(selectedVenue);
    
    // Auto sync region tab state
    setActiveTab(region);

    map.flyTo({
      center: coords,
      zoom: isTrending ? 6.8 : 7.8,
      pitch: 45, // Dramatic 3D look
      bearing: 15,
      speed: 1.2,
      curve: 1.4,
      essential: true
    });
  }, [selectedVenue, isTrending, setActiveTab]);

  // 5. Region tab camera panning handler
  const handleTabChange = (tab: 'india' | 'uae' | 'sa') => {
    setActiveTab(tab);
    const map = mapRef.current;
    if (!map) return;

    if (tab === 'india') {
      map.flyTo({
        center: [78.9629, 20.5937],
        zoom: 4.0,
        pitch: 30,
        bearing: 0,
        speed: 1.0
      });
    } else if (tab === 'uae') {
      map.flyTo({
        center: [55.0, 25.1],
        zoom: 7.5,
        pitch: 45,
        bearing: -10,
        speed: 1.2
      });
    } else if (tab === 'sa') {
      map.flyTo({
        center: [25.0, -29.5],
        zoom: 5.2,
        pitch: 35,
        bearing: 0,
        speed: 1.2
      });
    }
  };



  return (
    <div className="flex flex-col h-full w-full bg-[#0b1017] text-slate-100 font-sans relative select-none">
      
      {/* Global CSS Style tag for glowing pulsing markers */}
      <style>{`
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .pulsing-ring {
          position: absolute;
          border-radius: 50%;
          width: 100%;
          height: 100%;
          animation: ripple 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
          pointer-events: none;
        }
        .pulsing-ring.ring-1 {
          border: 2px solid rgba(255, 94, 58, 0.8);
          box-shadow: 0 0 10px rgba(255, 94, 58, 0.5);
        }
        .pulsing-ring.ring-2 {
          border: 2px solid rgba(245, 158, 11, 0.8);
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
        }
        .pulsing-ring.ring-selected {
          border: 2px solid rgba(245, 158, 11, 0.85);
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.6);
        }
        .pulsing-ring.ring-main-stadium {
          border: 2px solid rgba(251, 191, 36, 0.9);
          box-shadow: 0 0 15px rgba(251, 191, 36, 0.75);
        }

        .marker-circle.rank-1 {
          background: radial-gradient(circle, rgba(255,94,58,0.95) 0%, rgba(255,94,58,0.4) 100%);
          border-color: #ff5e3a;
          box-shadow: 0 0 12px rgba(255,94,58,0.6);
        }
        .marker-circle.rank-2 {
          background: radial-gradient(circle, rgba(245,158,11,0.95) 0%, rgba(245,158,11,0.4) 100%);
          border-color: #f59e0b;
          box-shadow: 0 0 12px rgba(245,158,11,0.6);
        }
        .marker-circle.rank-main-stadium {
          background: radial-gradient(circle, rgba(251,191,36,0.95) 0%, rgba(251,191,36,0.5) 100%);
          border-color: #fbbf24;
          box-shadow: 0 0 15px rgba(251,191,36,0.7);
        }
        .marker-circle.rank-other {
          background: radial-gradient(circle, rgba(148,163,184,0.85) 0%, rgba(148,163,184,0.3) 100%);
          border-color: #94a3b8;
          box-shadow: 0 0 8px rgba(148,163,184,0.3);
        }
        .maplibregl-canvas-container {
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>

      {/* Region Selector Tab Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#232a35] bg-[#10151c]/90 z-10">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Map Focus</span>
        </div>
        <div className="flex bg-[#0b1017] p-1 rounded-lg border border-[#232a35] gap-0.5 sm:gap-1 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => handleTabChange('india')}
            className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all duration-200 ${
              activeTab === 'india'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-[0_0_10px_rgba(14,165,233,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            🇮🇳 India
          </button>
          <button
            onClick={() => handleTabChange('uae')}
            className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all duration-200 ${
              activeTab === 'uae'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            🇦🇪 UAE
          </button>
          <button
            onClick={() => handleTabChange('sa')}
            className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all duration-200 ${
              activeTab === 'sa'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            🇿🇦 South Africa
          </button>
        </div>
      </div>

      {/* Main WebGL Map Canvas Container */}
      <div ref={mapContainerRef} className="flex-grow w-full relative min-h-[300px] h-[350px] md:h-[450px]" style={{ background: '#0b111a' }}>
        
        {/* Hover Tooltip Overlay (Follows venue position) */}
        {hoveredVenue && mapRef.current && (
          <div
            className="absolute bg-slate-950/95 border border-[#232a35] text-slate-100 px-3 py-1.5 rounded-lg shadow-2xl pointer-events-none z-30 flex flex-col gap-0.5"
            style={{
              left: `${mapRef.current.project(getCoords(hoveredVenue)).x}px`,
              top: `${mapRef.current.project(getCoords(hoveredVenue)).y - 12}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <span className="text-[11px] font-bold whitespace-nowrap text-sky-400 flex items-center gap-1">
              {(hoveredVenue.venue || hoveredVenue.name || '').toLowerCase().includes('narendra modi') ? '👑 ' : ''}
              {hoveredVenue.venue || hoveredVenue.name}
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              {hoveredVenue.city} · {hoveredVenue.matches} Matches
            </span>
            {(hoveredVenue.venue || hoveredVenue.name || '').toLowerCase().includes('narendra modi') && (
              <span className="text-[8px] font-mono text-amber-400 font-bold uppercase tracking-wider mt-0.5">
                ★ Flagship IPL Venue
              </span>
            )}
          </div>
        )}

        {/* Selected Details Floating Glassmorphic Card (Matches original Leaflet popup info) */}
        {selectedVenue && getRegion(selectedVenue) === activeTab && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-xs bg-slate-950/95 backdrop-blur-md border border-[#232a35] rounded-xl p-4 shadow-2xl z-20 animate-fadeIn">
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div>
                <span className="text-[8px] font-mono uppercase tracking-widest text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/25">
                  {selectedVenue.city}
                </span>
                <h4 className="text-[13px] font-bold text-slate-100 leading-tight mt-1 flex items-center gap-1">
                  {(selectedVenue.venue || selectedVenue.name || '').toLowerCase().includes('narendra modi') ? '👑 ' : ''}
                  {selectedVenue.venue || selectedVenue.name}
                </h4>
              </div>
              <button
                onClick={() => onSelectVenue(null)}
                className="p-1 rounded bg-[#10151c] border border-[#232a35] hover:border-sky-400 hover:text-sky-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Content Stats */}
            <div className="space-y-2 border-t border-[#232a35] pt-2 text-[11px]">
              {(selectedVenue.venue || selectedVenue.name || '').toLowerCase().includes('narendra modi') && (
                <div className="mb-2.5 p-2 rounded bg-amber-500/10 border border-amber-500/25 text-[10px] text-amber-300 font-bold flex items-center gap-1.5 justify-center leading-none">
                  <span>🏆</span> Flagship Stadium (132k Seats)
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-mono">Total Matches</span>
                <span className="font-bold font-mono text-sky-400">{selectedVenue.matches}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-mono">Avg Run</span>
                <span className="font-bold font-mono text-amber-400">
                  {selectedVenue.avg_score || selectedVenue.avg_first_innings_score || 'N/A'} runs
                </span>
              </div>

              {isTrending ? (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-mono">Activity Score</span>
                    <span className="font-bold text-sky-400">{selectedVenue.activity}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0b1017] rounded-full overflow-hidden border border-[#232a35]">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${selectedVenue.activity}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {selectedVenue.top_scorer && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-mono">Top Performer</span>
                      <span className="font-bold flex items-center gap-1 text-emerald-400 font-mono">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        {selectedVenue.top_scorer}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Empty State Help Badge */}
        {!selectedVenue && (
          <div className="absolute bottom-4 left-4 bg-slate-950/70 backdrop-blur border border-[#232a35]/60 text-slate-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 pointer-events-none text-[10px] font-mono z-10">
            <Info className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>Select a venue node on the map or list to fly to details.</span>
          </div>
        )}

        {/* Vector Map Legend Overlay */}
        <div className="absolute bottom-4 right-4 z-10 text-[9px] font-mono text-slate-400 bg-slate-950/80 backdrop-blur p-2.5 rounded-lg border border-[#232a35] flex flex-col gap-1 shadow-md">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_6px_#0ea5e9]"></span>
            <span>Indian Venues</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]"></span>
            <span>UAE Venues</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]"></span>
            <span>South Africa</span>
          </div>
        </div>

      </div>
    </div>
  );
}
