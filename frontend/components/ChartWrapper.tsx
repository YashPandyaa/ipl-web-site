'use client';

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useTheme } from './ThemeProvider';

// Register all Chart.js controllers, scales, elements
Chart.register(...registerables);

interface ChartWrapperProps {
  id: string;
  type: 'bar' | 'line' | 'radar' | 'doughnut' | 'pie';
  data: any;
  options?: any;
  plugins?: any[];
  height?: number;
}

function colorToRGBA(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g);
    if (match && match.length >= 3) {
      return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${alpha})`;
    }
  }
  return color;
}

export default function ChartWrapper({
  id,
  type,
  data,
  options,
  plugins,
  height = 300,
}: ChartWrapperProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart instance before recreating
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    // Also remove any existing tooltip elements for this chart ID to prevent leftovers
    const oldTooltip = document.getElementById('chartjs-tooltip-' + id);
    if (oldTooltip) {
      oldTooltip.remove();
    }

    const ctx = canvasRef.current.getContext('2d');
    let customizedData = data;

    if (ctx) {
      // Create a shallow copy of data with a mapped copy of datasets
      customizedData = {
        ...data,
        datasets: data.datasets.map((dataset: any) => {
          const newDataset = { ...dataset };
          
          // 1. Line/Area Chart Styling: Tension, Gradient Fill & Hover Point Glow
          if (type === 'line' || dataset.type === 'line') {
            const color = typeof dataset.borderColor === 'string' ? dataset.borderColor : '#e8a33d';
            newDataset.tension = 0.4;
            newDataset.borderWidth = 3;

            // Glowing gradient area fill (modern area chart look)
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, colorToRGBA(color, 0.16));
            gradient.addColorStop(1, colorToRGBA(color, 0.0));
            newDataset.backgroundColor = gradient;
            newDataset.fill = true;

            // Sleek hover data points only
            newDataset.pointRadius = 1;
            newDataset.pointHitRadius = 24; // Easier hover target area
            newDataset.pointHoverRadius = 5;
            newDataset.pointHoverBackgroundColor = color;
            newDataset.pointHoverBorderColor = isDark ? '#ffffff' : '#1f2937';
            newDataset.pointHoverBorderWidth = 2.5;
          }

          // 2. Bar Chart Styling: Rounded corners and vertical gradients
          if (type === 'bar' || dataset.type === 'bar') {
            const color = typeof dataset.backgroundColor === 'string' ? dataset.backgroundColor : '#1A56DB';
            
            // Rounded corners on top
            newDataset.borderRadius = 5;
            newDataset.borderSkipped = false;
            newDataset.barThickness = 12; // sleek, modern thin bars

            // Vertical gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, colorToRGBA(color, 0.8));
            gradient.addColorStop(1, colorToRGBA(color, 0.15));
            newDataset.backgroundColor = gradient;

            // Hover effect: Solid color glow
            newDataset.hoverBackgroundColor = colorToRGBA(color, 1.0);
            newDataset.hoverBorderColor = color;
            newDataset.hoverBorderWidth = 1;
          }

          return newDataset;
        })
      };
    }

    // Theme variables
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const tickColor = isDark ? '#9ca3af' : '#4b5563';
    const legendLabelColor = isDark ? '#d1d5db' : '#374151';

    // Default premium theme options for all charts
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      animation: {
        duration: 350,
        easing: 'easeOutQuart'
      },
      hover: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: legendLabelColor,
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 6,
            boxHeight: 6,
            padding: 18,
            font: { size: 10, weight: '600', family: 'var(--font-inter)' }
          }
        },
        tooltip: {
          enabled: false, // Disable native tooltips for custom HTML floating tooltips
          external: function(context: any) {
            // Tooltip Element
            let tooltipEl = document.getElementById('chartjs-tooltip-' + id);

            // Create element on first render
            if (!tooltipEl) {
              tooltipEl = document.createElement('div');
              tooltipEl.id = 'chartjs-tooltip-' + id;
              tooltipEl.style.background = isDark ? 'rgba(10, 15, 20, 0.85)' : 'rgba(255, 255, 255, 0.9)';
              tooltipEl.style.backdropFilter = 'blur(12px)';
              tooltipEl.style.setProperty('-webkit-backdrop-filter', 'blur(12px)');
              tooltipEl.style.border = isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)';
              tooltipEl.style.borderRadius = '8px';
              tooltipEl.style.color = isDark ? '#f3f4f6' : '#1f2937';
              tooltipEl.style.opacity = '0';
              tooltipEl.style.pointerEvents = 'none';
              tooltipEl.style.position = 'absolute';
              tooltipEl.style.transition = 'all 0.12s cubic-bezier(0.4, 0, 0.2, 1)';
              tooltipEl.style.padding = '8px 12px';
              tooltipEl.style.boxShadow = isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)' : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
              tooltipEl.style.transform = 'translate(-50%, 0) scale(0.95)';
              tooltipEl.style.zIndex = '50';
              
              // Create a container inside canvas parent
              const parent = canvasRef.current?.parentElement;
              if (parent) {
                parent.appendChild(tooltipEl);
              }
            }

            const { chart, tooltip } = context;

            // Hide if no tooltip
            if (tooltip.opacity === 0) {
              tooltipEl.style.opacity = '0';
              tooltipEl.style.transform = 'translate(-50%, 0) scale(0.95)';
              return;
            }

            // Set Text
            if (tooltip.body) {
              const titleLines = tooltip.title || [];
              const bodyLines = tooltip.body.map((b: any) => b.lines);

              const div = document.createElement('div');
              div.style.fontFamily = 'var(--font-inter)';
              div.style.fontSize = '11px';

              titleLines.forEach((title: any) => {
                const titleEl = document.createElement('div');
                titleEl.style.fontWeight = '700';
                titleEl.style.marginBottom = '6px';
                titleEl.style.color = isDark ? '#ffffff' : '#111827';
                titleEl.style.fontFamily = 'var(--font-space-mono)';
                const titleStr = title !== undefined && title !== null ? String(title) : '';
                titleEl.innerText = titleStr.includes('Season') ? titleStr : `Season ${titleStr}`; // Year title
                div.appendChild(titleEl);
              });

              bodyLines.forEach((body: string, i: number) => {
                const colors = tooltip.labelColors?.[i] || {};
                const bulletColor = colors.borderColor || colors.backgroundColor || '#e8a33d';
                
                const span = document.createElement('span');
                span.style.background = bulletColor;
                span.style.borderWidth = '1px';
                span.style.borderColor = bulletColor;
                span.style.display = 'inline-block';
                span.style.width = '7px';
                span.style.height = '7px';
                span.style.marginRight = '8px';
                span.style.borderRadius = '50%';

                const rowEl = document.createElement('div');
                rowEl.style.display = 'flex';
                rowEl.style.alignItems = 'center';
                rowEl.style.marginTop = '4px';
                rowEl.style.color = isDark ? '#e5e7eb' : '#374151';
                
                rowEl.appendChild(span);
                
                const textNode = document.createTextNode(body);
                rowEl.appendChild(textNode);
                div.appendChild(rowEl);
              });

              // Clear old children
              while (tooltipEl.firstChild) {
                tooltipEl.firstChild.remove();
              }
              tooltipEl.appendChild(div);
            }

            const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

            // Display, position, and set styles for font
            tooltipEl.style.opacity = '1';
            tooltipEl.style.transform = 'translate(-50%, 0) scale(1)';
            tooltipEl.style.left = positionX + tooltip.caretX + 'px';
            tooltipEl.style.top = positionY + tooltip.caretY - tooltipEl.offsetHeight - 12 + 'px';
          }
        }
      },
      scales: type !== 'radar' && type !== 'doughnut' && type !== 'pie' ? {
        x: {
          grid: { 
            display: false // Clean up vertical lines completely
          },
          border: {
            display: false // No axis border line
          },
          ticks: { 
            color: tickColor, 
            font: { size: 9, family: 'var(--font-space-mono)' },
            padding: 8
          }
        },
        y: {
          grid: { 
            color: gridColor, 
            tickLength: 0,
            borderDash: [5, 5]
          },
          border: {
            display: false // No axis border line
          },
          ticks: { 
            color: tickColor, 
            font: { size: 9, family: 'var(--font-space-mono)' },
            padding: 8
          }
        }
      } : undefined
    };

    const combinedOptions = {
      ...defaultOptions,
      ...options,
      plugins: {
        ...defaultOptions.plugins,
        ...(options?.plugins || {}),
        legend: {
          ...defaultOptions.plugins.legend,
          ...(options?.plugins?.legend || {})
        },
        tooltip: {
          ...defaultOptions.plugins.tooltip,
          ...(options?.plugins?.tooltip || {})
        }
      },
      scales: type !== 'radar' && type !== 'doughnut' && type !== 'pie' ? {
        ...defaultOptions.scales,
        ...(options?.scales || {})
      } : options?.scales
    };

    // Canvas drop-shadow plugin for premium line/bar glows matching accents
    const shadowPlugin = {
      id: 'shadowPlugin',
      beforeDatasetDraw(chart: any, args: any) {
        const { ctx } = chart;
        ctx.save();
        const dataset = chart.data.datasets[args.index];
        const color = dataset.borderColor || dataset.pointHoverBorderColor || '#e8a33d';
        const typeofColor = typeof color === 'string' ? color : '#e8a33d';

        if (dataset.type === 'line' || chart.config.type === 'line') {
          ctx.shadowColor = colorToRGBA(typeofColor, 0.35);
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;
        } else if (dataset.type === 'bar' || chart.config.type === 'bar') {
          ctx.shadowColor = colorToRGBA(typeofColor, 0.2);
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 2;
        }
      },
      afterDatasetDraw(chart: any) {
        chart.ctx.restore();
      }
    };

    // Custom vertical dashed line plugin on hover (crosshair)
    const verticalLinePlugin = {
      id: 'verticalLine',
      afterDraw(chart: any) {
        if (!chart.scales.y) return;
        const activeElements = chart.getActiveElements();
        if (activeElements && activeElements.length > 0) {
          const activePoint = activeElements[0];
          const { ctx } = chart;
          const { x } = activePoint.element;
          const topY = chart.scales.y.top;
          const bottomY = chart.scales.y.bottom;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x, topY);
          ctx.lineTo(x, bottomY);
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.restore();
        }
      }
    };

    const chartPlugins = [shadowPlugin, verticalLinePlugin, ...(plugins || [])];

    // Create new chart instance
    chartRef.current = new Chart(canvasRef.current, {
      type,
      data: customizedData,
      options: combinedOptions,
      plugins: chartPlugins
    });

    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      const tooltipEl = document.getElementById('chartjs-tooltip-' + id);
      if (tooltipEl) {
        tooltipEl.remove();
      }
    };
  }, [data, options, plugins, type, isDark, id, height]);

  return (
    <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
      <canvas id={id} ref={canvasRef} />
    </div>
  );
}
