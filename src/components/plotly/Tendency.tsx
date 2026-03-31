'use client';

import { useEffect, useRef, useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { compressIcon, expandIcon } from './CustomButtons';

// Debe coincidir con los botones del rangeselector
const TIME_BUTTONS = [
  { count: 1,  step: 'hour',  stepmode: 'backward' },
  { count: 24, step: 'hour',  stepmode: 'backward' },
  { count: 7,  step: 'day',   stepmode: 'backward' },
  { count: 1,  step: 'month', stepmode: 'backward' },
  { step: 'all' },
] as const;


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
  showOperatingZones?: boolean;
}


export default function FrequencyTrendChart({
  minPF = 50,
  maxPF = 60,
  traces = [],
  tittle = "Grafica de tendencia",
  yAxisTitle = "Eje Y",
  showOperatingZones = false,
}: TendencyChartProps) {

  const containerRef = useRef<HTMLDivElement>(null);
  const [themeVersion, setThemeVersion] = useState(0);
  const currentTheme = useRef<string>('');
  const { state, open } = useSidebar();
  const [isMaximized, setIsMaximized] = useState(false);

  // ── LIVE / EXPLORE mode ────────────────────────────────────────────────
  // true  = LIVE MODE:    viewport follows latest data (autorange or button window)
  // false = EXPLORE MODE: viewport frozen, user is panning/zooming freely
  const isLiveModeRef = useRef(true);
  // Which button is active (null = autorange / "Todo")
  const activeBtnRef = useRef<typeof TIME_BUTTONS[number] | null>(null);

  // Guard: true while we do internal Plotly calls → listener ignores these
  const isInternalRef = useRef(false);

  // Para remover el listener antes del purge
  const relayoutHandlerRef = useRef<((data: any) => void) | null>(null);

  // Indica si el gráfico fue inicializado (Effect 1) y Effect 2 puede actuar
  const isChartInitializedRef = useRef(false);

  // ── Detección de tema ──────────────────────────────────────────────────────
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      if (newTheme !== currentTheme.current) {
        currentTheme.current = newTheme;
        setThemeVersion(v => v + 1);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // ── Effect 1: inicialización completa (incluye config con botón maximizar) ─
  useEffect(() => {
    if (!containerRef.current) return;

    const loadPlot = async () => {
      try {
        const Plotly = await import('plotly.js-dist-min');
        const style = getComputedStyle(document.documentElement);

        const colors = {
          paperColor:        style.getPropertyValue('--third-paper').trim(),
          plotColor:         style.getPropertyValue('--third-plot').trim(),
          textColor:         style.getPropertyValue('--third-text').trim(),
          gridColor:         style.getPropertyValue('--third-grid').trim(),
          rangeSelectorColor:style.getPropertyValue('--third-range-selector').trim(),
          blueTenue:         style.getPropertyValue('--third-bg-blue').trim(),
        };

        const operatingZones = showOperatingZones ? [
          { type: 'rect' as const, xref: 'paper' as const, yref: 'y' as const,
            x0: 0, x1: 1, y0: 0,  y1: 40,  fillcolor: 'rgba(34, 197, 94, 0.15)', line: { width: 0 }, layer: 'below' as const },
          { type: 'rect' as const, xref: 'paper' as const, yref: 'y' as const,
            x0: 0, x1: 1, y0: 40, y1: 80,  fillcolor: 'rgba(234, 179, 8, 0.15)',  line: { width: 0 }, layer: 'below' as const },
          { type: 'rect' as const, xref: 'paper' as const, yref: 'y' as const,
            x0: 0, x1: 1, y0: 80, y1: 100, fillcolor: 'rgba(239, 68, 68, 0.15)', line: { width: 0 }, layer: 'below' as const },
        ] : [];

        const layout: Partial<Plotly.Layout> = {
          uirevision: tittle,
          title: isMaximized ? { text: tittle, font: { size: 16, weight: 900 } } : undefined,
          paper_bgcolor: colors.paperColor,
          plot_bgcolor:  colors.plotColor,
          font:          { color: colors.textColor },
          shapes:        operatingZones,
          hovermode:     'x unified',
          hoverlabel:    { bgcolor: colors.paperColor, bordercolor: colors.gridColor, font: { color: colors.textColor, size: 12 } },
          xaxis: {
            type:        'date',
            autorange:   true,
            automargin:  true,
            zeroline:    false,
            gridcolor:   colors.gridColor,
            linewidth:   1,
            linecolor:   colors.gridColor,
            ticklen:     4,
            tickfont:    { size: isMaximized ? 12 : 10, color: colors.textColor },
            tickformatstops: [
              { dtickrange: [null, 60000],       value: '%H:%M:%S'     },
              { dtickrange: [60000, 3600000],    value: '%H:%M'        },
              { dtickrange: [3600000, 86400000], value: '%H:%M\n%d %b' },
              { dtickrange: [86400000, null],    value: '%d %b\n%Y'    },
            ],
            rangeselector: {
              font:        { color: colors.textColor, size: isMaximized ? 13 : 10 },
              buttons: [
                { count: 1,  label: '1h', step: 'hour',  stepmode: 'backward' },
                { count: 24, label: '1d', step: 'hour',  stepmode: 'backward' },
                { count: 7,  label: '1s', step: 'day',   stepmode: 'backward' },
                { count: 1,  label: '1m', step: 'month', stepmode: 'backward' },
                { step: 'all', label: 'Todo' },
              ],
              x: 0, xanchor: 'left', y: 1.02, yanchor: 'bottom',
              bgcolor:     colors.rangeSelectorColor,
              activecolor: colors.blueTenue,
            },
            rangeslider: { visible: isMaximized, thickness: 0.08, bgcolor: colors.plotColor },
          },
          yaxis: {
            range:      [minPF - 1, maxPF + 1],
            title:      isMaximized ? { text: yAxisTitle + (yAxisTitle.includes('[') ? '' : ' [Hz]'), font: { color: colors.textColor, size: 16, weight: 900 } } : undefined,
            gridcolor:  colors.gridColor,
            zerolinecolor: colors.gridColor,
            zeroline:   false,
            linewidth:  1,
            linecolor:  colors.gridColor,
            fixedrange: false,
            automargin: true,
            tickfont:   { size: isMaximized ? 12 : 10, color: colors.textColor },
            ticklen:    4,
            tickangle:  0,
          },
          margin: isMaximized ? { r: 80, b: 60, t: 80, l: 80 } : { r: 10, b: 45, t: 28, l: 10 },
          legend: {
            orientation: 'h', x: 0.5, xanchor: 'center',
            y: isMaximized ? -0.12 : -0.35, yanchor: 'top',
            font: { size: isMaximized ? 13 : 10, color: colors.textColor },
          },
          modebar: { orientation: 'v', bgcolor: colors.blueTenue },
        };

        // Config solo se pasa en Effect 1 → evita duplicar el botón en cada render
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
              click: () => setIsMaximized(prev => !prev),
            },
          ],
        };

        const plotlyTraces: Array<Plotly.Data> = traces.map(trace => ({
          x: trace.x, y: trace.y,
          type: 'scatter',
          mode: trace.mode || 'lines',
          name: trace.name,
          hovertemplate: `<b>%{y:.2f}</b><extra>%{fullData.name}</extra>`,
          line: { color: trace.lineColor || undefined, width: isMaximized ? 2 : 1.5, simplify: true },
        }));

        await Plotly.react(containerRef.current!, plotlyTraces, layout, config);
        Plotly.Plots.resize(containerRef.current!);

        // Listener: detect user interaction to switch LIVE / EXPLORE
        const handler = (eventData: any) => {
          if (isInternalRef.current) return;

          const btnIdx = eventData['xaxis.rangeselector.active'];
          if (typeof btnIdx === 'number' && btnIdx >= 0) {
            // Range button click → LIVE MODE with that button's window
            isLiveModeRef.current = true;
            activeBtnRef.current = TIME_BUTTONS[btnIdx];
          } else if (eventData['xaxis.autorange'] === true) {
            // "Todo" button → LIVE MODE with autorange
            isLiveModeRef.current = true;
            activeBtnRef.current = null;
          } else if (eventData['xaxis.range[0]'] !== undefined ||
                     eventData['xaxis.range'] !== undefined) {
            // Manual pan/zoom → EXPLORE MODE (freeze viewport)
            isLiveModeRef.current = false;
          }
        };
        relayoutHandlerRef.current = handler;
        (containerRef.current! as any).on('plotly_relayout', handler);
        isChartInitializedRef.current = true;

      } catch (error) {
        console.error('Error al cargar Plotly:', error);
      }
    };

    loadPlot();

    return () => {
      isChartInitializedRef.current = false;
      isLiveModeRef.current = true;
      activeBtnRef.current = null;
      if (containerRef.current) {
        const el = containerRef.current as any;
        if (relayoutHandlerRef.current) {
          el.removeListener?.('plotly_relayout', relayoutHandlerRef.current);
          relayoutHandlerRef.current = null;
        }
        const Plotly = require('plotly.js-dist-min');
        Plotly.purge(el);
      }
    };
  // traces NO está aquí → las actualizaciones de datos las maneja Effect 2
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeVersion, minPF, maxPF, isMaximized, showOperatingZones, tittle]);

  // ── Effect 2: actualizar datos sin tocar el config ─────────────────────────
  // Usa restyle (solo datos). Solo mueve viewport en LIVE MODE.
  useEffect(() => {
    if (!isChartInitializedRef.current || !containerRef.current) return;

    const updateData = async () => {
      const Plotly = await import('plotly.js-dist-min');
      if (!isChartInitializedRef.current || !containerRef.current) return;

      // Guard ALL Plotly calls — restyle can fire plotly_relayout internally
      // (e.g. when autorange is true), which the listener must ignore
      isInternalRef.current = true;

      // ALWAYS update trace data
      await (Plotly as any).restyle(containerRef.current, {
        x: traces.map(t => t.x),
        y: traces.map(t => t.y),
      });

      // ONLY update viewport in LIVE MODE
      if (isLiveModeRef.current) {
        const btn = activeBtnRef.current;
        if (btn !== null && btn.step !== 'all' && 'count' in btn) {
          let maxTime = -Infinity;
          for (const trace of traces) {
            if (trace.x.length > 0) {
              const lastX = trace.x[trace.x.length - 1];
              const ts = lastX instanceof Date ? lastX.getTime() : new Date(lastX as unknown as string).getTime();
              if (ts > maxTime) maxTime = ts;
            }
          }
          if (maxTime !== -Infinity && containerRef.current) {
            const endDate = new Date(maxTime);
            let startDate: Date;
            if      (btn.step === 'hour')  startDate = new Date(maxTime - btn.count * 3_600_000);
            else if (btn.step === 'day')   startDate = new Date(maxTime - btn.count * 86_400_000);
            else { startDate = new Date(maxTime); startDate.setMonth(startDate.getMonth() - btn.count); }

            await (Plotly as any).relayout(containerRef.current, {
              'xaxis.range[0]': startDate,
              'xaxis.range[1]': endDate,
              'xaxis.autorange': false,
            });
          }
        }
      }
      // EXPLORE MODE: viewport stays where user left it — no relayout

      isInternalRef.current = false;
    };

    updateData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traces]);

  // ── Resize ─────────────────────────────────────────────────────────────────
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
      {isMaximized && <div className="fixed inset-0 bg-black/50 z-40" />}
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
