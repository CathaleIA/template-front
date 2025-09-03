'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RefreshCw, Save, Settings } from "lucide-react";
import { PageHeader } from "@/components/page-header"

import {
    MetricsConfig,
    MetricConfig,
    Thresholds,
    SensorData,
    ThresholdLevels,
    EmailSettings,
    SystemSettings,
} from "@/types";

import { useState } from "react";
import { cn } from "@/lib/utils";

import { AnimatePresence } from "motion/react"
import * as motion from "motion/react-client"
import { toast } from "sonner";

interface ThresholdsProps {
    metricsConfig: MetricsConfig;
    currentValues: SensorData;
    thresholds: Thresholds;
    setThresholds: React.Dispatch<React.SetStateAction<Thresholds>>;
    emailSettings: EmailSettings;
    systemSettings: SystemSettings;
    defaultThresholds: Thresholds;
}



const ThresholdsComponent: React.FC<ThresholdsProps> = ({ metricsConfig, currentValues, thresholds, setThresholds, emailSettings, systemSettings, defaultThresholds }) => {
    const [activeCategory, setActiveCategory] = useState<string>("Motor");
    const [isRefresquin, setIsRefresquin] = useState(false);

    const getCategories = (): string[] => {
        const categoriesSet = new Set(Object.values(metricsConfig).map(m => m.category));
        return Array.from(categoriesSet);
    };


    const handleThresholdChange = (metric: string, level: keyof ThresholdLevels, value: string) => {
        setThresholds(prev => ({
            ...prev,
            [metric]: {
                ...prev[metric],
                [level]: parseFloat(value) || 0
            }
        }));
    };

    const getMetricsByCategory = (category: string): [string, MetricConfig][] => {
        return Object.entries(metricsConfig).filter(([key, config]) => config.category === category);
    };

    const renderThresholdCard = (metricKey: string, config: MetricConfig) => {
        const IconComponent = config.icon;
        const threshold = thresholds[metricKey];
        const rawValue = currentValues[metricKey];

        // Convertir y validar el valor
        const currentValue = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;
        const numericValue = typeof currentValue === 'number' && !isNaN(currentValue) ? currentValue : undefined;

        const getAlertLevel = (metricKey: string, value: number): string => {
            const threshold = thresholds[metricKey];
            const config = metricsConfig[metricKey];

            if (!threshold || value === undefined || value === null) return "normal";

            if (config.isReverse) {
                // Para métricas inversas (como presión de aceite), valores bajos son problemáticos
                if (value <= threshold.danger) return "danger";
                if (value <= threshold.warning) return "warning";
                return "normal";
            } else {
                // Para métricas normales, valores altos son problemáticos
                if (value >= threshold.danger) return "danger";
                if (value >= threshold.warning) return "warning";
                return "normal";
            }
        };

        const getAlertColor = (level: string): string => {
            switch (level) {
                case "danger": return "border-red-500 bg-red-50";
                case "warning": return "border-yellow-500 bg-yellow-50";
                default: return "border-green-500 bg-green-50";
            }
        };

        const alertLevel = numericValue !== undefined ? getAlertLevel(metricKey, numericValue) : 'normal';
        const alertColor = getAlertColor(alertLevel);

        return (
            <Card key={metricKey} className={`overflow-hidden transition-all duration-200 bg-background rounded-sm shadow-none hover:shadow-lg border-none`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{config.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                        {currentValue !== undefined && (
                            <div className="text-right">
                                <div className="text-lg font-bold">{currentValue}</div>
                                <div className="text-xs text-gray-500">{config.unit}</div>
                            </div>
                        )}
                        <IconComponent className="h-5 w-5 text-blue-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <CardDescription className="mb-4">{config.description}</CardDescription>

                    {currentValue !== undefined && (
                        <div className={`mb-3 p-2 rounded text-sm font-medium ${alertLevel === 'danger' ? 'text-red-700 bg-red-100' :
                            alertLevel === 'warning' ? 'text-yellow-700 bg-yellow-100' :
                                'text-green-700 bg-green-100'
                            }`}>
                            Estado: {
                                alertLevel === 'danger' ? '🔴 Peligro' :
                                    alertLevel === 'warning' ? '🟡 Advertencia' :
                                        '🟢 Normal'
                            }
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <Label className="text-xs font-medium text-green-600">Normal</Label>
                            <input
                                type="number"
                                step="0.1"
                                value={threshold.normal}
                                onChange={(e) => handleThresholdChange(metricKey, 'normal', e.target.value)}
                                className="w-full mt-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-foreground"
                            />
                            <span className="text-xs text-gray-500">{config.unit}</span>
                        </div>

                        <div>
                            <Label className="text-xs font-medium text-amber-600">Advertencia</Label>
                            <input
                                type="number"
                                step="0.1"
                                value={threshold.warning}
                                onChange={(e) => handleThresholdChange(metricKey, 'warning', e.target.value)}
                                className="w-full mt-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
                            />
                            <span className="text-xs text-gray-500">{config.unit}</span>
                        </div>

                        <div>
                            <Label className="text-xs font-medium text-red-600">Peligro</Label>
                            <input
                                type="number"
                                step="0.1"
                                value={threshold.danger}
                                onChange={(e) => handleThresholdChange(metricKey, 'danger', e.target.value)}
                                className="w-full mt-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-foreground"
                            />
                            <span className="text-xs text-gray-500">{config.unit}</span>
                        </div>
                    </div>

                    {config.isReverse && (
                        <p className="text-xs text-blue-600 mt-2">
                            ⚠️ Métrica inversa: valores bajos indican problemas
                        </p>
                    )}
                </CardContent>
            </Card>
        );
    };

    const handleSaveConfiguration = () => {
        const config = {
            thresholds,
            emailSettings,
            systemSettings,
            lastUpdated: new Date().toISOString()
        };

        toast.success("Success", { description: "Configuración guardada exitosamente" })
    };

    const handleResetToDefaults = () => {
        setIsRefresquin(true)
        setThresholds(defaultThresholds);
        toast.info("Info", { description: "Configuración restablecida a valores predeterminados" })
        setIsRefresquin(false)
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="w-full">
                <PageHeader
                    title="Configuración de Umbrales de Alerta"
                    description="Define los valores límite para cada métrica. Los valores se comparan contra estos umbrales para generar alertas. Las tarjetas muestran los valores actuales y su estado de alerta."
                    actions={
                        [
                            <AlertDialog key="reset">
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="custom"
                                        size="custom"
                                    >
                                        <RefreshCw className="h-4 w-4" /> Restablecer
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleResetToDefaults} disabled={isRefresquin}>
                                            {isRefresquin ? "Restableciendo..." : "Restablecer"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>, <Button
                                key="save"
                                onClick={handleSaveConfiguration}
                                type="submit"
                                variant="custom"
                                size="custom"
                                className="gap-2"
                            >
                                <Save className="h-4 w-4" />
                                <span>Guardar</span>
                            </Button>
                        ]
                    }
                />
            </div>

            <Card className="flex flex-col gap-4 card-generic p-5">
                <nav className="border-b-2 border-border w-auto text-sm font-semibold text-primary leading-none">
                    <ul className="flex items-center w-auto list-none gap-8">
                        {getCategories().map(category => (
                            <motion.li
                                key={category}
                                initial={false}
                                className={`relative py-3 w-auto list-none cursor-pointer hover:text-blue-link ${category === activeCategory
                                    ? 'text-blue-link'
                                    : ''
                                    }`}
                                onClick={() => setActiveCategory(category)}
                            >
                                {category}
                                {category === activeCategory ? (
                                    <motion.div
                                        className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-blue-link"
                                        layoutId="underline"
                                        id="underline"
                                    />
                                ) : null}
                            </motion.li>
                        ))}
                    </ul>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="wait">
                        {getMetricsByCategory(activeCategory).map(([metricKey, config]) => (
                            <motion.div
                                key={metricKey}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex"
                            >
                                {renderThresholdCard(metricKey, config)}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </Card>
        </div>
    )
}


export default ThresholdsComponent;