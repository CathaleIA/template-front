'use client'

import TemperatureHeatmap from "@/components/plotly/HeatMap";
import Tendency from "@/components/plotly/Tendency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heatdata } from '@/utils/generatedata/heatmap'
import { DevanadosData } from "@/utils/generatedata/tendency";
import { useState } from "react";

const HealhtlyComponent = () => {
    const [selectTendency, setselectTendency] = useState('acople');
    return (
        <div className="flex flex-col lg:grid lg:grid-cols-3 lg:grid-rows-3 gap-3 h-[calc(100svh-var(--header-height))]!">
            <div className="col-span-2 row-span-1">
                <div className='bg-card  h-full flex flex-col rounded-tr-2xl shadow-lg/20'>
                    <Select
                        defaultValue="acople"
                        onValueChange={(value) => setselectTendency(value)}
                    >
                        <SelectTrigger
                            className="bg-card text-primary border-b-6 border-r-6 border-background rounded-br-full pr-2 w-[35%] flex items-center justify-center focus:ring-0 focus:ring-offset-0"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-auto">
                            <SelectItem value="acople">RODAMIENTO ACOPLE</SelectItem>
                            <SelectItem value="libre">RODAMIENTO LIBRE</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className=' flex-1 min-h-0'>
                        {selectTendency === 'acople' ? (
                            <TemperatureHeatmap {...Heatdata} />
                        ) : selectTendency === 'libre' ? (
                            <TemperatureHeatmap {...Heatdata} />
                        ) : null}
                    </div>
                </div>
            </div>
            <div className="col-span-1 row-span-1">
                <div className="flex flex-col bg-card  h-full rounded-tr-2xl shadow-lg/20">
                    <div className="flex justify-center items-center bg-card w-[45%] h-[35px] pr-2 rounded-br-full text-primary border-b-6 border-r-6 border-background">
                        <h1 className="text-sm font-semibold leading-none tracking-tight text-muted-foreground uppercase">
                            RESUMEN
                        </h1>
                    </div>

                    <div className="my-auto px-2 py-1 space-y-1 text-sm">
                        {[
                            { label: "Temp. Devanado U", value: "62 °C", status: "✅" },
                            { label: "Temp. Devanado V", value: "65 °C", status: "✅" },
                            { label: "Temp. Devanado W", value: "70 °C", status: "⚠️" },
                            { label: "Temp. Rodamiento Acople", value: "Casi OK", status: "⚠️" },
                            { label: "Temp. Rodamiento Libre", value: "OK", status: "✅" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b border-muted pb-1">
                                <span className="text-muted-foreground">{item.label}</span>
                                <span className="font-semibold text-foreground">
                                    {item.value} {item.status}
                                </span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
            <div className="col-span-3 row-span-2">
                <div className='flex flex-col bg-card  h-full rounded-bl-2xl  rounded-br-2xl shadow-lg/20'>
                    <div className='flex justify-center items-center bg-card w-[45%] h-[35px] pr-2 rounded-br-full text-primary border-b-6 border-r-6 border-background'>
                        <h1 className="text-sm font-semibold leading-none tracking-tight text-muted-foreground uppercase">
                            DEVANADOS</h1>
                    </div>
                    <div className="flex-1 min-h-0 w-full">
                        <Tendency {...DevanadosData} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HealhtlyComponent;