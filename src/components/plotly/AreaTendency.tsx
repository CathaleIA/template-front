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
          paperColor: style.getPropertyValue('--third-paper').trim(),
          plotColor: style.getPropertyValue('--third-plot').trim(),
          textColor: style.getPropertyValue('--third-text').trim(),
          cardColor: style.getPropertyValue('--background').trim(),
          dangerColor: style.getPropertyValue('--destructive').trim(),
          warningColor: style.getPropertyValue('--chart-4').trim(),
          successColor: style.getPropertyValue('--chart-2').trim(),
          rangeSelectorColor: style.getPropertyValue('--third-range-selector').trim(),
          gridColor: style.getPropertyValue('--third-grid').trim(),
          blueTenue: style.getPropertyValue('--third-bg-blue').trim(),

          lineColor: '#3b82f6',
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
          paper_bgcolor: colors.paperColor,
          plot_bgcolor: colors.plotColor,
          font: { color: colors.textColor },
          xaxis: {
            title: { text: 'Cilindros', standoff: 15 },
            linewidth: 1,
            linecolor: colors.rangeSelectorColor,
            zeroline: false,
            ticklen: 3,
            tickfont: {
              size: 10,
              color: colors.textColor
            },
          },
          yaxis: {
            gridcolor: colors.gridColor,
            zeroline: false,
            linewidth: 1,
            linecolor: colors.rangeSelectorColor,
            title: { text: 'Temperatura (°C)', standoff: 15 },
            range: [Math.min(...min) - 5, Math.max(...max) + 5],
            tickfont: {
              size: 10,
              color: colors.textColor
            },
            ticklabelposition: "outside",
            tickangle: 45,
            ticklen: 5,

          },
          margin: { t: 90, l: 70, r: 30, b: 80 },
          legend: {
            orientation: "h",
            x: 0.5,
            xanchor: "center",
            y: 1.1,
            yanchor: "top",
            font: {
              size: 10,
              color: colors.textColor
            }
          },
          modebar: {
            orientation: "h",
            bgcolor: colors.blueTenue,
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