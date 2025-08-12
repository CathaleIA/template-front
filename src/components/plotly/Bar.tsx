'use client';

import { useEffect, useRef, useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

interface PressureData {
    label: string;
    value: number;
    min: number;
    max: number;
}

const pressureValues: PressureData[] = [
    { label: 'Refri. PRE', value: 50, min: 30, max: 60 },
    { label: 'Refri. POS', value: 50, min: 35, max: 65 },
    { label: 'Pre. GAS', value: 30, min: 15, max: 40 },
    { label: 'Pre. TURBO', value: 80, min: 60, max: 90 },
];

const PressureGroupedBarChart = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [themeVersion, setThemeVersion] = useState(0); // Forzar recarga
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
            bgColor: style.getPropertyValue('--card').trim(),
            cardColor: style.getPropertyValue('--background').trim(),
            gridColor: style.getPropertyValue('--color-border').trim(),
            textColor: style.getPropertyValue('--foreground').trim(),
            warningColor: style.getPropertyValue('--plotly-4').trim(),
            successColor: style.getPropertyValue('--plotly-2').trim(),
            dangerColor: style.getPropertyValue('--plotly-3').trim(),

        };

        const labels = pressureValues.map(p => p.label);
        const loadPlot = async () => {
            try {
                const Plotly = await import('plotly.js-dist-min');

                const data: Plotly.Data[] = [
                    {
                        type: 'bar',
                        orientation: 'v',
                        x: labels,
                        y: pressureValues.map(p => p.min),
                        name: 'Mínimo',
                        marker: { color: colors.dangerColor },
                        text: pressureValues.map(p => p.min.toString()),
                        textposition: 'outside',
                        width: 0.1,
                    },
                    {
                        type: 'bar',
                        orientation: 'v',
                        x: labels,
                        y: pressureValues.map(p => p.value),
                        name: 'Actual',
                        marker: { color: colors.successColor },
                        text: pressureValues.map(p => p.value.toString()),
                        textposition: 'outside',
                        width: 0.4,
                    },
                    {
                        type: 'bar',
                        orientation: 'v',
                        x: labels,
                        y: pressureValues.map(p => p.max),
                        name: 'Máximo',
                        marker: { color: colors.warningColor },
                        text: pressureValues.map(p => p.max.toString()),
                        textposition: 'outside',
                        width: 0.1,
                    },
                ];

                const layout: Partial<Plotly.Layout> = {
                    barmode: 'group',
                    bargap: 0.2,
                    bargroupgap: 0,
                    paper_bgcolor: colors.bgColor,
                    plot_bgcolor: colors.bgColor,
                    font: { color: colors.textColor },
                    xaxis: {
                        // title: { text: 'Tipo de Presión' },
                        type: 'category',
                        tickangle: -20,
                    },
                    yaxis: {
                        title: { text: 'Presion [psi]' },
                        showgrid: true,
                        gridcolor: colors.gridColor,
                        tickvals: [0, 20, 40, 60, 80, 100],
                        range: [0, 100],
                    },
                    margin: { t: 30, b: 60, l: 40, r: 20 },
                    legend: {
                        y: -0.3,
                        yanchor: "top",
                        yref: "paper",
                        x: 0.5,
                        xanchor: "center",
                        orientation: "h"
                    }
                };

                const config: Partial<Plotly.Config> = {
                    displayModeBar: false,
                    responsive: true,
                };

                await Plotly.newPlot(containerRef.current!, data, layout, config);
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
    }, [themeVersion]);

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
};

export default PressureGroupedBarChart;
