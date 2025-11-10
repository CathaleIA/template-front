'use client'

import { FrecuencyCilindersData, VelocidadFrecuencyData } from '@/utils/generatedata/tendency'
import { generateSimulatedData } from '@/utils/generatedata/cilinders'

import CylinderTemperatureChart from '@/components/plotly/AreaTendency';
import PressureBars from '@/components/plotly/Bar';
import Tendency from "@/components/plotly/Tendency";
import FrequencyTrendChart2 from '@/components/plotly/TwoYAxisTendency';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const MotorGridComponent = () => {
    const [selectTendency, setselectTendency] = useState('temperatura');
    return (
        <div className="flex flex-col lg:grid lg:grid-cols-3 lg:grid-rows-4 gap-4 h-[calc(100svh-var(--header-height)-var(--tablist-height)-var(--header-h))]!">
            <div className='col-span-1 row-span-1'>
                <div className="bg-background  h-full grid grid-rows-2 grid-cols-2 px-3 shadow-[8px_8px_15px_0px_rgba(0,0,0,0.5)] rounded-tr-sm rounded-br-sm rounded-bl-sm">
                    <div className="col-span-1 row-span-2 flex flex-col justify-center gap-4 mx-auto">
                        <div className="rounded-xl border-l-4 border-r-4 border-border flex items-center justify-between px-4">
                            <div>
                                <p className="text-sm font-medium text-foreground">Voltaje</p>
                                <p className="text-xs text-muted-foreground">Trifásico</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-foreground">4160</p>
                                <p className="text-xs text-muted-foreground">V</p>
                            </div>
                        </div>
                        <div className=" rounded-xl border-l-4 border-r-4 border-border flex items-center justify-between px-4 ">
                            <div>
                                <p className="text-sm font-medium text-foreground">Factor de Potencia</p>
                                <p className="text-xs text-muted-foreground">Carga</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-foreground">0.9</p>
                                <p className="text-xs text-muted-foreground">FP</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1  row-span-2 rounded-2xl flex flex-col items-center justify-center text-center">
                        <h3 className="text-lg font-medium text-foreground mb-4">Potencia Eléctrica</h3>
                        <p className="text-5xl font-bold text-foreground mb-2">840</p>
                        <p className="text-base text-muted-foreground">kW</p>
                    </div>
                </div>
            </div>

            <div className="col-span-1 row-span-1">
                <div className="flex flex-col bg-background h-full shadow-[8px_8px_15px_0px_rgba(0,0,0,0.5)] rounded-tr-sm rounded-br-sm rounded-bl-sm">
                    <div className="flex justify-center items-center bg-green-medium w-[45%] h-[35px] pr-2 rounded-br-full text-primary border-b-6 border-r-6 border-green-gray">
                        <h1 className="text-xs font-bold leading-none tracking-tight text-green-gray uppercase">
                            RESUMEN
                        </h1>
                    </div>

                    <div className=" my-auto px-2 py-1 space-y-1 text-sm">
                        {[
                            { label: "RPM", value: "1800 ±5", status: "✅" },
                            { label: "Frecuencia", value: "60 Hz", status: "✅" },
                            { label: "Presión Turbo", value: "29 psi", status: "✅" },
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
                <div className='flex flex-col bg-background h-full shadow-[8px_8px_15px_0px_rgba(0,0,0,0.5)] rounded-tr-4xl rounded-bl-4xl'>
                    <div className="flex justify-center items-center w-[45%] h-[35px] pr-2 bg-green-medium rounded-br-full text-primary border-b-6 border-r-6 border-green-gray">
                        <h1 className="text-xs font-bold leading-none tracking-tight text-green-gray uppercase">
                            RPM vs Hz
                        </h1>
                    </div>
                    <div className="flex-1 min-h-0 w-full">
                        <FrequencyTrendChart2 {...VelocidadFrecuencyData} />
                    </div>
                </div>
            </div>

            <div className="col-span-2 row-span-3 rounded-br-full">
                <div className='bg-background  h-full flex flex-col shadow-[8px_8px_15px_0px_rgba(0,0,0,0.5)] rounded-tr-4xl rounded-bl-4xl'>
                    <Select
                        defaultValue="temperatura"
                        onValueChange={(value) => setselectTendency(value)}
                    >
                        <SelectTrigger
                            className="bg-green-medium text-green-gray border-b-6 border-r-6 border-green-gray rounded-br-full pr-2 w-[35%] flex items-center justify-center focus:ring-0 focus:ring-offset-0 font-bold text-xs "
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-auto">
                            <SelectItem value="temperatura">CILINDROS TEMPERATURA</SelectItem>
                            <SelectItem value="frecuencia">VIBRACIONES CILINDROS</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className=' flex-1 min-h-0'>
                        {selectTendency === 'temperatura' ? (
                            // <BarPlotly /> // Componente para
                            <CylinderTemperatureChart {...generateSimulatedData({})} />
                        ) : selectTendency === 'frecuencia' ? (
                            <Tendency {...FrecuencyCilindersData} showOperatingZones={true} /> // Componente para frecuencia
                        ) : null}
                    </div>
                </div>
            </div>

            <div className='col-span-1 row-span-2'>
                <div className='flex flex-col bg-background  h-full shadow-[8px_8px_15px_0px_rgba(0,0,0,0.5)] rounded-tr-4xl rounded-bl-4xl'>
                    <div className='flex justify-center items-center w-[45%] h-[35px] pr-2 bg-green-medium rounded-br-full text-primary border-b-6 border-r-6 border-green-gray'>
                        <h1 className="text-xs font-bold leading-none tracking-tight text-green-gray uppercase">
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

export default MotorGridComponent;

