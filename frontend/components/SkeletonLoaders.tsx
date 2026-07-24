'use client';

import React from 'react';

// Chart Skeleton representing a loading line or bar chart
export function ChartSkeleton({ height = 250 }: { height?: number }) {
  return (
    <div 
      className="w-full rounded-sm border border-line bg-surface p-5 flex flex-col justify-between animate-pulse"
      style={{ height: `${height + 40}px` }}
    >
      {/* Title block */}
      <div className="h-4 bg-surface-2 rounded-sm w-1/3 mb-4"></div>
      
      {/* Chart grid container */}
      <div className="flex-1 w-full flex items-end gap-3 px-2 py-4">
        {Array.from({ length: 12 }).map((_, idx) => {
          const heights = ['h-1/3', 'h-2/3', 'h-1/2', 'h-5/6', 'h-1/4', 'h-3/4', 'h-2/5', 'h-4/5', 'h-3/5', 'h-1/2', 'h-4/6', 'h-3/4'];
          const hClass = heights[idx % heights.length];
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className={`w-full ${hClass} bg-surface-2 rounded-sm opacity-60`}></div>
              <div className="w-6 h-2.5 bg-surface-2 rounded-sm"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Table Skeleton representing a data table with header and rows
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full rounded-sm border border-line bg-surface p-5 animate-pulse">
      {/* Table Title */}
      <div className="h-4 bg-surface-2 rounded-sm w-1/4 mb-5"></div>
      
      {/* Table Headers */}
      <div className="flex items-center gap-4 py-3 border-b border-line bg-surface-2/40 px-3">
        <div className="h-3 bg-surface-2 rounded-sm flex-1"></div>
        <div className="h-3 bg-surface-2 rounded-sm w-20"></div>
        <div className="h-3 bg-surface-2 rounded-sm w-24"></div>
        <div className="h-3 bg-surface-2 rounded-sm w-24"></div>
        <div className="h-3 bg-surface-2 rounded-sm w-28"></div>
      </div>
      
      {/* Table Rows */}
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-4 py-3.5 px-3">
            <div className="h-3.5 bg-surface-2 rounded-sm flex-1"></div>
            <div className="h-3 bg-surface-2 rounded-sm w-20"></div>
            <div className="h-3 bg-surface-2 rounded-sm w-24"></div>
            <div className="h-3 bg-surface-2 rounded-sm w-24 text-center"></div>
            <div className="h-3.5 bg-surface-2 rounded-sm w-28"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
