'use client';

import { useEffect, useRef, useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

interface CylinderTempChartProps {
  minTemp: number;
  maxTemp: number;
  title: string;
  warningThreshold?: number;
  cylinders?: Array<string>;
  current?: Array<number>;
  min?: Array<number>;
  max?: Array<number>;
}

const CylinderTemperatureChart = ({
  minTemp = 85,
  maxTemp = 110,
  warningThreshold = 0.9, // 90% del maxTemp
  title = 'Temperatura de Cilindros',
  cylinders = [],
  current = [],
  min = [],
  max = [],
}: CylinderTempChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [themeVersion, setThemeVersion] = useState(0);
  const currentTheme = useRef<string>('');
  const { state, open } = useSidebar();

  // Detectar cambios de tema
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      if (newTheme !== currentTheme.current) {
        currentTheme.current = newTheme;
        setThemeVersion(v => v + 1);
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

        const colors = {
          bgColor: style.getPropertyValue('--card').trim(),         // Fondo del dashboard
          cardColor: style.getPropertyValue('--background').trim(),             // Fondo de la card
          textColor: style.getPropertyValue('--foreground').trim(),       // Texto principal
          dangerColor: style.getPropertyValue('--destructive').trim(),    // Alertas críticas
          warningColor: style.getPropertyValue('--chart-4').trim(),       // Advertencias (amarillo)
          successColor: style.getPropertyValue('--chart-2').trim(),       // Línea de seguridad (verde)
          gridColor: style.getPropertyValue('--border').trim(),           // Líneas de cuadrícula
          lineColor: '#3b82f6',                                           // Línea de temperatura actual (azul claro)
          markerNormal: '#1d4ed8',                                        // Marcadores normales (azul oscuro)
          markerBorder: '#262626',                                        // Borde de marcador (gris oscuro)
          fillMax: 'rgba(248, 113, 113, 0.15)',                            // Relleno rango máximo (rojo claro)
          lineMax: 'rgba(248, 113, 113, 0.5)',                             // Línea rango máximo
          fillMin: 'rgba(34, 197, 94, 0.15)',                              // Relleno rango mínimo (verde claro)
          lineMin: 'rgba(34, 197, 94, 0.5)',                               // Línea rango mínimo
        };

        const data: Plotly.Data[] = [
          {
            type: 'scatter',
            mode: 'lines+markers',
            x: cylinders,
            y: current,
            name: 'Temperatura Actual',
            text: current.map(v => v.toFixed(1) + '°C'),
            textposition: 'top center',
            textfont: {
              size: 14,
              color: colors.textColor,
              family: 'Arial, sans-serif'
            },
            line: {
              color: '#3498db',
              width: 3
            },
            marker: {
              color: current.map(temp =>
                temp > maxTemp ? colors.dangerColor :
                  temp > maxTemp * warningThreshold ? colors.warningColor :
                    '#2980b9' // Azul más oscuro para marcadores
              ),
              size: 10,
              line: {
                color: colors.cardColor,
                width: 1
              }
            },
            hoverinfo: 'text',
            hovertext: cylinders.map((cyl, i) =>
              `<b>${cyl}</b><br>` +
              `Actual: ${current[i].toFixed(1)}°C<br>` +
              `Mín: ${min[i].toFixed(1)}°C<br>` +
              `Máx: ${max[i].toFixed(1)}°C`
            )
          },

          // 2. Área para el rango máximo (relleno superior)
          {
            type: 'scatter',
            mode: 'lines',
            x: cylinders,
            y: max,
            name: 'Rango Máximo',
            fill: 'tonexty', // Rellena hacia la siguiente traza
            fillcolor: 'rgba(231, 76, 60, 0.15)', // Rojo con transparencia
            line: {
              color: 'rgba(231, 76, 60, 0.5)', // Línea semitransparente
              width: 1,
              dash: 'dot'
            },
            hoverinfo: 'none'
          },

          // 3. Área para el rango mínimo (relleno inferior)
          {
            type: 'scatter',
            mode: 'lines',
            x: cylinders,
            y: min,
            name: 'Rango Mínimo',
            fill: 'tonexty',
            fillcolor: 'rgba(46, 204, 113, 0.15)', // Verde con transparencia
            line: {
              color: 'rgba(46, 204, 113, 0.5)',
              width: 1,
              dash: 'dot'
            },
            hoverinfo: 'none'
          }
        ];

        // Configuración del layout
        const layout: Partial<Plotly.Layout> = {
          paper_bgcolor: colors.bgColor,
          plot_bgcolor: colors.cardColor,
          font: { color: colors.textColor },
          xaxis: {
            title: { text: 'Cilindros', standoff: 15 },
            tickangle: -45,
            linecolor: colors.gridColor,
            gridcolor: colors.gridColor,
          },
          yaxis: {
            title: { text: 'Temperatura (°C)', standoff: 15 },
            range: [Math.min(...min) - 5, Math.max(...max) + 5],
            linecolor: colors.gridColor,
            gridcolor: colors.gridColor,
          },
          margin: { t: 90, l: 70, r: 30, b: 80 },
          legend: {
            orientation: 'h',
            y: 1.1,
            x: 0.5,
            xanchor: 'center',
            font: { size: 12 }
          },
          hovermode: 'closest',
          shapes: [
            {
              type: 'line',
              x0: -0.5,
              x1: cylinders.length - 0.5,
              y0: maxTemp,
              y1: maxTemp,
              line: {
                color: colors.dangerColor,
                width: 2,
                dash: 'dot'
              }
            },
            {
              type: 'line',
              x0: -0.5,
              x1: cylinders.length - 0.5,
              y0: minTemp,
              y1: minTemp,
              line: {
                color: colors.successColor,
                width: 2,
                dash: 'dot'
              }
            }
          ],
        };

        const config: Partial<Plotly.Config> = {
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'],
          staticPlot: false
        };

        Plotly.newPlot(containerRef.current!, data, layout, config);
        Plotly.Plots.resize(containerRef.current!);

      } catch (error) {
        console.error('Error al cargar Plotly:', error);
      }
    };

    loadPlot();

    // Cleanup
    return () => {
      if (containerRef.current) {
        const Plotly = require('plotly.js-dist-min');
        Plotly.purge(containerRef.current);
      }
    };
  }, [minTemp, maxTemp, title, themeVersion, warningThreshold]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeTimer = setTimeout(() => {
      try {
        const Plotly = require('plotly.js-dist-min');
        Plotly.Plots.resize(containerRef.current!);
        console.log('Redimensionando - Estado sidebar:', state, 'Open:', open);
      } catch (error) {
        console.error('Error al redimensionar:', error);
      }
    }, 70);

    return () => clearTimeout(resizeTimer);
  }, [state, open]);

  return (
    <div ref={containerRef} className='w-full h-full rounded-2xl overflow-hidden' />
  );
};

export default CylinderTemperatureChart;