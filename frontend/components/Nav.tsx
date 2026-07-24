'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { useTheme } from './ThemeProvider';
import {
  Home, BarChart3, User, Shield, Calendar, Trophy,
  GitCompare, Menu, X, Sun, Moon, Map, Users
} from 'lucide-react';
const NAV_ITEMS = [
  { id: 'home', label: 'home', icon: Home },
  { id: 'stats', label: 'stats', icon: BarChart3 },
  { id: 'players', label: 'players', icon: User },
  { id: 'teams', label: 'teams', icon: Shield },
  { id: 'squads', label: 'squads', icon: Users },
  { id: 'seasons', label: 'seasons', icon: Calendar },
  { id: 'records', label: 'records', icon: Trophy },
  { id: 'compare', label: 'compare', icon: GitCompare },
  { id: 'trending', label: 'trending map', icon: Map },
];

import { useRouter } from 'next/navigation';

export default function Nav() {
  const { state, dispatch } = useAppState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const navigateTo = (pageId: string) => {
    dispatch({ type: 'SET_ACTIVE_PAGE', payload: pageId });
    setMobileOpen(false);
    if (pageId === 'players') {
      router.push('/players');
    } else {
      router.push('/');
    }
  };

  return (
    <nav className="bg-surface border-b border-line sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-[1180px] mx-auto px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Brand */}
          <div className="flex items-center space-x-4">
            <div
              onClick={() => navigateTo('home')}
              className="flex items-center space-x-2 cursor-pointer select-none"
            >
              <span className="text-2xl font-display text-accent uppercase tracking-wider">
                ipl universe
              </span>
              <span className="text-[9px] text-accent font-mono border border-line px-1.5 py-0.5 rounded-sm bg-surface-2">
                2008-2026
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex space-x-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = state.activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-[11px] font-mono tracking-wider font-semibold transition-all ${isActive
                        ? 'bg-accent text-accent-contrast'
                        : 'text-sage hover:text-chalk hover:bg-surface-2'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-sm border border-line-strong text-sage hover:text-chalk transition-colors flex items-center justify-center cursor-pointer bg-transparent"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-accent" /> : <Moon className="w-3.5 h-3.5 text-accent" />}
            </button>
          </div>


          {/* Mobile controls */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-sm border border-line-strong text-sage hover:text-chalk transition-colors flex items-center justify-center cursor-pointer bg-transparent"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-accent" /> : <Moon className="w-3.5 h-3.5 text-accent" />}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-sage hover:text-chalk p-1.5 rounded-sm border border-line-strong bg-transparent"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-surface border-b border-line px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = state.activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`flex items-center space-x-3 w-full px-4 py-2 rounded-sm text-xs font-mono font-semibold transition-all ${isActive
                    ? 'bg-accent text-accent-contrast'
                    : 'text-sage hover:text-chalk hover:bg-surface-2'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
