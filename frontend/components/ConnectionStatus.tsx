'use client';

import React from 'react';

interface ConnectionStatusProps {
  status: 'connected' | 'polling' | 'disconnected';
}

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  const config = {
    connected: { color: 'bg-emerald-500', text: 'Live (WS Connected)' },
    polling: { color: 'bg-amber-500', text: 'Live (Polling)' },
    disconnected: { color: 'bg-rose-500', text: 'Offline' }
  };

  const { color, text } = config[status] || config.disconnected;

  return (
    <div className="flex items-center space-x-1.5 px-2 py-1 rounded-sm border border-line bg-surface-2 font-mono text-[9px] font-bold select-none text-sage hover:text-chalk transition-all">
      <span className={`w-1.5 h-1.5 rounded-full ${color} shrink-0`}></span>
      <span>{text}</span>
    </div>
  );
}
