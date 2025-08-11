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
}


export default function FrequencyTrendChart({
  minPF = 50,
  maxPF = 60,
  traces = [],
  tittle = "Grafica de tendencia",
  yAxisTitle = "Eje Y",
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
          bgColor: style.getPropertyValue('--card').trim(),         // Fondo del dashboard
          cardColor: style.getPropertyValue('--background').trim(),             // Fondo de la card
          textColor: style.getPropertyValue('--foreground').trim(),       // Texto principal
          buttonColor: style.getPropertyValue('--color-muted').trim(),
          gridColor: style.getPropertyValue('--color-border').trim(),
          lineColor: style.getPropertyValue('--color-chart-5').trim(),
        };

        // Configuración completa del layout
        const layout: Partial<Plotly.Layout> = {
          paper_bgcolor: colors.bgColor,
          plot_bgcolor: colors.cardColor,
          font: { color: colors.textColor },
          xaxis: {
            type: 'date',
            gridcolor: colors.gridColor,
            linecolor: colors.gridColor,
            zerolinecolor: colors.gridColor,
            autorange: true,
            rangeselector: {
              buttons: [
                { count: 1, label: '1h', step: 'hour', stepmode: 'backward' },
                { count: 24, label: '1d', step: 'hour', stepmode: 'backward' },
                { count: 7, label: '1w', step: 'day', stepmode: 'backward' },
                { count: 1, label: '1m', step: 'month', stepmode: 'backward' },
                { step: 'all', label: 'Todo' }
              ],
              bgcolor: colors.buttonColor,
              font: { color: colors.textColor },
              activecolor: colors.bgColor,
              x: 0,
              xanchor: 'left',
              y: 1.15,
              yanchor: 'top'
            },
            rangeslider: {
              visible: true,
              thickness: 0.1,
              bgcolor: colors.cardColor,
              bordercolor: colors.gridColor
            }
          },
          yaxis: {
            title: {
              text: yAxisTitle,
              font: { color: colors.textColor }
            },
            range: [minPF - 1, maxPF + 1],
            gridcolor: colors.gridColor,
            fixedrange: false,
            linecolor: colors.gridColor,
            zerolinecolor: colors.gridColor,
          },
          margin: isMaximized
            ? { t: 80, l: 100, r: 60, b: 40 }
            : { t: 40, l: 50, r: 30, b: 20 },
          legend: {
            y: -0.4,          // Posición vertical (0 = fondo, 1 = parte superior)
            yanchor: "top",   // Ancla el a leyenda en la posición y
            yref: "paper",
            x: 0.5,
            xanchor: "center", // Ancla la leyenda en el centro horizontal
            orientation: "h"   // Orientación horizontal (opcional)
          },
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
  }, [themeVersion, minPF, maxPF, isMaximized]);

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
          rounded-2xl overflow-hidden
          ${isMaximized
                ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] z-50'
                : 'w-full h-full'}
        `}
      />
    </>
  );
};