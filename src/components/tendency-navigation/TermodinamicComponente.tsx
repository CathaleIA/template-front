'use client'

import TemperatureHeatmap from "@/components/plotly/HeatMap";
import Tendency from "@/components/plotly/Tendency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heatdata } from '@/utils/generatedata/heatmap'
import { DevanadosData } from "@/utils/generatedata/tendency";
import { useState } from "react";
import { BorderTrail } from "@/components/motion-primitives/border-trail";

const HealhtlyComponent = () => {
    const [selectTendency, setselectTendency] = useState('acople');
    return (
        <div className="flex flex-col lg:grid lg:grid-cols-3 lg:grid-rows-3 gap-4 h-[calc(100svh-var(--header-height)-var(--tablist-height))]!">
            <div className="col-span-2 row-span-1">
                <div
                    className='bg-bg-white h-full flex flex-col card-plotly3'
                >
                    <Select
                        defaultValue="acople"
                        onValueChange={(value) => setselectTendency(value)}
                    >
                        <SelectTrigger
                            className="relative bg-input/50 text-muted-foreground text-xs font-bold  rounded-br-full pr-2 w-[35%] flex items-center justify-center focus:ring-0 focus:ring-offset-0"
                        >
                            <BorderTrail
                                style={{
                                    boxShadow: '0px 0px 60px 30px rgb(130 130 130 / 90%), 0 0 60px 20px rgb(255 255 255 / 80%), 0 0 140px 90px rgb(130 130 130 / 50%)',
                                }}
                                size={10}
                            />
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
                <div
                    className="flex flex-col bg-bg-white  h-full card-plotly2"
                >
                    <div className="flex justify-center items-center bg-input/50 w-[45%] h-[35px] pr-2 rounded-br-full text-primary ">
                        <h1 className="text-xs font-bold leading-none tracking-tight text-muted-foreground uppercase">
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
                <div
                    className='flex flex-col bg-bg-white  h-full card-plotly3'
                >
                    <div className='flex justify-center items-center bg-input/50 w-[45%] h-[35px] pr-2 rounded-br-full text-primary '>
                        <h1 className="text-xs font-bold leading-none tracking-tight text-muted-foreground uppercase">
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