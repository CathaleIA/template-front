'use client';

import { useEffect, useRef, useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { compressIcon, expandIcon } from './CustomButtons';


interface TraceData {
  x: Date[];
  y: number[];
  name: string;
  lineColor?: string;
  mode?: 'lines' | 'markers' | 'lines+markers';
}

interface TendencyChartProps {
  minPF: number;
  maxPF: number;
  traces: TraceData[];
  tittle?: string;
  yAxisTitle: string;
  showOperatingZones?: boolean; // Nueva prop para activar/desactivar zonas
}


export default function FrequencyTrendChart({
  minPF = 50,
  maxPF = 60,
  traces = [],
  tittle = "Grafica de tendencia",
  yAxisTitle = "Eje Y",
  showOperatingZones = false, // Por defecto desactivado
}: TendencyChartProps) {

  const containerRef = useRef<HTMLDivElement>(null);
  const [themeVersion, setThemeVersion] = useState(0);
  const currentTheme = useRef<string>('');
  const { state, open } = useSidebar();
  const [isMaximized, setIsMaximized] = useState(false);

  // Detectar cambios de tema
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      if (newTheme !== currentTheme.current) {
        currentTheme.current = newTheme;
        setThemeVersion(v => v + 1); // Incrementar para forzar recarga
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Cargar el gráfico
  useEffect(() => {
    if (!containerRef.current) return;

    const loadPlot = async () => {
      try {
        const Plotly = await import('plotly.js-dist-min');
        const style = getComputedStyle(document.documentElement);

        // Obtener colores actuales
        const colors = {
          paperColor: style.getPropertyValue('--third-paper').trim(),
          plotColor: style.getPropertyValue('--third-plot').trim(),
          textColor: style.getPropertyValue('--third-text').trim(),
          gridColor: style.getPropertyValue('--third-grid').trim(),
          rangeSelectorColor: style.getPropertyValue('--third-range-selector').trim(),
          blueTenue: style.getPropertyValue('--third-bg-blue').trim(),
        };

        const variablesMaximazed = {
          titleAxisYOne: {
            text: 'Velocidad [rpm]',
            font: { color: colors.textColor, size: isMaximized ? 16 : 12, weight: 900 }
          },
          titleAxisYTwo: {
            text: yAxisTitle + (yAxisTitle.includes('[') ? '' : ' [Hz]'),
            font: { color: colors.textColor, size: isMaximized ? 16 : 12, weight: 900 }
          },
          anguleTicks: isMaximized ? 0 : 90
        };

        // Configuración de shapes (zonas de colores)
        const operatingZones = showOperatingZones ? [
          // Zona verde (0-40) 🟢
          {
            type: 'rect' as const,
            xref: 'paper' as const,
            yref: 'y' as const,
            x0: 0,
            x1: 1,
            y0: 0,
            y1: 40,
            fillcolor: 'rgba(34, 197, 94, 0.15)', // verde suave
            line: { width: 0 },
            layer: 'below' as const
          },
          // Zona amarilla (40-80) 🟡
          {
            type: 'rect' as const,
            xref: 'paper' as const,
            yref: 'y' as const,
            x0: 0,
            x1: 1,
            y0: 40,
            y1: 80,
            fillcolor: 'rgba(234, 179, 8, 0.15)', // amarillo suave
            line: { width: 0 },
            layer: 'below' as const
          },
          // Zona roja (80-100) 🔴
          {
            type: 'rect' as const,
            xref: 'paper' as const,
            yref: 'y' as const,
            x0: 0,
            x1: 1,
            y0: 80,
            y1: 100,
            fillcolor: 'rgba(239, 68, 68, 0.15)', // rojo suave
            line: { width: 0 },
            layer: 'below' as const
          }
        ] : [];

        // Configuración completa del layout
        const layout: Partial<Plotly.Layout> = {
          title: isMaximized ? {
            text: tittle,
            font: {
              size: 16,
              weight: 900,
            }
          } : undefined,
          paper_bgcolor: colors.paperColor,
          plot_bgcolor: colors.plotColor,
          font: { color: colors.textColor },
          shapes: operatingZones, // Agregar zonas de colores
          xaxis: {
            type: 'date',
            autorange: true,
            zeroline: false,
            gridcolor: colors.gridColor,
            linewidth: 1,
            linecolor: isMaximized
              ? colors.textColor
              : colors.rangeSelectorColor,
            ticklen: 3,
            tickfont: {
              size: isMaximized
                ? 14
                : 10,
              color: colors.textColor
            },
            rangeselector: {
              font: {
                color: colors.textColor,
                size: isMaximized
                  ? 14
                  : 10,
              },
              buttons: [
                { count: 1, label: '1h', step: 'hour', stepmode: 'backward' },
                { count: 24, label: '1d', step: 'hour', stepmode: 'backward' },
                { count: 7, label: '1w', step: 'day', stepmode: 'backward' },
                { count: 1, label: '1m', step: 'month', stepmode: 'backward' },
                { step: 'all', label: 'Todo' }
              ],
              x: 1,
              xanchor: 'right',
              y: 1,
              yanchor: 'bottom',
              bgcolor: colors.rangeSelectorColor,
              activecolor: colors.paperColor,
            },
            rangeslider: {
              visible: true,
              thickness: 0.1,
              bgcolor: colors.plotColor,
            }
          },
          yaxis: {
            range: [minPF - 1, maxPF + 1],
            zerolinecolor: colors.gridColor,
            title: variablesMaximazed.titleAxisYTwo,
            gridcolor: colors.gridColor,
            zeroline: false,
            linewidth: 1,
            linecolor: isMaximized
              ? colors.textColor
              : colors.rangeSelectorColor,
            fixedrange: false,
            automargin: false,
            tickfont: {
              size: isMaximized
                ? 14
                : 10,
              color: colors.textColor
            },
            ticklabelposition: "outside",
            tickangle: variablesMaximazed.anguleTicks,
            ticklen: 5,
          },
          margin: isMaximized
            ? { r: 100, b: 30, t: 80, l: 100, }
            : { r: 60, b: 0, t: 10, l: 35 },
          legend: {
            orientation: "h",
            x: 0.5,
            xanchor: "center",
            y: isMaximized
              ? 1
              : -0.4,
            yanchor: isMaximized
              ? "bottom"
              : "top",
            font: {
              size: isMaximized
                ? 14
                : 10,
              color: colors.textColor
            }
          },
          modebar: {
            orientation: "v",
            bgcolor: colors.blueTenue,
          }
        };

        const config = {
          responsive: true,
          scrollZoom: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToAdd: [
            {
              name: 'toggle-maximize',
              title: isMaximized ? 'Minimizar gráfico' : 'Maximizar gráfico',
              icon: isMaximized ? compressIcon : expandIcon,
              click: () => {
                // Solo cambia el estado → el useEffect se encarga del resto
                setIsMaximized((prev) => !prev);
              },
            },
          ],
        };

        // Convertir los datos de entrada a traces de Plotly
        const plotlyTraces: Array<Plotly.Data> = traces.map(trace => ({
          x: trace.x,
          y: trace.y,
          type: 'scatter',
          mode: trace.mode || 'lines',
          name: trace.name,
          line: {
            color: trace.lineColor || '',
            width: 1,
            simplify: true,
          }
        }));

        // Crear gráfico nuevo
        await Plotly.react(
          containerRef.current!,
          plotlyTraces,
          layout,
          config
        );

        Plotly.Plots.resize(containerRef.current!);

      } catch (error) {
        console.error('Error al cargar Plotly:', error);
      }
    };

    loadPlot();

    return () => {
      if (containerRef.current) {
        const Plotly = require('plotly.js-dist-min');
        Plotly.purge(containerRef.current);
      }
    };
  }, [themeVersion, minPF, maxPF, isMaximized, showOperatingZones]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeTimer = setTimeout(() => {
      try {
        const Plotly = require('plotly.js-dist-min');
        Plotly.Plots.resize(containerRef.current!);
      } catch (error) {
        console.error('Error al redimensionar:', error);
      }
    }, 160);

    return () => clearTimeout(resizeTimer);
  }, [state, open, isMaximized]);

  return (
    <>
      {isMaximized && (
        <div className="fixed inset-0 bg-black/50 z-40" />
      )}

      <div
        ref={containerRef}
        className={`
          rounded-bl-4xl overflow-hidden
          ${isMaximized
            ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] z-50'
            : 'w-full h-full'}
        `}
      />
    </>
  );
};