'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface AppState {
  activePage: string;
  selectedSeason: number | null;    // null = all-time
  selectedPlayer: string | null;
  comparePlayer1: string | null;
  comparePlayer2: string | null;
  selectedTeam: string | null;
  quizScore: number;
  quizStreak: number;
  dreamXI: Record<string, string>;   // slot → player name
  auctionBudget: number;             // starts at 100 (in Crores)
  auctionSquad: string[];            // owned players
}

const initialState: AppState = {
  activePage: 'home',
  selectedSeason: null,
  selectedPlayer: null,
  comparePlayer1: null,
  comparePlayer2: null,
  selectedTeam: null,
  quizScore: 0,
  quizStreak: 0,
  dreamXI: {},
  auctionBudget: 100, // ₹100 Crore
  auctionSquad: []
};

type AppAction =
  | { type: 'SET_ACTIVE_PAGE'; payload: string }
  | { type: 'SET_SEASON'; payload: number | null }
  | { type: 'SET_PLAYER'; payload: string | null }
  | { type: 'SET_COMPARE_PLAYERS'; p1: string | null; p2: string | null }
  | { type: 'SET_TEAM'; payload: string | null }
  | { type: 'RESET_QUIZ' }
  | { type: 'ADD_QUIZ_POINT' }
  | { type: 'INCREMENT_STREAK' }
  | { type: 'RESET_STREAK' }
  | { type: 'SET_DREAM_XI'; slot: string; player: string }
  | { type: 'CLEAR_DREAM_XI' }
  | { type: 'BID_AUCTION_PLAYER'; player: string; bidAmount: number }
  | { type: 'RESET_AUCTION' };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_PAGE':
      return { ...state, activePage: action.payload };
    case 'SET_SEASON':
      return { ...state, selectedSeason: action.payload };
    case 'SET_PLAYER':
      return { ...state, selectedPlayer: action.payload };
    case 'SET_COMPARE_PLAYERS':
      return { ...state, comparePlayer1: action.p1, comparePlayer2: action.p2 };
    case 'SET_TEAM':
      return { ...state, selectedTeam: action.payload };
    case 'RESET_QUIZ':
      return { ...state, quizScore: 0, quizStreak: 0 };
    case 'ADD_QUIZ_POINT':
      return { ...state, quizScore: state.quizScore + 1 };
    case 'INCREMENT_STREAK':
      return { ...state, quizStreak: state.quizStreak + 1 };
    case 'RESET_STREAK':
      return { ...state, quizStreak: 0 };
    case 'SET_DREAM_XI':
      return {
        ...state,
        dreamXI: { ...state.dreamXI, [action.slot]: action.player }
      };
    case 'CLEAR_DREAM_XI':
      return { ...state, dreamXI: {} };
    case 'BID_AUCTION_PLAYER':
      if (state.auctionBudget < action.bidAmount) return state; // budget guard
      if (state.auctionSquad.includes(action.player)) return state; // duplicate guard
      return {
        ...state,
        auctionBudget: parseFloat((state.auctionBudget - action.bidAmount).toFixed(2)),
        auctionSquad: [...state.auctionSquad, action.player]
      };
    case 'RESET_AUCTION':
      return { ...state, auctionBudget: 100, auctionSquad: [] };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}
