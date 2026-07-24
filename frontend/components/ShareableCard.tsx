'use client';

import React, { useRef, useState } from 'react';
import { PlayerSummary } from '../lib/types';
import { Download, Award, Shield, User, Flame, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ShareableCardProps {
  player: PlayerSummary;
}

export default function ShareableCard({ player }: ShareableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      // Wait for any micro-animations to settle
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2, // Double resolution for crystal-clear output
        backgroundColor: '#0B0F1A', // Match dark tailwind base
        logging: false,
      });

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${player.player.replace(/\s+/g, '_')}_IPL_Card.png`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error('Error generating card image:', error);
    } finally {
      setDownloading(false);
    }
  };

  const isBatter = !!player.batting && player.batting.runs > 500;
  const isBowler = !!player.bowling && player.bowling.wickets > 30;
  const isAllRounder = isBatter && isBowler;

  let roleLabel = 'IPL Player';
  if (isAllRounder) roleLabel = 'ALL-ROUNDER';
  else if (isBatter) roleLabel = 'BATTER';
  else if (isBowler) roleLabel = 'BOWLER';

  // Determine overall rating score based on stats
  const computeRating = () => {
    let rating = 70; // baseline
    if (player.batting) {
      rating += Math.min(15, (player.batting.runs / 6000) * 15);
      rating += Math.min(5, (player.batting.strike_rate / 150) * 5);
      if (player.batting.average > 30) rating += 5;
    }
    if (player.bowling) {
      rating += Math.min(15, (player.bowling.wickets / 180) * 15);
      if (player.bowling.economy < 8.0) rating += 5;
    }
    return Math.min(99, Math.round(rating));
  };

  const ratingVal = computeRating();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Exporter Container */}
      <div 
        ref={cardRef}
        className="relative w-80 bg-gradient-to-b from-brand-dark to-[#0B0F1A] p-6 rounded-3xl border-2 border-gold/50 shadow-2xl overflow-hidden font-sans select-none flex flex-col justify-between aspect-[3/4.5]"
      >
        {/* Decorative Grid Lines / Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-2 right-2 opacity-5">
          <Flame className="w-48 h-48" />
        </div>

        {/* Header Block: Overall Rating & Badge */}
        <div className="flex justify-between items-start z-10">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-extrabold text-gold font-mono tracking-tighter">{ratingVal}</span>
            <span className="text-[10px] font-bold text-gold/80 uppercase font-mono tracking-widest">{roleLabel}</span>
          </div>
          <div className="p-2 bg-base/90 rounded-xl border border-border text-gold">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Avatar Placeholder / Graphic */}
        <div className="flex flex-col items-center my-4 z-10 relative">
          <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 shadow-inner">
            <User className="w-12 h-12" />
          </div>
          {/* Flame aura if rating is high */}
          {ratingVal >= 85 && (
            <span className="absolute -bottom-2 bg-gold text-[#0B0F1A] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-gold/40">
              <Flame className="w-3 h-3 fill-[#0B0F1A] animate-pulse" />
              ELITE
            </span>
          )}
        </div>

        {/* Player Name */}
        <div className="text-center z-10 mb-4">
          <h3 className="text-xl font-bold text-slate-100 tracking-wide line-clamp-1">{player.player}</h3>
          <p className="text-[9px] text-slate-400 tracking-widest uppercase font-semibold mt-0.5">IPL Legendary Series</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 z-10 bg-base/60 p-3 rounded-2xl border border-border/80 backdrop-blur-sm">
          {/* Batting Section */}
          {player.batting ? (
            <div className="flex flex-col gap-1.5 border-r border-border pr-2">
              <div className="text-[9px] font-bold text-gold/80 uppercase tracking-wider mb-0.5 flex items-center gap-0.5">
                <Shield className="w-2.5 h-2.5" /> BATTING
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Runs</span>
                <span className="font-semibold text-slate-200">{player.batting.runs}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Avg</span>
                <span className="font-semibold text-slate-200">{player.batting.average}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">S/R</span>
                <span className="font-semibold text-slate-200">{player.batting.strike_rate}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 border-r border-slate-800 text-[10px] py-4">
              No Batting Stats
            </div>
          )}

          {/* Bowling Section */}
          {player.bowling ? (
            <div className="flex flex-col gap-1.5 pl-2">
              <div className="text-[9px] font-bold text-accent-purple/80 uppercase tracking-wider mb-0.5 flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5" /> BOWLING
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Wkts</span>
                <span className="font-semibold text-slate-200">{player.bowling.wickets}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Econ</span>
                <span className="font-semibold text-slate-200">{player.bowling.economy}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">S/R</span>
                <span className="font-semibold text-slate-200">{player.bowling.strike_rate}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 text-[10px] py-4">
              No Bowling Stats
            </div>
          )}
        </div>

        {/* Footer Brand Info */}
        <div className="flex justify-between items-center text-[8px] text-slate-500 mt-4 pt-2 border-t border-slate-900">
          <span>IPL HISTORICAL DATABASE</span>
          <span className="font-semibold">2008–2022</span>
        </div>
      </div>

      {/* Exporter triggers */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-2 px-6 py-2.5 bg-base-light dark:bg-base-dark border border-border-light dark:border-border-dark text-sm font-semibold rounded-xl text-text-primary-light dark:text-text-primary-dark hover:bg-slate-200 dark:hover:bg-brand-dark/40 transition-colors shadow-md disabled:opacity-50"
      >
        {downloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-gold" />
            <span>Exporting PNG...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 text-gold" />
            <span>Download Stat Card</span>
          </>
        )}
      </button>
    </div>
  );
}
