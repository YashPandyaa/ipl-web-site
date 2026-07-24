'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, TrendingUp, ChevronRight, Activity, Search } from 'lucide-react';
import { getVenues } from '../lib/api';

// Comprehensive dataset covering all 34+ IPL stadiums across India & Overseas
const ALL_STADIUMS = [
  { id: 1, name: "Narendra Modi Stadium", city: "Ahmedabad", lat: 23.0909, lng: 72.5950, matches: 38, activity: 98, change: 15.5 },
  { id: 2, name: "Wankhede Stadium", city: "Mumbai", lat: 18.9389, lng: 72.8258, matches: 115, activity: 95, change: 8.2 },
  { id: 3, name: "M. Chinnaswamy Stadium", city: "Bengaluru", lat: 12.9788, lng: 77.5996, matches: 94, activity: 91, change: -3.1 },
  { id: 4, name: "MA Chidambaram Stadium", city: "Chennai", lat: 13.0628, lng: 80.2793, matches: 85, activity: 88, change: 12.0 },
  { id: 5, name: "Eden Gardens", city: "Kolkata", lat: 22.5646, lng: 88.3433, matches: 93, activity: 86, change: 4.5 },
  { id: 6, name: "Arun Jaitley Stadium", city: "Delhi", lat: 28.6379, lng: 77.2432, matches: 89, activity: 82, change: -5.4 },
  { id: 7, name: "Rajiv Gandhi International Stadium", city: "Hyderabad", lat: 17.4065, lng: 78.5505, matches: 77, activity: 79, change: 6.8 },
  { id: 8, name: "BRSABV Ekana Cricket Stadium", city: "Lucknow", lat: 26.8125, lng: 81.0267, matches: 21, activity: 76, change: 14.2 },
  { id: 9, name: "Sawai Mansingh Stadium", city: "Jaipur", lat: 26.8940, lng: 75.8021, matches: 57, activity: 74, change: 2.1 },
  { id: 10, name: "Punjab Cricket Association IS Bindra Stadium", city: "Mohali", lat: 30.6909, lng: 76.7374, matches: 62, activity: 72, change: -1.5 },
  { id: 11, name: "Maharaja Yadavindra Singh Stadium", city: "Mullanpur", lat: 30.7850, lng: 76.7200, matches: 9, activity: 70, change: 25.0 },
  { id: 12, name: "Maharashtra Cricket Association Stadium", city: "Pune", lat: 18.6749, lng: 73.7058, matches: 51, activity: 68, change: -4.0 },
  { id: 13, name: "Himachal Pradesh Cricket Association Stadium", city: "Dharamshala", lat: 32.1976, lng: 76.3259, matches: 13, activity: 66, change: 18.5 },
  { id: 14, name: "Dr. Y.S. Rajasekhara Reddy ACA-VDCA Cricket Stadium", city: "Visakhapatnam", lat: 17.7981, lng: 83.3482, matches: 15, activity: 64, change: 9.3 },
  { id: 15, name: "Barsapara Cricket Stadium", city: "Guwahati", lat: 26.1368, lng: 91.7378, matches: 5, activity: 62, change: 11.0 },
  { id: 16, name: "Holkar Cricket Stadium", city: "Indore", lat: 22.7258, lng: 75.8778, matches: 9, activity: 58, change: 0.0 },
  { id: 17, name: "Barabati Stadium", city: "Cuttack", lat: 20.4807, lng: 85.8790, matches: 7, activity: 55, change: -2.0 },
  { id: 18, name: "JSCA International Stadium Complex", city: "Ranchi", lat: 23.3101, lng: 85.2750, matches: 7, activity: 53, change: 0.0 },
  { id: 19, name: "Shaheed Veer Narayan Singh Stadium", city: "Raipur", lat: 21.2505, lng: 81.8213, matches: 6, activity: 50, change: 0.0 },
  { id: 20, name: "Dr DY Patil Sports Academy", city: "Navi Mumbai", lat: 19.0330, lng: 73.0205, matches: 37, activity: 65, change: -10.0 },
  { id: 21, name: "Brabourne Stadium", city: "Mumbai", lat: 18.9370, lng: 72.8240, matches: 27, activity: 61, change: -8.0 },
  { id: 22, name: "Saurashtra Cricket Association Stadium", city: "Rajkot", lat: 22.3039, lng: 70.8022, matches: 10, activity: 48, change: 0.0 },
  { id: 23, name: "Green Park", city: "Kanpur", lat: 26.4764, lng: 80.3478, matches: 4, activity: 45, change: 0.0 },
  { id: 24, name: "Dubai International Cricket Stadium", city: "Dubai", lat: 25.0478, lng: 55.2186, matches: 46, activity: 73, change: 5.0 },
  { id: 25, name: "Sheikh Zayed Cricket Stadium", city: "Abu Dhabi", lat: 24.4000, lng: 54.5333, matches: 22, activity: 63, change: 0.0 },
  { id: 26, name: "Sharjah Cricket Stadium", city: "Sharjah", lat: 25.3306, lng: 55.4206, matches: 28, activity: 67, change: 0.0 },
  { id: 27, name: "Wanderers Stadium", city: "Johannesburg", lat: -26.1347, lng: 28.0583, matches: 8, activity: 52, change: 0.0 },
  { id: 28, name: "Newlands", city: "Cape Town", lat: -33.9696, lng: 18.4682, matches: 7, activity: 50, change: 0.0 },
  { id: 29, name: "Kingsmead", city: "Durban", lat: -29.8517, lng: 31.0314, matches: 15, activity: 56, change: 0.0 },
  { id: 30, name: "SuperSport Park", city: "Centurion", lat: -25.8601, lng: 28.1953, matches: 12, activity: 54, change: 0.0 },
  { id: 31, name: "St George's Park", city: "Port Elizabeth", lat: -33.9650, lng: 25.6022, matches: 7, activity: 48, change: 0.0 },
  { id: 32, name: "De Beers Diamond Oval", city: "Kimberley", lat: -28.7369, lng: 24.7828, matches: 3, activity: 42, change: 0.0 },
  { id: 33, name: "Buffalo Park", city: "East London", lat: -33.0039, lng: 27.9179, matches: 3, activity: 40, change: 0.0 },
  { id: 34, name: "OUTsurance Oval", city: "Bloemfontein", lat: -29.1147, lng: 26.2081, matches: 2, activity: 38, change: 0.0 }
].map((item, idx) => ({ ...item, rank: idx + 1 }));

// Dynamically import LeafletMap with SSR disabled to prevent server-side window errors
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center w-full h-[500px] bg-surface border border-line rounded-xl">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mb-2"></div>
      <p className="text-xs text-sage">Loading Leaflet Map Tiles...</p>
    </div>
  )
});

export default function TrendingVenuesMap() {
  const [venues, setVenues] = useState<any[]>(ALL_STADIUMS);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const apiVenues = await getVenues();
        if (apiVenues && apiVenues.length > 0) {
          const maxMatches = Math.max(...apiVenues.map((v: any) => v.matches || 1));
          
          // Merge API venues with static catalog coordinates and properties
          const processed = apiVenues.map((apiItem: any, idx: number) => {
            const matchedStatic = ALL_STADIUMS.find(s => 
              s.name.toLowerCase().includes(apiItem.venue.toLowerCase()) ||
              apiItem.venue.toLowerCase().includes(s.name.toLowerCase())
            );
            
            const activityScore = Math.min(99, Math.max(40, Math.round(((apiItem.matches || 1) / maxMatches) * 98)));
            
            return {
              id: idx + 1,
              name: apiItem.venue,
              city: apiItem.city || matchedStatic?.city || 'India',
              lat: matchedStatic?.lat,
              lng: matchedStatic?.lng,
              matches: apiItem.matches,
              avg_score: apiItem.avg_first_innings_score,
              top_scorer: apiItem.top_scorer,
              activity: activityScore,
              change: matchedStatic ? matchedStatic.change : 5.0,
              rank: idx + 1
            };
          });

          setVenues(processed);
          setSelectedVenue(processed[0]);
        } else {
          setVenues(ALL_STADIUMS);
          setSelectedVenue(ALL_STADIUMS[0]);
        }
      } catch (err) {
        console.error('Failed to load API venues, using fallback catalog:', err);
        setVenues(ALL_STADIUMS);
        setSelectedVenue(ALL_STADIUMS[0]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredVenues = venues.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    return 'rank-other';
  };

  const getChangeBadge = (change: number) => {
    if (change > 0) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 min-w-[55px] justify-center">
          <span>▲</span> +{change}%
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 min-w-[55px] justify-center">
          <span>▼</span> {Math.abs(change)}%
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-500 border border-slate-500/20 min-w-[55px] justify-center">
          <span>●</span> Flat
        </span>
      );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 px-3 py-1 rounded-full text-xs font-bold text-accent uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
            IPL Global Stadium Map
          </div>
          <h2 className="text-2xl font-bold text-chalk font-display uppercase tracking-wider">IPL Stadiums & Trending Venues Map</h2>
          <p className="text-xs text-sage mt-0.5 max-w-2xl">
            Interactive GPS visualization of all {venues.length} IPL stadiums ingested across 19 historical seasons (2008–2026). Select any venue marker or search from the list to inspect matches, activity index, and stats.
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Leaflet Map Container */}
        <div className="lg:col-span-2 relative min-h-[350px] h-[380px] sm:h-[450px] lg:h-[550px] w-full rounded-sm overflow-hidden border border-line bg-bg shadow-2xl">
          <LeafletMap
            venues={venues}
            selectedVenue={selectedVenue}
            onSelectVenue={setSelectedVenue}
            isTrending={true}
          />
        </div>

        {/* Right Side: Stadium List & Search Card */}
        <div className="bg-surface rounded-sm border border-line flex flex-col overflow-hidden shadow-2xl transition-colors duration-300">
          {/* List Header & Search Bar */}
          <div className="p-4 border-b border-line space-y-3 bg-surface-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-wider text-chalk flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span>Stadiums ({filteredVenues.length})</span>
              </span>
              <span className="text-[10px] font-mono text-accent bg-surface border border-line px-2 py-0.5 rounded-sm">
                Total: {venues.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-sage absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search stadium or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-surface text-chalk placeholder:text-sage-dim border border-line rounded-sm text-xs focus:outline-none focus:border-accent font-mono transition-colors"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="p-2 flex flex-col gap-1.5 overflow-y-auto max-h-[440px] font-mono">
            {filteredVenues.length > 0 ? (
              filteredVenues.map((venue) => {
                const isSelected = selectedVenue?.name === venue.name || selectedVenue?.id === venue.id;

                return (
                  <div
                    key={venue.id || venue.name}
                    onClick={() => setSelectedVenue(venue)}
                    className={`flex items-center p-2.5 rounded-sm cursor-pointer transition-all duration-200 border ${
                      isSelected
                        ? 'bg-accent/15 border-accent text-chalk shadow-[inset_3px_0_0_var(--accent)]'
                        : 'bg-transparent border-transparent hover:bg-surface-2 hover:border-line text-sage hover:text-chalk'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mr-2.5 border ${
                      venue.rank === 1
                        ? 'bg-accent/20 border-accent text-accent'
                        : venue.rank === 2
                        ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                        : 'bg-surface-2 border-line text-sage-dim'
                    }`}>
                      #{venue.rank}
                    </div>

                    {/* Venue Info */}
                    <div className="flex-grow min-w-0 pr-2">
                      <span className="font-sans font-semibold text-xs truncate block text-chalk">
                        {venue.name}
                      </span>
                      <span className="text-[10px] text-sage truncate block font-sans lowercase">
                        {venue.city}
                      </span>
                    </div>

                    {/* Matches Stats */}
                    <div className="text-right mr-3 shrink-0">
                      <div className="text-xs font-bold text-accent font-mono">
                        {venue.matches}
                      </div>
                      <div className="text-[8px] text-sage-dim uppercase tracking-wider">
                        Matches
                      </div>
                    </div>

                    {/* Change badge */}
                    <div className="shrink-0 flex items-center gap-1">
                      {getChangeBadge(venue.change)}
                      <ChevronRight className={`w-3.5 h-3.5 text-sage transition-transform ${
                        isSelected ? 'translate-x-0.5 text-accent' : ''
                      }`} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-sage italic">
                No stadium found matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>

          {/* List Footer */}
          <div className="px-4 py-2.5 border-t border-line bg-surface-2 text-[9px] text-sage-dim text-center font-mono">
            Full 34+ Stadium Catalog · Interactive Leaflet GIS System
          </div>
        </div>
      </div>
    </div>
  );
}
