'use client';
import { useEffect, useRef, useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

interface PolarPhaseAngleProps {
    angles: {
        l1l2: number;
        l2l3: number;
        l3l1: number;
    };
    title?: string;
    referenceAngle?: number;
}

const PolarPhaseAnglePlot = ({
    angles = { l1l2: 120, l2l3: 120, l3l1: 120 },
    title = 'Ángulos de Fase entre Líneas',
    referenceAngle = 120,
}: PolarPhaseAngleProps) => {

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

        // Obtener colores actuales
        const colors = {
            paperColor: style.getPropertyValue('--third-paper').trim(),
            plotColor: style.getPropertyValue('--third-plot').trim(),
            textColor: style.getPropertyValue('--third-text').trim(),
            gridColor: style.getPropertyValue('--third-grid').trim(),
            refenrenceLine: style.getPropertyValue('--foreground').trim(),
            trianguleBg: style.getPropertyValue('--plotly-5').trim(),
            trianguleBg2: style.getPropertyValue('--plotly-6').trim(),
        };

        const loadPlot = async () => {
            try {
                const Plotly = await import('plotly.js-dist-min');

                // Calcular el tercer ángulo si no suma 360°
                const totalAngle = angles.l1l2 + angles.l2l3 + angles.l3l1;
                const adjustedL3L1 = 360 - angles.l1l2 - angles.l2l3;

                const data: Plotly.Data[] = [
                    // Área de fondo para el sistema completo
                    {
                        type: 'scatterpolar',
                        r: [1, 1, 1, 1],
                        theta: [0, 120, 240, 0],
                        fill: 'toself',
                        fillcolor: colors.trianguleBg,
                        line: {
                            color: colors.trianguleBg,
                            width: 0.5
                        },
                        mode: 'lines',
                        showlegend: false,
                    },
                    // Área de los ángulos actuales
                    {
                        type: 'scatterpolar',
                        r: [0.8, 0.8, 0.8, 0.8],
                        theta: [0, angles.l1l2, angles.l1l2 + angles.l2l3, 0],
                        fill: 'toself',
                        fillcolor: colors.trianguleBg2,
                        line: {
                            color: colors.trianguleBg2,
                            width: 1
                        },
                        mode: 'lines',
                        name: 'Ángulos actuales',
                        hoverinfo: 'none'
                    },
                    // Líneas de fase con marcadores en el borde
                    {
                        type: 'scatterpolar',
                        r: [0, 1, 1, 0],
                        theta: [0, 0, angles.l1l2, 0],
                        mode: 'lines',
                        line: {
                            // color: 'blue',
                            width: 3
                        },
                        name: 'L1-L2',
                        hovertemplate: '<b>L1-L2</b>: %{theta:.1f}°<extra></extra>',
                        hoverinfo: 'text'
                    },
                    {
                        type: 'scatterpolar',
                        r: [0, 1, 1, 0],
                        theta: [angles.l1l2, angles.l1l2, angles.l1l2 + angles.l2l3, angles.l1l2],
                        mode: 'lines',
                        line: {
                            // color: 'green',
                            width: 3
                        },
                        name: 'L2-L3',
                        hovertemplate: '<b>L2-L3</b>: %{theta:.1f}°<extra></extra>',
                        hoverinfo: 'text'
                    },
                    {
                        type: 'scatterpolar',
                        r: [0, 1, 1, 0],
                        theta: [angles.l1l2 + angles.l2l3, angles.l1l2 + angles.l2l3, 360, angles.l1l2 + angles.l2l3],
                        mode: 'lines',
                        line: {
                            // color: 'orange',
                            width: 3
                        },
                        name: 'L3-L1',
                        hovertemplate: '<b>L3-L1</b>: %{theta:.1f}°<extra></extra>',
                        hoverinfo: 'text'
                    },
                    // Líneas de referencia
                    {
                        type: 'scatterpolar',
                        r: [0, 1.2],
                        theta: [0, 0],
                        mode: 'lines',
                        line: {
                            color: colors.refenrenceLine,
                            width: 1,
                            dash: 'dot'
                        },
                        showlegend: false,
                    },
                    {
                        type: 'scatterpolar',
                        r: [0, 1.2],
                        theta: [referenceAngle, referenceAngle],
                        mode: 'lines',
                        line: {
                            color: colors.refenrenceLine,
                            width: 1,
                            dash: 'dot'
                        },
                        showlegend: false,
                    },
                    {
                        type: 'scatterpolar',
                        r: [0, 1.2],
                        theta: [referenceAngle * 2, referenceAngle * 2],
                        mode: 'lines',
                        line: {
                            color: colors.refenrenceLine,
                            width: 1,
                            dash: 'dot'
                        },
                        showlegend: false,
                    },
                    // Texto de los ángulos (usando marcadores invisibles)
                    {
                        type: 'scatterpolar',
                        r: [0.7, 0.7, 0.7],
                        theta: [angles.l1l2 / 2, angles.l1l2 + angles.l2l3 / 2, angles.l1l2 + angles.l2l3 + adjustedL3L1 / 2],
                        mode: 'text',
                        text: [`${angles.l1l2}°`, `${angles.l2l3}°`, `${adjustedL3L1.toFixed(1)}°`],
                        textfont: {
                            size: 12,
                            color: colors.textColor,
                            weight: 3
                        },
                        showlegend: false,
                    }
                ];

                const layout: Partial<Plotly.Layout> = {
                    autosize: true,
                    paper_bgcolor: colors.paperColor,
                    plot_bgcolor: colors.plotColor,
                    font: { color: colors.textColor },
                    title: {
                        text: `<b>L1-L2: ${angles.l1l2}° | L2-L3: ${angles.l2l3}° | L3-L1: ${adjustedL3L1.toFixed(1)}°</b>`,
                        font: { size: 11, weight: 900 },
                        x: 0.5, // centrado
                        xanchor: 'center',
                        y: 0.9, // posición vertical ajustada (ajusta esto si es necesario)
                        yanchor: 'bottom',
                        pad: { t: 0, b: 2 }, // ← Esto es clave: reduce el padding interno del título
                    },
                    polar: {
                        radialaxis: {
                            visible: false,
                            range: [0, 1.2],
                            angle: 90
                        },
                        angularaxis: {
                            direction: 'clockwise',
                            rotation: 90,
                            tickvals: [0, 60, 120, 180, 240, 300],
                            tickfont: {
                                size: 10,
                                color: colors.textColor
                            },
                            tickcolor: colors.textColor,
                            linecolor: colors.gridColor,
                            gridcolor: colors.gridColor,
                            showline: true
                        },
                        bgcolor: 'rgba(0,0,0,0)'
                    },
                    showlegend: true,
                    legend: {
                        // orientation: 'h',
                        yanchor: 'bottom',
                        y: 0,
                        xanchor: 'center',
                        x: 0.5,
                        bgcolor: 'rgba(0,0,0,0)',
                        font: {
                            size: 12
                        },
                        itemwidth: 30,
                        itemsizing: 'constant'
                    },
                    margin: { r: 35, b: 30, t: 0, l: 35 },
                };

                const config: Partial<any> = {
                    displayModeBar: false,
                    responsive: true,
                    staticPlot: false,
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
    }, [angles.l1l2, angles.l2l3, angles.l3l1, title, referenceAngle, themeVersion]);

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
        <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" />
    );
};

export default PolarPhaseAnglePlot;