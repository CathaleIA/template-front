'use client';

import { useEffect, useRef, useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TraceData {
    x: Date[];
    y: number[];
    name: string;
    mode?: 'lines' | 'markers' | 'lines+markers';
}

interface TendencyChartProps {
    minPF: number;
    maxPF: number;
    traces: TraceData[];
    tittle?: string;
    yAxisTitle: string;
}

export default function FullScreemShadcn({
    minPF = 50,
    maxPF = 60,
    traces = [],
    tittle = "Grafica de tendencia",
    yAxisTitle = "Eje Y",
}: TendencyChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const fullscreenContainerRef = useRef<HTMLDivElement>(null);
    const [themeVersion, setThemeVersion] = useState(0);
    const currentTheme = useRef<string>('');
    const { state, open } = useSidebar();
    const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

    // Detectar cambios de tema
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
            if (newTheme !== currentTheme.current) {
                currentTheme.current = newTheme;
                setThemeVersion((v) => v + 1);
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    // Función para crear el gráfico
    const createPlot = async (container: HTMLDivElement, isFullscreen = false) => {
        if (!container || !traces.length) return;

        console.log('✅ Creando gráfico en fullscreen:', container);

        const Plotly = await import('plotly.js-dist-min');
        const style = getComputedStyle(document.documentElement);

        const colors = {
            bgColor: style.getPropertyValue('--card').trim(),
            cardColor: style.getPropertyValue('--background').trim(),
            textColor: style.getPropertyValue('--foreground').trim(),
            buttonColor: style.getPropertyValue('--color-muted').trim(),
            gridColor: style.getPropertyValue('--color-border').trim(),
            lineColor: style.getPropertyValue('--color-chart-5').trim(),
        };

        const frecuenciaY = traces[0]?.y || [];
        const minF = Math.min(...frecuenciaY);
        const maxF = Math.max(...frecuenciaY);

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
                        { step: 'all', label: 'Todo' },
                    ],
                    bgcolor: colors.buttonColor,
                    font: { color: colors.textColor },
                    activecolor: colors.bgColor,
                    x: 0,
                    xanchor: 'left',
                    y: 1.15,
                    yanchor: 'top',
                },
                rangeslider: {
                    visible: true,
                    thickness: 0.1,
                    bgcolor: colors.cardColor,
                    bordercolor: colors.gridColor,
                },
            },
            yaxis: {
                title: { text: 'Frecuencia [Hz]', font: { color: colors.textColor } },
                range: [minF - 1, maxF + 1],
                gridcolor: colors.gridColor,
                fixedrange: false,
                linecolor: colors.gridColor,
                zerolinecolor: colors.gridColor,
            },
            yaxis2: {
                title: { text: 'Velocidad [rpm]', font: { color: colors.textColor } },
                overlaying: 'y',
                side: 'right',
                range: [minPF - 1, maxPF + 1],
                tickformat: '~s',
                gridcolor: colors.gridColor,
                fixedrange: false,
                linecolor: colors.gridColor,
                zerolinecolor: colors.gridColor,
            },
            margin: isFullscreen ? { t: 50, l: 70, r: 70, b: 70, pad: 10 } : { t: 30, l: 50, r: 50, b: 20 },
            legend: {
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: isFullscreen ? -0.2 : -0.35,
                yanchor: 'top',
                font: { size: 10, color: colors.textColor },
            },
        };

        const config = {
            responsive: true,
            scrollZoom: true,
            displayModeBar: true,
            displaylogo: false,
        };

        const plotlyTraces: Plotly.Data[] = traces.map((trace, index) => ({
            x: trace.x,
            y: trace.y,
            type: 'scatter',
            mode: trace.mode || 'lines',
            name: trace.name,
            line: { width: 1, simplify: true },
            yaxis: index === 0 ? 'y' : 'y2',
        }));

        container.style.width = '100%';
        container.style.height = '100%';

        await Plotly.react(container, plotlyTraces, layout, config);
        Plotly.Plots.resize(container);
    };

    // Gráfico principal
    useEffect(() => {
        if (!containerRef.current || !traces.length) return;

        createPlot(containerRef.current);

        return () => {
            if (containerRef.current) {
                const Plotly = require('plotly.js-dist-min');
                Plotly.purge?.(containerRef.current);
            }
        };
    }, [themeVersion, minPF, maxPF, traces]);

    // Redimensionar al cambiar el sidebar
    useEffect(() => {
        if (!containerRef.current) return;
        const timer = setTimeout(() => {
            try {
                const Plotly = require('plotly.js-dist-min');
                Plotly.Plots.resize(containerRef.current!);
            } catch (e) {
                console.error('Resize error:', e);
            }
        }, 70);
        return () => clearTimeout(timer);
    }, [state, open]);

    // 🔥 Este es el cambio clave: observa el ref, no solo el estado
    useEffect(() => {
        if (!isFullscreenOpen) return;

        const container = fullscreenContainerRef.current;
        if (container) {
            console.log('🟢 Contenedor encontrado, creando gráfico fullscreen');
            createPlot(container, true);
        } else {
            console.log('🟡 Contenedor aún no montado, esperando...');
            const interval = setInterval(() => {
                const container = fullscreenContainerRef.current;
                if (container) {
                    console.log('🟢 Contenedor montado, creando gráfico');
                    clearInterval(interval);
                    createPlot(container, true);
                }
            }, 50);

            return () => clearInterval(interval);
        }
    }, [isFullscreenOpen]);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex justify-end p-2">
                <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            Pantalla completa
                        </Button>
                    </DialogTrigger>
                    <DialogContent
                        style={{ width: '90vw', height: '90vh', maxWidth: 'none', maxHeight: 'none', padding: '1rem' }}
                        className="flex flex-col"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                        <DialogTitle className="sr-only">Gráfico en pantalla completa</DialogTitle>
                        <div
                            ref={fullscreenContainerRef}
                            className="flex-1 bg-background rounded-md overflow-hidden"
                        />
                    </DialogContent>
                </Dialog>
            </div>
            <div
                ref={containerRef}
                className="w-full h-full flex-1 rounded-2xl overflow-hidden"
            />
        </div>
    );
}