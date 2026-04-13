"use client";

import { useIoTTags } from "@/context/IoTTagsContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TabVistaGeneral from "./tabs/TabVistaGeneral";
import TabConjuntoMotor from "./tabs/TabConjuntoMotor";
import TabConjuntoElectrico from "./tabs/TabConjuntoElectrico";
import CapabilityCurve from "@/components/CapabilityCurve";

const GEN = "generador-55";
const EMPTY: Record<string, never> = {};

export default function DashboardGen05() {
    const { tags, connected, lastUpdate, error } = useIoTTags();

    const gen    = tags[GEN] ?? {};
    const agc     = gen["AGC_4"]     ?? EMPTY;
    const engine  = gen["Engine_1"]  ?? EMPTY;
    const hmi     = gen["GVL_HMI_3"] ?? EMPTY;
    const alarmas = gen["Alarmas"]   ?? EMPTY;
    const raiz    = gen["raiz"]      ?? EMPTY;

    return (
        <div className="flex flex-col h-[calc(100vh-var(--header-height))] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
                <div>
                    <h1 className="text-sm font-bold uppercase tracking-widest text-foreground">
                        Generador 55 — Monitoreo en Tiempo Real
                    </h1>
                    {lastUpdate && (
                        <p className="text-[10px] text-muted-foreground">
                            Última actualización: {lastUpdate.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {error && <span className="text-xs text-red-400">{error}</span>}
                    <div className={`flex items-center gap-1.5 text-xs ${connected ? "text-[#00ffc2]" : "text-red-400"}`}>
                        <span className={`w-2 h-2 rounded-full ${connected ? "bg-[#00ffc2] animate-pulse" : "bg-red-500"}`} />
                        {connected ? "En vivo" : "Desconectado"}
                    </div>
                </div>
            </div>

            <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
                <TabsList className="shrink-0 mx-4 mt-2 h-auto w-auto max-w-[calc(100%-2rem)] justify-start gap-2 overflow-x-auto rounded-lg p-1.5">
                    <TabsTrigger className="whitespace-nowrap px-3 py-1.5 text-xs font-medium" value="general">Vista General</TabsTrigger>
                    <TabsTrigger className="whitespace-nowrap px-3 py-1.5 text-xs font-medium" value="motor">Conjunto Motor</TabsTrigger>
                    <TabsTrigger className="whitespace-nowrap px-3 py-1.5 text-xs font-medium" value="electrico">Conjunto Eléctrico</TabsTrigger>
                    <TabsTrigger className="whitespace-nowrap px-3 py-1.5 text-xs font-medium" value="curva-capacidad">Curva de Capacidad</TabsTrigger>
                </TabsList>

                <TabsContent forceMount value="general"   className="flex-1 min-h-0 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden">
                    <TabVistaGeneral agc={agc} engine={engine} raiz={raiz} />
                </TabsContent>
                <TabsContent forceMount value="motor"     className="flex-1 min-h-0 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden">
                    <TabConjuntoMotor engine={engine} hmi={hmi} alarmas={alarmas} />
                </TabsContent>
                <TabsContent forceMount value="electrico" className="flex-1 min-h-0 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden">
                    <TabConjuntoElectrico agc={agc} hmi={hmi} />
                </TabsContent>
                <TabsContent forceMount value="curva-capacidad" className="flex-1 min-h-0 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden">
                    <CapabilityCurve
                        activePowerKw={agc["Generator_active_power"]?.value != null ? parseFloat(agc["Generator_active_power"].value) : null}
                        reactivePowerKvar={agc["Generator_reactive_power"]?.value != null ? parseFloat(agc["Generator_reactive_power"].value) : null}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
