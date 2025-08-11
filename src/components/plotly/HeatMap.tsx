'use client';

import { useEffect, useRef, useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

interface HeatmapProps {
    data?: {
        timestamp: Date;
        temperature: number;
    }[];
    title?: string;
    maxTemp?: number;
}


export default function TemperatureHeatmap({
    data = [],
    title,
    maxTemp = 90
}: HeatmapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [themeVersion, setThemeVersion] = useState(0);
    const currentTheme = useRef<string>('');
    const { state, open } = useSidebar();

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

    useEffect(() => {
        if (!containerRef.current) return;

        const style = getComputedStyle(document.documentElement);
        const colors = {
            bgColor: style.getPropertyValue('--card').trim(),         // Fondo del dashboard
            cardColor: style.getPropertyValue('--background').trim(),             // Fondo de la card
            textColor: style.getPropertyValue('--foreground').trim(),       // Texto principal
            successColor: style.getPropertyValue('--color-chart-1').trim(),
            warningColor: style.getPropertyValue('--color-chart-2').trim(),
            dangerColor: style.getPropertyValue('--color-chart-3').trim(),
            gridColor: style.getPropertyValue('--color-border').trim() || '#E5E7EB',
        };

        const days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return date.toISOString().slice(0, 10); // YYYY-MM-DD
        });

        const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

        const z = days.map(day => {
            return hours.map(hour => {
                const reading = data.find(r =>
                    r.timestamp.toISOString().slice(0, 10) === day &&
                    r.timestamp.getHours() === parseInt(hour)
                );
                return reading?.temperature ?? null;
            });
        });

        const loadPlot = async () => {
            try {
                const Plotly = await import('plotly.js-dist-min');

                await Plotly.newPlot(containerRef.current!, [{
                    type: 'heatmap',
                    x: hours,
                    y: days,
                    z: z,
                    colorscale: [
                        [0, colors.successColor || '#4CAF50'],
                        [0.6, colors.warningColor || '#FFC107'],
                        [1, colors.dangerColor || '#F44336']
                    ],
                    zmin: 40,
                    zmax: maxTemp,
                    hoverinfo: 'x+y+z',
                    hoverlabel: {
                        namelength: 0
                    }
                }], {
                    yaxis: { title: { text: 'Fecha' }, autorange: 'reversed' },
                    margin: { t: 10, l: 70, r: 50, b: 40 },
                    paper_bgcolor: colors.bgColor,
                    plot_bgcolor: colors.bgColor,
                    font: { color: colors.textColor },
                }, {
                    displayModeBar: false,
                });

                Plotly.Plots.resize(containerRef.current!);

            } catch (error) {
                console.error('Failed to load Plotly:', error);
            }
        };

        loadPlot();

        return () => {
            if (containerRef.current) {
                const Plotly = require('plotly.js-dist-min');
                Plotly.purge(containerRef.current);
            }
        };

    }, [data, maxTemp, title, themeVersion]);

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

    return <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />;
}
