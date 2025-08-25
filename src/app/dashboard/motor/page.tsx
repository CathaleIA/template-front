'use client'

import { FrecuencyCilindersData, VelocidadFrecuencyData } from '@/utils/generatedata/tendency'
import { generateSimulatedData } from '@/utils/generatedata/cilinders'

import CylinderTemperatureChart from '@/components/plotly/AreaTendency';
import PressureBars from '@/components/plotly/Bar';
import Tendency from "@/components/plotly/Tendency";
import FrequencyTrendChart2 from '@/components/plotly/TwoYAxisTendency';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";


export default function MotorGrid() {
    const [selectTendency, setselectTendency] = useState('temperatura');
    return (
        // Grid principal: 4 columnas x 3 filas = 12 celdas de igual tamaño
        <div className="flex flex-col lg:grid lg:grid-cols-3 lg:grid-rows-4 gap-3 h-[calc(100svh-var(--header-height))]! p-3 px-5">
            <div className='col-span-1 row-span-1'>
                <div className="bg-card  h-full grid grid-rows-2 grid-cols-2 rounded-tl-2xl shadow-lg/20 px-3">
                    <div className="col-span-1 row-span-2 flex flex-col justify-center gap-4 mx-auto">
                        <div className="rounded-xl border-l-4 border-r-4 border-border flex items-center justify-between px-4">
                            <div>
                                <p className="text-sm font-medium text-foreground">Voltaje</p>
                                <p className="text-xs text-muted-foreground">Trifásico</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-foreground">400</p>
                                <p className="text-xs text-muted-foreground">V</p>
                            </div>
                        </div>
                        <div className=" rounded-xl border-l-4 border-r-4 border-border flex items-center justify-between px-4 ">
                            <div>
                                <p className="text-sm font-medium text-foreground">Factor de Potencia</p>
                                <p className="text-xs text-muted-foreground">Carga</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-foreground">0.87</p>
                                <p className="text-xs text-muted-foreground">FP</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1  row-span-2 rounded-2xl flex flex-col items-center justify-center text-center">
                        <h3 className="text-lg font-medium text-foreground mb-4">Potencia Mecánica</h3>
                        <p className="text-5xl font-bold text-foreground mb-2">840</p>
                        <p className="text-base text-muted-foreground">kW</p>
                    </div>
                </div>
            </div>

            <div className="col-span-1 row-span-1">
                <div className="flex flex-col bg-card  h-full rounded-md shadow-lg/20">
                    <div className="flex justify-center items-center bg-card w-[45%] h-[35px] pr-2 rounded-br-full text-primary border-b-6 border-r-6 border-background">
                        <h1 className="text-sm font-semibold leading-none tracking-tight text-muted-foreground uppercase">
                            RESUMEN
                        </h1>
                    </div>

                    <div className=" my-auto px-2 py-1 space-y-1 text-sm">
                        {[
                            { label: "RPM", value: "1800 ±5", status: "✅" },
                            { label: "Frecuencia", value: "60 Hz", status: "✅" },
                            { label: "Presión Turbo", value: "80 psi", status: "⚠️" },
                            { label: "Refrigerante", value: "OK", status: "✅" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b border-muted pb-1">
                                <span className="text-muted-foreground">{item.label}</span>
                                <span className="font-semibold text-foreground">{item.value} {item.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className='col-span-1 row-span-2'>
                <div className='flex flex-col bg-card  h-full rounded-tr-2xl shadow-lg/20'>
                    <div className='flex justify-center items-center bg-card w-[45%] h-[35px] pr-2 rounded-br-full text-primary border-b-6 border-r-6 border-background'>
                        <h1 className="text-sm font-semibold leading-none tracking-tight text-muted-foreground uppercase">
                            RPM vs Hz</h1>
                    </div>
                    <div className="flex-1 min-h-0 w-full">
                        <FrequencyTrendChart2 {...VelocidadFrecuencyData} />
                    </div>
                </div>
            </div>

            <div className="col-span-2 row-span-3 rounded-br-full">
                <div className='bg-card  h-full flex flex-col rounded-bl-2xl shadow-lg/20'>
                    <Select
                        defaultValue="temperatura"
                        onValueChange={(value) => setselectTendency(value)}
                    >
                        <SelectTrigger
                            className="bg-card text-primary border-b-6 border-r-6 border-background rounded-br-full pr-2 w-[35%] flex items-center justify-center focus:ring-0 focus:ring-offset-0"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-auto">
                            <SelectItem value="temperatura">CILINDROS TEMPERATURA</SelectItem>
                            <SelectItem value="frecuencia">CLINDROS FRECUENCIA</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className=' flex-1 min-h-0'>
                        {selectTendency === 'temperatura' ? (
                            // <BarPlotly /> // Componente para
                            <CylinderTemperatureChart {...generateSimulatedData({})} />
                        ) : selectTendency === 'frecuencia' ? (
                            <Tendency {...FrecuencyCilindersData} /> // Componente para frecuencia (o el que necesites)
                        ) : null}
                    </div>
                </div>
            </div>

            <div className='col-span-1 row-span-2'>
                <div className='flex flex-col bg-card  h-full rounded-br-2xl shadow-lg/20'>
                    <div className='flex justify-center items-center bg-card w-[45%] h-[35px] pr-2 rounded-br-full text-primary border-b-6 border-r-6 border-background'>
                        <h1 className="text-sm font-semibold leading-none tracking-tight text-muted-foreground uppercase">
                            PRESION</h1>
                    </div>
                    <div className="flex-1 min-h-0 w-full">
                        <PressureBars />
                    </div>
                </div>
            </div>
        </div>
    )
}




