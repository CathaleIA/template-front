'use client';
import { useEffect, useRef, useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';


interface VoltageGaugeProps {
    type?: string;
    variable?: number;
    minVariable?: number;
    maxVariable?: number;
    title?: string;
    unit?: string;
    warningLow?: number;
    warningHight?: number;
    reference?: number;
    optimalMin?: number;
    optimalMax?: number;
}

const Gauge = ({
    type = 'startToEnd',
    variable = 10.4,
    minVariable = 0,
    maxVariable = 24,
    title = 'Grafico tipo gauge',
    unit = '[]',
    warningLow = 10,
    warningHight = 35,
    reference = 10,
    optimalMin = 5,
    optimalMax = 10,

}: VoltageGaugeProps) => {

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
            paperColor: style.getPropertyValue('--third-paper').trim(),
            plotColor: style.getPropertyValue('--third-plot').trim(),
            textColor: style.getPropertyValue('--third-text').trim(),
            space1Color: style.getPropertyValue('--plotly-1').trim(),
            space2olor: style.getPropertyValue('--plotly-2').trim(),
            space3Color: style.getPropertyValue('--plotly-3').trim(),
            dangerColor: style.getPropertyValue('--color-danger').trim(),
        };

        const loadPlot = async () => {
            try {
                const Plotly = await import('plotly.js-dist-min');

                const getGaugeColor = (value: number) => {
                    if (value <= warningLow) return '#dc2626';
                    if (value <= optimalMin) return '#f59e0b';
                    if (value <= optimalMax) return '#16a34a';
                    if (value <= warningHight) return '#f59e0b';
                    return '#dc2626';
                };

                const data: Plotly.Data[] = [
                    {
                        domain: { x: [0, 1], y: [0, 1] },
                        value: variable,
                        title: {
                            text: `<b>${title}</b><br><span style="font-size:0.8em">${`referencia: ${reference}`}[${unit}]</span>`,
                            font: { size: 16 }
                        },
                        type: 'indicator',
                        mode: 'gauge+number+delta',
                        gauge: {
                            shape: "angular",
                            axis: {
                                range: [minVariable, maxVariable],
                                tickwidth: 0.1,
                                tickcolor: colors.textColor,
                                tickfont: { size: 15 }
                            },
                            bar: {
                                color: getGaugeColor(variable),
                                thickness: 0.5
                            },
                            borderwidth: 1,
                            bordercolor: colors.paperColor,
                            steps: [
                                {
                                    range: [minVariable, warningLow],
                                    color: colors.space1Color
                                },
                                {
                                    range: [warningLow, optimalMin],
                                    color: colors.space2olor
                                },
                                {
                                    range: [optimalMin, optimalMax],
                                    color: colors.space3Color
                                },
                                {
                                    range: [optimalMax, warningHight],
                                    color: colors.space2olor
                                },
                                {
                                    range: [warningHight, maxVariable],
                                    color: colors.space1Color
                                }
                            ],
                            threshold: {
                                line: { color: colors.dangerColor, width: 4 },
                                thickness: 1,
                                value: warningHight
                            }
                        },
                        delta: { reference: reference },
                    }
                ];

                const layout: Partial<Plotly.Layout> = {
                    margin: { t: 80, b: 40, l: 40, r: 40 },
                    paper_bgcolor: colors.paperColor,
                    font: { color: colors.textColor },
                    autosize: true,
                };

                const config: Partial<any> = {
                    displayModeBar: false,
                    responsive: true,
                    staticPlot: false
                };

                await Plotly.newPlot(containerRef.current!, data, layout, config);

                Plotly.Plots.resize(containerRef.current!);

            } catch (error) {
                console.error('Failed to load Plotly:', error);
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
    }, [variable, minVariable, maxVariable, title, unit, warningLow, warningHight, themeVersion]);

    // Efecto para redimensionar cuando cambia el estado del sidebar
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
        <div ref={containerRef} className="w-full h-full rounded-bl-4xl overflow-hidden" />
    );
};

export default Gauge;