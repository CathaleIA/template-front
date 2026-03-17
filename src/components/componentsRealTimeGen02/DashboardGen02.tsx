"use client";

import { useIoTTags } from "@/context/IoTTagsContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TabElectrico from "./tabs/TabElectrico";
import TabMotor from "./tabs/TabMotor";
import TabVibraciones from "./tabs/TabVibraciones";
import TabBobinas from "./tabs/TabBobinas";

const GEN = "Generador_53";
const EMPTY: Record<string, never> = {};

export default function DashboardGen02() {
    const { tags, connected, lastUpdate, error } = useIoTTags();

    const gen    = tags[GEN] ?? {};
    const gd     = gen["GD"]         ?? EMPTY;
    const engine = gen["Engine_1"]   ?? EMPTY;
    const knock  = gen["Detcon20_1"] ?? EMPTY;
    const mic5   = gen["MIC5_1"]     ?? EMPTY;

    return (
        <div className="flex flex-col h-[calc(100vh-var(--header-height))] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
                <div>
                    <h1 className="text-sm font-bold uppercase tracking-widest text-foreground">
                        Generador 53 — Monitoreo en Tiempo Real
                    </h1>
                    {lastUpdate && (
                        <p className="text-[10px] text-muted-foreground">
                            Última actualización: {lastUpdate.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {error && <span className="text-xs text-red-400">{error}</span>}
                    <div className={`flex items-center gap-1.5 text-xs ${connected ? "text-[#60a5fa]" : "text-red-400"}`}>
                        <span className={`w-2 h-2 rounded-full ${connected ? "bg-[#60a5fa] animate-pulse" : "bg-red-500"}`} />
                        {connected ? "En vivo" : "Desconectado"}
                    </div>
                </div>
            </div>

            <Tabs defaultValue="electrico" className="flex-1 flex flex-col min-h-0">
                    <TabsList className="shrink-0 mx-4 mt-2 w-fit">
                        <TabsTrigger value="electrico">Eléctrico</TabsTrigger>
                        <TabsTrigger value="motor">Motor</TabsTrigger>
                        <TabsTrigger value="vibraciones">Vibraciones</TabsTrigger>
                        <TabsTrigger value="bobinas">Bobinas</TabsTrigger>
                    </TabsList>

                    <TabsContent value="electrico"   className="flex-1 min-h-0 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                        <TabElectrico gd={gd} />
                    </TabsContent>
                    <TabsContent value="motor"       className="flex-1 min-h-0 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                        <TabMotor engine={engine} />
                    </TabsContent>
                    <TabsContent value="vibraciones" className="flex-1 min-h-0 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                        <TabVibraciones knock={knock} mic5={mic5} />
                    </TabsContent>
                    <TabsContent value="bobinas"     className="flex-1 min-h-0 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                        <TabBobinas mic5={mic5} />
                    </TabsContent>
                </Tabs>
        </div>
    );
}
