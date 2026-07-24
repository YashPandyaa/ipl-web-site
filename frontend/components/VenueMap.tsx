'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getVenues } from '../lib/api';
import { VenueStats } from '../lib/types';
import { MapPin, Trophy, ShieldAlert, Award } from 'lucide-react';

// Dynamically import LeafletMap with SSR disabled to prevent server-side window errors
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center w-full h-[450px] bg-slate-950/20 dark:bg-slate-950/60 border border-border-light dark:border-border-dark rounded-xl">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold mb-2"></div>
      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Loading Leaflet Map Tiles...</p>
    </div>
  )
});

export default function VenueMap() {
  const [venues, setVenues] = useState<VenueStats[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<VenueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getVenues();
      if (data) {
        setVenues(data);
        // Default to the venue with the most matches
        if (data.length > 0) {
          setSelectedVenue(data[0]);
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark backdrop-blur-none dark:backdrop-blur-md">
      {/* Leaflet Map Section */}
      <div className="lg:col-span-2 relative min-h-[450px] w-full rounded-xl overflow-hidden shadow-inner">
        <LeafletMap
          venues={venues}
          selectedVenue={selectedVenue}
          onSelectVenue={setSelectedVenue}
        />
        
        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] text-xs text-text-secondary-light dark:text-text-secondary-dark bg-surface-light/95 dark:bg-slate-900/95 p-2.5 rounded-lg border border-border-light dark:border-slate-800 shadow-md">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gold block"></span>
            <span>Indian Venues</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-purple-dark block"></span>
            <span>Overseas (UAE/SA)</span>
          </div>
        </div>
      </div>

      {/* Selected Venue Details Card */}
      <div className="flex flex-col justify-between bg-base-light/80 dark:bg-base-dark/80 p-6 rounded-xl border border-border-light dark:border-border-dark">
        {selectedVenue ? (
          <div className="flex flex-col h-full justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-gold mb-2">
                <MapPin className="w-5 h-5" />
                <span className="text-xs font-semibold tracking-wider uppercase text-gold">VENUE SPECS</span>
              </div>
              <h4 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark line-clamp-2">{selectedVenue.venue}</h4>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">{selectedVenue.city || 'International'}</p>
 
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-base-light/50 dark:bg-base-dark/50 p-2.5 rounded-lg border border-border-light dark:border-border-dark">
                  <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Matches Hosted</div>
                  <div className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">{selectedVenue.matches}</div>
                </div>

                <div className="flex justify-between items-center bg-base-light/50 dark:bg-base-dark/50 p-2.5 rounded-lg border border-border-light dark:border-border-dark">
                  <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Avg 1st Innings</div>
                  <div className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">{selectedVenue.avg_first_innings_score} runs</div>
                </div>

                <div className="flex justify-between items-center bg-base-light/50 dark:bg-base-dark/50 p-2.5 rounded-lg border border-border-light dark:border-border-dark">
                  <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Top POM Performer</div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                    <Award className="w-4 h-4 text-gold" />
                    <span>{selectedVenue.top_scorer}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark text-xs text-text-secondary-light/80 dark:text-text-secondary-dark/80 flex items-start gap-2">
              <Trophy className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark shrink-0" />
              <span>
                Based on match history, venues with high average first innings scores favor teams batting first, whereas coastal stadiums like Wankhede (Mumbai) see high chase ratios.
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary-light dark:text-text-secondary-dark py-8">
            <ShieldAlert className="w-12 h-12 mb-3 text-text-secondary-light dark:text-text-secondary-dark" />
            <p className="text-sm">Select a venue bubble on the map to see statistics.</p>
          </div>
        )}
      </div>
    </div>
  );
}
