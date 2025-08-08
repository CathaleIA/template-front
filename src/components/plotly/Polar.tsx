'use client';
import { useEffect, useRef, useState } from 'react';

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
            bgColor: style.getPropertyValue('--card').trim(),         // Fondo del dashboard
            cardColor: style.getPropertyValue('--background').trim(),             // Fondo de la card
            textColor: style.getPropertyValue('--foreground').trim(),       // Texto principal
            gridColor: style.getPropertyValue('--color-border').trim(),
            phase1Color: style.getPropertyValue('--color-chart-1').trim(),
            phase2Color: style.getPropertyValue('--color-chart-2').trim(),
            phase3Color: style.getPropertyValue('--color-chart-3').trim(),
            referenceColor: style.getPropertyValue('--color-chart-5').trim(),
            dangerColor: style.getPropertyValue('--color-danger').trim(),
            successColor: style.getPropertyValue('--color-success').trim(),
            muted: style.getPropertyValue('--bg-bg').trim(),
            refenrenceLine: style.getPropertyValue('--foreground').trim(),
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
                        fillcolor: colors.muted,
                        line: {
                            color: colors.muted,
                            width: 0.5
                        },
                        mode:'lines',
                        showlegend: false,
                    },
                    // Área de los ángulos actuales
                    {
                        type: 'scatterpolar',
                        r: [0.8, 0.8, 0.8, 0.8],
                        theta: [0, angles.l1l2, angles.l1l2 + angles.l2l3, 0],
                        fill: 'toself',
                        fillcolor: 'rgba(100, 200, 255, 0.3)',
                        line: {
                            color: 'rgba(100, 200, 255, 0.3)',
                            width: 1
                        },
                        mode:'lines',
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
                            color: 'blue',
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
                            color: 'green',
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
                            color: 'orange',
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
                    title: {
                        text: `<b>L1-L2: ${angles.l1l2}° | L2-L3: ${angles.l2l3}° | L3-L1: ${adjustedL3L1.toFixed(1)}°</b>`,
                        font: {
                            size: 13,
                            color: colors.textColor
                        },
                        x: 0.5,
                        xanchor: 'center'
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
                        orientation: 'h',
                        yanchor: 'bottom',  // Ancla al fondo
                        y: -0.3,           // Ajusta posición vertical (negativo = fuera del gráfico)
                        xanchor: 'center',  // Centrado horizontal
                        x: 0.5,            // Posición horizontal central
                        bgcolor: 'rgba(0,0,0,0)',
                        font: {
                            size: 12       // Tamaño consistente
                        },
                        itemwidth: 30,     // Ancho fijo por ítem
                        itemsizing: 'constant' // Tamaño uniforme
                    },
                    paper_bgcolor: colors.bgColor,
                    font: { color: colors.textColor },
                    margin: { t: 80, b: 60, l: 20, r: 20 },
                    autosize: true,
                };

                const config: Partial<any> = {
                    displayModeBar: false,
                    responsive: true,
                    staticPlot: false,
                };

                await Plotly.newPlot(containerRef.current!, data, layout, config);

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

    return (
        <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" />
    );
};

export default PolarPhaseAnglePlot;