"use client";

import { useIoTTags } from "@/context/IoTTagsContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TabGeneral from "./tabs/TabGeneral";
import TabCilindros from "./tabs/TabCilindros";
import TabSistema from "./tabs/TabSistema";
import TabVibraciones from "./tabs/TabVibraciones";

const GEN = "Generador_55";
const EMPTY: Record<string, never> = {};

export default function DashboardGen01() {
    const { tags, connected, lastUpdate, error } = useIoTTags();

    const gen = tags[GEN] ?? {};
    const agc     = gen["AGC_4"]     ?? EMPTY;
    const engine  = gen["Engine_1"]  ?? EMPTY;
    const hmi     = gen["GVL_HMI_3"] ?? EMPTY;
    const alarmas = gen["Alarmas"]   ?? EMPTY;
    const raiz    = gen["raiz"]      ?? EMPTY;

    const hasData = Object.keys(gen).length > 0;

    return (
        <div className="flex flex-col h-[calc(100vh-var(--header-height))] overflow-hidden">
            {/* Header bar */}
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
                    {error && (
                        <span className="text-xs text-red-400">{error}</span>
                    )}
                    <div className={`flex items-center gap-1.5 text-xs ${connected ? "text-[#00ffc2]" : "text-red-400"}`}>
                        <span className={`w-2 h-2 rounded-full ${connected ? "bg-[#00ffc2] animate-pulse" : "bg-red-500"}`} />
                        {connected ? "En vivo" : "Desconectado"}
                    </div>
                </div>
            </div>

            {/* Waiting state */}
            {!hasData ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                    <div className="w-8 h-8 border-4 border-[#00ffc2] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm">Esperando datos de Generador 55...</p>
                </div>
            ) : (
                <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
                    <TabsList className="shrink-0 mx-4 mt-2 w-fit">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="cilindros">Cilindros</TabsTrigger>
                        <TabsTrigger value="sistema">Sistema</TabsTrigger>
                        <TabsTrigger value="vibraciones">Vibraciones</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general"    className="flex-1 min-h-0 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                        <TabGeneral agc={agc} />
                    </TabsContent>
                    <TabsContent value="cilindros"  className="flex-1 min-h-0 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                        <TabCilindros engine={engine} alarmas={alarmas} />
                    </TabsContent>
                    <TabsContent value="sistema"    className="flex-1 min-h-0 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                        <TabSistema engine={engine} raiz={raiz} />
                    </TabsContent>
                    <TabsContent value="vibraciones" className="flex-1 min-h-0 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                        <TabVibraciones hmi={hmi} />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
